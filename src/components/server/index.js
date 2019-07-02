import React from "react";
import {
  Table, Card, Input, Button, Form, Modal, message, Select
} from "antd";
import { observer } from "mobx-react";
import { inject, pagination } from '../../utils/util';
import authService from '../../services/auth';
import userService from '../../services/user';
import serverService from '../../services/server';

const Search = Input.Search
const TextArea = Input.TextArea
const FormItem = Form.Item
const Option = Select.Option


@inject({ authService, userService, serverService, pagination })
@observer
class Server extends React.Component {

  state = {
    data: [],
    loading: false,
    pagination: "",
    title: "",
    isVisible: false,
    serverForm: "",
    type: "",
    selectedRowKeys: [],
    serverInfo: "",
    selectedRows: "",
    userLists: [],
  }

  params = {
    page: 1,
    page_size: 10,
    name: ""
  }

  timeout = null;

  componentDidMount() {
    this.fetchData()
  }

  fetchData = () => {
    this.setState({ loading: true })
    this.props.serverService.list(this.params)
      .then(data => {
        const pagination = this.props.pagination(data)
        this.setState({
          data: data.results,
          loading: false,
          selectedRowKeys: [],
          selectedRows: "",
          pagination,
        })
      })
  }

  handleSearch = value => {
    if (this.timeout) {
      clearTimeout(this.timeout);
      this.timeout = null;
    }

    this.params.name = value

    this.timeout = setTimeout(this.fetchData, 300);
  }

  handleTableChange = (pagination, filters, sorter) => {
    this.params.page = pagination.current
    this.params.page_size = pagination.pageSize
    this.fetchData()
  }

  handleServerCreate = () => {
    this.setState({
      isVisible: true,
      title: "添加资产",
      type: "create"
    })
  }

  handleServerEdit = () => {
    this.setState({
      isVisible: true,
      title: "编辑资产",
      serverInfo: this.state.selectedRows,
      type: "edit"
    })
  }

  handleServerDelete = () => {
    const record = this.state.selectedRows
    const id = record.id
    Modal.confirm({
      title: "删除确认",
      content: `确定删除资产 ${record.hostname}(${record.ip}) 吗?`,
      onOk: () => {
        this.props.serverService.delete(id)
          .then(data => {
            message.success("删除成功")
            this.fetchData()
          })
          .catch(error => {
            if (error.response.status === 400) {
              message.error("删除失败，请重试")
            } else if (error.response.status === 409) {
              message.error("资产正在使用，无法删除")
            }
          })
      },
      onCancel: () => {
        message.info("取消删除", 1)
      }
    })
  }

  handleSubmit = () => {
    this.serverForm.props.form.validateFields((err, values) => {
      if (!err) {
        if (this.state.type === "create") {
          this.props.serverService.add(values)
            .then(data => {
              message.success(`资产 ${values.hostname} 添加成功`)
              this.fetchData()
            })
            .catch(error => {
              if (error.response.status === 409) {
                message.error("添加失败，主机名或IP已存在")
              }
            })
        }
        else {
          const id = this.state.selectedRows.id
          this.props.serverService.update(id, values)
            .then(data => {
              message.success(`资产 ${values.hostname} 修改成功`)
              this.fetchData()
            })
            .catch(error => {
              if (error.response.status === 409) {
                message.error("修改失败，主机名或IP已存在")
              } else if (error.response.status === 400) {
                message.error("修改失败，请重试")
              }
            })
        }
        this.handleCancel()
      }
    })
  }

  handleCancel = () => {
    this.serverForm.props.form.resetFields()
    this.setState({
      isVisible: false,
      serverInfo: "",
      userLists: []
    })
  }

  handleOnSelectChange = (selectedRowKeys, selectedRows) => {
    this.setState({ selectedRowKeys, selectedRows })
  }

  handleUsersSearch = value => {
    this.props.userService.lists({ "name": value })
      .then(data => {
        this.setState({ userLists: data.results })
      })
  };

