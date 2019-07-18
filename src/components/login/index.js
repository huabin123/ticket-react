import React from 'react';
import {
  Form, Icon, Input, Button, message, Modal
} from 'antd';
import { Redirect } from 'react-router-dom';
import { observer } from "mobx-react";

import './index.less';
import authService from '../../services/auth';
import { inject } from '../../utils/util';


@inject({ authService })
@observer
class LoginForm extends React.Component {

  handleInfo = () => {
    Modal.info({
      title: '忘记密码',
      content: '忘记密码请联系管理员'
    });
  }

  handleSubmit = (e) => {
    e.preventDefault();
    this.props.form.validateFields((err, values) => {
      if (!err) {
        this.props.authService.login(values)
          .then(data => {
            message.success("登陆成功")
            this.props.authService.setLogin(data)
          })
          .catch(error => {
            if (error.response.status === 400) {
              message.error("账号或密码错误")
            }
          })
      }
    })
  }

  render() {
    const { loginSuccess } = this.props.authService
    if (loginSuccess) return <Redirect to="/" />;

    const { getFieldDecorator } = this.props.form;

    return (
      <div className="login" style={{ backgroundImage: `url(./login-background.jpg)` }}>
        <div className="form-box">
          <div className="title">
            <img alt="logo" src={process.env.PUBLIC_URL + "/logo.png"} />
            <span>运维工单系统</span>
          </div>
          <Form onSubmit={this.handleSubmit} className="form">
            <Form.Item className="form-title">
              <b>登录</b>
            </Form.Item>
            <Form.Item>
              {getFieldDecorator('account', {
                initialValue: "admin",
                rules: [
                  { required: true, message: '请输入账号' }
                ],
              })(
                <Input prefix={<Icon type="user" style={{ color: 'rgba(0,0,0,.25)' }} />} placeholder="账号" />
              )}
            </Form.Item>
            <Form.Item>
              {getFieldDecorator('password', {
                initialValue: "admin",
                rules: [{ required: true, message: '请输入密码' }],
              })(
                <Input prefix={<Icon type="lock" style={{ color: 'rgba(0,0,0,.25)' }} />} type="password" placeholder="密码" />
              )}
            </Form.Item>
            <Form.Item>
              <Button type="primary" htmlType="submit" className="form-button">
                登录
          </Button>
              <div>
                <Button onClick={this.handleInfo} type="link" style={{ float: "right" }}>忘记密码</Button>
              </div>
            </Form.Item>
          </Form>
        </div>
      </div>
    );
  }
}

export default Form.create()(LoginForm);