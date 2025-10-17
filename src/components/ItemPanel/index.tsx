import React, { forwardRef, RefAttributes, useContext, useState } from 'react';
import styles from "./index.less";
import { Collapse, Modal, Input, message, Checkbox, Progress } from "antd";
import 'antd/lib/collapse/style';
import 'antd/lib/modal/style';
import 'antd/lib/input/style';
import 'antd/lib/button/style';
import LangContext from "../../util/context";
import CodeAnalyseTool from "../../util/codeAnalyse";
import DumpAnalyseTool from "../../util/dumpAnalyse";
import FrameDataCacheTool from "../../util/frameDataCache";
// import { setbottombarVisible } from '../../index';
import GlobalEnv from "../../util/globalEnv.js";

import { Table, Button } from 'antd'; // 添加Table和Button组件导入
import { ColumnsType } from 'antd/es/table'; // 添加表格类型定义
import { DownloadOutlined, UploadOutlined, DeleteOutlined } from '@ant-design/icons'; // 添加图标

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

     const [token, setToken] = useState(localStorage.getItem('token') || '');
     const [username, setUsername] = useState(localStorage.getItem('username') || '');
     const [succLogin, setSuccLogin] = useState(localStorage.getItem('token') ? true : false);
     // const [token, setToken] = useState('');
     // const [username, setUsername] = useState('');
     // const [succLogin, setSuccLogin] = useState(false);


     const [visible, setVisible] = useState(false);
     const [registerVisible, setRegisterVisible] = useState(false);


     const [password, setPassword] = useState('');
     const [reg_username, setRegUsername] = useState('');
     const [reg_password, setRegPassword] = useState('');
     const [reg_note, setRegNote] = useState('');


     const [workspaceModalVisible, setWorkspaceModalVisible] = useState(false);
     const [uploadBigDataModalVisible, setUploadBigDataModalVisible] = useState(false);
     const [bigDataModalVisible, setBigDataModalVisible] = useState(false);
     const [blockEdgeModalVisible, setBlockEdgeModalVisible] = useState(false);
     const [workspaceList, setWorkspaceList] = useState<any[]>([]);
     const [bigDataList, setBigDataList] = useState<any[]>([]);
     const [blockEdgeList, setBlockEdgeList] = useState<any[]>([]);
     const [newWorkspaceName, setNewWorkspaceName] = useState('');
     const [newDumpfileName, setNewDumpfileName] = useState('');
     const [blockCycleStart, setBlockCycleStart] = useState(0);
     const [blockCycleEnd, setBlockCycleEnd] = useState(11185);
     const [blockParam, setBlockParam] = useState(1);

     const [showBigDumpUploadSection, setShowBigDumpUploadSection] = useState(false); // 控制第二部分显示
     const [uploadProgressVisible, setUploadProgressVisible] = useState(false); // 控制进度弹窗显示
     const [uploadProgress, setUploadProgress] = useState(0); // 上传进度百分比
     const [currentUploadFile, setCurrentUploadFile] = useState(''); // 当前上传的文件名

     const baseURL = GlobalEnv['api'];

     const fetchWorkspaces = async () => {
          try {
               const response = await fetch(`${baseURL}/get_workspace?token=${token}`);
               if (response.ok) {
                    const data = await response.json();
                    setWorkspaceList(data.files);
               } else {
                    message.error('获取工作区列表失败: ' + (await response.text()));
               }
          } catch (err) {
               message.error('网络请求失败');
          }
     };


     const fetchBigDataList = async () => {
          try {
               const token = GlobalEnv['influx_token'];
               const url = GlobalEnv['influx_url'];
               const org = GlobalEnv['influx_org'];
               const bucket = GlobalEnv['influx_bucket']; // 确保已配置 bucket 名称

               const client = new InfluxDB({ url, token });
               const queryClient = client.getQueryApi(org);
               const username = localStorage.getItem('username');

               // 构建 Flux 查询：获取 measurement=username 的 upload_id 所有唯一值
               const fluxQuery = `
                                   from(bucket: "${bucket}")
                                   |> range(start: 0)  // 全时间范围扫描
                                   |> filter(fn: (r) => r._measurement == "${username}")
                                   |> group(columns: ["upload_id"])  // 按Tag分组
                                   |> limit(n: 1)  // 每组取单点代表唯一值
                              `;

               // 执行查询并收集结果
               let dataList = []; // 准备数据结构
               // await queryClient.queryRows(fluxQuery, {
               //      next: (row, tableMeta) => {
               //           const rowData = tableMeta.toObject(row);
               //           if (rowData.upload_id) {
               //                // 构建符合Table组件的数据结构
               //                dataList.push({
               //                     upload_id: rowData.upload_id,   // 数据命名
               //                });
               //           }
               //      },
               //      error: (error) => {
               //           throw new Error(`查询失败: ${error.message}`);
               //      },
               //      complete: () => console.log('upload_id 查询完成')
               // });

               let uploadIds = new Set();
               await queryClient.queryRows(fluxQuery, {
                    next: (row, tableMeta) => {
                         const rowData = tableMeta.toObject(row);
                         if (rowData.upload_id) {
                              uploadIds.add(rowData.upload_id);
                         }
                    },
                    error: (error) => {
                         throw new Error(`查询失败: ${error.message}`);
                    },
                    complete: () => {
                         //console.log('upload_id 查询完成')
                         //console.log(uploadIds);
                         let cnt = 1;
                         for (let x of uploadIds) {
                              dataList.push({
                                   id: cnt,
                                   upload_id: x,   // 数据命名
                              });
                              cnt += 1;
                         }
                         //console.log(dataList);
                         setBigDataList(dataList);
                    }
               });

               // return Array.from(uploadIds); // 返回去重后的数组
          } catch (err) {
               console.error('InfluxDB 错误:', err);
               message.error('网络请求失败');
               // return []; // 返回空数组避免上层异常
          }
     };


     const handleWorkspaceOverwrite = (filename: string) => {
          Modal.confirm({
               title: '确认覆盖',
               content: `确定要覆盖 "${filename}" 工作区吗？`,
               onOk: () => {
                    // 这里添加实际覆盖逻辑
                    handleUploadWorkspace(filename, true);

               }
          });
     };

     const handleDownloadWorkspace = async (filename: string) => {
          if (!token) {
               message.warning('请先登录');
               return;
          }

          try {
               const formData = new FormData();
               formData.append('token', token);
               formData.append('filename', filename);

               const response = await fetch(`${baseURL}/download_json_workspace`, {
                    method: 'POST',
                    body: formData
               });

               if (response.ok) {
                    const data = await response.json();
                    // 假设后端返回 { filename: string, content: object }
                    const jsonObject = data.content; // 这里已经是JS对象了
                    message.success(`工作区 "${data.filename}" 下载并解析成功`);

                    // 这里你可以对解析后的 jsonObject 进行后续操作
                    console.log('下载的JSON对象:', jsonObject);
                    CodeAnalyseTool.loadFromPack(jsonObject.codePack);



                    if (CodeAnalyseTool.getSuccInitCodeInfo() && CodeAnalyseTool.getSuccInitRenderInfo()) {
                         if (window.UpdateGraph) {
                              window.UpdateGraph();
                         }
                    } else {
                         alert('init Code Info Error in handleDownloadWorkspace()!');
                    }
                    setWorkspaceModalVisible(false);

               } else {
                    const errorText = await response.text();
                    message.error('下载失败: ' + errorText);
                    if (response.status === 401) {
                         message.error('登录状态已过期，请重新登录');
                         localStorage.removeItem('token');
                         // 可能还需要更新前端状态，例如 setToken(null)
                    }
                    throw new Error(`HTTP错误: ${response.status}`);
               }
          } catch (err) {
               console.error('Download error:', err);
               // 错误处理已在上面response.ok的分支中进行，这里可以补充一些网络错误或意外错误的处理
               if (err.message !== 'HTTP错误: 401') { // 避免重复提示
                    message.error('下载请求失败');
               }
          }
     };

     const checkDataExists = async (username, upload_id) => {
          try {
               const token = GlobalEnv['influx_token'];
               const url = GlobalEnv['influx_url'];
               const org = GlobalEnv['influx_org'];
               const bucket = GlobalEnv['influx_bucket'];

               const client = new InfluxDB({ url, token });
               const queryClient = client.getQueryApi(org);

               // 构建一个简单的查询：只获取第一条记录
               const fluxQuery = `
      from(bucket: "${bucket}")
        |> range(start: 0)
        |> filter(fn: (r) => r._measurement == "${username}" and r.upload_id == "${upload_id}")
        |> limit(n: 1) // 只取一条记录，足够判断存在性
    `;

               let dataExists = false;

               // 如果查询到任何行，则数据存在
               for await (const row of queryClient.iterateRows(fluxQuery)) {
                    dataExists = true; // 只要有一行数据，就设置为 true
                    break;
               }

               return dataExists;

          } catch (error) {
               console.error('检查数据存在性时出错:', error);
               // 在错误情况下，可以根据逻辑返回 false 或抛出异常
               return false;
          }
     };

     const influx_time_start_ms = 1735660800000;
     const handleDownloadBigData = async (username: string, upload_id: string) => {
          console.log(`username:${username}, upload_id:${upload_id}`);
          let dataExist = await checkDataExists(username, upload_id);
          if (!dataExist) {
               message.info('无数据');
               return;
          }
          try {
               const token = GlobalEnv['influx_token'];
               const url = GlobalEnv['influx_url'];
               const org = GlobalEnv['influx_org'];
               const bucket = GlobalEnv['influx_bucket'];

               // 创建InfluxDB客户端
               const client = new InfluxDB({ url, token });
               const queryClient = client.getQueryApi(org);

               // 构建查询语句：获取时间范围和数据总量
               // 分别查询最小时间、最大时间和总条数
               const queryMin = `from(bucket: "${bucket}") |> range(start: 0) |> filter(fn: (r) => r._measurement == "${username}" and r.upload_id == "${upload_id}") |> group() |> min(column: "_time")`;
               const queryMax = `from(bucket: "${bucket}") |> range(start: 0) |> filter(fn: (r) => r._measurement == "${username}" and r.upload_id == "${upload_id}") |> group() |> max(column: "_time")`;
               const queryCount = `from(bucket: "${bucket}") |> range(start: 0) |> filter(fn: (r) => r._measurement == "${username}" and r.upload_id == "${upload_id}" ) |> group() |> count()`;

               // 分别执行并获取结果
               const minTimeResult = await queryClient.collectRows(queryMin); // 使用 collectRows 获取所有行
               const maxTimeResult = await queryClient.collectRows(queryMax);
               const totalCountResult = await queryClient.collectRows(queryCount);

               // 提取值，假设每个查询结果只有一行数据
               const minTime = minTimeResult.length > 0 ? new Date(minTimeResult[0]._time).getTime() : null;
               const maxTime = maxTimeResult.length > 0 ? new Date(maxTimeResult[0]._time).getTime() : null;
               const totalCount = totalCountResult.length > 0 ? totalCountResult[0]._value : 0;



               console.log(`数据总条数: ${totalCount}`);

               if (minTime !== null && maxTime !== null) {
                    // 计算与基准时间戳的差值（单位：毫秒）
                    const minCycle = minTime - influx_time_start_ms;
                    const maxCycle = maxTime - influx_time_start_ms;

                    console.log(`Cycle范围: minCycle=${minCycle}ms, maxCycle=${maxCycle}`);


                    // 显示完整信息
                    message.info(`用户 ${username} / 数据集 ${upload_id} 的数据信息:\n
                                   - Cycle范围: ${minCycle} 至 ${maxCycle}`);
                    // 把min和max同步到底下的进度条
                    DumpAnalyseTool.setMinCycle(minCycle);
                    DumpAnalyseTool.setMaxCycle(maxCycle);
                    window.UpdateMinMaxCycle();
                    FrameDataCacheTool.setUsername(username);
                    FrameDataCacheTool.setUploadId(upload_id);
                    FrameDataCacheTool.setSuccInit(true);

                    setBigDataModalVisible(false);


               } else {
                    message.warning(`未找到用户 ${username} 上传ID ${upload_id} 对应的数据`);
               }
          } catch (error) {
               console.error('查询时间戳范围失败:', error);
               message.error('下载失败，请检查网络连接或数据库配置');
          }
     };


     const handleDeleteBigData = async (username: string, upload_id: string) => {
          console.log(`准备删除数据 - username:${username}, upload_id:${upload_id}`);
          try {
               const token = GlobalEnv['influx_token'];
               const url = GlobalEnv['influx_url'];
               const org = GlobalEnv['influx_org'];
               const bucket = GlobalEnv['influx_bucket'];

               // 创建InfluxDB客户端
               const client = new InfluxDB({ url, token });

               // 使用一个极大的时间范围（1970年到未来10年）以确保覆盖所有数据[1,2](@ref)
               const startTime = "1970-01-01T00:00:00Z";
               const stopTime = "2035-12-31T23:59:59Z"; // 未来足够远的时间

               // 构建删除谓词[1,6](@ref)
               const predicate = `_measurement="${username}" AND upload_id="${upload_id}"`;

               // 方案一：使用InfluxDB客户端库的deleteApi（如果可用）[6](@ref)
               try {
                    // 尝试使用客户端库的deleteApi（需要确认你的客户端库版本是否支持）
                    const deleteApi = client.getDeleteApi ? client.getDeleteApi(org) : null;

                    if (deleteApi && typeof deleteApi.delete === 'function') {
                         // 使用库封装的delete方法
                         await deleteApi.delete(startTime, stopTime, predicate, bucket, org);
                    } else {
                         // 方案二：使用原始的HTTP请求[1,6](@ref)
                         const deleteUrl = `${url}/api/v2/delete?org=${encodeURIComponent(org)}&bucket=${encodeURIComponent(bucket)}`;
                         const response = await fetch(deleteUrl, {
                              method: 'POST',
                              headers: {
                                   'Authorization': `Token ${token}`,
                                   'Content-Type': 'application/json',
                              },
                              body: JSON.stringify({
                                   start: startTime,
                                   stop: stopTime,
                                   predicate: predicate
                              })
                         });

                         if (!response.ok) {
                              const errorText = await response.text();
                              throw new Error(`删除请求失败: ${response.status} ${response.statusText} - ${errorText}`);
                         }
                    }

                    message.success(`用户 ${username} 的数据集 ${upload_id} 已成功删除`);
                    setBigDataModalVisible(false);

               } catch (deleteError) {
                    console.error('调用删除API失败:', deleteError);
                    throw deleteError;
               }

          } catch (error) {
               console.error('删除数据失败:', error);
               message.error('删除失败: ' + error.message);
          }
     };


     const handleCodeUpload = (event) => {
          const files = event.target.files; // 获取文件夹中的所有文件
          if (files && files.length > 0) {

               for (let i = 0; i < files.length; i++) {
                    const file = files[i];
                    console.log('文件名:', file.name);
                    console.log('文件路径:', file.webkitRelativePath); // 文件的相对路径
                    console.log('文件大小:', file.size);
                    console.log('文件类型:', file.type);
               }

               (async () => {
                    // await CodeAnalyseTool.analyseCodeFiles(files);

                    await CodeAnalyseTool.analyseCodeFiles_cpp(files, window.GetUseTestData());
                    console.log("code_info:", CodeAnalyseTool.getCodeInfo());
                    alert("代码文件上传解析成功！");
               })();
          }

     };



     const { InfluxDB, Point } = require('@influxdata/influxdb-client')

     const handleBigDumpUpload = (event) => {
          // 显示进度弹窗

          const files = event.target.files; // 获取文件夹中的所有文件
          if (files) {

               setUploadProgressVisible(true);
               setUploadProgress(0);
               (async () => {
                    const token = GlobalEnv['influx_token']
                    const url = GlobalEnv['influx_url']

                    const client = new InfluxDB({ url, token })
                    let org = GlobalEnv['influx_org']
                    let bucket = GlobalEnv['influx_bucket']

                    let writeClient = client.getWriteApi(org, bucket, 'ms')
                    const upload_id = newDumpfileName;
                    const username = localStorage.getItem('username');

                    try {
                         DumpAnalyseTool.resetDumpInfo();
                         for (let i = 0; i < files.length; i++) {
                              const file = files[i];
                              await DumpAnalyseTool.analyseAndUploadBigDumpFile(username, upload_id, writeClient, file);
                              // 更新进度
                              const progress = Math.round(((i + 1) / files.length) * 100);
                              setUploadProgress(progress);
                         }
                         await DumpAnalyseTool.run_test_case(files, window.GetUseTestData());
                         alert("数据文件上传解析成功！");
                    } catch (error) {
                         console.error("上传过程中出错:", error);
                         message.error("文件上传失败");
                    } finally {
                         // 关闭进度弹窗
                         setUploadProgressVisible(false);
                         setBigDataModalVisible(false);
                    }
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

     const handleReGeneratePortEdge = () => {
          // 调用生成结构图的逻辑
          if (CodeAnalyseTool.getSuccInitCodeInfo()) {
               if (window.ReGenerateGraphEdge) {
                    window.ReGenerateGraphEdge();
               }
          } else {
               alert('Please upload code!');
          }

     };

     



     const queryDumpDataSection = () => {
          console.log('now in queryDumpDataSection');

          const token = GlobalEnv['influx_token']
          const url = GlobalEnv['influx_url']

          const client = new InfluxDB({ url, token })

          let org = GlobalEnv['influx_org']
          let bucket = GlobalEnv['influx_bucket']

          let queryClient = client.getQueryApi(org)
          let fluxQuery = `from(bucket: "test_bucket")
                         |> range(start: -30m)
                         |> filter(fn: (r) => r._measurement == "measurement1")`

          queryClient.queryRows(fluxQuery, {
               next: (row, tableMeta) => {
                    const tableObject = tableMeta.toObject(row)
                    console.log(tableObject)
               },
               error: (error) => {
                    console.error('\nError', error)
               },
               complete: () => {
                    console.log('\nSuccess')
               },
          })
          console.log('queryDumpDataSection finish');
     }


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

     const fetchBlockEdge = () => {

          let edgelist = CodeAnalyseTool.getBlockEdgeList();
          setBlockEdgeList(edgelist);
     }

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
               // const isTokenValid = checkHasWorkspace(token).then(hasWorkspace => {
               //      return hasWorkspace !== false; // 如果返回false，可能是Token过期
               // }).catch(() => false);

               const isTokenValid = true;
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

     const validateIntegerInput = (value: string, defaultValue: number): number => {
          const parsed = parseInt(value, 10);
          return isNaN(parsed) ? defaultValue : parsed;
     };

     const checkUploadBigDumpValid = (name: string) => {
          // 规则1: 检查字符串不为空且长度>=1
          if (!name || name.trim().length === 0) {
               alert("数据集名称不能为空");
               return false;
          }

          // 规则2: 检查字符串长度在1到80之间
          if (name.length < 1 || name.length > 80) {
               alert("数据集名称长度必须在1到80个字符之间");
               return false;
          }

          // 规则3: 检查是否与现有upload_id重复
          for (let data of bigDataList) {
               if (data.upload_id && data.upload_id === name) {
                    alert("数据集名称不能与现有数据集重复");
                    return false;
               }
          }

          return true;
     };


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
     const handleUploadWorkspace = async (workspaceName: string, overwrite: boolean) => {
          if (!token) {
               message.warning('请先登录');
               return;
          }
          if (!CodeAnalyseTool.getSuccInitCodeInfo() || !CodeAnalyseTool.getSuccInitRenderInfo()) {
               message.warning('请先上传代码文件并生成结构图！');
               return;
          }

          // 创建临时文件对象
          const temp_file = {
               timestamp: new Date().toISOString(),
               codePack: CodeAnalyseTool.pack2json()
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
          formData.append('filename', workspaceName);

          try {
               const url = overwrite ? 'overwriteWorkspace' : 'uploadWorkspace'
               const response = await fetch(`${baseURL}/${url}`, {
                    method: 'POST',
                    body: formData
               });

               if (response.ok) {
                    message.success('文件上传成功');
                    setWorkspaceModalVisible(false); // 关闭弹窗
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



     return (
          <div ref={ref} className={styles.itemPanel} style={{ height }}>
               <Collapse bordered={false} defaultActiveKey={[]}>

                    <Panel header={i18n['account']} key="1" forceRender>
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

                         {/* login modal */}
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

                         {/* register modal */}
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
                    </Panel>

                    <Panel header={i18n['code-upload']} key="2" forceRender>
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

                         </div>

                    </Panel>

                    <Panel header={i18n['dump-upload']} key="3" forceRender>
                         <div style={{ marginTop: 10 }}>

                              <button
                                   style={{
                                        display: 'inline-block',
                                        marginBottom: 10,
                                        padding: '10px 20px',
                                        backgroundColor: '#8a95a9',
                                        color: '#fff',
                                        borderRadius: '5px',
                                        cursor: 'pointer',
                                        width: '90%'
                                   }}
                                   onClick={() => {
                                        setUploadBigDataModalVisible(true);
                                        fetchBigDataList();
                                   }}
                              >
                                   上传dump数据集
                              </button>

                              <button
                                   style={{
                                        display: 'inline-block',
                                        marginBottom: 10,
                                        padding: '10px 20px',
                                        backgroundColor: '#8a95a9',
                                        color: '#fff',
                                        borderRadius: '5px',
                                        cursor: 'pointer',
                                        width: '90%'
                                   }}
                                   onClick={() => {
                                        fetchBigDataList();
                                        setBigDataModalVisible(true);
                                   }}
                              >
                                   下载dump数据集
                              </button>
                         </div>

                         {/* download dumpfile modal */}
                         <Modal
                              title="下载dumpfile数据集"
                              visible={bigDataModalVisible}
                              onCancel={() => setBigDataModalVisible(false)}
                              footer={null}
                              width={800}
                         >
                              <Table
                                   dataSource={bigDataList}
                                   columns={[
                                        {
                                             title: '数据命名',
                                             dataIndex: 'upload_id',
                                             key: 'upload_id'
                                        },
                                        {
                                             title: '操作',
                                             key: 'action',
                                             render: (_, record) => (
                                                  <div>

                                                       <Button
                                                            type="default"
                                                            icon={<DownloadOutlined />}
                                                            onClick={() => handleDownloadBigData(localStorage.getItem('username'), record.upload_id)}
                                                       >
                                                            使用该数据
                                                       </Button>

                                                       <Button
                                                            type="default"
                                                            icon={<DeleteOutlined />}
                                                            onClick={() => handleDeleteBigData(localStorage.getItem('username'), record.upload_id)}
                                                       >
                                                            删除数据集
                                                       </Button>
                                                  </div>
                                             )
                                        }
                                   ]}
                                   pagination={false}
                                   rowKey="id"
                                   style={{ marginBottom: 16 }}
                              />
                         </Modal>

                         {/* upload dumpfile modal */}
                         <Modal
                              title="上传dumpfile数据"
                              visible={uploadBigDataModalVisible}
                              onCancel={() => {
                                   setUploadBigDataModalVisible(false);
                                   setShowBigDumpUploadSection(false); // 关闭时重置显示状态

                              }}
                              footer={null}
                              width={800}
                         >
                              <div style={{ display: 'flex', marginTop: 16, marginBottom: 16 }}>
                                   <Input
                                        placeholder="输入新数据集名称"
                                        value={newDumpfileName}
                                        onChange={(e) => setNewDumpfileName(e.target.value)}
                                        style={{ flex: 1, marginRight: 8 }}
                                        disabled={showBigDumpUploadSection}
                                   />

                              </div>

                              <div style={{ display: 'flex', alignItems: 'center', marginBottom: 16 }}>


                                   <Button
                                        type="primary"
                                        onClick={() => {
                                             // 检查名字是否合法，是否和前面已经使用的重复，如果失败，则上方提示，成功则进入下一步
                                             const temp_valid = checkUploadBigDumpValid(newDumpfileName);
                                             if (temp_valid) {
                                                  setShowBigDumpUploadSection(true); // 点击后显示第二部分
                                             }

                                        }}
                                   >
                                        下一步
                                   </Button>
                              </div>



                              {showBigDumpUploadSection && (
                                   <div >
                                        <label
                                             htmlFor="test-big-dump-upload" // 关联 input 的 id
                                             style={{
                                                  display: 'inline-block',
                                                  marginBottom: 10,
                                                  padding: '10px 20px',
                                                  backgroundColor: '#3878efff',
                                                  color: '#fff',
                                                  borderRadius: '5px',
                                                  cursor: 'pointer',
                                                  width: '30%',
                                             }}
                                        >
                                             上传dumpfile数据集
                                        </label>
                                        <input
                                             id="test-big-dump-upload"
                                             type="file"
                                             webkitdirectory="true"
                                             onChange={handleBigDumpUpload}
                                             style={{ display: 'none' }} // 隐藏 input
                                        />
                                   </div>
                              )}
                         </Modal>

                         {/* upload dumpfile progress bar modal */}
                         <Modal
                              title="文件上传进度"
                              visible={uploadProgressVisible}
                              footer={null}
                              closable={false}
                              width={400}
                         >
                              <div style={{ textAlign: 'center' }}>
                                   <p>正在上传: {currentUploadFile}</p>
                                   <Progress
                                        percent={uploadProgress}
                                        status={uploadProgress === 100 ? "success" : "active"}
                                        style={{ margin: '20px 0' }}
                                   />
                                   <p>已完成: {uploadProgress}%</p>
                              </div>
                         </Modal>


                    </Panel>

                    <Panel header={i18n['task']} key="4" forceRender>
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

                              <button
                                   style={{
                                        display: 'inline-block',
                                        marginBottom: 10,
                                        padding: '10px 20px',
                                        backgroundColor: '#9aa690',
                                        color: '#fff',
                                        borderRadius: '5px',
                                        cursor: 'pointer',
                                        width: '90%'
                                   }}
                                   onClick={() => {
                                        handleReGeneratePortEdge()
                                   }}
                              >
                                   重新生成port边
                              </button>
                         </div>



                    </Panel>

                    <Panel header={i18n['workspace']} key="5" forceRender>
                         <div style={{ marginTop: 10 }}>
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
                                   onClick={() => {
                                        setWorkspaceModalVisible(true);
                                        fetchWorkspaces();
                                   }}
                              >
                                   管理工作区
                              </button>
                         </div>

                         <Modal
                              title="工作区管理"
                              visible={workspaceModalVisible}
                              onCancel={() => setWorkspaceModalVisible(false)}
                              footer={null}
                              width={800}
                         >
                              <Table
                                   dataSource={workspaceList}
                                   columns={[
                                        {
                                             title: '文件名',
                                             dataIndex: 'filename',
                                             key: 'filename'
                                        },
                                        {
                                             title: '上传时间',
                                             dataIndex: 'uploaded_at',
                                             key: 'uploaded_at'
                                        },
                                        {
                                             title: '操作',
                                             key: 'action',
                                             render: (_, record) => (
                                                  <div>
                                                       <Button
                                                            type="primary"
                                                            icon={<UploadOutlined />}
                                                            onClick={() => handleWorkspaceOverwrite(record.filename)}
                                                            style={{ marginRight: 8 }}
                                                       >
                                                            覆盖
                                                       </Button>
                                                       <Button
                                                            type="default"
                                                            icon={<DownloadOutlined />}
                                                            onClick={() => handleDownloadWorkspace(record.filename)}
                                                       >
                                                            下载
                                                       </Button>
                                                  </div>
                                             )
                                        }
                                   ]}
                                   pagination={false}
                                   rowKey="id"
                                   style={{ marginBottom: 16 }}
                              />

                              <div style={{ display: 'flex', marginTop: 16 }}>
                                   <Input
                                        placeholder="输入工作区名称"
                                        value={newWorkspaceName}
                                        onChange={(e) => setNewWorkspaceName(e.target.value)}
                                        style={{ flex: 1, marginRight: 8 }}
                                   />
                                   <Button
                                        type="primary"
                                        onClick={() => {
                                             const name = newWorkspaceName || 'temp_workspace';
                                             handleUploadWorkspace(name, false);
                                             setNewWorkspaceName('');
                                        }}
                                   >
                                        上传新工作区
                                   </Button>
                              </div>
                         </Modal>
                    </Panel>

                    <Panel header={i18n['select']} key="6" forceRender>
                         <div style={{ marginTop: 10 }}>
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
                                   onClick={() => {
                                        fetchBlockEdge();
                                        setBlockEdgeModalVisible(true);
                                   }}
                              >
                                   筛选堵塞边
                              </button>
                         </div>

                         {/* select block port modal */}
                         <Modal
                              title="筛选阻塞边"
                              visible={blockEdgeModalVisible}
                              onCancel={() => setBlockEdgeModalVisible(false)}
                              footer={null}
                              width={800}
                         >
                              <Table
                                   dataSource={blockEdgeList}
                                   columns={[
                                        {
                                             title: 'Port ID',
                                             dataIndex: 'pi_id',
                                             key: 'pi_id'
                                        },
                                        {
                                             title: 'Port变量名',
                                             dataIndex: 'name',
                                             key: 'name'
                                        },
                                        {
                                             title: 'Port文件名',
                                             dataIndex: 'dump_file_name',
                                             key: 'dump_file_name'
                                        },
                                        {
                                             title: '阻塞周期',
                                             dataIndex: 'blockNum',
                                             key: 'blockNum'
                                        },

                                   ]}
                                   pagination={{
                                        pageSize: 10, // 新增：每页显示10条数据
                                        showSizeChanger: false,
                                        showQuickJumper: true,
                                   }}
                                   rowKey="id"
                                   style={{ marginBottom: 16 }}
                              />

                              <div style={{ display: 'flex', marginTop: 16 }}>

                                   <div style={{ flex: 1, marginRight: 8 }}>
                                        <span>输入筛选起点:</span>
                                        <Input
                                             placeholder="输入筛选起点"
                                             value={blockCycleStart}
                                             onChange={(e) => setBlockCycleStart(validateIntegerInput(e.target.value, blockCycleStart))}
                                             style={{ width: '100%' }}
                                        />
                                   </div>

                                   <div style={{ flex: 1, marginRight: 8 }}>
                                        <span>输入筛选终点:</span>
                                        <Input
                                             placeholder="输入筛选终点"
                                             value={blockCycleEnd}
                                             onChange={(e) => setBlockCycleEnd(validateIntegerInput(e.target.value, blockCycleEnd))}
                                             style={{ width: '100%' }}
                                        />
                                   </div>

                                   <div style={{ flex: 1, marginRight: 8 }}>
                                        <span>输入阻塞阈值:</span>
                                        <Input
                                             placeholder="输入阻塞阈值"
                                             value={blockParam}
                                             onChange={(e) => setBlockParam(validateIntegerInput(e.target.value, blockParam))}
                                             style={{ width: '100%' }}
                                        />
                                   </div>


                                   <Button
                                        type="primary"
                                        onClick={() => {
                                             // const name = newWorkspaceName || 'temp_workspace';
                                             // handleUploadWorkspace(name, false);
                                             // setNewWorkspaceName('');
                                        }}
                                   >
                                        筛选
                                   </Button>

                              </div>
                         </Modal>
                    </Panel>

                    <Panel header={i18n['online-doc']} key="7" forceRender>
                         <div style={{ marginTop: 10 }}>


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
