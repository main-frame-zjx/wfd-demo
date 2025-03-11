// codeAnalyse.js
let codeInfo = {}

const CodeAnalyseTool = {
    analyseCodeFiles(files) {
        this.sampleInit();
    },

    sampleInit() {
        codeInfo = {
            moduleNum: 10,
            moduleInstanceNum: 37,
            portInstanceNum: 4,
            moduleArray: [],
            moduleInstanceArray: [],
            portInstanceArray: []
        }
    },

    getCodeInfo() {
        return codeInfo;
    },


};



export default CodeAnalyseTool;