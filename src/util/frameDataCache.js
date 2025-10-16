
const InfluxDB = require('@influxdata/influxdb-client').InfluxDB;
import GlobalEnv from "./globalEnv.js";

const CACHE_SIZE = 1000;

let local_username = null;
let local_upload_id = null;
let succInit = false;

class FrameDataCache {
    /**
     * @param {number} N - 循环队列的容量（最多存储N个frameData）
     */
    constructor(N) {
        // 队列容量
        this.N = N;

        // 循环队列数组，大小为2N以便区分空/满状态
        this.dataLoader = new Array(2 * N);

        // 队列指针：front指向第一个有效元素，tail指向下一个插入位置
        this.front = 0;
        this.tail = 0;

        // 周期ID范围：frontCycle指向队列第一个元素的cycle_id，tailCycle指向下一个要插入的cycle_id
        this.frontCycle = 0;
        this.tailCycle = 0;

        // 当前队列中的元素数量
        this.size = 0;
    }

    /**
     * 清空队列中的所有数据，重置所有状态
     */
    clear() {
        this.dataLoader.fill(null);
        this.front = 0;
        this.tail = 0;
        this.frontCycle = 0;
        this.tailCycle = 0;
        this.size = 0;
    }

    /**
     * 向队列中添加帧数据
     * @param {number} cycle_begin - 起始cycle_id
     * @param {number} cycle_end - 结束cycle_id（不包含）
     * @param {FrameData[]} frameDatas - 要添加的帧数据数组
     */
    addData(cycle_begin, cycle_end, frameDatas) {
        // 检查数据是否连续
        if (cycle_begin !== this.tailCycle) {
            this.clear();
        }

        // 调整cycle_end，确保不超过容量限制
        const original_cycle_end = cycle_end;
        cycle_end = Math.min(cycle_end, cycle_begin + this.N);

        // 如果需要截断数据，发出警告
        if (original_cycle_end > cycle_end) {
            console.warn(`数据截断: 原始结束cycle=${original_cycle_end}, 调整后cycle_end=${cycle_end}`);
        }

        // 添加数据到队列
        for (let cycle = cycle_begin; cycle < cycle_end; cycle++) {
            const dataIndex = cycle - cycle_begin;

            // 创建frameData对象
            const frameData = frameDatas[dataIndex] ? { ...frameDatas[dataIndex] } : {};

            // 将数据放入循环队列
            this.dataLoader[this.tail] = frameData;
            this.tail = (this.tail + 1) % (2 * this.N);
            this.tailCycle = cycle + 1;

            // 更新队列大小
            if (this.size === 0) {
                this.frontCycle = cycle;
            }
            if (this.size < 2 * this.N) {
                this.size++;
            } else {
                // 队列已满，需要移动front指针
                this.front = (this.front + 1) % (2 * this.N);
                this.frontCycle++;
            }
        }
    }

    /**
     * 获取指定cycle_id的帧数据
     * @param {number} cycle_id - 要查询的cycle_id
     * @returns {FrameData|null} 找到的帧数据，如果不存在则返回null
     */
    async getData(cycle_id, window_size, consider_valid) {
        //console.log('in getData');
        //需要的数据不在范围里
        if (cycle_id < this.frontCycle || cycle_id >= this.tailCycle) {
            await this.fetchData(cycle_id, cycle_id + this.N);
            //要await一个异步的获取
        }//需要的数据在范围里，但是需要提前加载后面的数据
        // else if (cycle_id >= this.tailCycle - this.N / 2) {

        // }

        const index = (this.front + (cycle_id - this.frontCycle)) % (2 * this.N);
        //console.log('getData ok!');
        return this.dataLoader[index];
    }

    /**
     * 检查队列是否为空
     * @returns {boolean} 队列是否为空
     */
    isEmpty() {
        return this.size === 0;
    }

    /**
     * 检查队列是否已满
     * @returns {boolean} 队列是否已满
     */
    isFull() {
        return this.size === 2 * this.N;
    }

    /**
     * 获取当前队列中的元素数量
     * @returns {number} 队列元素数量
     */
    getSize() {
        return this.size;
    }

