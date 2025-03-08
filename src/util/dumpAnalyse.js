// dumpAnalyse.js
const fs = require('fs');
const path = require('path');

class DumpFile {
    constructor(name) {
        this.filename = name;
        this.keyList = [];
        this.valueList = [];
        this.N;
    }

    setN(n) {
        this.N = n;
    }

    setKey(k) {
        this.keyList.push(k);
    }

    setValue(v) {
        // v 是行数组，valueList 是 [[], [], ...]
        this.valueList.push(v);
    }

    printValue(k) {
        let n = 0;
        for (let key of this.keyList) {
            n++;
            if (k === key) {
                break;
            }
        }
        n--;
        for (let l of this.valueList) {
            console.log(l[n]);
        }
    }
}

const DumpAnalyseTool = {
    
    //调用示例
    // const resultFilePath = 'result.txt';
    // const dFiles = integrate(files);
    integrate(dFiles,fnames) {
        console.log('处理',fnames);
        let resultFile = []
        for(let i = 0; i < dFiles.length; i++) {
            const fileContent = dFiles[i];
            const df = new DumpFile(fnames[i]);
            let flag = 0;
            let num = 0;
            let className = '';
            fileContent.forEach(line => {
                if (line.startsWith('class')) {
                    const listLine = line.split(/\s+/);
                    className = listLine[1];
                }

                if (flag === 1 && line.trim() !== '') {
                    const listLine = line.split(/\s+/);
                    df.setValue(listLine);
                    resultFile.push(listLine[num]);
                    df.setN(num + 1);
                    resultFile.push(` fileName: ${fileName}`);
                }
        
                if (line.startsWith('endclass')) {
                    flag = 1;
                }

                if (flag === 0) {
                    num += 1;
                    if (!line.startsWith('class') && !line.startsWith('endclass')) {
                        df.setKey(line);
                    }
                }
            });
        }

        // dFiles.push(df);
        return resultFile;
    },

    
    sort(rf) {
        // 读取输入文件
        const fileContent = rf;
        const lines = [];
        for (let i = 0; i < fileContent.length; i++) {
            lines.push(fileContent[i]);
        }
    
        // 过滤空行和非空行
        const strList = lines.filter(line => line.trim() !== '');
    
        // 对行进行排序
        strList.sort();
    
        // 将排序后的内容写入输出文件
        const resultFile = [];
        strList.forEach(line => resultFile.push(`${line}`));
        resultFile.end();
    
        console.log(`处理完成，结果已写入文件`);
        return 
    },

    
    calculate() {
        // 读取输入文件
        const fileContent = fs.readFileSync('/wfd-demo/test_data/dump_data/result2.txt', 'utf-8');
        const lines = fileContent.split('\n');
    
        // 初始化字典
        const dic = new Map();
    
        // 解析每一行并填充字典
        lines.forEach(line => {
            if (line.trim() === '') return; // 跳过空行
    
            const lineList = line.split(/\s+/); // 按空格分割行
            const cycle = parseInt(lineList[0], 10); // 提取 cycle
            const value = lineList[2]; // 提取 value
    
            if (!dic.has(cycle)) {
                dic.set(cycle, [value]); // 如果 cycle 不存在，初始化一个数组
            } else {
                dic.get(cycle).push(value); // 如果 cycle 存在，将 value 添加到数组中
            }
        });
        // 打开输出文件
        const resultFile = fs.createWriteStream('/wfd-demo/test_data/dump_data/result3.txt', { encoding: 'utf-8' });

        // 计算频率并写入结果
        dic.forEach((values, key) => {
            values.forEach(value => {
                let num = 0;
                for (let cycle = key - 25; cycle <= key + 25; cycle++) {
                    if (dic.has(cycle) && dic.get(cycle).includes(value)) {
                        num++;
                    }
                }
                const frequency = num / 50; // 计算频率
                resultFile.write(`${key} ${value} ${frequency.toFixed(2)}\n`); // 写入结果
            });
        });

        resultFile.end();
        console.log(`处理完成，结果已写入文件`);
    }
};

export default DumpAnalyseTool;