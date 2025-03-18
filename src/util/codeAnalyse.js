// codeAnalyse.js
let codeInfo = null
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
    },

    getCodeInfo() {
        return codeInfo;
    },

    setCodeInfo(info) {
        codeInfo = info;
    }


};



export default CodeAnalyseTool;