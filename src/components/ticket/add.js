import React from 'react';
import {
  Card, Form, Input, Select, DatePicker, Button, message, Modal
} from 'antd';
import { withRouter } from 'react-router-dom';

import './index.less';
import ticketService from '../../services/ticket';
import userService from '../../services/user';
import serverService from '../../services/server';
import classifyService from '../../services/classify';
import { inject } from '../../utils/util';

const TextArea = Input.TextArea
const FormItem = Form.Item
const Option = Select.Option



@inject({ ticketService, userService, classifyService, serverService })
class TicketAdd extends React.Component {
  state = {
    classifyLists: [],
    serverLists: [],
    userLists: [],
    isVisible: false
  }

  componentDidMount() {
    this.fetchData()
  }

  fetchData = () => {
    this.fetchClassify()
  }

  fetchClassify = () => {
    this.props.classifyService.lists()
      .then(data => {
        this.setState({
          classifyLists: data.results
        })
      })
  }

  handleSubmit = values => {
    this.props.ticketService.add(values)
      .then(data => {
        message.success("提交成功")
        this.props.history.push(`/ticket/detail/${data.id}`)
      })
      .catch(error => {
        if (error.response.status === 400) {
          message.error("提交失败，请重试")
        }
      })
  }

  handleUsersSearch = value => {
    this.props.userService.lists({ "name": value })
      .then(data => {
        this.setState({ userLists: data.results })
      })
  };

  handleServersSearch = value => {
    this.props.serverService.lists({ "name": value })
      .then(data => {
        this.setState({ serverLists: data.results })
      })
  };

  handleClassifyCancel = () => {
    this.classifyForm.props.form.resetFields()
    this.setState({ isVisible: false })
  }

  handleClassifyOk = () => {
    this.classifyForm.props.form.validateFields((err, values) => {
      if (!err) {
        this.props.classifyService.add(values)
          .then(data => {
            const classifyLists = this.state.classifyLists
            classifyLists.push(data)
            this.setState({ classifyLists })
            message.success("添加成功")
          })
          .catch(error => {
            if (error.response.status === 400) {
              message.error("添加失败，请重试")
            }
          })

        this.handleClassifyCancel()
      }
    })
  }

  render() {
    return (
      <div>
        <Card bordered={false} title="提交工单">
          <TicketForm
            classifyLists={this.state.classifyLists}
            serverLists={this.state.serverLists}
            userLists={this.state.userLists}
            handleSubmit={this.handleSubmit}
            handleUsersSearch={this.handleUsersSearch}
            handleOpenAddClassify={() => this.setState({ isVisible: true })}
            handleServersSearch={this.handleServersSearch}
          />
        </Card>
        <Modal
          width={400}
          title="添加故障分类"
          visible={this.state.isVisible}
          onCancel={this.handleClassifyCancel}
          onOk={this.handleClassifyOk}
        >
          <ClassifyForm
            wrappedComponentRef={(inst) => this.classifyForm = inst}
          />
        </Modal>
      </div>
    )
  }
}


class TicketForm extends React.Component {
  timeout = null;

  handleSubmit = (e) => {
    e.preventDefault();
    this.props.form.validateFields((err, values) => {
      if (!err) {
        values.occur_time = values.occur_time.format('YYYY-MM-DD HH:mm:ss')
        this.props.handleSubmit(values)
      }
    });
  }

  handleUsersSearch = value => {
    if (this.timeout) {
      clearTimeout(this.timeout);
      this.timeout = null;
    }
    this.timeout = setTimeout(this.props.handleUsersSearch, 300, value);
  };

  handleServersSearch = value => {
    if (this.timeout) {
      clearTimeout(this.timeout);
      this.timeout = null;
    }
    this.timeout = setTimeout(this.props.handleServersSearch, 300, value);
  };

