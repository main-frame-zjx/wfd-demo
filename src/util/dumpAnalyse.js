// dumpAnalyse.js
let final_result = '';
let filesToProcess = 0;
let succInit = false;
let cycleDict = {};

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
function readFileAsText(file) {
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

const DumpAnalyseTool = {

  async analyseDumpFiles(files) {
    if (files) {
      let result = [];
      for (let i = 0; i < files.length; i++) {
        const fileName = files[i].name;
        if (fileName.endsWith('model_vec')) {
          filesToProcess++;
        }
      }

      // 用于存储所有文件的读取和处理 Promise
      const fileProcessingPromises = [];

      for (let i = 0; i < files.length; i++) {
        const file = files[i];
        const fileName = file.name;
        if (fileName.endsWith('model_vec')) {
          const filePromise = readFileAsText(file)
            .then((fileContent) => {
              const lines = fileContent.split(/\r?\n/);
              let flag = 0;
              let num = 0;
              for (let i = 0; i < lines.length; i++) {
                const resultLine = [];
                const line = lines[i];
                if (flag === 1 && line.trim() !== '') {
                  const listLine = line.split(/\s+/);
                  resultLine.push(listLine[num]);
                  resultLine.push(`fileName: ${fileName}`);
                }
                if (line.startsWith('endclass')) {
                  flag = 1;
                }
                if (flag === 0) {
                  num += 1;
                }
                if (resultLine.length !== 0) {
                  result.push(resultLine);
                }
              }

            })
            .catch((error) => {
              console.error('Error reading file:', error);
            });
          fileProcessingPromises.push(filePromise);
        }
      }
      console.log('hello');
      // 等待所有文件处理完成
      await Promise.all(fileProcessingPromises);

      this.result_calc_rate(result);
    }
  },

  result_calc_rate(result) {
    result.sort((a, b) => {
      return a[0] - b[0];
    });
    let dic = {};
    for (let i = 0; i < result.length; i++) {
      const lineList = result[i];
      const cycle = parseInt(lineList[0]); // 提取 cycle
      const value = lineList[1]; // 提取 value
      if (!dic.hasOwnProperty(cycle)) {
        dic[cycle] = [value]; // 如果 cycle 不存在，初始化一个数组
      } else {
        dic[cycle].push(value); // 如果 cycle 存在，将 value 添加到数组中
      }
    }
    let fresult = '';
    for (const key in dic) {
      const parsedKey = parseInt(key);
      if (dic.hasOwnProperty(key)) {
        for (const value of dic[key]) {
          let num = 0;
          for (let cycle = parsedKey - 15; cycle < parsedKey + 15; cycle++) {
            if (dic.hasOwnProperty(cycle) && dic[cycle].includes(value)) {
              num++;
            }
          }
          const frequency = num / 30;
          fresult += `${parsedKey} ${value} ${frequency.toFixed(2)}\n`;
        }
      }
    }
    console.log('result:', fresult);
    this.setDumpInfo(fresult);
    succInit = true;
  },

  getDumpInfo() {
    return final_result;
  },

  setDumpInfo(result) {
    final_result = result;
  },

  getSuccInit() {
    return succInit;
  },

  initCycleDict() {

  },

  calcPortTransferRate() {

  }
};

export default DumpAnalyseTool;