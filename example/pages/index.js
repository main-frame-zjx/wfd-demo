import { WithRouterDesigner } from "../../dist";
import React, { Component } from "react";
import { Button, Modal, Dropdown, Menu } from 'antd'
import { HashRouter as Router, Switch, Route } from 'react-router-dom';
import AdminPage from "./admin";
import IntroPage from "./introPage";
import 'antd/dist/antd.less'
class HomePage extends Component {
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
      nodes: [],
      edges: []
    };

    const data1 = {
      nodes: [],
      edges: []
    };

    const candidateUsers = [];
    const candidateGroups = [];


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
      <Route exact path="/" component={HomePage} />
      <Route exact path="/admin" component={AdminPage} />
      <Route exact path="/intro" component={IntroPage} />
    </Switch>
  </Router>
);

export default App;

