import request from '../utils/request';


class SchedulingService {

  list = params => {
    // 分页
    return request({
      url: "/scheduling/",
      method: 'get',
      params
    })
  }

  upload = data => {
    return request({
      url: '/scheduling/',
      method: 'post',
      data
    })
  }
}

const schedulingService = new SchedulingService();
export default schedulingService;
