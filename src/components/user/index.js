import React from "react";
import {
  Table, Card, Input, Button, Tag, Form, Switch, Modal, message
} from "antd";
import { observer } from "mobx-react";
import { inject, pagination } from '../../utils/util';
import authService from '../../services/auth';
import userService from '../../services/user';

const Search = Input.Search
const TextArea = Input.TextArea
const FormItem = Form.Item


@inject({ authService, userService, pagination })
@observer
class User extends React.Component {

  state = {
    data: [],
    loading: false,
    pagination: "",
    title: "",
    isVisible: false,
    userForm: "",
    type: "",
    selectedRowKeys: [],
    userInfo: "",
    selectedRows: ""
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
    this.props.userService.list(this.params)
      .then(data => {
        const pagination = this.props.pagination(data)
        this.setState({
          data: data.results,
          loading: false,
          selectedRowKeys: [],
          selectedRows: "",
          pagination
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

  handleUserCreate = () => {
    this.setState({
      isVisible: true,
      title: "添加用户",
      type: "create"
    })
  }

  handleUserEdit = () => {
    this.setState({
      isVisible: true,
      title: "编辑用户",
      userInfo: this.state.selectedRows,
      type: "edit"
    })
  }

  handleUserDelete = () => {
    const record = this.state.selectedRows
    const id = record.id
    Modal.confirm({
      title: "删除确认",
      content: `确定删除用户 ${record.account}(${record.name}) 吗?`,
      onOk: () => {
        this.props.userService.delete(id)
          .then(data => {
            message.success("删除成功")
            this.fetchData()
          })
          .catch(error => {
            if (error.response.status === 400) {
              message.error("删除失败，请重试")
            } else if (error.response.status === 409) {
              message.error("用户正在使用，无法删除")
            }
          })
      },
      onCancel: () => {
        message.info("取消删除", 1)
      }
    })
  }

  handleSubmit = () => {
    this.userForm.props.form.validateFields((err, values) => {
      if (!err) {
        if (this.state.type === "create") {
          this.props.userService.add(values)
            .then(data => {
              message.success(`用户 ${values.account} 添加成功`)
              message.success(`密码已发送至邮箱 ${values.email}`)
              this.fetchData()
            })
            .catch(error => {
              if (error.response.status === 409) {
                message.error("添加失败，账号或姓名已存在")
              }
            })
        }
        else {
          const id = this.state.selectedRows.id
          this.props.userService.update(id, values)
            .then(data => {
              message.success(`用户 ${values.account} 修改成功`)
              this.fetchData()
            })
            .catch(error => {
              if (error.response.status === 409) {
                message.error("修改失败，账号或姓名已存在")
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
    this.userForm.props.form.resetFields()
    this.setState({
      isVisible: false,
      userInfo: ""
    })
  }

  handleOnSelectChange = (selectedRowKeys, selectedRows) => {
    this.setState({ selectedRowKeys, selectedRows })
  }

  render() {

    const columns = [
      {
        title: '账户',
        dataIndex: 'account',
        width: 200
      },
      {
        title: '姓名',
        dataIndex: 'name',
        width: 200
      },
      {
        title: '邮箱',
        dataIndex: 'email',
        width: 200
      },
      {
        title: '手机',
        dataIndex: 'phone',
        width: 200
      },
      {
        title: '管理员',
        dataIndex: 'is_super',
        width: 50,
        render(is_super) {
          if (is_super === true) {
            return <Tag color="blue">启用</Tag>
          } else {
            return <Tag color="red">禁用</Tag>
          }
        }
      },
      {
        title: 'Active',
        dataIndex: 'is_active',
        width: 50,
        render(is_active) {
          if (is_active === true) {
            return <Tag color="blue">启用</Tag>
          } else {
            return <Tag color="red">禁用</Tag>
          }
        }
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
        <Card bordered={false} title="用户管理">
          <div style={{ marginBottom: "20px" }}>
            {this.props.authService.userInfo.is_super ?
              <span>
                <Button type="primary" style={{ marginRight: 15 }} onClick={this.handleUserCreate}>添加用户</Button>
                <Button type="primary" style={{ marginRight: 15 }} disabled={!hasSelected} onClick={this.handleUserEdit}>编辑用户</Button>
                <Button type="primary" style={{ marginRight: 15 }} disabled={!hasSelected} onClick={this.handleUserDelete}>删除用户</Button>
              </span>
              : ""
            }
            <Search
              style={{ width: "300px" }}
              onChange={e => this.handleSearch(e.target.value)}
              placeholder="搜索账户或姓名"
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
          <UserForm
            userInfo={this.state.userInfo}
            wrappedComponentRef={(inst) => this.userForm = inst}
          />
        </Modal>
      </div >
    )
  }
}


class UserForm extends React.Component {

  render() {
    const userInfo = this.props.userInfo
    const { getFieldDecorator } = this.props.form;

    const formItemLayout = {
      labelCol: { span: 5 },
      wrapperCol: { span: 16 }
    }

    return (
      <div>
        <Form layout="horizontal" {...formItemLayout}>
          <FormItem label="账号">
            {
              getFieldDecorator("account", {
                initialValue: userInfo.account,
                rules: [
                  { required: true, message: "请输入账号" }
                ]
              })(
                <Input type="text" placeholder="请输入账号" />
              )
            }
          </FormItem>
          <FormItem label="姓名">
            {
              getFieldDecorator("name", {
                initialValue: userInfo.name,
                rules: [
                  { required: true, message: "请输入姓名" }
                ]
              })(
                <Input type="text" placeholder="请输入姓名" />
              )
            }
          </FormItem>
          <FormItem label="邮箱">
            {
              getFieldDecorator("email", {
                initialValue: userInfo.email,
                rules: [
                  { type: 'email', message: '请输入正确的邮箱地址' },
                  { required: true, message: "请输入邮箱地址" }
                ]
              })(
                <Input type="text" placeholder="请输入邮箱地址" />
              )
            }
          </FormItem>
          <FormItem label="手机">
            {
              getFieldDecorator("phone", {
                initialValue: userInfo.phone,
              })(
                <Input type="text" placeholder="请输入手机号码" />
              )
            }
          </FormItem>
          <FormItem label="管理员">
            {
              getFieldDecorator("is_super", {
                valuePropName: "checked",
                initialValue: userInfo.is_super,
              })(
                <Switch />
              )
            }
          </FormItem>
          <FormItem label="Active">
            {
              getFieldDecorator("is_active", {
                valuePropName: "checked",
                initialValue: userInfo === "" ? true : userInfo.is_active
              })(
                <Switch />
              )
            }
          </FormItem>
          <FormItem label="备注">
            {
              getFieldDecorator("remarks", {
                initialValue: userInfo.remarks
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

UserForm = Form.create({})(UserForm)

export default User;
