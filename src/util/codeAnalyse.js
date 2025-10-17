// codeAnalyse.js
let codeInfo = null;
let succInitCodeInfo = false;
let succInitRenderInfo = false;
let tmpData = null;
let renderInfo = null

import { message } from "antd";
import CodeProcessFunc from "./codeProcessFunc";


class CodeInfo {
    constructor() {
        this.moduleNum = 0;
        this.moduleInstanceNum = 0;
        this.portNum = 0;
        this.portInstanceNum = 0;
        this.moduleArray = [];
        this.moduleInstanceArray = [];
        this.portArray = [];
        this.portInstanceArray = [];
        this.moduleNameMap = new Map();
        this.moduleInstanceMap = new Map();
        this.portNameMap = new Map();
        this.portInstanceMap = new Map();
    }
}

class RenderInfo {
    constructor() {
        this.data = {
            nodes: [],
            edges: [],
        };
        this.nodesId2Index = {};
        this.combinedEdges = [];
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

class MxPort {
    constructor(p_id, port_type, instance_num, name,) {
        this.p_id = p_id;
        this.port_type = port_type;
        this.instance_num = instance_num;
        this.name = name;
    }
}

class MxPortInstance {
    constructor(pi_id, name, dump_file_name, index, receive_index, transmit_index) {
        this.pi_id = pi_id;
        this.name = name;
        this.dump_file_name = dump_file_name;
        this.index = index
        this.receive_index = receive_index;
        this.transmit_index = transmit_index;
    }
}


class CombinedEdge {
    constructor(edgeProperty, source, target, fileNameArray, portInstanceIndexArray) {
        this.edgeProperty = edgeProperty;
        this.source = source;
        this.target = target;
        this.fileNameArray = fileNameArray;
        this.portInstanceIndexArray = portInstanceIndexArray;
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

//parse "gia_vsd_draw_id0[0]" to "gia_vsd_draw_id0_0"
function parsePortName(name) {
    // use regex to parse
    const match = name.match(/^(.+?)\[(\d+)\]$/);
    if (match) {
        return `${match[1]}_${match[2]}`;
    } else {
        // not match, return default value
        return `${name}_${0}`;
    }
}


function code_analyse_test_case1(codeInfo, referCodeInfo) {
    // console.log('codeInfo', codeInfo);
    // console.log('referCodeInfo', referCodeInfo);
    let pass = true;
    if (codeInfo.moduleNum != referCodeInfo.moduleNum) pass = false;
    if (codeInfo.moduleInstanceNum != referCodeInfo.moduleInstanceNum) pass = false;
    if (codeInfo.portInstanceNum != referCodeInfo.portInstanceNum) pass = false;
    //check port instance associate with dumpfile
    for (let i = 0; i < codeInfo.portInstanceNum; i++) {
        let dump_file_name = referCodeInfo.portInstanceArray[i].dump_file_name;
        let name = referCodeInfo.portInstanceArray[i].name;
        const searchKey = parsePortName(name);
        let pi = codeInfo.portInstanceMap.get(searchKey);
        if (pi.dump_file_name != dump_file_name) pass = false;
    }
    return pass;
};

const CodeAnalyseTool = {
    async analyseCodeFiles(files) {
        this.initCodeInfo();
        await this.readTxtInit(files, codeInfo);
    },

    async analyseCodeFilesToRefer(files, referCodeInfo) {
        await this.readTxtInit(files, referCodeInfo);
    },

    async analyseCodeFiles_cpp(files, useTestData) {
        this.initCodeInfo();

        await this.readCppInit(files);

        if (useTestData) {
            // check analyse result match with .txt file
            let referCodeInfo = new CodeInfo();
            await this.analyseCodeFilesToRefer(files, referCodeInfo);
            let pass = code_analyse_test_case1(codeInfo, referCodeInfo);
            if (pass) {
                message.info("代码解析器测试通过！\ncode_analyse_test_case1");
            } else {
                message.error("代码解析器测试未通过！\ncode_analyse_test_case1");
            }


        }
    },



    // extract and save module, moduleInstance, port, portInstance.
    async readCppInit(files) {
        if (files) {
            let finalCode = '';

            // expand for loop
            for (let i = 0; i < files.length; i++) {
                const file = files[i];
                const fileName = file.name;
                if (fileName.endsWith('.cpp') || fileName.endsWith('.c') || fileName.endsWith('.h')) {
                    await readFileAsTextPromise(file)
                        .then((fileContent) => {
                            let expandedCode = CodeProcessFunc.expandForLoop(fileContent);
                            finalCode += CodeProcessFunc.replaceToString(expandedCode);
                        })
                        .catch((error) => {
                            console.error('Error reading file:', error);
                        });
                }
            }

            // console.log(finalCode);
            CodeProcessFunc.extractModule(finalCode, codeInfo.moduleNameMap, codeInfo.moduleArray);
            CodeProcessFunc.generateModuleInstance(codeInfo.moduleArray, codeInfo.moduleInstanceMap, codeInfo.moduleInstanceArray);
            codeInfo.moduleNum = codeInfo.moduleArray.length;
            codeInfo.moduleInstanceNum = codeInfo.moduleInstanceArray.length;

            CodeProcessFunc.extractPort(finalCode, codeInfo.portNameMap, codeInfo.portArray);
            CodeProcessFunc.generatePortInstance(codeInfo.portArray, codeInfo.portInstanceMap, codeInfo.portInstanceArray);
            CodeProcessFunc.extractPortInstanceFileName(finalCode, codeInfo.portInstanceMap);
            CodeProcessFunc.extractConnectInfo(finalCode, codeInfo.portInstanceMap, codeInfo.moduleInstanceMap);
            // CodeProcessFunc.printPortInstances(codeInfo.portInstanceArray);
            codeInfo.portNum = codeInfo.portArray.length;
            codeInfo.portInstanceNum = codeInfo.portInstanceArray.length;
            succInitCodeInfo = true;
        }
    },

    // from txt file read module, moduleInstance, port, portInstance.
    async readTxtInit(files, _codeInfo_) {
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
                            let flag = 0;
                            let curLine = 0;
                            let moduleNum = parseInt(lines[curLine]);
                            if (moduleNum) {
                                _codeInfo_.moduleNum = moduleNum;
                                curLine++;
                            }
                            else {
                                alert(fileName + ', this file are not required!');
                                return;
                            }

                            for (let i = 0; i < _codeInfo_.moduleNum; i++) {
                                const lineContent = lines[curLine];
                                const params = lineContent.split(/\s+/);
                                if (params.length !== 4) {
                                    alert(fileName + ", line " + curLine.toString() + ", param num error!");
                                    return;
                                }
                                let newModule = new MxModule(parseInt(params[0]), params[1], parseInt(params[2]), params[3]);
                                _codeInfo_.moduleArray.push(newModule);
                                curLine++;
                            }


                            let moduleInstanceNum = parseInt(lines[curLine]);
                            if (moduleInstanceNum) {
                                _codeInfo_.moduleInstanceNum = moduleInstanceNum;
                                curLine++;
                            }
                            else {
                                alert(fileName + ', this file are not required!');
                                return;
                            }

                            for (let i = 0; i < _codeInfo_.moduleInstanceNum; i++) {
                                const lineContent = lines[curLine];
                                const params = lineContent.split(/\s+/);
                                if (params.length !== 4) {
                                    alert(fileName + ", line " + curLine.toString() + ", param num error!");
                                    return;
                                }
                                let newModuleInstance = new MxModuleInstance(parseInt(params[0]), parseInt(params[1]), params[2], parseInt(params[3]));
                                _codeInfo_.moduleInstanceArray.push(newModuleInstance);
                                curLine++;
                            }


                            let portInstanceNum = parseInt(lines[curLine]);
                            if (portInstanceNum) {
                                _codeInfo_.portInstanceNum = portInstanceNum;
                                curLine++;
                            }
                            else {
                                alert(fileName + ', this file are not required!');
                                return;
                            }

                            for (let i = 0; i < _codeInfo_.portInstanceNum; i++) {
                                const lineContent = lines[curLine];
                                const params = lineContent.split(/\s+/);
                                if (params.length !== 5) {
                                    alert(fileName + ", line " + curLine.toString() + ", param num error!");
                                    return;
                                }
                                let newPortInstance = new MxPortInstance(parseInt(params[0]), params[1], params[2], i, parseInt(params[3]), parseInt(params[4]));
                                _codeInfo_.portInstanceArray.push(newPortInstance);
                                curLine++;
                            }

                            succInitCodeInfo = true;
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

    // sampleInit() {
    //     info = {
    //         moduleNum: 10,
    //         moduleInstanceNum: 37,
    //         portInstanceNum: 4,
    //         moduleArray: [],
    //         moduleInstanceArray: [],
    //         portInstanceArray: []
    //     };
    //     this.setCodeInfo(info);
    // },

    initCodeInfo() {
        codeInfo = new CodeInfo();
        renderInfo = new RenderInfo();
    },

    getCodeInfo() {
        return codeInfo;
    },

    setCodeInfo(info) {
        codeInfo = info;
    },

    getSuccInitCodeInfo() {
        return succInitCodeInfo;
    },

    setSuccInitCodeInfo(succ) {
        succInitCodeInfo = succ;
    },

    getSuccInitRenderInfo() {
        return succInitRenderInfo;
    },



    getTmpData() {
        return tmpData;
    },

    setTmpData(data) {
        tmpData = data;
    },

    initRenderInfo(dpc_id) {
        let nodes = [];
        let edges = [];
        if (dpc_id == -1) {

        }
        else if (dpc_id >= 0 && dpc_id < 4) {

            const { drawModuleInstanceArray, drawPortInstanceArray, nodesId2Index } = this.selectModuleInstanceAndPortToDraw(dpc_id);
            console.log(`drawModuleInstanceArray.length = ${drawModuleInstanceArray.length}`);
            console.log(`drawPortInstanceArray.length = ${drawPortInstanceArray.length}`);
            // init node array
            for (let i = 0; i < drawModuleInstanceArray.length; i++) {
                let mi = drawModuleInstanceArray[i];
                let mi_name = codeInfo.moduleArray[mi.mptr_id].module_type === "Single" ? mi.module_name : mi.module_name + '[' + mi.index.toString() + ']';
                let node = {
                    id: mi.mi_id.toString(),
                    x: 10 + 10 * i, //only use for init, no meaning
                    y: 10 + 10 * i,
                    label: mi_name,
                    //clazz: 'module',
                    clazz: 'scriptTask',
                };
                nodes.push(node);
            }
            const edgeGroups = {}; // 按源节点-目标节点分组
            for (let i = 0; i < drawPortInstanceArray.length; i++) {
                let pi = drawPortInstanceArray[i];
                let edge = {
                    source: pi.transmit_index.toString(),
                    target: pi.receive_index.toString(),
                    sourceAnchor: 0,
                    targetAnchor: 1,
                    clazz: 'flow',
                    //clazz: 'port',
                    MxLabel: pi.name,
                    MxFileName: pi.dump_file_name,
                    //shape: 'arc',
                    // shape: 'cubic-vertical',
                    color: 'rgb(194, 207, 209)',
                    curvePosition: 0.5,
                    curveOffset: 30,
                    currentRate: 0,

                };
                const key = `${edge.source}-${edge.target}`;
                edgeGroups[key] = edgeGroups[key] || [];
                edgeGroups[key].push(edge);
                const edgeGroupsLen = edgeGroups[key].length;
                edge.curveOffset = edge.curveOffset * edgeGroupsLen;
                edges.push(edge);
            }
            this.setPositionAndAnchor_Uniformly(nodes, edges, nodesId2Index, 900, 500);
            // this.setPositionAndAnchor(nodes, edges, nodesId2Index, 900, 500);
            console.log('nodesId2Index', nodesId2Index);
            renderInfo.data.nodes = nodes;
            renderInfo.data.edges = edges;
            renderInfo.nodesId2Index = nodesId2Index;
        }
        succInitRenderInfo = true;
        this.switchEdgeSet(dpc_id, false);
        console.log('renderInfo', renderInfo);

        return { nodes: nodes, edges: edges };
    },

    reGenerateGraph(nodes, edges) {
        console.log('this.graph.nodes', nodes);
        console.log('renderInfo.data.nodes', renderInfo.data.nodes);
        let ret_nodes = renderInfo.data.nodes;
        let ret_edges = renderInfo.data.edges;
        let nodesId2Index = renderInfo.nodesId2Index;
        for (let i = 0; i < nodes.length; i++) {
            let node = nodes[i];
            const model = node.getModel();
            ret_nodes[nodesId2Index[model.id]].x = model.x;
            ret_nodes[nodesId2Index[model.id]].y = model.y;
        }

        this.setAnchor(ret_nodes, ret_edges, nodesId2Index);

        return { nodes: ret_nodes, edges: ret_edges };
    },

    getEdgeSetDrawData() {
        let nodes = renderInfo.data.nodes;
        let edges = [];
        for (let i = 0; i < renderInfo.combinedEdges.length; i++) {
            edges.push(renderInfo.combinedEdges[i].edgeProperty);
        }

        return { nodes: nodes, edges: edges };
    },

    getNormalEdgeDrawData() {
        let nodes = renderInfo.data.nodes;
        let edges = renderInfo.data.edges;
        return { nodes: nodes, edges: edges };
    },

    switchEdgeSet(dpc_id, ignore_dpc_id = false) {
        let combinedEdges = [];
        const edgeGroups = {}; // 按源节点-目标节点分组
        const edgeGroups2Index = {}; // 按源节点-目标节点找到对应的combinedEdge
        if (ignore_dpc_id) {
            return;
        }
        if (dpc_id < 0 || dpc_id >= 4 || !succInitRenderInfo) {
            return;
        }



        const { drawModuleInstanceArray, drawPortInstanceArray, nodesId2Index } = this.selectModuleInstanceAndPortToDraw(dpc_id);

        for (let i = 0; i < drawPortInstanceArray.length; i++) {
            let pi = drawPortInstanceArray[i];
            let edge = {
                source: pi.transmit_index.toString(),
                target: pi.receive_index.toString(),
                sourceAnchor: 0,
                targetAnchor: 1,
                clazz: 'combinedEdge',
                MxLabel: pi.name,
                MxFileName: pi.dump_file_name,
                //shape: 'arc',
                // shape: 'cubic-vertical',
                color: 'rgb(194, 207, 209)',
                // label: pi.dump_file_name,
                curvePosition: 0.5,
                curveOffset: 30,
                currentRate: [0],
                fileNameArray: [pi.dump_file_name],
                portInstanceIndexArray: [pi.pi_id],
                useMaxCalcRate: false
            };
            const key = `${edge.source}-${edge.target}`;
            edgeGroups[key] = edgeGroups[key] || [];
            edgeGroups[key].push(edge);
            const edgeGroupsLen = edgeGroups[key].length;
            edge.curveOffset = edge.curveOffset * edgeGroupsLen;
            if (edgeGroupsLen == 1) {

                let fileNameArray = [edge.MxFileName];
                let portInstanceIndexArray = [pi.pi_id];
                let combinedEdge = new CombinedEdge(edge, edge.source, edge.target, fileNameArray, portInstanceIndexArray);
                edgeGroups2Index[key] = combinedEdges.length;
                combinedEdges.push(combinedEdge);
            } else {

                let index = edgeGroups2Index[key];
                let combinedEdge = combinedEdges[index];
                combinedEdge.edgeProperty.fileNameArray.push(edge.MxFileName);
                combinedEdge.fileNameArray.push(edge.MxFileName);

                combinedEdge.edgeProperty.portInstanceIndexArray.push(pi.pi_id);
                combinedEdge.portInstanceIndexArray.push(pi.pi_id);
            }


        }


        let nodes = renderInfo.data.nodes;
        let edges = [];
        for (let i = 0; i < combinedEdges.length; i++) {
            edges.push(combinedEdges[i].edgeProperty);
        }
        this.setAnchor(nodes, edges, nodesId2Index)
        console.log('combinedEdges', combinedEdges);
        renderInfo.combinedEdges = combinedEdges;

    },

    getBlockEdgeList() {
        if (succInitCodeInfo)
            return codeInfo.portInstanceArray;
        else
            return [];
    },

    switchDpcId(dpc_id) {
        let nodes = renderInfo.data.nodes;
        let edges = renderInfo.data.edges;

        if (dpc_id >= 0 && dpc_id < 4 && succInitRenderInfo) {

            const { drawModuleInstanceArray, drawPortInstanceArray, nodesId2Index } = this.selectModuleInstanceAndPortToDraw(dpc_id);

            // 这里分配给每个node的位置
            for (let i = 0; i < drawModuleInstanceArray.length; i++) {
                let mi = drawModuleInstanceArray[i];
                let mi_name = codeInfo.moduleArray[mi.mptr_id].module_type === "Single" ? mi.module_name : mi.module_name + '[' + mi.index.toString() + ']';
                nodes[i].id = mi.mi_id.toString();
                nodes[i].label = mi_name;
            }

            for (let i = 0; i < drawPortInstanceArray.length; i++) {
                let pi = drawPortInstanceArray[i];
                edges[i].source = pi.transmit_index.toString();
                edges[i].target = pi.receive_index.toString();
                edges[i].MxLabel = pi.name;
                edges[i].MxFileName = pi.dump_file_name;

            }
            this.setPositionAndAnchor(nodes, edges, nodesId2Index, 900, 500);
            // console.log('nodesId2Index', nodesId2Index);
            renderInfo.nodesId2Index = nodesId2Index;
        }

        // console.log('renderInfo', renderInfo);
        // return { nodes: nodes, edges: edges };
    },

    getRenderData() {
        return { nodes: renderInfo.data.nodes, edges: renderInfo.data.edges };
    },

    // updateRenderData(currentCycle) {
    //     renderInfo.data.edges.forEach(edge => {
    //         edge.color = this.calcColor(currentCycle);
    //     });
    //     // console.log(renderInfo.data.edges);
    // },

    // calcColor(currentCycle) {
    //     let minCycle = 8000;
    //     let maxCycle = 11000;
    //     // 计算归一化比例（0~1）
    //     let ratio = (currentCycle - minCycle) / (maxCycle - minCycle);
    //     ratio = Math.max(0, Math.min(1, ratio)); // 边界约束

    //     // 基于亮度线性映射的 RGB 计算
    //     const brightness = Math.round(ratio * 255);
    //     return `rgb(${brightness}, ${brightness}, ${brightness})`;
    // },

    getRenderInfo() {
        return renderInfo;
    },


    setAnchor(nodes, edges, nodesId2Index) {

        for (let i = 0; i < edges.length; i++) {
            let edge = edges[i];
            let targetIndex = nodesId2Index[edge.target];
            let sourceIndex = nodesId2Index[edge.source];
            //
            let y_diff = Math.abs(nodes[targetIndex].y - nodes[sourceIndex].y);
            let x_diff = Math.abs(nodes[targetIndex].x - nodes[sourceIndex].x);
            if (y_diff >= x_diff) {
                if (nodes[targetIndex].y > nodes[sourceIndex].y) {
                    edge.targetAnchor = 0;
                    edge.sourceAnchor = 2;

                } else {
                    edge.targetAnchor = 2;
                    edge.sourceAnchor = 0;
                }
            } else {
                if (nodes[targetIndex].x > nodes[sourceIndex].x) {
                    edge.targetAnchor = 3;
                    edge.sourceAnchor = 1;
                } else {
                    edge.targetAnchor = 1;
                    edge.sourceAnchor = 3;
                }
            }

        }
    },


    setPositionAndAnchor(nodes, edges, nodesId2Index, x_max, y_max) {
        let num = nodes.length;
        let x_posArray = [1, 1, 3, 7, 9, 5, 11, 7, 4, -1];
        let y_posArray = [1, -1, 1, 0, 0, 1, 0, 1, -1, 0];
        let x_posmax = 11 + 1;
        let x_posmin = -1 - 1;
        let y_posmax = 1 + 0.5;
        let y_posmin = -1 - 0.5;
        if (num > x_posArray.length) return;
        for (let i = 0; i < num; i++) {
            let x_ = x_max * (x_posArray[i] - x_posmin) / (x_posmax - x_posmin);
            nodes[i].x = parseInt(x_);
            let y_ = y_max * (y_posArray[i] - y_posmin) / (y_posmax - y_posmin);
            nodes[i].y = parseInt(y_);
        }

        this.setAnchor(nodes, edges, nodesId2Index);
    },




    setPositionAndAnchor_Uniformly(nodes, edges, nodesId2Index, x_max, y_max) {
        let num = nodes.length;
        // 计算中心点坐标
        let cx = x_max / 2;
        let cy = y_max / 2;
        // 计算半径（取最大尺寸的40%以确保不超出边界）
        let r = Math.min(x_max, y_max) * 0.4;

        // 移除不必要的数组和条件检查，直接计算每个节点的坐标
        for (let i = 0; i < num; i++) {
            // 计算角度（均匀分布）
            let angle = (2 * Math.PI / num) * i;
            // 计算x和y坐标
            let x = cx + r * Math.cos(angle);
            let y = cy + r * Math.sin(angle);
            // 赋值坐标（使用parseInt保持与原函数一致）
            nodes[i].x = parseInt(x);
            nodes[i].y = parseInt(y);
        }

        // 调用setAnchor方法处理锚点
        this.setAnchor(nodes, edges, nodesId2Index);
    },




    selectModuleInstanceAndPortToDraw(dpc_id) {
        let drawModuleInstanceArray = [];
        let drawPortInstanceArray = [];
        let drawModuleId = [];
        let nodesId2Index = {};

        for (let i = 0; i < codeInfo.moduleInstanceNum; i++) {
            let mi = codeInfo.moduleInstanceArray[i];
            let type = codeInfo.moduleArray[mi.mptr_id].module_type;
            if (type === 'Single' || (type === 'Multi' && mi.index == dpc_id)) {
                nodesId2Index[mi.mi_id.toString()] = drawModuleInstanceArray.length;
                drawModuleInstanceArray.push(mi);
                drawModuleId.push(mi.mi_id);

            }
        }
        const mid_set = new Set(drawModuleId);

        for (let i = 0; i < codeInfo.portInstanceNum; i++) {
            let pi = codeInfo.portInstanceArray[i];
            if (pi.receive_index === 'null' || pi.transmit_index === 'null') {
                continue;
            }
            if (mid_set.has(pi.receive_index) && mid_set.has(pi.transmit_index)) {
                drawPortInstanceArray.push(pi);
            }
        }
        return { drawModuleInstanceArray, drawPortInstanceArray, nodesId2Index }
    },

    pack2json() {
        return {
            codeInfo: codeInfo,
            succInitCodeInfo: succInitCodeInfo,
            succInitRenderInfo: succInitRenderInfo,
            renderInfo: renderInfo,
        };
    },

    loadFromPack(pack) {
        this.initCodeInfo();
        if (pack.succInitCodeInfo) {
            codeInfo = pack.codeInfo;
            succInitCodeInfo = pack.succInitCodeInfo;
        }
        if (pack.succInitRenderInfo) {
            succInitRenderInfo = pack.succInitRenderInfo;
            renderInfo = pack.renderInfo;
        }


    }


};



export default CodeAnalyseTool;