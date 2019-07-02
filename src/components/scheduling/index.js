import React from "react";
import {
  DatePicker, Card, Table, Upload, Button, Icon, message, Modal, Input, TimePicker, Popconfirm, Form
} from "antd";
import { inject } from '../../utils/util';
import authService from '../../services/auth';
import schedulingService from '../../services/scheduling';
import shiftService from '../../services/shift';
import moment from 'moment';
import { observer } from "mobx-react";
import "./index.less"

const { MonthPicker } = DatePicker;
const { confirm } = Modal;
const EditableContext = React.createContext();


@inject({ schedulingService, authService, shiftService })
@observer
class Scheduling extends React.Component {
  state = {
    data: [],
    shiftLists: [],
    editingKey: '',
    isVisible: false
  }

  date = moment()

  shiftColumns = [
    {
      title: '班次',
      dataIndex: 'shift',
      editable: true,
      width: "20%"
    },
    {
      title: '开始时间',
      dataIndex: 'start_time',
      editable: true,
      width: "25%"
    },
    {
      title: '结束时间',
      dataIndex: 'end_time',
      editable: true,
      width: "25%"
    },
    {
      title: '操作',
      dataIndex: 'operation',
      width: "30%",
      render: (text, record) => {
        const { editingKey } = this.state;
        const editable = this.isEditing(record);
        return editable ? (
          <span>
            <EditableContext.Consumer>
              {form => (
                <Button
                  type="link"
                  onClick={() => this.save(form, record.id)}
                >
                  保存
                </Button>
              )}
            </EditableContext.Consumer>
            <Popconfirm title="确定取消?" onConfirm={() => this.cancel(record.id)}>
              <Button type="link">取消</Button>
            </Popconfirm>
          </span>
        ) : (
            <span>
              <Button type="link" disabled={editingKey !== ''} onClick={() => this.edit(record.id)}>
                编辑
              </Button>
              <Popconfirm title="确定删除?" onConfirm={() => this.delete(record.id)}>
                <Button type="link">删除</Button>
              </Popconfirm>
            </span>
          );
      },
    },
  ];

  componentDidMount() {
    this.fetchScheduling()
    this.fetchShift()
  }

  fetchScheduling = () => {
    const month = this.date.month() + 1
    const year = this.date.year()
    this.props.schedulingService.list({ year, month })
      .then(data => {
        this.setState({
          data: data.results,
        })
      })
  }

  fetchShift = () => {
    this.props.shiftService.lists()
      .then(data => {
        this.setState({
          shiftLists: data.results,
          editingKey: ''
        })
      })
  }

  isEditing = record => record.id === this.state.editingKey;

  cancel = id => {
    if (id < 0) {
      const newData = [...this.state.shiftLists];
      const index = newData.findIndex(item => id === item.id);
      newData.splice(index, 1);
      this.setState({ shiftLists: newData });
    }
    this.setState({ editingKey: '' });
  };

  save(form, id) {
    form.validateFields((error, values) => {
      if (error) {
        return;
      }
      const row = {
        shift: values["shift"],
        start_time: values["start_time"].format('HH:mm:ss'),
        end_time: values["end_time"].format('HH:mm:ss')
      }

      if (id > -1) {
        this.props.shiftService.update(id, row)
          .then(data => {
            message.success("修改成功")
            this.fetchShift()
          })
          .catch(error => {
            if (error.response.status === 400) {
              message.error("修改失败，请重试")
            } else if (error.response.status === 409) {
              message.error("修改失败，班次已存在")
            }
          })
      } else {
        this.props.shiftService.add(row)
          .then(data => {
            message.success("添加成功")
            this.fetchShift()
          })
          .catch(error => {
            if (error.response.status === 400) {
              message.error("添加失败，请重试")
            } else if (error.response.status === 409) {
              message.error("添加失败，班次已存在")
            }
          })
      }
    });
  }

  edit = id => {
    this.setState({ editingKey: id });
  }

  delete = id => {
    this.props.shiftService.delete(id)
      .then(data => {
        message.success("删除成功")
        this.fetchShift()
      })
      .catch(error => {
        if (error.response.status === 400) {
          message.error("删除失败，请重试")
        } else if (error.response.status === 409) {
          message.error("班次正在使用，无法删除")
        }
      })
  }

  handleShiftAdd = () => {
    const { shiftLists } = this.state;
    const newData = {
      id: -1,
      shift: "",
      start_time: '00:00:00',
      end_time: '00:00:00',
    };
    this.setState({
      shiftLists: [...shiftLists, newData]
    });
    this.edit(newData.id)
  }

  handleDateChange = (date, dateString) => {
    this.date = date
    this.fetchScheduling()
  }

  renderWeekendCellClass = day => {
    let date = moment(this.date);
    date.set('date', day)
    const week = date.day()
    if (week in [6, 7]) {
      return "weekendcell"
    }
  }

