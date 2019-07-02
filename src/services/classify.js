import request from '../utils/request';


class ClassifyService {

  lists = () => {
    // 不分页
    return request({
      url: "/classify/",
      method: 'get'
    })
  }

  add = data => {
    return request({
      url: '/classify/',
      method: 'post',
      data
    })
  }
}

const classifyService = new ClassifyService();
export default classifyService;
