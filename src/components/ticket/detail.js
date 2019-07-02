import React from 'react';
import {
  Popover, Card, Tag, Divider, List, Input, Icon, Select, DatePicker, Button, message, Modal, Form
} from 'antd';

import './index.less';
import ticketService from '../../services/ticket';
import userService from '../../services/user';
import { inject } from '../../utils/util';

const IconText = ({ type, text }) => (
  <span>
    <Icon type={type} style={{ marginRight: 8 }} />
    {text}
  </span>
);

const { TextArea } = Input;
const { Option } = Select;


@inject({ ticketService, userService })
class TicketDetail extends React.Component {
  state = {
    ticket: {
      servers: [],
      progresses: []
    },
    status: 1,
    visible: false,
    users: [],
  }

  timeout = null;

  componentDidMount() {
    this.fetchData()
  }

  fetchData = () => {
    const id = this.props.match.params.id;

    this.props.ticketService.destroy(id).then(data => {
      this.setState({
        ticket: data
      })
    })
  }

  renderStatus = status => {
    if (status === 0) {
      return <Tag>未处理</Tag>
    } else if (status === 1) {
      return <Tag color="orange">处理中</Tag>
    } else if (status === 2) {
      return <Tag color="blue">已解决</Tag>
    } else if (status === 3) {
      return <Tag color="magenta">挂起</Tag>
    }
  }

  renderLevel = level => {
    if (level === 1) {
      return <Tag color="orange">一般故障</Tag>
    } else if (level === 2) {
      return <Tag color="red">严重故障</Tag>
    } else if (level === 3) {
      return <Tag color="#f50">重大故障</Tag>
    }
  }

  renderServer = server => {
    return (
      <div>
        <p>IP：{server.ip}</p>
        <p>业务：{server.app}</p>
        <p>负责人：{server.user}</p>
      </div>
    )
  }

  renderProgresses = progresses => {
    return (
      <List
        itemLayout="vertical"
        dataSource={progresses}
        renderItem={item => (
          <List.Item
            key={item.id}
            actions={[
              <IconText type="user" text={item.handler} />,
              <IconText type="clock-circle" text={item.handle_time} />
            ]}
          >
            {item.progress}
          </List.Item>
        )}
      />
    )
  }

  renderAddProgress = () => {
    return (
      <div>
        <div>
          <b>新增处理进度：</b>
          <Select
            defaultValue={this.state.status}
            style={{ width: 120, margin: "0 15px" }}
            onChange={this.handleStatusChange}
          >
            <Option value={1}>处理中</Option>
            <Option value={2}>已解决</Option>
            <Option value={3}>挂起</Option>
          </Select>
          {this.state.status === 2 ? <DatePicker showTime placeholder="恢复时间" onChange={this.handleRestoreTimeChange} /> : ""}
        </div>
        <TextArea
          rows={4}
          style={{ marginTop: "15px" }}
          onChange={e => this.handleProgressChange(e.target.value)}
          placeholder={this.state.status === 2 ? "解决方法" : "处理进度"}
        />
        <div style={{ marginTop: "15px", textAlign: "center" }}>
          <Button onClick={this.handleSubmit} type="primary">提交</Button>
        </div>
      </div>
    )
  }

  handleProgressChange = value => {
    this.progress = value
  }

  handleStatusChange = value => {
    this.setState(
      {
        status: value
      }
    )
  }

  handleRestoreTimeChange = (date, dateString) => {
    this.restore_time = dateString
  }

  handleSubmit = () => {
    const status = this.state.status;
    const restore_time = this.restore_time;
    const progress = this.progress;
    const id = this.props.match.params.id;

    console.log(status, restore_time, progress)

    if (status === 2) {
      if (!restore_time) {
        message.error("请确认故障恢复时间")
        return;
      }
    }
    if (!progress) {
      const msg = status === 2 ? "解决方法" : "处理进度"
      message.error(`请输入${msg}`)
      return;
    }

    this.props.ticketService.update(id, { status, restore_time, progress })
      .then(data => {
        message.success("提交成功")
        this.fetchData()
      })
      .catch(error => {
        if (error.response.status === 400) {
          message.error("提交失败，请重试")
        }
      })

  }

