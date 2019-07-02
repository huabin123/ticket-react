import request from '../utils/request';


class StatisticService {

  getClassifyStatistic = () => {
    return request({
      url: "/statistic/classify",
      method: 'get'
    })
  }

  getLevelStatistic = () => {
    return request({
      url: "/statistic/level",
      method: 'get'
    })
  }

  getServerStatistic = () => {
    return request({
      url: "/statistic/server",
      method: 'get'
    })
  }

  getSchedulingTodayStatistic = () => {
    return request({
      url: "/statistic/scheduling",
      method: 'get'
    })
  }
}

const statisticService = new StatisticService();
export default statisticService;
