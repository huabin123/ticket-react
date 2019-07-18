import React from 'react';
import { Layout, Button, message, Popover, Menu, Icon, Avatar } from 'antd';
import { observer } from "mobx-react";
import { Link, Redirect } from 'react-router-dom';

import './index.less';
import authService from '../../services/auth';
import { inject } from '../../utils/util';
import menuList from "../../config/menuConfig";

const { Header, Content, Footer, Sider } = Layout;
const SubMenu = Menu.SubMenu;


@inject({ authService })
@observer
class ILayout extends React.Component {

  state = {
    collapsed: false,
  };

  timer = setInterval(() => {
    let date = new Date();
    let sysTime = date.getFullYear() + '-' + (date.getMonth() + 1) + '-' + date.getDate() + ' ' + date.getHours() + ':' + date.getMinutes() + ':' + date.getSeconds();
    this.setState({
      sysTime
    })
  }, 1000)

  componentWillUnmount() {
    if (this.timer != null) {
      clearInterval(this.timer);
    }
  }

  toggle = () => {
    this.setState({
      collapsed: !this.state.collapsed,
    });
  };

  handleLogout = () => {
    this.props.authService.logout()
    message.info("已退出")
  }

  renderMenu = (data) => {
    return data.map((item) => {
      if (item.super && !this.props.authService.userInfo.is_super) {
        return ""
      }

      if (item.children) {
        return (
          <SubMenu key={item.key} title={
            <span>
              {item.icon ? <Icon type={item.icon} /> : ""}
              <span>{item.title}</span>
            </span>
          }>
            {this.renderMenu(item.children)}
          </SubMenu >
        )
      }
      return <Menu.Item key={item.key} >
        <Link to={item.key}>
          {item.icon ? <Icon type={item.icon} /> : ""}
          <span>{item.title}</span>
        </Link>
      </Menu.Item >
    })
  }


  render() {
    const { loginSuccess } = this.props.authService
    if (!loginSuccess) return <Redirect to="/login" />;

    let selectedKeys = window.location.hash.replace(/^.*#|\?.*$/g, "")

    return (
      <Layout className="layout">
        <Sider
          trigger={null}
          collapsible
          collapsed={this.state.collapsed}
          breakpoint="xl"
          collapsedWidth="80"
          onCollapse={this.toggle}
        >
          <div className="logo" >
            <img alt="logo" src={process.env.PUBLIC_URL + '/logo.png'} />
            {this.state.collapsed ? "" : <b>运维工单系统</b>}
          </div>
          <Menu theme="dark" mode="inline" selectedKeys={[selectedKeys]}>
            {this.renderMenu(menuList)}
          </Menu>
        </Sider>
        <Layout>
          <Header style={{ background: '#fff', padding: 0 }}>
            <Icon
              className="trigger"
              type={this.state.collapsed ? 'menu-unfold' : 'menu-fold'}
              onClick={this.toggle}
            />
            <span className="user">
              <span style={{ marginRight: "30px" }}>{this.state.sysTime}</span>
              <Popover trigger="hover"
                content={
                  <div>
                    {/* <div>
                      <Icon type="setting" />
                      <Button size="large" type="link">个人设置</Button>
                    </div> */}
                    <div>
                      <Icon type="logout" />
                      <Button size="large" type="link" onClick={this.handleLogout}>退出登录</Button>
                    </div>
                  </div>
                }
              >
                <Avatar src={process.env.PUBLIC_URL + "/avatar.png"} />
                <Button type="link" style={{ fontSize: "20px" }} >{this.props.authService.userInfo.name}</Button>
              </Popover>
            </span>
          </Header>
          <Content
            style={{
              padding: 24,
              minHeight: 280,
            }}
          >
            {this.props.children}
          </Content>
          <Footer style={{ textAlign: 'center' }}>
            <p>运维工单系统 @ 2019</p>
          </Footer>
        </Layout>
      </Layout>
    )
  }
}

export default ILayout;
