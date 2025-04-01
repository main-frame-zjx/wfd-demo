// codeAnalyse.js
let codeInfo = null;
let succInitCodeInfo = false;
let succInitRenderInfo = false;
let tmpData = null;
let renderInfo = null
class CodeInfo {
    constructor() {
        this.moduleNum = 0;
        this.moduleInstanceNum = 0;
        this.portInstanceNum = 0;
        this.moduleArray = [];
        this.moduleInstanceArray = [];
        this.portInstanceArray = [];
    }
}

class RenderInfo {
    constructor() {
        this.data = {
            nodes: [],
            edges: [],
        };
        this.nodesId2Index = {};
    }
}


class MxModule {
    constructor(m_id, name, instance_num, module_type) {
        this.m_id = m_id;
        this.name = name;
        this.instance_num = instance_num;
        this.module_type = module_type;
    }
}

class MxModuleInstance {
    constructor(mi_id, mptr_id, module_name, index) {
        this.mi_id = mi_id;
        this.mptr_id = mptr_id;
        this.module_name = module_name;
        this.index = index;
    }
}

class MxPortInstance {
    constructor(pi_id, name, dump_file_name, receive_index, transmit_index) {
        this.pi_id = pi_id;
        this.name = name;
        this.dump_file_name = dump_file_name;
        this.receive_index = receive_index;
        this.transmit_index = transmit_index;
    }
}

function readFileAsTextPromise(file) {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = (e) => {
            if (e.target && typeof e.target.result === 'string') {
                resolve(e.target.result);
            } else {
                reject(new Error('Failed to read file as text.'));
            }
        };
        reader.onerror = (e) => {
            reject(e.target.error || new Error('Unknown error occurred.'));
        };
        reader.readAsText(file);
    });
}

