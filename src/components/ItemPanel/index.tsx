import React, { forwardRef, RefAttributes, useContext } from 'react';
import styles from "./index.less";
import { Collapse } from "antd";
import 'antd/lib/collapse/style';
import LangContext from "../../util/context";
import CodeAnalyseTool from "../../util/codeAnalyse";
import DumpAnalyseTool from "../../util/dumpAnalyse";
const { Panel } = Collapse;


declare module 'react' {
     interface InputHTMLAttributes<T> extends HTMLAttributes<T> {
          webkitdirectory?: string;
     }
}


export interface ItemPanelProps {
     height: number;
}
const ItemPanel = forwardRef<any, ItemPanelProps>(({ height }, ref) => {
     const { i18n } = useContext(LangContext);


     const handleCodeUpload = (event) => {
          const files = event.target.files; // 获取文件夹中的所有文件
          if (files) {

               for (let i = 0; i < files.length; i++) {
                    const file = files[i];
                    console.log('文件名:', file.name);
                    console.log('文件路径:', file.webkitRelativePath); // 文件的相对路径
                    console.log('文件大小:', file.size);
                    console.log('文件类型:', file.type);
               }
          }

          CodeAnalyseTool.analyseCodeFiles(files);
          console.log(CodeAnalyseTool.getCodeInfo());
     };


     const handleDumpUpload = (event) => {
          const files = event.target.files; // 获取文件夹中的所有文件
          if (files) {
               for (let i = 0; i < files.length; i++) {
                    const file = files[i];
                    console.log('文件名:', file.name);
                    console.log('文件路径:', file.webkitRelativePath); // 文件的相对路径
                    console.log('文件大小:', file.size);
                    console.log('文件类型:', file.type);
               }

               let result = [];
               let completedFiles = 0;
               let filesToProcess = 0;
               for (let i = 0; i < files.length; i++) {
                    const fileName = files[i].name;
                    if (fileName.endsWith('model_vec')) {
                         filesToProcess++;
                    }
               }
               for (let i = 0; i < files.length; i++) {
                    const file = files[i];
                    const fileName = file.name;
                    if (fileName.endsWith('model_vec')) {
                         const reader = new FileReader();
                         reader.onload = function (e) {
                              const fileContent = e.target.result as string;
                              const lines = fileContent.split(/\r?\n/);
                              // console.log(`文件名: ${fileName}, 文件内容: ${fileContent}`);
                              let flag = 0;
                              let num = 0;
                              for (let i = 0; i < lines.length; i++) {
                                   const resultLine = [];
                                   const line = lines[i];
                                   if (flag === 1 && line.trim() !== '') {
                                        // console.log('line:', line);
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
                                   // console.log('result:', result);
                              }
                              // 每完成一个文件的处理，计数器加 1
                              completedFiles++;
                              // 当所有文件都处理完成时，打印结果
                              if (completedFiles === filesToProcess) {
                                   console.log('result:', result);
                                   // sort
                                   result.sort((a, b) => {
                                        return a[0] - b[0];
                                   });
                                   // calculate
                                   let dic = {};
                                   for (let i = 0; i < result.length; i++) {
                                        const lineList = result[i];
                                        const cycle = parseInt(lineList[0]); // 提取 cycle
                                        // console.log('cycle:', cycle);
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
                                             // 遍历键对应的值数组
                                             for (const value of dic[key]) {
                                                  let num = 0;
                                                  // 循环遍历从 key - 15 到 key + 15 的范围
                                                  for (let cycle = parsedKey - 15; cycle < parsedKey + 15; cycle++) {
                                                       if (dic.hasOwnProperty(cycle) && dic[cycle].includes(value)) {
                                                            num++;
                                                       }
                                                  }
                                                  const frequency = num / 30;
                                                  // 拼接结果字符串
                                                  fresult += `${parsedKey} ${value} ${frequency.toFixed(2)}\n`;
                                             }
                                        }
                                   }
                                   console.log('result:', fresult);
                              }
                         }
                         // 以文本形式读取文件
                         reader.readAsText(file);
                    };
               }
          }
     };

     return (
          <div ref={ref} className={styles.itemPanel} style={{ height }}>
               <Collapse bordered={false} defaultActiveKey={[]}>
                    <Panel header={i18n['start']} key="1" forceRender>
                         <div style={{ marginTop: 10 }}>
                              {/* <button
                                   style={{ display: 'block', marginBottom: 10, width: '100%' }}
                                   onClick={() => alert('上传代码文件')}
                              >
                                   上传代码文件
                              </button>
                              <button
                                   style={{ display: 'block', width: '100%' }}
                                   onClick={() => alert('上传数据文件')}
                              >
                                   上传数据文件
                              </button>

                              <input
                                   type="file"
                                   webkitdirectory="true" // 允许选择文件夹
                                   onChange={handleFolderChange}
                              /> */}

                              <label
                                   htmlFor="file-upload" // 关联 input 的 id
                                   style={{
                                        display: 'inline-block',
                                        marginBottom: 10,
                                        padding: '10px 20px',
                                        backgroundColor: '#007bff',
                                        color: '#fff',
                                        borderRadius: '5px',
                                        cursor: 'pointer',
                                   }}
                              >
                                   上传代码文件
                              </label>
                              <input
                                   id="file-upload"
                                   type="file"
                                   webkitdirectory="true"
                                   onChange={handleCodeUpload}
                                   style={{ display: 'none' }} // 隐藏 input
                              />


                              <label
                                   htmlFor="dump-upload" // 关联 input 的 id
                                   style={{
                                        display: 'inline-block',
                                        marginBottom: 10,
                                        padding: '10px 20px',
                                        backgroundColor: '#007bff',
                                        color: '#fff',
                                        borderRadius: '5px',
                                        cursor: 'pointer',
                                   }}
                              >
                                   上传数据文件
                              </label>
                              <input
                                   id="dump-upload"
                                   type="file"
                                   webkitdirectory="true"
                                   onChange={handleDumpUpload}
                                   style={{ display: 'none' }} // 隐藏 input
                              />
                         </div>
                         {/* <img data-item={"{clazz:'start',size:'30*30',label:''}"}
                              src={require('../assets/flow/start.svg')} style={{ width: 42, height: 42 }} />
                         <div>{i18n['startEvent']}</div>
                         <img data-item={"{clazz:'timerStart',size:'30*30',label:''}"}
                              src={require('../assets/flow/timer-start.svg')} style={{ width: 42, height: 42 }} />
                         <div>{i18n['timerEvent']}</div>
                         <img data-item={"{clazz:'messageStart',size:'30*30',label:''}"}
                              src={require('../assets/flow/message-start.svg')} style={{ width: 42, height: 42 }} />
                         <div>{i18n['messageEvent']}</div>
                         <img data-item={"{clazz:'signalStart',size:'30*30',label:''}"}
                              src={require('../assets/flow/signal-start.svg')} style={{ width: 42, height: 42 }} />
                         <div>{i18n['signalEvent']}</div> */}
                    </Panel>
                    <Panel header={i18n['task']} key="2" forceRender>
                         <img data-item={"{clazz:'userTask',size:'80*44',label:'" + i18n['userTask'] + "'}"}
                              src={require('../assets/flow/user-task.svg')} style={{ width: 80, height: 44 }} />
                         <div>{i18n['userTask']}</div>
                         {/*<img data-item="{clazz:'subProcess',size:'80*44',label:''}"*/}
                         {/*       src={require('../assets/flow/sub-process.svg')} style={{width: 80, height: 44}}/>*/}
                         {/*<div>{i18n['subProcess']}</div>*/}
                         <img data-item={"{clazz:'scriptTask',size:'80*44',label:'" + i18n['scriptTask'] + "'}"}
                              src={require('../assets/flow/script-task.svg')} style={{ width: 80, height: 44 }} />
                         <div>{i18n['scriptTask']}</div>
                         <img data-item={"{clazz:'javaTask',size:'80*44',label:'" + i18n['javaTask'] + "'}"}
                              src={require('../assets/flow/java-task.svg')} style={{ width: 80, height: 44 }} />
                         <div>{i18n['javaTask']}</div>
                         <img data-item={"{clazz:'mailTask',size:'80*44',label:'" + i18n['mailTask'] + "'}"}
                              src={require('../assets/flow/mail-task.svg')} style={{ width: 80, height: 44 }} />
                         <div>{i18n['mailTask']}</div>
                         <img data-item={"{clazz:'receiveTask',size:'80*44',label:'" + i18n['receiveTask'] + "'}"}
                              src={require('../assets/flow/receive-task.svg')} style={{ width: 80, height: 44 }} />
                         <div>{i18n['receiveTask']}</div>
                    </Panel>
                    <Panel header={i18n['gateway']} key="3" forceRender>
                         <img data-item="{clazz:'exclusiveGateway',size:'40*40',label:''}"
                              src={require('../assets/flow/exclusive-gateway.svg')} style={{ width: 48, height: 48 }} />
                         <div>{i18n['exclusiveGateway']}</div>
                         <img data-item="{clazz:'parallelGateway',size:'40*40',label:''}"
                              src={require('../assets/flow/parallel-gateway.svg')} style={{ width: 48, height: 48 }} />
                         <div>{i18n['parallelGateway']}</div>
                         <img data-item="{clazz:'inclusiveGateway',size:'40*40',label:''}"
                              src={require('../assets/flow/inclusive-gateway.svg')} style={{ width: 48, height: 48 }} />
                         <div>{i18n['inclusiveGateway']}</div>
                    </Panel>
                    <Panel header={i18n['catch']} key="4" forceRender>
                         <img data-item={"{clazz:'timerCatch',size:'50*30',label:''}"}
                              src={require('../assets/flow/timer-catch.svg')} style={{ width: 58, height: 38 }} />
                         <div>{i18n['timerEvent']}</div>
                         <img data-item={"{clazz:'messageCatch',size:'50*30',label:''}"}
                              src={require('../assets/flow/message-catch.svg')} style={{ width: 58, height: 38 }} />
                         <div>{i18n['messageEvent']}</div>
                         <img data-item={"{clazz:'signalCatch',size:'50*30',label:''}"}
                              src={require('../assets/flow/signal-catch.svg')} style={{ width: 58, height: 38 }} />
                         <div>{i18n['signalEvent']}</div>
                    </Panel>
                    <Panel header={i18n['end']} key="5" forceRender>
                         <img data-item={"{clazz:'end',size:'30*30',label:''}"}
                              src={require('../assets/flow/end.svg')} style={{ width: 42, height: 42 }} />
                         <div>{i18n['endEvent']}</div>
                    </Panel>
               </Collapse>
          </div>
     )
});

export default ItemPanel;
