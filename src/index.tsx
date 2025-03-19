import * as React from 'react';
import styles from './index.less';
import G6 from '@antv/g6/lib';
import { getShapeName } from './util/clazz'
import locale from './locales/index';
import Command from './plugins/command'
import Toolbar from './plugins/toolbar'
import Bottombar from './plugins/bottombar'
import AddItemPanel from './plugins/addItemPanel'
import CanvasPanel from './plugins/canvasPanel'
import { exportXML } from "./util/bpmn";
import LangContext from "./util/context";
import CodeAnalyseTool from "./util/codeAnalyse";
import DumpAnalyseTool from "./util/dumpAnalyse";
import DetailPanel from "./components/DetailPanel";
import ItemPanel from "./components/ItemPanel";
import ToolbarPanel from "./components/ToolbarPanel";
import BottombarPanel from "./components/BottombarPanel";
import registerShape from './shape'
import registerBehavior from './behavior'
import { IDefaultModel, IProcessModel, ISelectData } from './types';
registerShape(G6);
registerBehavior(G6);


declare global {
  interface Window {
    GenerateGraph: () => void;
    ExportGraphDataToJson: () => void;
    ImportGraphDataFromJson: () => void;
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
  data: any;
  /** 审核人 */
  users?: ISelectData[];
  /** 审核组 */
  groups?: ISelectData[];
}

export interface DesignerStates {
  selectedModel: IDefaultModel;
  processModel: IProcessModel;
}

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
  public bottombarVisable: any;

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
      },
    };
    this.bottombarVisable = false;
  }

  setbottombarVisable = (flag) => {
    this.bottombarVisable = flag;
  }

  isBottombarVisable = () => {
    if (DumpAnalyseTool && DumpAnalyseTool.getSuccInit()) return true;
    return false;
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
    let data = CodeAnalyseTool.getRenderData(0);
    this.graph.data(data ? this.initShape(data) : { nodes: [], edges: [] });
    this.graph.render();
  }

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
        default: ['drag-canvas', 'clickSelected'],
        view: [],
        edit: ['drag-canvas', 'hoverNodeActived', 'hoverAnchorActived', 'dragNode', 'dragEdge',
          'dragPanelItemAddNode', 'clickSelected', 'deleteItem', 'itemAlign', 'dragPoint', 'brush-select'],
      },
      defaultEdge: {
        type: 'flow-polyline-round',
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
    window.ExportGraphDataToJson = this.ExportGraphDataToJson;
    window.ImportGraphDataFromJson = this.ImportGraphDataFromJson;
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
    const { signalDefs, messageDefs } = processModel;
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
          {!isView && <BottombarPanel ref={this.bottombarRef} />}
        </div>
      </LangContext.Provider>
    );
  }
}