  handleUpload = file => {
    const year = this.date.year();
    const month = this.date.month() + 1;
    const formData = new FormData()

    confirm({
      title: `上传确认`,
      content: `确认上传${year}年${month}月值班表?`,
      onOk: () => {
        formData.append('file', file);
        formData.append('year', year);
        formData.append('month', month);

        this.props.schedulingService.upload(formData)
          .then(data => {
            message.success("上传成功")
            this.fetchScheduling()
          })
          .catch(error => {
            if (error.response.status === 400) {
              message.error("Excel格式错误")
            }
          })
      },
      onCancel() {
        message.info("取消上传")
      },
    });
    return false;
  }

  render() {
    const components = {
      body: {
        cell: EditableCell,
      },
    };

    const shiftColumns = this.shiftColumns.map(col => {
      if (!col.editable) {
        return col;
      }
      return {
        ...col,
        onCell: record => ({
          record,
          inputType: col.dataIndex === 'shift' ? 'text' : 'time',
          dataIndex: col.dataIndex,
          title: col.title,
          editing: this.isEditing(record),
        }),
      };
    });

    const days = this.date.daysInMonth()

    let columns = [
      {
        title: '用户',
        dataIndex: 'user',
        width: 80,
        align: "center",
      }
    ]
    for (let i = 1; i <= days; i++) {
      const column = {
        key: i,
        title: i,
        dataIndex: i,
        width: 40,
        align: "center",
        className: this.renderWeekendCellClass(i),
        render(i) {
          let config = {
            'A': 'cyan',
            'B': '#2db7f5',
            'C': '#87d068',
          }
          if (i) {
            return <span style={{ backgroundColor: config[i], display: "block" }}>{i}</span>
          } else {
            return <span>休</span>
          }


        }
      };
      columns.push(column)
    }

    return (
      <div className="scheduling">
        <Card title="值班管理" bordered={false}>
          <div style={{ marginBottom: "15px" }}>
            <MonthPicker
              placeholder="选择日期"
              defaultValue={this.date}
              onChange={this.handleDateChange}
              allowClear={false}
            />
            {this.props.authService.userInfo.is_super ?
              <Upload
                beforeUpload={this.handleUpload}
                showUploadList={false}
                style={{ marginLeft: "15px" }}
              >
                <Button>
                  <Icon type="upload" /> 上传值班表
              </Button>
              </Upload>
              : ""
            }
          </div>
          <Table
            rowKey={record => record.id}
            dataSource={this.state.data}
            size="middle"
            columns={columns}
            pagination={false}
            scroll={{ x: 1500 }}
            bordered
          />
          <div style={{ marginTop: "10px", fontSize: "15px" }}>
            <span style={{ marginRight: "15px" }}>说明: </span>
            {this.state.shiftLists.map(item => {
              return <span key={item.id} style={{ marginRight: "15px" }}>{item.shift}: <i>{item.start_time} ~ {item.end_time}</i></span>
            })}
            {this.props.authService.userInfo.is_super ?
              <Button type="link" size="small" onClick={() => this.setState({ isVisible: true })}>设置</Button>
              : ""
            }
          </div>
        </Card>
        <Modal
          width={650}
          title="班次管理"
          visible={this.state.isVisible}
          onCancel={() => this.setState({ isVisible: false })}
          footer={null}
        >
          <Button onClick={this.handleShiftAdd} type="primary" style={{ marginBottom: 16 }}>
            Add
          </Button>
          <EditableContext.Provider value={this.props.form}>
            <Table
              bordered
              components={components}
              dataSource={this.state.shiftLists}
              columns={shiftColumns}
              pagination={false}
              rowKey={record => record.id}
              size="small"
            />
          </EditableContext.Provider>
        </Modal>
      </div >
    )
  }
}


class EditableCell extends React.Component {
  getInput = () => {
    if (this.props.inputType === 'time') {
      return <TimePicker />;
    }
    return <Input />;
  };

  renderCell = ({ getFieldDecorator }) => {
    const {
      editing,
      dataIndex,
      title,
      inputType,
      record,
      index,
      children,
      ...restProps
    } = this.props;
    return (
      <td {...restProps}>
        {editing ? (
          <Form.Item style={{ margin: 0 }}>
            {getFieldDecorator(dataIndex, {
              rules: [
                {
                  required: true,
                  message: `请输入 ${title}`,
                },
              ],
              initialValue: dataIndex === "shift" ? record[dataIndex] : moment(record[dataIndex], 'HH:mm:ss')
            })(this.getInput())}
          </Form.Item>
        ) : (
            children
          )}
      </td>
    );
  };

  render() {
    return <EditableContext.Consumer>{this.renderCell}</EditableContext.Consumer>;
  }
}

export default Form.create()(Scheduling);