  render() {
    const { getFieldDecorator } = this.props.form;
    const classifyLists = this.props.classifyLists;
    const serverLists = this.props.serverLists;
    const userLists = this.props.userLists;

    const formItemLayout = {
      labelCol: {
        lg: { span: 24 },
        xl: { span: 4 }
      },
      wrapperCol: {
        lg: { span: 20 },
        xl: { span: 12 },
      }
    }

    const buttonItemLayout = {
      wrapperCol: {
        lg: { span: 20 },
        xl: { span: 14, offset: 4 }
      },
    }

    return (
      <div>
        <Form layout="horizontal" {...formItemLayout} onSubmit={this.handleSubmit}>
          <FormItem label="标题">
            {
              getFieldDecorator("title", {
                rules: [
                  { required: true, message: "标题不能为空" }
                ]
              })(
                <Input type="text" placeholder="标题" />
              )
            }
          </FormItem>
          <FormItem label="故障级别">
            {
              getFieldDecorator("level", {
                rules: [
                  { required: true, message: "故障级别不能为空" }
                ]
              })(
                <Select style={{ width: 150 }}>
                  <Option value={1}>一般故障</Option>
                  <Option value={2}>严重故障</Option>
                  <Option value={3}>重大故障</Option>
                </Select>
              )
            }
          </FormItem>
          <FormItem label="故障分类">
            {
              getFieldDecorator("classify_id", {
                rules: [
                  { required: true, message: "故障分类不能为空" }
                ]
              })(
                <Select style={{ width: 150 }}>
                  {classifyLists.map(item => <Option key={item.id} value={item.id}>{item.category}</Option>)}
                </Select>
              )
            }
            <Button type="link" icon="plus" size="small" onClick={this.props.handleOpenAddClassify}>
              新增
            </Button>
          </FormItem>
          <FormItem label="故障服务器">
            {
              getFieldDecorator("servers", {
                rules: [
                  { required: true, message: "故障服务器不能为空" }
                ]
              })(
                <Select
                  showSearch
                  mode="multiple"
                  placeholder="搜索服务器"
                  defaultActiveFirstOption={false}
                  showArrow={false}
                  filterOption={false}
                  onSearch={this.handleServersSearch}
                  notFoundContent={null}
                >
                  {serverLists.map(item => <Option key={item.id} value={item.id}>{item.hostname}({item.ip})</Option>)}
                </Select>
              )
            }
          </FormItem>
          <FormItem label="故障描述">
            {
              getFieldDecorator("description", {
                rules: [
                  { required: true, message: "故障描述不能为空" }
                ]
              })(
                <TextArea rows={4} placeholder="故障描述" />
              )
            }
          </FormItem>
          <FormItem label="影响评估">
            {
              getFieldDecorator("affect", {
                rules: [
                  { required: true, message: "影响评估不能为空" }
                ]
              })(
                <TextArea rows={4} placeholder="影响评估" />
              )
            }
          </FormItem>
          <FormItem label="故障发生时间">
            {
              getFieldDecorator("occur_time", {
                rules: [
                  { required: true, message: "故障发生时间不能为空" }
                ]
              })(
                <DatePicker showTime placeholder="故障发生时间" />
              )
            }
          </FormItem>
          <FormItem label="处理人">
            {
              getFieldDecorator("handler_id", {
                rules: [
                  { required: true, message: "处理人不能为空" }
                ]
              })(
                <Select
                  style={{ width: 200 }}
                  showSearch
                  placeholder="搜索用户"
                  defaultActiveFirstOption={false}
                  showArrow={false}
                  filterOption={false}
                  onSearch={this.handleUsersSearch}
                  notFoundContent={null}
                >
                  {userLists.map(item => <Option key={item.id} value={item.id}>{item.name}({item.account})</Option>)}
                </Select>
              )
            }
          </FormItem>
          <Form.Item {...buttonItemLayout}>
            <Button type="primary" htmlType="submit">
              提交
            </Button>
          </Form.Item>
        </Form>
      </div>
    )
  }
}

TicketForm = Form.create({})(TicketForm)

class ClassifyForm extends React.Component {

  render() {
    const { getFieldDecorator } = this.props.form;

    return (
      <Form>
        <FormItem>
          {
            getFieldDecorator("category", {
              rules: [
                { required: true, message: "故障分类不能为空" }
              ]
            })(
              <Input type="text" placeholder="故障分类" />
            )
          }
        </FormItem>
      </Form>
    )
  }

}

ClassifyForm = Form.create({})(ClassifyForm)

export default withRouter(TicketAdd);