    /**
     * 获取队列中所有的cycle_id范围
     * @returns {Object} 包含minCycle和maxCycle的对象
     */
    getCycleRange() {
        return {
            minCycle: this.frontCycle,
            maxCycle: this.tailCycle - 1
        };
    }

    /**
     * 获取队列状态信息（用于调试）
     * @returns {Object} 队列状态对象
     */
    getStatus() {
        return {
            capacity: 2 * this.N,
            size: this.size,
            front: this.front,
            tail: this.tail,
            frontCycle: this.frontCycle,
            tailCycle: this.tailCycle,
            isEmpty: this.isEmpty(),
            isFull: this.isFull()
        };
    }


    async fetchData(cycle_begin, cycle_end) {
        console.log(`in fetchData, cycle_begin:${cycle_begin}, cycle_end:${cycle_end}`);
        const influx_time_start_ms = 1735660800000; // 基准时间戳(2025-01-01)

        // 计算实际时间戳范围
        const startTime = influx_time_start_ms + cycle_begin;
        const stopTime = influx_time_start_ms + cycle_end; // stop为exclusive，所以不需要-1


        // 转换为RFC3339格式的字符串
        const startTimeISO = new Date(startTime).toISOString();
        const stopTimeISO = new Date(stopTime).toISOString();

        try {
            const token = GlobalEnv['influx_token'];
            const url = GlobalEnv['influx_url'];
            const org = GlobalEnv['influx_org'];
            const bucket = GlobalEnv['influx_bucket'];

            // 创建InfluxDB客户端
            const client = new InfluxDB({ url, token });
            const queryClient = client.getQueryApi(org);

            // 构建Flux查询[3,8](@ref)
            const fluxQuery = `
                from(bucket: "${bucket}")
                    |> range(start: ${startTimeISO}, stop: ${stopTimeISO})
                    |> filter(fn: (r) => r._measurement == "${local_username}" and r.upload_id == "${local_upload_id}" )
                    // |> keep(columns: ["_time", "filename", "_value"])
            `;

            // 执行查询并收集结果[3](@ref)
            const rows = await queryClient.collectRows(fluxQuery);

            // 按时间戳分组处理数据
            const groupedData = {};

            for (let i = cycle_begin; i < cycle_end; i++) {
                groupedData[i] = { cycle_id: i };
            }
            for (const row of rows) {
                // 将时间转换为毫秒时间戳
                const timestamp = new Date(row._time).getTime();
                const cycle_id = timestamp - influx_time_start_ms;

                // 添加文件名和数据值[1,3](@ref)
                // groupedData[cycle_id].data.push({
                //     filename: row.filename,
                //     data: row._value.toString() // 确保数据为字符串类型
                // });
                groupedData[cycle_id][row.filename] = row._value.toString() // 确保数据为字符串类型
            }



            // 转换为数组并按时序排序
            const frameDatas = Object.values(groupedData);
            frameDatas.sort((a, b) => a.cycle_id - b.cycle_id);
            this.addData(cycle_begin, cycle_end, frameDatas)


        } catch (error) {
            console.error('从InfluxDB获取数据失败:', error);
            throw new Error(`数据下载失败: ${error.message}`);
        }

        console.log('fetchData ok!');
    }


}

let cache = new FrameDataCache(CACHE_SIZE);

const FrameDataCacheTool = {
    setUsername(username) {
        local_username = username;
    },

    setUploadId(upload_id) {
        local_upload_id = upload_id;
    },

    setSuccInit(succ) {
        succInit = succ;
    },

    getSuccInit() {
        return succInit;
    },

    async queryData(cycle_id, window_size, consider_valid) {
        if (local_upload_id === null) return null;
        if (local_username === null) return null;
        let ret = {};

        for (let i = 0; i < window_size; i++) {
            let oneframe = await cache.getData(cycle_id + i);
            for (let key in oneframe) {
                if (!ret[key]) ret[key] = 0;
                ret[key] += 1 / window_size;
            }
            //console.log(`cycle: ${cycle_id + i}, data`, oneframe);
        }
        if(consider_valid){
            // to complete
            console.log('consider_valid');
        }

        return ret;
    },
}


export default FrameDataCacheTool;