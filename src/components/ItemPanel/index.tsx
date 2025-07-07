import React, { forwardRef, RefAttributes, useContext, useState } from 'react';
import styles from "./index.less";
import { Collapse, Modal, Input, message } from "antd";
import 'antd/lib/collapse/style';
import 'antd/lib/modal/style';
import 'antd/lib/input/style';
import 'antd/lib/button/style';
import LangContext from "../../util/context";
import CodeAnalyseTool from "../../util/codeAnalyse";
import DumpAnalyseTool from "../../util/dumpAnalyse";
// import { setbottombarVisible } from '../../index';
import GlobalEnv from "../../util/globalEnv.js";

import i18n from "../../util/zhcn";
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
     // const { i18n } = useContext(LangContext);
     const [token, setToken] = useState(localStorage.getItem('token') || '');
     const [loadWorkspaceVisible, setLoadWorkspaceVisible] = useState(false);
     const [visible, setVisible] = useState(false);
     const [registerVisible, setRegisterVisible] = useState(false);
     const [username, setUsername] = useState(
          localStorage.getItem('username') || ''
     );
     const [succLogin, setSuccLogin] = useState(localStorage.getItem('token') ? true : false);
     const [password, setPassword] = useState('');


     const [reg_username, setRegUsername] = useState('');
     const [reg_password, setRegPassword] = useState('');
     const [reg_note, setRegNote] = useState('');

     const baseURL = GlobalEnv['api'];


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


     // const handleImportJson = (event) => {
     //      const files = event.target.files;
     //      if (files && files.length > 0 && window.ImportGraphDataFromJson) {
     //           const file = files[0];
     //           // CodeAnalyseTool.setTmpData(file);
     //           window.ImportGraphDataFromJson(); // 调用导入 JSON 的方法
     //      }
     // };


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
                    window.UpdateMinMaxCycle();
                    // if (window.parent && window.parent.setbottombarVisible) {
                    // setbottombarVisible(true);

                    // }
               })();

          }
     };

     const handleGenerateStructure = () => {
          // 调用生成结构图的逻辑
          if (CodeAnalyseTool.getSuccInitCodeInfo()) {
               if (window.GenerateGraph) {
                    window.GenerateGraph();
               }
          } else {
               alert('Please upload code!');
          }

     };


     // const handleExportJson = () => {
     //      // 调用生成结构图的逻辑
     //      if (CodeAnalyseTool.getSuccInitCodeInfo()) {
     //           if (window.ExportGraphDataToJson) {
     //                window.ExportGraphDataToJson();
     //           }
     //      } else {
     //           alert('Please upload code!');
     //      }

     // };

     // ================== 检查工作区函数 ==================
     const checkHasWorkspace = async (tmp_token) => {
          console.log('token', tmp_token);
          try {
               const response = await fetch(
                    `${baseURL}/has_workspace?token=${tmp_token}`
               );

               if (response.ok) {
                    const data = await response.json();
                    return data.has_workspace;
               } else {
                    message.error('检查工作区失败: ' + (await response.text()));
                    if (response.status === 401) {
                         console.log('身份过期');
                         message.error('登录状态已过期，请重新登录');
                         localStorage.removeItem('token');
                         return false;
                    }
                    throw new Error(`HTTP错误: ${response.status}`);
               }
          } catch (err) {
               if (err.response && err.response.status === 401) {
                    console.log('身份过期'); // 在接口调用处明确打印
                    message.error('登录状态已过期，请重新登录');
               }
               message.error('网络请求失败');
               return false;
          }
     };
     // ================== PDF下载逻辑 ==================
     const handleDownloadIntro = () => {
          if (!token) {
               message.warning('请先登录');
               return;
          }
          window.open(`${baseURL}/download/intro?token=${token}`);
     };


     const handleGotoIntro = () => {
          if (!token) {
               message.warning('请先登录');
               return;
          }
          // 新增：检查Token是否有效（调用已有的验证函数或新增验证逻辑）
          try {
               // 调用已有的checkHasWorkspace函数验证Token
               // 注意：checkHasWorkspace是异步函数，需要处理Promise
               const isTokenValid = checkHasWorkspace(token).then(hasWorkspace => {
                    return hasWorkspace !== false; // 如果返回false，可能是Token过期
               }).catch(() => false);
               if (!isTokenValid) {
                    message.error('登录状态已过期，请重新登录');
                    localStorage.removeItem('token');
                    setToken('');
                    setSuccLogin(false);
                    return;
               }
          } catch (error) {
               message.error('Token验证失败，请重新登录');
               return;
          }
          window.GotoIntroDocs();
     };



     const handleDownloadTechDoc = () => {
          if (!token) {
               message.warning('请先登录');
               return;
          }
          window.open(`${baseURL}/download/tech-doc?token=${token}`);
     };


     // ================== 登录逻辑 ==================
     const handleLogin = async () => {
          try {
               const formData = new FormData();
               formData.append('username', username);
               formData.append('password', password);

               const response = await fetch(`${baseURL}/login`, {
                    method: 'POST',
                    body: formData
               });

               if (response.ok) {
                    const data = await response.json();
                    localStorage.setItem('token', data.token);
                    localStorage.setItem('username', username);
                    setToken(data.token);
                    // console.log('data.token', data.token);
                    message.success('登录成功');
                    setSuccLogin(true);
                    setVisible(false);
                    console.log(data.role);
                    if (data.role == 'admin') {
                         console.log('GotoAdminPanel');
                         window.GotoAdminPanel();
                    }


                    // 检查是否有工作区
                    if (data.role == 'user') {
                         const hasWorkspace = await checkHasWorkspace(data.token);
                         if (hasWorkspace) {
                              setLoadWorkspaceVisible(true);
                         }
                    }
               } else {
                    message.error('登录失败: ' + (await response.text()));
                    if (response.status === 401) {
                         console.log('身份过期');
                         message.error('登录状态已过期，请重新登录');
                         localStorage.removeItem('token');
                         return false;
                    }
                    throw new Error(`HTTP错误: ${response.status}`);
               }
          } catch (err) {
               if (err.response && err.response.status === 401) {
                    localStorage.setItem('token', '');
                    localStorage.setItem('username', '');
                    setToken('');
                    message.success('退出登录');
                    setSuccLogin(false);
                    console.log('身份过期'); // 在接口调用处明确打印
                    message.error('登录状态已过期，请重新登录');
               }
               console.log(err);
               message.error('网络请求失败');
          }
     };

     const handleLogout = () => {
          localStorage.setItem('token', '');
          localStorage.setItem('username', '');
          setToken('');
          message.success('退出登录');
          setSuccLogin(false);
     }


     const handleRegister = async () => {
          try {
               const formData = new FormData();
               formData.append('username', reg_username);
               formData.append('password', reg_password);
               formData.append('note', reg_note);

               const response = await fetch(`${baseURL}/register`, {
                    method: 'POST',
                    body: formData
               });

               if (response.ok) {
                    const data = await response.json();
                    message.success('成功提交注册表，请等待管理员审批');
                    setRegisterVisible(false);
               } else {
                    message.error('注册失败: ' + (await response.text()));
                    if (response.status === 401) {
                         console.log('身份过期');
                         message.error('登录状态已过期，请重新登录');
                         localStorage.removeItem('token');
                         return false;
                    }
                    throw new Error(`HTTP错误: ${response.status}`);
               }
          } catch (err) {
               if (err.response && err.response.status === 401) {
                    console.log('身份过期'); // 在接口调用处明确打印
                    message.error('登录状态已过期，请重新登录');
                    localStorage.setItem('token', '');
                    localStorage.setItem('username', '');
                    setToken('');
                    message.success('退出登录');
                    setSuccLogin(false);
               }
               console.log(err);
               message.error('网络请求失败');
          }
     };

     // ================== 上传文件逻辑 ==================
     const handleUpload = async () => {
          if (!token) {
               message.warning('请先登录');
               return;
          }

          // 创建临时文件对象
          const temp_file = {
               timestamp: new Date().toISOString(),
               codePack: CodeAnalyseTool.pack2json(),
               dumpPack: DumpAnalyseTool.pack2json()
          };


          var cache = [];
          var json_str = JSON.stringify(temp_file, function (key, value) {
               if (typeof value === 'object' && value !== null) {
                    if (cache.indexOf(value) !== -1) {
                         return;
                    }
                    cache.push(value);
               }
               return value;
          });
          cache = null;	//释放cache


          // 生成JSON文件
          const jsonBlob = new Blob([json_str], {
               type: 'application/json'
          });
          const jsonFile = new File([jsonBlob], 'temp.json');

          const formData = new FormData();
          formData.append('token', token);
          formData.append('file', jsonFile);

          try {
               const response = await fetch(`${baseURL}/upload`, {
                    method: 'POST',
                    body: formData
               });

               if (response.ok) {
                    message.success('文件上传成功');
               } else {
                    message.error('上传失败: ' + (await response.text()));
                    if (response.status === 401) {
                         console.log('身份过期');
                         message.error('登录状态已过期，请重新登录');
                         localStorage.removeItem('token');
                         return false;
                    }
                    throw new Error(`HTTP错误: ${response.status}`);
               }
          } catch (err) {
               if (err.response && err.response.status === 401) {
                    console.log('身份过期'); // 在接口调用处明确打印
                    message.error('登录状态已过期，请重新登录');
               }
               message.error('上传请求失败');
          }
     };

     // ================== 下载文件逻辑 ==================
     const handleDownload = async () => {
          if (!token) {
               message.warning('请先登录');
               return;
          }

          try {
               const response = await fetch(
                    `${baseURL}/download?token=${token}`
               );

               if (response.ok) {
                    // 从响应头获取文件名
                    const contentDisposition = response.headers.get('Content-Disposition');
                    let filename = 'latest_file.json';

                    if (contentDisposition) {
                         const filenameMatch = contentDisposition.match(/filename="?(.+?)"?(;|$)/);
                         if (filenameMatch && filenameMatch[1]) {
                              filename = filenameMatch[1];
                         }
                    }

                    // 创建下载链接
                    const blob = await response.blob();
                    const url = window.URL.createObjectURL(blob);
                    const a = document.createElement('a');
                    a.href = url;
                    a.download = filename; // 使用后端返回的真实文件名
                    document.body.appendChild(a);
                    a.click();
                    document.body.removeChild(a);
                    window.URL.revokeObjectURL(url);

                    message.success('文件下载成功');
               } else {
                    const errorText = await response.text();
                    message.error(`下载失败: ${errorText}`);
                    if (response.status === 401) {
                         console.log('身份过期');
                         message.error('登录状态已过期，请重新登录');
                         localStorage.removeItem('token');
                         return false;
                    }
                    throw new Error(`HTTP错误: ${response.status}`);
               }
          } catch (err) {
               if (err.response && err.response.status === 401) {
                    console.log('身份过期'); // 在接口调用处明确打印
                    message.error('登录状态已过期，请重新登录');
               }
               message.error('下载请求失败');
               console.error('Download error:', err);
          }
     };

     // ================== 加载数据包逻辑 ==================
     const handleLoadPack = async () => {
          if (!token) {
               message.warning('请先登录');
               return;
          }

          try {
               // 显示加载状态
               message.loading({ content: '正在加载数据包...', key: 'loading' });

               const response = await fetch(
                    `${baseURL}/download_json?token=${token}`
               );

               if (response.ok) {
                    const data = await response.json();

                    // 处理获取的JSON数据（示例：更新状态或调用工具类）
                    if (data.content) {
                         // console.log(data.content);
                         CodeAnalyseTool.loadFromPack(data.content.codePack || {});
                         DumpAnalyseTool.loadFromPack(data.content.dumpPack || {});
                         window.UpdateMinMaxCycle();
                         window.UpdateGraph();
                         message.success({ content: '数据包加载成功', key: 'loading' });

                         // 可选：触发界面更新
                         // if (window.UpdateGraphData) {
                         //      window.UpdateGraphData(data.content);
                         // }
                    } else {
                         message.error({ content: '数据包内容为空', key: 'loading' });
                    }
               } else {
                    message.error({
                         content: `加载失败: ${await response.text()}`,
                         key: 'loading'
                    });
                    if (response.status === 401) {
                         console.log('身份过期');
                         message.error('登录状态已过期，请重新登录');
                         localStorage.removeItem('token');
                         return false;
                    }
                    throw new Error(`HTTP错误: ${response.status}`);
               }
          } catch (err) {
               if (err.response && err.response.status === 401) {
                    console.log('身份过期'); // 在接口调用处明确打印
                    message.error('登录状态已过期，请重新登录');
               }
               message.error({
                    content: '网络请求失败',
                    key: 'loading'
               });
               console.error('Load pack error:', err);
          }
     };






     return (
          <div ref={ref} className={styles.itemPanel} style={{ height }}>
               <Collapse bordered={false} defaultActiveKey={[]}>
                    <Panel header="账户操作" key="6" forceRender>
                         <div style={{ marginTop: 10 }}>

                              {!succLogin ? (
                                   <button
                                        className="btn-success"
                                        onClick={() => setVisible(true)}
                                   >
                                        用户登录
                                   </button>

                              ) : (
                                   <div
                                        className="username-display"
                                        aria-label="当前登录用户"  // 增强可访问性
                                        title={`已登录用户: ${username}`}
                                   >
                                        用户：{username}
                                   </div>

                              )}


                              {!succLogin ? (
                                   <button
                                        className="btn-success"
                                        onClick={() => setRegisterVisible(true)}
                                   >
                                        注册
                                   </button>

                              ) : (
                                   <button
                                        className="btn-success"
                                        onClick={() => handleLogout()}
                                   >
                                        退出登录
                                   </button>

                              )}


                         </div>

                         {/* 登录弹窗 */}
                         <Modal
                              title="登录"
                              visible={visible}
                              onOk={handleLogin}
                              onCancel={() => setVisible(false)}
                         >
                              <Input
                                   placeholder="用户名"
                                   value={username}
                                   onChange={(e) => setUsername(e.target.value)}
                                   style={{ marginBottom: 10 }}
                              />
                              <Input.Password
                                   placeholder="密码"
                                   value={password}
                                   onChange={(e) => setPassword(e.target.value)}
                              />
                         </Modal>


                         <Modal
                              title="注册"
                              visible={registerVisible}
                              onOk={handleRegister}
                              onCancel={() => setRegisterVisible(false)}
                         >
                              <Input
                                   placeholder="用户名"
                                   value={reg_username}
                                   onChange={(e) => setRegUsername(e.target.value)}
                                   style={{ marginBottom: 10 }}
                              />
                              <Input.Password
                                   placeholder="密码"
                                   value={reg_password}
                                   onChange={(e) => setRegPassword(e.target.value)}
                              />
                              <Input
                                   placeholder="备注"
                                   value={reg_note}
                                   onChange={(e) => setRegNote(e.target.value)}
                                   style={{ marginBottom: 10 }}
                              />
                         </Modal>

                         {/* 工作区加载确认弹窗 */}
                         <Modal
                              title="工作区恢复"
                              visible={loadWorkspaceVisible}
                              onOk={() => {
                                   handleLoadPack();
                                   setLoadWorkspaceVisible(false);
                              }}
                              onCancel={() => setLoadWorkspaceVisible(false)}
                              okText="加载"
                              cancelText="取消"
                         >
                              <p>是否加载上次保存的工作区？</p>
                         </Modal>
                    </Panel>
                    <Panel header={i18n['start']} key="1" forceRender>
                         <div style={{ marginTop: 10 }}>


                              <label
                                   htmlFor="file-upload" // 关联 input 的 id
                                   style={{
                                        display: 'inline-block',
                                        marginBottom: 10,
                                        padding: '10px 20px',
                                        backgroundColor: '#8a95a9',
                                        color: '#fff',
                                        borderRadius: '5px',
                                        cursor: 'pointer',
                                        width: '90%',
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
                                        backgroundColor: '#8a95a9',
                                        color: '#fff',
                                        borderRadius: '5px',
                                        cursor: 'pointer',
                                        width: '90%',
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
                         <div style={{ marginTop: 10 }}>
                              <button
                                   style={{
                                        display: 'inline-block',
                                        marginBottom: 10,
                                        padding: '10px 20px',
                                        backgroundColor: '#9aa690',
                                        color: '#fff',
                                        borderRadius: '5px',
                                        cursor: 'pointer',
                                        width: '90%',
                                   }}
                                   onClick={handleGenerateStructure}
                              >
                                   生成结构图
                              </button>
                         </div>

                    </Panel>

                    <Panel header={i18n['catch']} key="4" forceRender>

                    </Panel>
                    <Panel header={i18n['workspace']} key="5" forceRender>
                         <div style={{ marginTop: 10 }}>


                              <button
                                   className="btn-success"
                                   onClick={handleUpload}
                              >
                                   上传工作区
                              </button>

                              <button
                                   className="btn-warning"
                                   onClick={handleDownload}
                              >
                                   下载到本地
                              </button>

                              <button
                                   className="btn-info" // 新增样式类
                                   onClick={handleLoadPack}
                              >
                                   加载工作区
                              </button>
                         </div>
                    </Panel>
                    <Panel header={i18n['pdfdownload']} key="7" forceRender>
                         <div style={{ marginTop: 10 }}>
                              {/* <button
                                   style={{
                                        display: 'block',
                                        marginBottom: 10,
                                        padding: '10px 20px',
                                        backgroundColor: '#8a95a9',
                                        color: '#fff',
                                        borderRadius: '5px',
                                        cursor: 'pointer',
                                        width: '90%'
                                   }}
                                   onClick={handleDownloadIntro}
                              >
                                   项目介绍手册下载
                              </button>
                              <button
                                   style={{
                                        display: 'block',
                                        marginBottom: 10,
                                        padding: '10px 20px',
                                        backgroundColor: '#8a95a9',
                                        color: '#fff',
                                        borderRadius: '5px',
                                        cursor: 'pointer',
                                        width: '90%'
                                   }}
                                   onClick={handleDownloadTechDoc}
                              >
                                   技术文档下载
                              </button> */}

                              <button
                                   style={{
                                        display: 'block',
                                        marginBottom: 10,
                                        padding: '10px 20px',
                                        backgroundColor: '#8a95a9',
                                        color: '#fff',
                                        borderRadius: '5px',
                                        cursor: 'pointer',
                                        width: '90%'
                                   }}
                                   onClick={handleGotoIntro}
                              >
                                   项目介绍
                              </button>
                         </div>
                    </Panel>
               </Collapse>
          </div >
     )
});


export default ItemPanel;