  render() {

    const columns = [
      {
        title: '主机名',
        dataIndex: 'hostname',
        width: 200
      },
      {
        title: 'IP',
        dataIndex: 'ip',
        width: 200
      },
      {
        title: '业务',
        dataIndex: 'app',
        width: 200
      },
      {
        title: '负责人',
        dataIndex: 'user.name',
        width: 200
      },
      {
        title: '备注',
        dataIndex: 'remarks',
        width: 200
      }
    ]

    const rowSelection = {
      selectedRowKeys: this.state.selectedRowKeys,
      onChange: this.handleOnSelectChange,
      type: 'radio'
    };
    const hasSelected = this.state.selectedRowKeys.length > 0;

    return (
      <div>
        <Card bordered={false} title="资产管理">
          <div style={{ marginBottom: "20px" }}>
            {this.props.authService.userInfo.is_super ?
              <span>
                <Button type="primary" style={{ marginRight: 15 }} onClick={this.handleServerCreate}>添加资产</Button>
                <Button type="primary" style={{ marginRight: 15 }} disabled={!hasSelected} onClick={this.handleServerEdit}>编辑资产</Button>
                <Button type="primary" style={{ marginRight: 15 }} disabled={!hasSelected} onClick={this.handleServerDelete}>删除资产</Button>
              </span>
              : ""
            }
            <Search
              style={{ width: "300px" }}
              onChange={e => this.handleSearch(e.target.value)}
              placeholder="搜索主机名或IP"
              enterButton
              allowClear
            />
          </div>
          <Table
            size="middle"
            style={{ maxWidth: "1200px" }}
            scroll={{ x: 1200 }}
            columns={columns}
            rowKey={record => record.id}
            dataSource={this.state.data}
            loading={{ spinning: this.state.loading, tip: "加载中..." }}
            pagination={this.state.pagination}
            onChange={this.handleTableChange}
            rowSelection={rowSelection}
            onRow={(record, index) => {
              return {
                onClick: () => {
                  this.setState({
                    selectedRowKeys: [record.id],
                    selectedRows: record
                  })
                }
              };
            }}
          />
        </Card>
        <Modal
          width={600}
          title={this.state.title}
          visible={this.state.isVisible}
          onOk={this.handleSubmit}
          onCancel={this.handleCancel}
        >
          <ServerForm
            serverInfo={this.state.serverInfo}
            userLists={this.state.userLists}
            handleUsersSearch={this.handleUsersSearch}
            wrappedComponentRef={(inst) => this.serverForm = inst}
          />
        </Modal>
      </div >
    )
  }
}


class ServerForm extends React.Component {

  handleUsersSearch = value => {
    if (this.timeout) {
      clearTimeout(this.timeout);
      this.timeout = null;
    }
    this.timeout = setTimeout(this.props.handleUsersSearch, 300, value);
  };


  render() {
    const serverInfo = this.props.serverInfo;
    const userLists = this.props.userLists;
    const { getFieldDecorator } = this.props.form;

    const formItemLayout = {
      labelCol: { span: 5 },
      wrapperCol: { span: 16 }
    }

    return (
      <div>
        <Form layout="horizontal" {...formItemLayout}>
          <FormItem label="主机名">
            {
              getFieldDecorator("hostname", {
                initialValue: serverInfo.hostname,
                rules: [
                  { required: true, message: "请输入主机名" }
                ]
              })(
                <Input type="text" placeholder="请输入主机名" />
              )
            }
          </FormItem>
          <FormItem label="IP">
            {
              getFieldDecorator("ip", {
                initialValue: serverInfo.ip,
                rules: [
                  { required: true, message: "请输入IP" }
                ]
              })(
                <Input type="text" placeholder="请输入IP" />
              )
            }
          </FormItem>
          <FormItem label="业务">
            {
              getFieldDecorator("app", {
                initialValue: serverInfo.app,
                rules: [
                  { required: true, message: "请输入业务" }
                ]
              })(
                <Input type="text" placeholder="请输入业务" />
              )
            }
          </FormItem>
          <FormItem label="负责人">
            {
              getFieldDecorator("user_id", {
                initialValue: serverInfo.user ? serverInfo.user.id : undefined,
                rules: [
                  { required: true, message: "负责人不能为空" }
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
                  {serverInfo.user ? <Option key={serverInfo.user.id} value={serverInfo.user.id}>{serverInfo.user.name}({serverInfo.user.account})</Option> : ""}
                  {userLists.map(item => <Option key={item.id} value={item.id}>{item.name}({item.account})</Option>)}
                </Select>
              )
            }
          </FormItem>
          <FormItem label="备注">
            {
              getFieldDecorator("remarks", {
                initialValue: serverInfo.remarks
              })(
                <TextArea />
              )
            }
          </FormItem>
        </Form>
      </div>
    )
  }
}

ServerForm = Form.create({})(ServerForm)

export default Server;
