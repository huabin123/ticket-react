import React from 'react';
import {
  Calendar, Card, Badge
} from 'antd';
import moment from 'moment';
import { inject } from '../../utils/util';
import authService from '../../services/auth';
import schedulingService from '../../services/scheduling';
import shiftService from '../../services/shift';
import { observer } from "mobx-react";
import "./index.less"


@inject({ schedulingService, authService, shiftService })
@observer
class MyScheduling extends React.Component {
  state = {
    data: {},
    shifts: {}
  }

  date = moment()

  componentDidMount() {
    this.fetchScheduling()
    this.fetchShift()
  }

  fetchScheduling = () => {
    const month = this.date.month() + 1
    const year = this.date.year()
    const user = this.props.authService.userInfo.id;
    this.props.schedulingService.list({ year, month, user })
      .then(data => {
        this.setState({
          data: data.results[0] ? data.results[0] : {},
        })
      })
  }

  fetchShift = () => {
    this.props.shiftService.lists()
      .then(data => {
        let shifts = {}
        data.results.map(item => {
          const shift = item.shift
          const start_time = item.start_time
          const end_time = item.end_time
          shifts[shift] = [start_time, end_time]
          return null;
        })
        this.setState({
          shifts
        })
      })
  }

  getListData = day => {
    let config = {
      'A': 'cyan',
      'B': '#2db7f5',
      'C': '#87d068',
    }

    const shift = this.state.data[day]
    if (!this.state.shifts[shift]) {
      return <Badge status="default" text="休" />
    }

    const [start_time, end_time] = this.state.shifts[shift]

    return (<div>
      <div><Badge color={config[shift]} text={shift} /></div>
      <div><Badge status="default" text={`${start_time} ~ ${end_time}`} /></div>
    </div>)
  }

  dateCellRender = date => {
    const month = this.date.month()
    const current_month = date.month()
    const day = date.date()
    if (month !== current_month) {
      return
    }
    return this.getListData(day)
  }

  onPanelChange = date => {
    this.date = date
    this.fetchScheduling()
  }

  render() {
    return (
      <div>
        <Card bordered={false} title="我的排班">
          <Calendar
            value={this.date}
            dateCellRender={this.dateCellRender}
            onPanelChange={this.onPanelChange}
          />
        </Card>
      </div >
    );
  }
}


export default MyScheduling;
