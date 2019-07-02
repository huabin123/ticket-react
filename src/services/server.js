import request from '../utils/request';


class ServerService {

  lists = params => {
    // 不分页
    return request({
      url: "/server/list",
      method: 'get',
      params
    })
  }

  list = params => {
    // 分页
    return request({
      url: "/server/",
      method: 'get',
      params
    })
  }

  add = data => {
    return request({
      url: '/server/',
      method: 'post',
      data
    })
  }

  delete = id => {
    return request({
      url: `/server/${id}`,
      method: 'delete'
    })
  }

  update = (id, data) => {
    return request({
      url: `/server/${id}`,
      method: 'put',
      data
    })
  }
}

const serverService = new ServerService();
export default serverService;
