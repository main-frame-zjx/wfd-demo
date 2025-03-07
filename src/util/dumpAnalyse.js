// dumpAnalyse.js
class DumpFile {
    constructor(fileName) {
        this.fileName = fileName;
        this.keys = [];
        this.values = [];
    }

    setKey(key) {
        this.keys.push(key.trim());
    }

    setValue(value) {
        this.values.push(value);
    }

    setN(n) {
        this.n = n;
    }
}

const DumpAnalyseTool = {

    //调用示例
    // const baseDir = '/wfd-demo/test_data/dump_data/';
    // const resultFilePath = 'result.txt';
    // const dFiles = integrate(baseDir, resultFilePath);
    integrate(baseDir, resultFilePath) {
        const resultFile = fs.createWriteStream(resultFilePath, { encoding: 'utf-8' });
        const files = fs.readdirSync(baseDir).map(file => path.join(baseDir, file));
        const dFiles = [];
    
        files.forEach(file => {
            if (fs.statSync(file).isFile()) {
                const fileName = path.basename(file);
                console.log(fileName);
    
                if (fileName.startsWith('integrate')) {
                    return; // Skip files starting with 'integrate'
                }
    
                const df = new DumpFile(fileName);
                const fileContent = fs.readFileSync(file, 'utf-8').split('\n');
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
                        resultFile.write(listLine[num]);
                        df.setN(num + 1);
                        resultFile.write(` className: ${className} fileName: ${fileName}\n`);
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
    
                dFiles.push(df);
            }
        });
    
        resultFile.end();
        return dFiles;
    },

    // 使用示例
    // const inputFilePath = 'result.txt';
    // const outputFilePath = 'result2.txt';
    // sort(inputFilePath, outputFilePath);
    sort(inputFilePath, outputFilePath) {
        // 读取输入文件
        const fileContent = fs.readFileSync(inputFilePath, 'utf-8');
        const lines = fileContent.split('\n');
    
        // 过滤空行和非空行
        const strList = lines.filter(line => line.trim() !== '');
    
        // 对行进行排序
        strList.sort();
    
        // 将排序后的内容写入输出文件
        const resultFile = fs.createWriteStream(outputFilePath, { encoding: 'utf-8' });
        strList.forEach(line => resultFile.write(`${line}\n`));
        resultFile.end();
    
        console.log(`处理完成，结果已写入文件: ${outputFilePath}`);
    },

    // 使用示例
    // const inputFilePath = 'result2.txt';
    // const outputFilePath = 'result3.txt';
    // calculate(inputFilePath, outputFilePath);
    calculate(inputFilePath, outputFilePath) {
        // 读取输入文件
        const fileContent = fs.readFileSync(inputFilePath, 'utf-8');
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
        const resultFile = fs.createWriteStream(outputFilePath, { encoding: 'utf-8' });

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
        console.log(`处理完成，结果已写入文件: ${outputFilePath}`);
    }
};

export default DumpAnalyseTool;