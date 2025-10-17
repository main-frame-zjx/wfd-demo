// dumpAnalyse.js
let final_result = '';
let filesToProcess = 0;
let succInit = false;
let cycleDict = {};
let minCycle = 0;
let maxCycle = 0;
let dumpInfo = null;
import { message } from "antd";
const influx_time_start_ms = 1735660800000;  //start from 2025-01-01

class DumpInfo {
  constructor() {
    this.minCycle = -1;
    this.maxCycle = -1;
    this.dumpFileNum = 0;
    this.dumpFileNameArray = [];
    this.dumpFileDataLineNum = new Map();
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

function dump_analyse_test_case1(dumpInfo, referDumpInfo) {
  console.log('dumpInfo', dumpInfo);
  console.log('referDumpInfo', referDumpInfo);
  let pass = true;
  //if (dumpInfo.minCycle != referDumpInfo.minCycle) pass = false;
  //if (dumpInfo.maxCycle != referDumpInfo.maxCycle) pass = false;
  if (dumpInfo.dumpFileNum != referDumpInfo.dumpFileNum) pass = false;
  for (let i = 0; i < dumpInfo.dumpFileNum; i++) {
    let dump_file_name = dumpInfo.dumpFileNameArray[i];
    if (dumpInfo.dumpFileDataLineNum.get(dump_file_name) != referDumpInfo.dumpFileDataLineNum.get(dump_file_name)) pass = false;
  }
  return pass;
};


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


const { InfluxDB, Point } = require('@influxdata/influxdb-client')
const DumpAnalyseTool = {

  // async analyseDumpFiles(files) {
  //   if (files) {
  //     let result = [];
  //     for (let i = 0; i < files.length; i++) {
  //       const fileName = files[i].name;
  //       if (fileName.endsWith('model_vec')) {
  //         filesToProcess++;
  //       }
  //     }

  //     // 用于存储所有文件的读取和处理 Promise
  //     const fileProcessingPromises = [];

  //     for (let i = 0; i < files.length; i++) {
  //       const file = files[i];
  //       const fileName = file.name;
  //       if (fileName.endsWith('model_vec')) {
  //         const filePromise = readFileAsText(file)
  //           .then((fileContent) => {
  //             const lines = fileContent.split(/\r?\n/);
  //             let flag = 0;
  //             let num = 0;
  //             for (let i = 0; i < lines.length; i++) {
  //               const resultLine = [];
  //               const line = lines[i];
  //               if (flag === 1 && line.trim() !== '') {
  //                 const listLine = line.split(/\s+/);
  //                 const cycle_id_idx = listLine.length - 1;
  //                 resultLine.push(listLine[cycle_id_idx]);
  //                 resultLine.push(`fileName:${fileName}`);
  //               }
  //               if (line.startsWith('endclass')) {
  //                 flag = 1;
  //               }
  //               if (flag === 0) {
  //                 num += 1;
  //               }
  //               if (resultLine.length !== 0) {
  //                 result.push(resultLine);
  //               }
  //             }

  //           })
  //           .catch((error) => {
  //             console.error('Error reading file:', error);
  //           });
  //         fileProcessingPromises.push(filePromise);
  //       }
  //     }

  //     // 等待所有文件处理完成
  //     await Promise.all(fileProcessingPromises);

  //     this.result_calc_rate(result);
  //   }
  // },

  // this function use for one dumpfile
  async analyseAndUploadBigDumpFile(username, upload_id, writeClient, file) {
    if (file) {
      const fileProcessingPromises = [];
      const fileName = file.name;
      if (fileName.endsWith('model_vec')) {
        const filePromise = readFileAsText(file)
          .then(async (fileContent) => {
            //update dumpInfo
            dumpInfo.dumpFileNum += 1;
            dumpInfo.dumpFileNameArray.push(fileName);
            let minCyc = -1;
            let maxCyc = -1;
            let dataLenNum = 0;
            //parse content
            const lines = fileContent.split(/\r?\n/);
            let flag = 0; // flag means after 'endclass' 
            let num = 0;
            let data_valid_pos = -1;
            const resultArray = []; //for one file
            for (let i = 0; i < lines.length; i++) {
              const line = lines[i];
              if (flag === 1 && line.trim() !== '') {
                const listLine = line.split(/\s+/);
                const cycle_id_idx = listLine.length - 1;
                const cyc_id = parseInt(listLine[cycle_id_idx], 10);
                //update dumpInfo
                dataLenNum += 1;
                if (minCyc == -1) {
                  minCyc = cyc_id;
                  maxCyc = cyc_id;
                }
                else {
                  minCyc = Math.min(minCyc, cyc_id);
                  maxCyc = Math.max(maxCyc, cyc_id);
                }

                //parse

                let data_valid = '1';
                if (data_valid_pos >= 0 && data_valid_pos < cycle_id_idx)
                  data_valid = listLine[data_valid_pos];
                resultArray.push([listLine[cycle_id_idx], data_valid]);
              }
              if (line.startsWith('endclass')) {
                flag = 1;
              }
              if (flag === 0 && line.startsWith('send[')) {
                data_valid_pos = i - 1;
              }
              if (flag === 0 && line.startsWith('valid[')) {
                data_valid_pos = i - 1;
              }
              if (flag === 0) {
                num += 1;
              }
            }
            //update dumpInfo
            dumpInfo.dumpFileDataLineNum.set(fileName, dataLenNum);
            if (dumpInfo.minCycle == -1) {
              dumpInfo.minCycle = minCyc;
              dumpInfo.maxCycle = maxCyc;
            } else {
              dumpInfo.minCycle = Math.min(dumpInfo.minCycle, minCyc);
              dumpInfo.maxCycle = Math.max(dumpInfo.maxCycle, maxCyc);
            }
            //send to influxDB
            this.sendLine2Influx(username, upload_id, fileName, writeClient, resultArray);
            await writeClient.flush();
          })
          .catch((error) => {
            console.error('Error reading file:', error);
          });
        fileProcessingPromises.push(filePromise);
      }

      await Promise.all(fileProcessingPromises);
    }
  },

  // for one line data in dumpfile, send it to InfluxDB
  sendLine2Influx(username, upload_id, filename, writeClient, resultArray) {
    const BATCH_SIZE = 1000;
    const n = resultArray.length;
    // console.log('dumpfile: ', filename, ', data line: ', n);
    let points = [];
    for (let i = 0; i < n; i++) {
      let timestamp = influx_time_start_ms + parseInt(resultArray[i][0]);
      let point = new Point(username)
        .tag('upload_id', upload_id)
        .tag('filename', filename)
        .intField('valid', resultArray[i][1])
        .timestamp(timestamp)
      points.push(point);
      // send data to InfluxDB per 1000 lines
      if (points.length >= BATCH_SIZE) {
        writeClient.writePoints(points);
        points = [];
      }
    }
    // send left data to InfluxDB
    if (points.length > 0) {
      writeClient.writePoints(points);
    }
  },

  resetDumpInfo() {
    dumpInfo = new DumpInfo();
  },

  async run_test_case(files, useTestData) {
    if (useTestData) {

      let referDumpInfo = new DumpInfo();
      await this.analyseDumpFilesToRefer(files, referDumpInfo);
      let pass = dump_analyse_test_case1(dumpInfo, referDumpInfo);
      if (pass) {
        message.info("数据解析器测试通过！\ndump_analyse_test_case1");
      } else {
        message.error("数据解析器测试未通过！\ndump_analyse_test_case1");
      }


    }
  },

  async analyseDumpFilesToRefer(files, referDumpInfo) {
    if (files) {

      // 用于存储所有文件的读取和处理 Promise
      const fileProcessingPromises = [];

      for (let i = 0; i < files.length; i++) {
        const file = files[i];
        const fileName = file.name;
        if (fileName.endsWith('.txt')) {
          console.log('analyse: ', fileName);
          const filePromise = readFileAsTextPromise(file)
            .then((fileContent) => {
              const lines = fileContent.split(/\r?\n/);
              let curLine = 0;
              let dumpFileNum = parseInt(lines[curLine]);
              if (dumpFileNum) {
                referDumpInfo.dumpFileNum = dumpFileNum;
                curLine++;
              }
              else {
                alert(fileName + ', this file are not required!');
                return;
              }

              for (let i = 0; i < referDumpInfo.dumpFileNum; i++) {
                const lineContent = lines[curLine];
                const params = lineContent.split(/\s+/);
                if (params.length !== 2) {
                  alert(fileName + ", line " + curLine.toString() + ", param num error!");
                  return;
                }
                referDumpInfo.dumpFileNameArray.push(params[0]);
                referDumpInfo.dumpFileDataLineNum.set(params[0], parseInt(params[1]));
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

  // result_calc_rate(result) {
  //   result.sort((a, b) => {
  //     return a[0] - b[0];
  //   });
  //   let dic = {};
  //   for (let i = 0; i < result.length; i++) {
  //     const lineList = result[i];
  //     const cycle = parseInt(lineList[0]); // 提取 cycle
  //     if (i == 0) {
  //       minCycle = cycle;
  //     }
  //     if (i == result.length - 1) {
  //       maxCycle = cycle;
  //     }
  //     const value = lineList[1]; // 提取 value
  //     if (!dic.hasOwnProperty(cycle)) {
  //       dic[cycle] = [value]; // 如果 cycle 不存在，初始化一个数组
  //     } else {
  //       dic[cycle].push(value); // 如果 cycle 存在，将 value 添加到数组中
  //     }
  //   }
  //   cycleDict = dic;
  //   console.log('Dict:', cycleDict);
  //   let fresult = '';
  //   for (const key in dic) {
  //     const parsedKey = parseInt(key);
  //     if (dic.hasOwnProperty(key)) {
  //       for (const value of dic[key]) {
  //         let num = 0;
  //         for (let cycle = parsedKey - 15; cycle < parsedKey + 15; cycle++) {
  //           if (dic.hasOwnProperty(cycle) && dic[cycle].includes(value)) {
  //             num++;
  //           }
  //         }
  //         const frequency = num / 30;
  //         fresult += `${parsedKey} ${value} ${frequency.toFixed(2)}\n`;
  //       }
  //     }
  //   }
  //   console.log('result:', fresult);
  //   this.setDumpInfo(fresult);
  //   succInit = true;
  // },

  // getDumpInfo() {
  //   return final_result;
  // },

  // setDumpInfo(result) {
  //   final_result = result;
  // },

  getSuccInit() {
    return succInit;
  },

  calcPortTransferRate(cycle_id, dump_file_name, window_size) {
    let num = 0;
    let fileName = 'fileName:' + dump_file_name;

    for (let cycle = cycle_id; cycle < cycle_id + window_size; cycle++) {
      if (cycle in cycleDict) {

        if (cycleDict[cycle].indexOf(fileName) == -1) {
          // nothing to do
        } else {
          num++;
        }

        // for (let value of cycleDict[cycle]) {
        //   // console.log('value',value);
        //   if (fileName == value) {
        //     // console.log('num:',num);
        //     num++;
        //   }
        // }
      }
    }
    // console.log('num',num);
    let frequency = num / window_size;
    return frequency;
  },
  getMinCycle() {
    return minCycle;
  },
  setMinCycle(minCycle_) {
    minCycle = minCycle_;
  },
  getMaxCycle() {
    return maxCycle;
  },
  setMaxCycle(maxCycle_) {
    maxCycle = maxCycle_;
  },



};

export default DumpAnalyseTool;