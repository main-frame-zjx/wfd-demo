import { WithRouterDesigner } from "../../dist";
import React, { Component } from "react";
import { Button, Modal, Dropdown, Menu } from 'antd'
import { BrowserRouter as Router, Switch, Route } from 'react-router-dom';
import AdminPage from "./admin";
import IntroPage from "./introPage";
import 'antd/dist/antd.less'
class Demo extends Component {
  constructor(props) {
    super(props);
    this.wfdRef = React.createRef();
  }

  state = {
    modalVisible: false,
    selectedLang: 'zh',
  };

  langMenu = (
    <Menu onClick={(lang) => { this.changeLang(lang) }}>
      <Menu.Item key="zh">
        <span role="img" >
          {"🇨🇳"}
        </span>
        {" 简体中文"}
      </Menu.Item>
      <Menu.Item key="en">
        <span role="img" >
          {"🇬🇧"}
        </span>
        {" English"}
      </Menu.Item>
    </Menu>
  );

  handleModalVisible(modalVisible) {
    this.setState({ modalVisible })
  }

  changeLang({ key }) {
    this.setState({ selectedLang: key })
  }

  render() {
    const data = {
      nodes: [{ id: 'startNode1', x: 50, y: 200, label: '', clazz: 'start', },
      { id: 'startNode2', x: 50, y: 320, label: '', clazz: 'timerStart', },
      { id: 'taskNode1', x: 200, y: 200, label: '主任审批', clazz: 'userTask', },
      { id: 'taskNode2', x: 400, y: 200, label: '经理审批', clazz: 'scriptTask', },
      { id: 'gatewayNode', x: 400, y: 320, label: '金额大于1000', clazz: 'inclusiveGateway', },
      { id: 'taskNode3', x: 400, y: 450, label: '董事长审批', clazz: 'receiveTask', },
      { id: 'catchNode1', x: 600, y: 200, label: '等待结束', clazz: 'signalCatch', },
      { id: 'endNode', x: 600, y: 320, label: '', clazz: 'end', }],
      edges: [{ source: 'startNode1', target: 'taskNode1', sourceAnchor: 1, targetAnchor: 3, clazz: 'flow' },
      { source: 'startNode2', target: 'gatewayNode', sourceAnchor: 1, targetAnchor: 3, clazz: 'flow' },
      { source: 'taskNode1', target: 'catchNode1', sourceAnchor: 0, targetAnchor: 0, clazz: 'flow' },
      { source: 'taskNode1', target: 'taskNode2', sourceAnchor: 1, targetAnchor: 3, clazz: 'flow' },
      { source: 'taskNode2', target: 'gatewayNode', sourceAnchor: 1, targetAnchor: 0, clazz: 'flow' },
      { source: 'taskNode2', target: 'taskNode1', sourceAnchor: 2, targetAnchor: 2, clazz: 'flow' },
      { source: 'gatewayNode', target: 'taskNode3', sourceAnchor: 2, targetAnchor: 0, clazz: 'flow' },
      { source: 'gatewayNode', target: 'endNode', sourceAnchor: 1, targetAnchor: 2, clazz: 'flow' },
      { source: 'taskNode3', target: 'endNode', sourceAnchor: 1, targetAnchor: 1, clazz: 'flow' },
      { source: 'catchNode1', target: 'endNode', sourceAnchor: 1, targetAnchor: 0, clazz: 'flow' }]
    };

    const data1 = {
      nodes: [{ id: 'startNode1', x: 50, y: 200, label: '', clazz: 'start', },
      { id: 'startNode2', x: 50, y: 320, label: '', clazz: 'timerStart', },
      { id: 'taskNode1', x: 200, y: 200, label: '主任审批', clazz: 'userTask', },
      { id: 'taskNode2', x: 400, y: 200, label: '经理审批', clazz: 'scriptTask', active: true },
      { id: 'gatewayNode', x: 400, y: 320, label: '金额大于1000', clazz: 'gateway', },
      { id: 'taskNode3', x: 400, y: 450, label: '董事长审批', clazz: 'receiveTask', },
      { id: 'catchNode1', x: 600, y: 200, label: '等待结束', clazz: 'signalCatch', },
      { id: 'endNode', x: 600, y: 320, label: '', clazz: 'end', }],
      edges: [{ source: 'startNode1', target: 'taskNode1', sourceAnchor: 1, targetAnchor: 3, clazz: 'flow' },
      { source: 'startNode2', target: 'gatewayNode', sourceAnchor: 1, targetAnchor: 3, clazz: 'flow' },
      { source: 'taskNode1', target: 'catchNode1', sourceAnchor: 0, targetAnchor: 0, clazz: 'flow' },
      { source: 'taskNode1', target: 'taskNode2', sourceAnchor: 1, targetAnchor: 3, clazz: 'flow' },
      { source: 'taskNode2', target: 'gatewayNode', sourceAnchor: 1, targetAnchor: 0, clazz: 'flow' },
      { source: 'taskNode2', target: 'taskNode1', sourceAnchor: 2, targetAnchor: 2, clazz: 'flow' },
      { source: 'gatewayNode', target: 'taskNode3', sourceAnchor: 2, targetAnchor: 0, clazz: 'flow' },
      { source: 'gatewayNode', target: 'endNode', sourceAnchor: 1, targetAnchor: 2, clazz: 'flow' },
      { source: 'taskNode3', target: 'endNode', sourceAnchor: 1, targetAnchor: 1, clazz: 'flow' },
      { source: 'catchNode1', target: 'endNode', sourceAnchor: 1, targetAnchor: 0, clazz: 'flow' }]
    };

    const candidateUsers = [{ id: '1', name: 'Tom' }, { id: '2', name: 'Steven' }, { id: '3', name: 'Andy' }];
    const candidateGroups = [{ id: '1', name: 'Manager' }, { id: '2', name: 'Security' }, { id: '3', name: 'OA' }];
    const height = 600;
    const { modalVisible, selectedLang } = this.state;
    return (
      <div>
        <Button style={{ float: 'right', marginTop: 6, marginRight: 6 }} onClick={() => this.wfdRef.current.graph.saveXML()}>下载结构图</Button>

        <Dropdown overlay={this.langMenu} trigger={['click']}>
          <Button style={{ float: 'right', marginTop: 6, marginRight: 10 }} >语言</Button>
        </Dropdown>
        <WithRouterDesigner ref={this.wfdRef} data={data} height={height} mode={"edit"} users={candidateUsers} groups={candidateGroups} lang={selectedLang} />
        <Modal title="查看流程图" visible={modalVisible} onCancel={() => this.handleModalVisible(false)} width={800} maskClosable={false} footer={null} destroyOnClose bodyStyle={{ height }} >
          <WithRouterDesigner data={data1} height={height - 40} isView />
        </Modal>
      </div>
    );
  }
}


const App = () => (
  <Router>
    <Switch>
      <Route exact path="/" component={Demo} />
      <Route exact path="/admin" component={AdminPage} />
      <Route exact path="/intro" component={IntroPage} />
    </Switch>
  </Router>
);

export default App;

