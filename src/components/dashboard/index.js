import React from 'react';
import ReactEcharts from 'echarts-for-react';
import { inject } from '../../utils/util';
import statisticService from '../../services/statistic';
import { Card, Row, Col, List, Badge } from 'antd';
import moment from "moment";


@inject({ statisticService })
class EchartsTest extends React.Component {
  state = {
    classifyStatisticData: [],
    levelStatisticData: {},
    serverStatisticData: [],
    schedulingTodayStatisticData: []
  }

  componentDidMount() {
    this.fetchClassifyStatistic()
    this.fetchLevelStatistic()
    this.fetchServerStatistic()
    this.fetchSchedulingTodayStatistic()
  }

  fetchClassifyStatistic = () => {
    this.props.statisticService.getClassifyStatistic()
      .then(data => {
        this.setState({ classifyStatisticData: data.results })
      })
  }

  fetchLevelStatistic = () => {
    this.props.statisticService.getLevelStatistic()
      .then(data => {
        this.setState({ levelStatisticData: data.results })
      })
  }

  fetchServerStatistic = () => {
    this.props.statisticService.getServerStatistic()
      .then(data => {
        this.setState({ serverStatisticData: data.results })
      })
  }

  fetchSchedulingTodayStatistic = () => {
    this.props.statisticService.getSchedulingTodayStatistic()
      .then(data => {
        this.setState({ schedulingTodayStatisticData: data.results })
      })
  }

  renderServerItem = (item, index) => {
    const backgroundColor = index > 2 ? '#fafafa' : '#314659'
    const fontColor = index > 2 ? '#314659' : '#fff'
    return (
      <List.Item
        key={item.id}
        extra={
          <span>{item.count}</span>
        }
      >
        <Badge
          count={index + 1}
          style={{ backgroundColor: backgroundColor, color: fontColor, marginRight: "15px" }}
        />
        {item.hostname}({item.ip})
      </List.Item>
    )
  }

  renderSchedulingItem = item => {
    let time = new Date().toTimeString()
    return (
      <List.Item
        extra={
          <span>{item.start_time < time && time < item.end_time ? "正在值班" : ""}</span>
        }
      >
        {item.user}： {item.start_time} ~ {item.end_time}
      </List.Item>
    )
  }


  render() {
    const last_seven_days = []
    for (let i = 6; i >= 0; i--) {
      last_seven_days.push(moment(moment().subtract(i, 'days')))
    }

    const { classifyStatisticData, levelStatisticData, serverStatisticData, schedulingTodayStatisticData } = this.state

    const classifyStatisticOption = {
      title: {
        text: '本月故障分类统计',
        x: 'center'
      },
      tooltip: {
        trigger: 'item',
        formatter: "{a} <br/>{b} : {c} ({d}%)"
      },
      legend: {
        orient: 'vertical',
        x: 'left',
        data: classifyStatisticData.map(item => item.category)
      },
      toolbox: {
        show: true,
        feature: {
          mark: { show: true },
          dataView: { show: true, readOnly: false },
          magicType: {
            show: true,
            type: ['pie', 'funnel'],
            option: {
              funnel: {
                x: '25%',
                width: '50%',
                funnelAlign: 'left',
                max: 1548
              }
            }
          },
          restore: { show: true },
          saveAsImage: { show: true }
        }
      },
      calculable: true,
      series: [
        {
          name: '访问来源',
          type: 'pie',
          radius: '55%',
          center: ['50%', '60%'],
          data: classifyStatisticData.map(item => {
            return { value: item.count, name: item.category }
          })
        }
      ]
    };

    const levelStatisticOption = {
      title: {
        text: '七天故障统计',
      },
      color: ['gold', 'pink', 'red'],
      tooltip: {
        trigger: 'axis',
        axisPointer: {            // 坐标轴指示器，坐标轴触发有效
          type: 'shadow'        // 默认为直线，可选为：'line' | 'shadow'
        }
      },
      legend: {
        data: ['一般故障', '严重故障', '重大故障']
      },
      toolbox: {
        show: true,
        orient: 'vertical',
        x: 'right',
        y: 'center',
        feature: {
          mark: { show: true },
          dataView: { show: true, readOnly: false },
          magicType: { show: true, type: ['line', 'bar', 'stack', 'tiled'] },
          restore: { show: true },
          saveAsImage: { show: true }
        }
      },
      calculable: true,
      xAxis: [
        {
          type: 'category',
          data: last_seven_days.map(item => item.format('MM月DD日'))
        }
      ],
      yAxis: [
        {
          type: 'value',
          minInterval: 1
        }
      ],
      series: [
        {
          name: '一般故障',
          type: 'bar',
          data: last_seven_days.map(item => {
            if (levelStatisticData[item.date()]) {
              if (levelStatisticData[item.date()][1]) {
                return levelStatisticData[item.date()][1]
              }
            }
            return 0;
          })
        },
        {
          name: '严重故障',
          type: 'bar',
          data: last_seven_days.map(item => {
            if (levelStatisticData[item.date()]) {
              if (levelStatisticData[item.date()][2]) {
                return levelStatisticData[item.date()][2]
              }
            }
            return 0;
          })
        },
        {
          name: '重大故障',
          type: 'bar',
          data: last_seven_days.map(item => {
            if (levelStatisticData[item.date()]) {
              if (levelStatisticData[item.date()][3]) {
                return levelStatisticData[item.date()][3]
              }
            }
            return 0;
          })
        }
      ]
    };

    return (
      <div>
        <Card title="今日值班" bordered={false} style={{ marginBottom: " 15px" }}>
          <List
            size="small"
            itemLayout="vertical"
            dataSource={schedulingTodayStatisticData}
            renderItem={this.renderSchedulingItem}
          />
        </Card>
        <Card title="统计" bordered={false}>
          <Row>
            <Col lg={24} xl={16}>
              <ReactEcharts option={levelStatisticOption} style={{ height: '350px' }} />
            </Col>
            <Col span={1}></Col>
            <Col lg={24} xl={7}>
              <h3><b>本月故障服务器排行</b></h3>
              <List
                style={{ marginBottom: '71px' }}
                size="small"
                itemLayout="vertical"
                split={false}
                dataSource={serverStatisticData}
                renderItem={this.renderServerItem}
              />
            </Col>
          </Row>
          <Row>
            <Col lg={24} xl={12}>
              <ReactEcharts option={classifyStatisticOption} style={{ height: '350px' }} />
            </Col>
          </Row>
        </Card>
      </div>
    )
  }
}

export default EchartsTest;
