import React from 'react';
import {
  Table, Card, Tag, Input, Select, DatePicker, Button, message, Modal, Form
} from 'antd';
import { Link } from 'react-router-dom';

import './index.less';
import ticketService from '../../services/ticket';
import userService from '../../services/user';
import authService from '../../services/auth';
import { inject, pagination } from '../../utils/util';

const Search = Input.Search;
const RangePicker = DatePicker.RangePicker;
const { Option } = Select;

const dateFormat = 'YYYY/MM/DD';

const columns = [
  {
    title: '标题',
    dataIndex: 'title',
    render(title, record) {
      return <span>
        <Link to={`/ticket/detail/${record.id}`}>{title}</Link>
        <Tag style={{ marginLeft: "5px" }}>{record.classify}</Tag>
      </span>
    }
  },
  {
    title: '当前处理人',
    dataIndex: 'handler',
    width: 150,
  },
  {
    title: '故障级别',
    dataIndex: 'level',
    width: 100,
    render(level) {
      if (level === 1) {
        return <Tag color="orange">一般故障</Tag>
      } else if (level === 2) {
        return <Tag color="red">严重故障</Tag>
      } else if (level === 3) {
        return <Tag color="#f50">重大故障</Tag>
      }
    }
  },
  {
    title: '状态',
    dataIndex: 'status',
    width: 100,
    render(status) {
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
  },
  {
    title: '发生时间',
    width: 150,
    dataIndex: 'occur_time'
  },
  {
    title: '恢复时间',
    width: 150,
    dataIndex: 'restore_time'
  },
]


@inject({ ticketService, userService, authService, pagination })
class MyTicket extends React.Component {
  state = {
    data: [],
    loading: false,
    pagination: "",
    selectedRowKeys: [],
    assignVisible: false,
    users: [],
  }

  params = {
    page: 1,
    page_size: 10,
    title: "",
    level: 0,
    status: -1,
    start: "",
    end: "",
    user: this.props.authService.userInfo.id
  }

  timeout = null;

  componentDidMount() {
    this.fetchData()
  }

  fetchData = () => {
    this.setState({ loading: true })
    this.props.ticketService.list(this.params).then(data => {
      const pagination = this.props.pagination(data)
      this.setState({
        data: data.results,
        loading: false,
        pagination
      })
    })
  }

  handleTableChange = (pagination, filters, sorter) => {
    this.params.page = pagination.current
    this.params.page_size = pagination.pageSize
    this.fetchData()
  }

  handleSearch = value => {
    if (this.timeout) {
      clearTimeout(this.timeout);
      this.timeout = null;
    }

    this.params.title = value

    this.timeout = setTimeout(this.fetchData, 300);
  }

  handleStatusChange = value => {
    this.params.status = value
    this.fetchData()
  }

  handleLevelChange = value => {
    this.params.level = value
    this.fetchData()
  }

  handleDateChange = (date, dateString) => {
    this.params.start = dateString[0]
    this.params.end = dateString[1]
    this.fetchData()
  }

  handleOnSelectChange = selectedRowKeys => {
    this.setState({ selectedRowKeys })
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

  handleAssignOk = () => {
    this.props.form.validateFields((err, values) => {
      if (!err) {
        const user_id = values["assign_user"];
        const tickets_id = this.state.selectedRowKeys;

        this.props.ticketService.assign({ user_id, tickets_id })
          .then(data => {
            message.success("修改成功")
            this.fetchData()
            this.setState({
              assignVisible: false,
              selectedRowKeys: []
            })
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
    this.setState({ assignVisible: false })
  }

  render() {
    const { getFieldDecorator } = this.props.form;
    const rowSelection = {
      selectedRowKeys: this.state.selectedRowKeys,
      onChange: this.handleOnSelectChange
    };
    const hasSelected = this.state.selectedRowKeys.length > 0;

    return (
      <div>
        <Card bordered={false} title="我的待办">
          <span>状态：</span>
          <Select defaultValue={-1} style={{ width: 120 }} onChange={this.handleStatusChange}>
            <Option value={-1}>全部</Option>
            <Option value={0}>未处理</Option>
            <Option value={1}>处理中</Option>
            <Option value={2}>已解决</Option>
            <Option value={3}>挂起</Option>
          </Select>
          <span style={{ marginLeft: "20px" }}>级别：</span>
          <Select defaultValue={0} style={{ width: 120 }} onChange={this.handleLevelChange}>
            <Option value={0}>全部</Option>
            <Option value={1}>一般故障</Option>
            <Option value={2}>严重故障</Option>
            <Option value={3}>重大故障</Option>
          </Select>
          <span style={{ marginLeft: "20px" }}>发生时间：</span>
          <RangePicker
            format={dateFormat}
            onChange={this.handleDateChange}
          />
        </Card>
        <Card bordered={false}>
          <div style={{ marginBottom: "20px" }}>
            <Link to="/ticket/add"><Button style={{ marginRight: "10px" }} type="primary">提交工单</Button></Link>
            <Button type="primary" onClick={() => this.setState({ assignVisible: true })} disabled={!hasSelected}>
              批量指派
            </Button>
            <span style={{ marginLeft: 8 }}>
              {hasSelected ? `已选择 ${this.state.selectedRowKeys.length} 个` : ''}
            </span>
            <span style={{ marginLeft: "20px" }}>
              <Search
                style={{ width: "300px" }}
                placeholder="搜索标题"
                onChange={e => this.handleSearch(e.target.value)}
                allowClear
              />
            </span>
          </div>
          <Table
            rowSelection={rowSelection}
            size="middle"
            scroll={{ x: 1100 }}
            columns={columns}
            rowKey={record => record.id}
            dataSource={this.state.data}
            loading={{ spinning: this.state.loading, tip: "加载中..." }}
            pagination={this.state.pagination}
            onChange={this.handleTableChange}
          />
        </Card>

        <Modal
          title="指定处理人"
          visible={this.state.assignVisible}
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

export default Form.create({})(MyTicket);
