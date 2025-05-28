import * as React from 'react';
import styles from './index.less';
import G6 from '@antv/g6/lib';
import { getShapeName } from '../../util/clazz'
import locale from '../../locales/index';
import Command from '../../plugins/command'
import Toolbar from '../../plugins/toolbar'
import Bottombar from '../../plugins/bottombar'
import AddItemPanel from '../../plugins/addItemPanel'
import CanvasPanel from '../../plugins/canvasPanel'
import { exportXML } from "../../util/bpmn";
import LangContext from "../../util/context";
import CodeAnalyseTool from "../../util/codeAnalyse";
import DumpAnalyseTool from "../../util/dumpAnalyse";
import DetailPanel from "../../components/DetailPanel";
import ItemPanel from "../../components/ItemPanel";
import ToolbarPanel from "../../components/ToolbarPanel";
import BottombarPanel from "../../components/BottombarPanel";
import registerShape from '../../shape'
import registerBehavior from '../../behavior'
import { IDefaultModel, IProcessModel, ISelectData } from '../../types';
registerShape(G6);
registerBehavior(G6);


declare global {
    interface Window {
        GenerateGraph: () => void;
        UpdateGraph: () => void;
        ExportGraphDataToJson: () => void;
        ImportGraphDataFromJson: () => void;
        RefreshGraph: (currentCycle: number) => void;
    }
}

export interface DesignerProps {
    /** 画布高度 */
    height?: number;
    /** 是否只显示中间画布 */
    isView?: boolean;
    /** 模式为只读或编辑 */
    mode: 'default' | 'view' | 'edit';
    /** 语言 */
    lang?: 'en' | 'zh';
    /** 流程数据 */
    data?: any;
    /** 审核人 */
    users?: ISelectData[];
    /** 审核组 */
    groups?: ISelectData[];
}

export interface DesignerStates {
    selectedModel: IDefaultModel;
    processModel: IProcessModel;
}

// let bottombarVisible = false;

// function setbottombarVisible(flag:boolean){
//   bottombarVisible = flag;
// }

// export{bottombarVisible,setbottombarVisible};


export default class Designer extends React.Component<DesignerProps, DesignerStates> {
    static defaultProps = {
        height: 500,
        isView: false,
        mode: 'edit',
        lang: 'zh',
    };
    private readonly pageRef: React.RefObject<any>;
    private readonly toolbarRef: React.RefObject<any>;
    private readonly bottombarRef: React.RefObject<any>;
    private readonly itemPanelRef: React.RefObject<any>;
    private readonly detailPanelRef: React.RefObject<any>;
    private resizeFunc: (...args: any[]) => any;
    public graph: any;
    public cmdPlugin: any;

    constructor(cfg: DesignerProps) {
        super(cfg);
        this.pageRef = React.createRef();
        this.toolbarRef = React.createRef();
        this.bottombarRef = React.createRef();
        this.itemPanelRef = React.createRef();
        this.detailPanelRef = React.createRef();
        this.resizeFunc = () => { };
        this.state = {
            selectedModel: {},
            processModel: {
                id: '',
                name: '',
                clazz: 'process',
                dataObjs: [],
                signalDefs: [],
                messageDefs: [],
                windowSize: 20,
                stepSize: 1,
                fpsmax: 10,
                fps: 0,
                dpcId: 0,
            },
        };
    }


