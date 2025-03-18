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
          (async () => {
               await CodeAnalyseTool.analyseCodeFiles(files);
               console.log("code_info:", CodeAnalyseTool.getCodeInfo());
               alert("代码文件上传解析成功！");
          })();
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
               (async () => {
                    await DumpAnalyseTool.analyseDumpFiles(files);
                    console.log("dump_info:", DumpAnalyseTool.getDumpInfo());
                    alert("数据文件上传解析成功！");
                    // if (window.parent && window.parent.setbottombarVisable) {
                    //      window.parent.setbottombarVisable(true);
                    // }
               })();

          }
     };

     const handleGenerateStructure = () => {
          // 调用生成结构图的逻辑
          console.log("生成结构图");
          alert("生成结构图功能正在开发中！");
     };

     return (
          <div ref={ref} className={styles.itemPanel} style={{ height }}>
               <Collapse bordered={false} defaultActiveKey={[]}>
                    <Panel header={i18n['start']} key="1" forceRender>
                         <div style={{ marginTop: 10 }}>

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

                    </Panel>
                    <Panel header={i18n['task']} key="2" forceRender>
                         <div>
                              <button
                                   style={{
                                        display: 'block',
                                        marginBottom: 10,
                                        padding: '10px 20px',
                                        backgroundColor: '#28a745',
                                        color: '#fff',
                                        borderRadius: '5px',
                                        cursor: 'pointer',
                                        width: '100%',
                                   }}
                                   onClick={handleGenerateStructure}
                              >
                                   生成结构图
                              </button>
                         </div>

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