  handleAssignOk = () => {
    this.props.form.validateFields((err, values) => {
      if (!err) {
        const user_id = values["assign_user"];
        const id = this.props.match.params.id;
        const tickets_id = [id];

        this.props.ticketService.assign({ user_id, tickets_id })
          .then(data => {
            message.success("修改成功")
            this.fetchData()
            this.handleAssignCancel()
          })
          .catch(error => {
            if (error.response.status === 400) {
              message.error("修改失败，请重试")
            }
          })
      }
    })
  }

  handleAssignCancel = () => {
    this.props.form.resetFields()
    this.setState({ visible: false })
  }

  handleUsersSearch = value => {
    if (this.timeout) {
      clearTimeout(this.timeout);
      this.timeout = null;
    }

    const fetchData = () => {
      this.props.userService.lists({ "name": value })
        .then(data => {
          this.setState({ users: data.results })
        })
    }

    this.timeout = setTimeout(fetchData, 300);
  };

  render() {
    const { getFieldDecorator } = this.props.form;

    return (
      <div>
        <Card bordered={false}>
          <h2>{this.state.ticket.title}</h2>
          <div>
            <span>{this.renderLevel(this.state.ticket.level)}</span>
            <span><Tag>{this.state.ticket.classify}</Tag></span>
            <span>{this.renderStatus(this.state.ticket.status)}</span>
            <span style={{ float: "right", marginRight: "20px" }}>
              {this.state.ticket.status === 2 ? "" :
                <Button onClick={() => this.setState({ visible: true })} type="primary">指定处理人</Button>}
            </span>
          </div>
          <div style={{ marginTop: "10px" }}>
            <span>提交人：</span>
            <span>{this.state.ticket.pub_user}</span>
            <span style={{ marginLeft: "20px" }}>提交时间：</span>
            <span>{this.state.ticket.pub_time}</span>
          </div>
          <div style={{ marginTop: "10px" }}>
            <span>发生时间：</span>
            <span>{this.state.ticket.occur_time}</span>
            <span style={{ marginLeft: "20px" }}>恢复时间：</span>
            <span>{this.state.ticket.restore_time ? this.state.ticket.restore_time : "未恢复"}</span>
          </div>
          <div style={{ marginTop: "10px" }}>
            <span>当前处理人：</span>
            <span>{this.state.ticket.handler}</span>
          </div>
          <Divider />
          <div>
            <span><b>故障服务器：</b></span>
            <span>{this.state.ticket.servers.map(item => {
              return (
                <Popover key={item.id} content={this.renderServer(item)} title={item.hostname} trigger="hover">
                  <Tag type="link">{item.hostname}</Tag>
                </Popover>
              )
            })}</span>
          </div>
          <div style={{ marginTop: "15px" }}>
            <span><b>故障详情：</b></span>
            <span>{this.state.ticket.description}</span>
          </div>
          <div style={{ marginTop: "15px" }}>
            <span><b>影响评估：</b></span>
            <span>{this.state.ticket.affect}</span>
          </div>

          <Divider />
          {this.state.ticket.progresses.length ?
            this.renderProgresses(this.state.ticket.progresses) :
            <div style={{ textAlign: "center" }}>还未开始处理</div>}

          <Divider />
          {this.state.ticket.status === 2 ? <div style={{ textAlign: "center" }}>处理完成</div> : this.renderAddProgress()}
        </Card>

        <Modal
          title="指定处理人"
          visible={this.state.visible}
          onOk={this.handleAssignOk}
          onCancel={this.handleAssignCancel}
          width={400}
        >
          <Form>
            <Form.Item>
              {
                getFieldDecorator("assign_user", {
                  rules: [
                    { required: true, message: "处理人不能为空" }
                  ]
                })(
                  <Select
                    style={{ width: 300 }}
                    showSearch
                    placeholder="搜索用户"
                    defaultActiveFirstOption={false}
                    showArrow={false}
                    filterOption={false}
                    onSearch={this.handleUsersSearch}
                    notFoundContent={null}
                  >
                    {this.state.users.map(item => {
                      return <Option key={item.id} value={item.id}>{item.name}({item.account})</Option>
                    })}
                  </Select>
                )
              }
            </Form.Item>
          </Form>
        </Modal>
      </div>
    )
  }
}

export default Form.create({})(TicketDetail);