    ExportGraphDataToJson = () => {
        if (this.graph) {
            const totalData = {
                graphData: this.graph.data,
                codeInfo: CodeAnalyseTool.getCodeInfo(),
            }; // 获取 graph 的数据
            const jsonString = JSON.stringify(totalData, null, 2); // 转换为 JSON 字符串
            const blob = new Blob([jsonString], { type: 'application/json' }); // 创建 Blob 对象
            const url = URL.createObjectURL(blob); // 生成下载链接

            // 创建隐藏的 <a> 标签并触发下载
            const a = document.createElement('a');
            a.href = url;
            a.download = 'graph-data.json'; // 下载文件名
            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);

            // 释放 URL 对象
            URL.revokeObjectURL(url);
        }
    };

    ImportGraphDataFromJson = () => {
        // const file = CodeAnalyseTool.getTmpData();
        // const reader = new FileReader();

        // reader.onload = (e) => {
        //   const content = e.target?.result as string; // 读取文件内容
        //   try {
        //     const totalData = JSON.parse(content); // 将 JSON 字符串解析为对象
        //     if (this.graph) {
        //       this.graph.data(totalData.graphData); // 更新 graph.data
        //       CodeAnalyseTool.setCodeInfo(totalData.codeInfo);
        //       CodeAnalyseTool.setSuccInit(true);
        //       this.graph.render(); // 重新渲染
        //       this.graph.fitView(); // 自适应视图
        //       alert('文件上传并加载成功！');
        //     }
        //   } catch (error) {
        //     console.error('文件解析失败:', error);
        //     alert('文件解析失败，请检查文件格式！');
        //   }
        // };

        // reader.readAsText(file); // 以文本形式读取文件
    };


    componentDidUpdate(prevProps, prevState, snapshot) {
        if (prevProps.data !== this.props.data) {
            if (this.graph) {
                this.graph.changeData(this.initShape(this.props.data));
                this.graph.setMode(this.props.mode);
                // this.graph.emit('canvas:click');
                if (this.cmdPlugin) {
                    this.cmdPlugin.initPlugin(this.graph);
                }
                if (this.props.isView) {
                    this.graph.fitView(5)
                }
            }
        }
    }

    GenerateGraph = () => {
        let data = CodeAnalyseTool.initRenderInfo(0);
        this.graph.data(data ? this.initShape(data) : { nodes: [], edges: [] });
        this.graph.render();
    }

    UpdateGraph = () => {
        // console.log('UpdateGraph');
        let data = CodeAnalyseTool.getRenderData();
        // console.log(data);
        this.graph.data(data ? this.initShape(data) : { nodes: [], edges: [] });
        this.graph.render();
    }

    calcColor = (cycle_id: number, dump_file_name: string) => {
        let window_size = this.state.processModel.windowSize;
        let rate = DumpAnalyseTool.calcPortTransferRate(cycle_id, dump_file_name, window_size);
        const style: any = {
            lineWidth: 2,
            shadowColor: 'transparent',
            shadowBlur: 0,
            shadowOffsetX: 0,
            shadowOffsetY: 0,
            currentRate: rate
        };


        if (rate === 0) {
            return { ...style, stroke: 'rgb(230, 230, 230)' }; // 更柔和的灰色
        }
        // HSL颜色空间插值
        const hue = 120 - (rate * 120); // 绿(120°)→红(0°)
        const saturation = 95;
        const lightness = 50 - (rate * 15); // 降低亮度增强对比

        // HSL转RGB
        const c = (1 - Math.abs(2 * lightness / 100 - 1)) * saturation / 100;
        const x = c * (1 - Math.abs((hue / 60) % 2 - 1));
        const m = lightness / 100 - c / 2;

        let r, g, b;
        if (hue < 60) [r, g, b] = [c, x, 0];
        else if (hue < 120) [r, g, b] = [x, c, 0];
        // 其他色相分支...

        style.stroke = `rgb(${Math.round((r + m) * 255)}, ${Math.round((g + m) * 255)}, ${Math.round((b + m) * 255)})`;

        // 动态线宽与阴影增强
        if (rate > 0.7) {
            style.lineWidth = 2 + Math.pow(rate, 3) * 4; // 非线性增长
            style.shadowColor = style.stroke.replace(')', ', 0.3)').replace('rgb', 'rgba');
            style.shadowBlur = 8 + rate * 10;
            style.shadowOffsetX = 3;
            style.shadowOffsetY = 3;
        } else if (rate > 0.3) {
            style.lineWidth = 2 + rate * 2;
        }
        return style;
        // let r = 0, g = 0, b = 0;
        // if (rate <= 0.5) {
        //   r = Math.round(255 * (2 * rate));
        //   g = 255;
        // } else {
        //   r = 255;
        //   g = 255 - Math.round(255 * (2 * (rate - 0.5)))
        // }

        // // console.log('stroke', `rgb(${r}, ${g}, ${b})`);
        // return { stroke: `rgb(${r}, ${g}, ${b})` }
    }



    RefreshGraph = (currentCycle: number) => {
        // // 根据当前周期更新图形数据
        if (CodeAnalyseTool.getSuccInitCodeInfo() && CodeAnalyseTool.getSuccInitRenderInfo() && DumpAnalyseTool.getSuccInit()) {
            CodeAnalyseTool.updateRenderData(currentCycle);
            // let renderInfo = CodeAnalyseTool.getRenderInfo();
            // TODO: 渲染方案1，需要进行性能测试
            // if (this.graph) {
            //   this.graph.changeData(renderInfo.data);
            //   this.graph.render();
            // }

            // TODO: 渲染方案2，需要进行性能测试
            if (this.graph) {
                const edges = this.graph.getEdges();
                // console.log(edges);
                for (let i = 0; i < edges.length; i++) {
                    let edge = edges[i];
                    const model = edge.getModel();
                    let style = this.calcColor(currentCycle, model.MxFileName);
                    this.graph.updateItem(edge, {
                        style: style,
                        currentRate: style.currentRate
                        // style: { stroke: renderInfo.data.edges[i].color } // 仅更新颜色属性
                    });
                }
                this.graph.get('canvas').draw();
            }

        }

    };

    componentDidMount() {
        const { isView, mode } = this.props;
        const height = this.props.height - 1;
        const width = this.pageRef.current.offsetWidth;
        let plugins = [];
        if (!isView) {
            this.cmdPlugin = new Command();
            const toolbar = new Toolbar({ container: this.toolbarRef.current });
            const bottombar = new Bottombar({ container: this.bottombarRef.current })
            const addItemPanel = new AddItemPanel({ container: this.itemPanelRef.current });
            const canvasPanel = new CanvasPanel({ container: this.pageRef.current });
            plugins = [this.cmdPlugin, toolbar, bottombar, addItemPanel, canvasPanel];
        }
        this.graph = new G6.Graph({
            plugins: plugins,
            container: this.pageRef.current,
            height: height,
            width: width,
            modes: {
                default: ['drag-canvas', 'clickSelected',
                    {
                        type: 'tooltip-edge',
                        formatText: (model) => {
                            var text = 'source: ' + model.source + '<br/> target: ' + model.target;
                            console.log('hello');
                            return text;
                        },

                        shouldUpdate: function shouldUpdate(e) {
                            return true;
                        }
                    },
                ],
                view: [],
                edit: ['drag-canvas', 'hoverNodeActived', 'hoverAnchorActived', 'dragNode', 'dragEdge',
                    'dragPanelItemAddNode', 'clickSelected', 'deleteItem', 'itemAlign', 'dragPoint', 'brush-select'],
            },
            edgeStateStyles: {
                hover: {
                    stroke: 'rgb(126, 183, 236)', // 悬停颜色
                    lineWidth: 3       // 悬醒线宽
                },
                selected: {
                    shadowColor: '#f00', // 选中阴影
                    shadowBlur: 10
                }
            },
            defaultEdge: {
                // type: 'flow-polyline-round',
                type: 'cubic-vertical',
                // type: 'arc',
                // type: 'smooth',
                style: {
                    // stroke: 'rgb(194, 207, 209)', // 线条颜色
                    lineWidth: 2,      // 线条宽度
                    lineAppendWidth: 20,
                    endArrow: true,    // 是否显示箭头
                },
            },
        });
        this.graph.saveXML = (createFile = true) => exportXML(this.graph.save(), this.state.processModel, createFile);
        if (isView) {
            this.graph.setMode("view");
        } else {
            this.graph.setMode(mode);
        }
        this.graph.data({ nodes: [], edges: [] });
        // this.graph.data(this.props.data ? this.initShape(this.props.data) : { nodes: [], edges: [] });
        // console.log(this.props.data);
        this.graph.render();
        if (isView && this.props.data && this.props.data.nodes) {
            this.graph.fitView(5)
        }
        this.initEvents();
        // window.parent.setbottombarVisable = this.setbottombarVisable;
        window.GenerateGraph = this.GenerateGraph;
        window.UpdateGraph = this.UpdateGraph;
        window.ExportGraphDataToJson = this.ExportGraphDataToJson;
        window.ImportGraphDataFromJson = this.ImportGraphDataFromJson;
        window.RefreshGraph = this.RefreshGraph;
    }



    initShape(data) {
        if (data && data.nodes) {
            return {
                nodes: data.nodes.map(node => {
                    return {
                        type: getShapeName(node.clazz),
                        ...node,
                    }
                }),
                edges: data.edges
            }
        }
        return data;
    }

    initEvents() {
        this.graph.on('edge:mouseenter', (e) => {
            const edge = e.item;
            graph.setItemState(edge, 'hover', true); // 激活 hover 状态
        });

        this.graph.on('edge:mouseleave', (e) => {
            const edge = e.item;
            graph.setItemState(edge, 'hover', false); // 关闭 hover 状态
        });
        this.graph.on('afteritemselected', (items) => {
            if (items && items.length > 0) {
                let item = this.graph.findById(items[0]);
                if (!item) {
                    item = this.getNodeInSubProcess(items[0])
                }
                this.setState({ selectedModel: { ...item.getModel() } });
            } else {
                this.setState({ selectedModel: this.state.processModel });
            }
        });
        const page = this.pageRef.current;
        const graph = this.graph;
        const height = this.props.height - 1;
        this.resizeFunc = () => {
            graph.changeSize(page.offsetWidth, height);
        };
        window.addEventListener("resize", this.resizeFunc);
    }

    componentWillUnmount() {
        window.removeEventListener("resize", this.resizeFunc);
        if (this.graph) {
            this.graph.getNodes().forEach(node => {
                node.getKeyShape().stopAnimate();
            });
        }
    }

    onItemCfgChange(key, value) {
        const items = this.graph.get('selectedItems');
        if (items && items.length > 0) {
            let item = this.graph.findById(items[0]);
            if (!item) {
                item = this.getNodeInSubProcess(items[0])
            }
            if (this.graph.executeCommand) {
                this.graph.executeCommand('update', {
                    itemId: items[0],
                    updateModel: { [key]: value }
                });
            } else {
                this.graph.updateItem(item, { [key]: value });
            }
            this.setState({ selectedModel: { ...item.getModel() } });
        } else {
            const canvasModel = { ...this.state.processModel, [key]: value };
            this.setState({ selectedModel: canvasModel });
            this.setState({ processModel: canvasModel });
        }
    }

    getNodeInSubProcess(itemId) {
        const subProcess = this.graph.find('node', (node) => {
            if (node.get('model')) {
                const clazz = node.get('model').clazz;
                if (clazz === 'subProcess') {
                    const containerGroup = node.getContainer();
                    const subGroup = containerGroup.subGroup;
                    const item = subGroup.findById(itemId);
                    return subGroup.contain(item);
                } else {
                    return false;
                }
            } else {
                return false;
            }
        });
        if (subProcess) {
            const group = subProcess.getContainer();
            return group.getItem(subProcess, itemId);
        }
        return null;
    }

    render() {
        const height = this.props.height;
        const { isView, mode, users, groups, lang } = this.props;
        const { selectedModel, processModel } = this.state;
        const { signalDefs, messageDefs, stepSize, fpsmax } = processModel;
        const i18n = locale[lang.toLowerCase()];
        const readOnly = mode !== "edit";


        return (
            <LangContext.Provider value={{ i18n, lang }}>
                <div className={styles.root}>
                    {!isView && <ToolbarPanel ref={this.toolbarRef} />}
                    <div>
                        {!isView && <ItemPanel ref={this.itemPanelRef} height={height} />}
                        <div ref={this.pageRef} className={styles.canvasPanel} style={{ height, width: isView ? '100%' : '70%', borderBottom: isView ? 0 : null }} />
                        {!isView && <DetailPanel ref={this.detailPanelRef}
                            height={height}
                            model={selectedModel}
                            readOnly={readOnly}
                            users={users}
                            groups={groups}
                            signalDefs={signalDefs}
                            messageDefs={messageDefs}
                            onChange={(key, val) => { this.onItemCfgChange(key, val) }} />
                        }
                    </div>
                    {!isView && <BottombarPanel ref={this.bottombarRef}
                        stepSize={stepSize}
                        fpsmax={fpsmax} />}
                </div>
            </LangContext.Provider>
        );
    }
}