const CodeAnalyseTool = {
    async analyseCodeFiles(files) {
        this.initCodeInfo();
        await this.readTxtInit(files);
    },

    async readTxtInit(files) {
        if (files) {

            // 用于存储所有文件的读取和处理 Promise
            const fileProcessingPromises = [];

            for (let i = 0; i < files.length; i++) {
                const file = files[i];
                const fileName = file.name;
                if (fileName.endsWith('txt')) {
                    const filePromise = readFileAsTextPromise(file)
                        .then((fileContent) => {
                            const lines = fileContent.split(/\r?\n/);
                            let flag = 0;
                            let curLine = 0;
                            let moduleNum = parseInt(lines[curLine]);
                            if (moduleNum) {
                                codeInfo.moduleNum = moduleNum;
                                curLine++;
                            }
                            else {
                                alert(fileName + ', this file are not required!');
                                return;
                            }

                            for (let i = 0; i < codeInfo.moduleNum; i++) {
                                const lineContent = lines[curLine];
                                const params = lineContent.split(/\s+/);
                                if (params.length !== 4) {
                                    alert(fileName + ", line " + curLine.toString() + ", param num error!");
                                    return;
                                }
                                let newModule = new MxModule(parseInt(params[0]), params[1], parseInt(params[2]), params[3]);
                                codeInfo.moduleArray.push(newModule);
                                curLine++;
                            }


                            let moduleInstanceNum = parseInt(lines[curLine]);
                            if (moduleInstanceNum) {
                                codeInfo.moduleInstanceNum = moduleInstanceNum;
                                curLine++;
                            }
                            else {
                                alert(fileName + ', this file are not required!');
                                return;
                            }

                            for (let i = 0; i < codeInfo.moduleInstanceNum; i++) {
                                const lineContent = lines[curLine];
                                const params = lineContent.split(/\s+/);
                                if (params.length !== 4) {
                                    alert(fileName + ", line " + curLine.toString() + ", param num error!");
                                    return;
                                }
                                let newModuleInstance = new MxModuleInstance(parseInt(params[0]), parseInt(params[1]), params[2], parseInt(params[3]));
                                codeInfo.moduleInstanceArray.push(newModuleInstance);
                                curLine++;
                            }


                            let portInstanceNum = parseInt(lines[curLine]);
                            if (portInstanceNum) {
                                codeInfo.portInstanceNum = portInstanceNum;
                                curLine++;
                            }
                            else {
                                alert(fileName + ', this file are not required!');
                                return;
                            }

                            for (let i = 0; i < codeInfo.portInstanceNum; i++) {
                                const lineContent = lines[curLine];
                                const params = lineContent.split(/\s+/);
                                if (params.length !== 5) {
                                    alert(fileName + ", line " + curLine.toString() + ", param num error!");
                                    return;
                                }
                                let newPortInstance = new MxPortInstance(parseInt(params[0]), params[1], params[2], parseInt(params[3]), parseInt(params[4]));
                                codeInfo.portInstanceArray.push(newPortInstance);
                                curLine++;
                            }

                            succInitCodeInfo = true;
                        })
                        .catch((error) => {
                            console.error('Error reading file:', error);
                        });
                    fileProcessingPromises.push(filePromise);
                }
            }
            // 等待所有文件处理完成
            await Promise.all(fileProcessingPromises);

        }
    },

    sampleInit() {
        info = {
            moduleNum: 10,
            moduleInstanceNum: 37,
            portInstanceNum: 4,
            moduleArray: [],
            moduleInstanceArray: [],
            portInstanceArray: []
        };
        this.setCodeInfo(info);
    },

    initCodeInfo() {
        codeInfo = new CodeInfo();
        renderInfo = new RenderInfo();
    },

    getCodeInfo() {
        return codeInfo;
    },

    setCodeInfo(info) {
        codeInfo = info;
    },

    getSuccInitCodeInfo() {
        return succInitCodeInfo;
    },

    setSuccInitCodeInfo(succ) {
        succInitCodeInfo = succ;
    },

    getSuccInitRenderInfo() {
        return succInitRenderInfo;
    },



    getTmpData() {
        return tmpData;
    },

    setTmpData(data) {
        tmpData = data;
    },

    initRenderInfo(dpc_id) {
        let nodes = [];
        let edges = [];
        if (dpc_id == -1) {

        }
        else if (dpc_id >= 0 && dpc_id < 4) {

            const { drawModuleInstanceArray, drawPortInstanceArray, nodesId2Index } = this.selectModuleInstanceAndPortToDraw(dpc_id);

            for (let i = 0; i < drawModuleInstanceArray.length; i++) {
                let mi = drawModuleInstanceArray[i];
                let mi_name = codeInfo.moduleArray[mi.mptr_id].module_type === "Single" ? mi.module_name : mi.module_name + '[' + mi.index.toString() + ']';
                let node = {
                    id: mi.mi_id.toString(),
                    x: 100 + 50 * i,
                    y: 100 + 50 * i,
                    label: mi_name,
                    clazz: 'scriptTask',
                    //active: true
                };
                nodes.push(node);
            }

            for (let i = 0; i < drawPortInstanceArray.length; i++) {
                let pi = drawPortInstanceArray[i];
                let edge = {
                    source: pi.transmit_index.toString(),
                    target: pi.receive_index.toString(),
                    sourceAnchor: 0,
                    targetAnchor: 1,
                    clazz: 'flow',
                    MxLabel: pi.name,
                    MxFileName: pi.dump_file_name,
                    //shape: 'arc',
                    // shape: 'cubic-vertical',
                    color: 'rgb(194, 207, 209)',
                    // label: pi.dump_file_name,
                    // curveOffset: 10,

                };
                edges.push(edge);
            }
            this.setPositionAndAnchor(nodes, edges, nodesId2Index, 900, 500);
            console.log('nodesId2Index', nodesId2Index);
            renderInfo.data.nodes = nodes;
            renderInfo.data.edges = edges;
            renderInfo.nodesId2Index = nodesId2Index;
        }


        console.log('renderInfo', renderInfo);
        succInitRenderInfo = true;
        return { nodes: nodes, edges: edges };
    },

    updateRenderData(currentCycle) {
        renderInfo.data.edges.forEach(edge => {
            edge.color = this.calcColor(currentCycle);
        });
        // console.log(renderInfo.data.edges);
    },

    calcColor(currentCycle) {
        let minCycle = 8000;
        let maxCycle = 11000;
        // 计算归一化比例（0~1）
        let ratio = (currentCycle - minCycle) / (maxCycle - minCycle);
        ratio = Math.max(0, Math.min(1, ratio)); // 边界约束

        // 基于亮度线性映射的 RGB 计算
        const brightness = Math.round(ratio * 255);
        return `rgb(${brightness}, ${brightness}, ${brightness})`;
    },

    getRenderInfo() {
        return renderInfo;
    },


    setPositionAndAnchor(nodes, edges, nodesId2Index, x_max, y_max) {

        let num = nodes.length;
        let x_posArray = [1, 1, 3, 7, 9, 5, 11, 7, 4, -1];
        let y_posArray = [1, -1, 1, 0, 0, 1, 0, 1, -1, 0];
        let x_posmax = 11 + 1;
        let x_posmin = -1 - 1;
        let y_posmax = 1 + 0.5;
        let y_posmin = -1 - 0.5;
        if (num > x_posArray.length) return;
        for (let i = 0; i < num; i++) {
            let x_ = x_max * (x_posArray[i] - x_posmin) / (x_posmax - x_posmin);
            nodes[i].x = parseInt(x_);
            let y_ = y_max * (y_posArray[i] - y_posmin) / (y_posmax - y_posmin);
            nodes[i].y = parseInt(y_);
        }

        for (let i = 0; i < edges.length; i++) {
            let edge = edges[i];
            let targetIndex = nodesId2Index[edge.target];
            let sourceIndex = nodesId2Index[edge.source];
            if (y_posArray[targetIndex] > y_posArray[sourceIndex]) {
                edge.targetAnchor = 0;
                edge.sourceAnchor = 2;

            } else if (y_posArray[targetIndex] < y_posArray[sourceIndex]) {
                edge.targetAnchor = 2;
                edge.sourceAnchor = 0;
            } else {
                if (x_posArray[targetIndex] > x_posArray[sourceIndex]) {
                    edge.targetAnchor = 3;
                    edge.sourceAnchor = 1;
                } else {
                    edge.targetAnchor = 1;
                    edge.sourceAnchor = 3;
                }
            }


            // console.log('targetIndex', targetIndex);
            // console.log('sourceIndex', sourceIndex);
            // console.log('targetAnchor', edge.targetAnchor);
            // console.log('sourceAnchor', edge.sourceAnchor);
        }
    },


    selectModuleInstanceAndPortToDraw(dpc_id) {
        let drawModuleInstanceArray = [];
        let drawPortInstanceArray = [];
        let drawModuleId = [];
        let nodesId2Index = {};

        for (let i = 0; i < codeInfo.moduleInstanceNum; i++) {
            let mi = codeInfo.moduleInstanceArray[i];
            let type = codeInfo.moduleArray[mi.mptr_id].module_type;
            if (type === 'Single' || (type === 'Multi' && mi.index == dpc_id)) {
                nodesId2Index[mi.mi_id.toString()] = drawModuleInstanceArray.length;
                drawModuleInstanceArray.push(mi);
                drawModuleId.push(mi.mi_id);

            }
        }
        const mid_set = new Set(drawModuleId);

        for (let i = 0; i < codeInfo.portInstanceNum; i++) {
            let pi = codeInfo.portInstanceArray[i];
            if (pi.receive_index === 'null' || pi.transmit_index === 'null') {
                continue;
            }
            if (mid_set.has(pi.receive_index) && mid_set.has(pi.transmit_index)) {
                drawPortInstanceArray.push(pi);
            }
        }
        return { drawModuleInstanceArray, drawPortInstanceArray, nodesId2Index }
    },


};



export default CodeAnalyseTool;