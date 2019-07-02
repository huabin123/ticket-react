import request from '../utils/request';


class UserService {

  lists = params => {
    // 不分页
    return request({
      url: "/user/list",
      method: 'get',
      params
    })
  }

  list = params => {
    // 分页
    return request({
      url: "/user/",
      method: 'get',
      params
    })
  }

  add = data => {
    return request({
      url: '/user/',
      method: 'post',
      data
    })
  }

  delete = id => {
    return request({
      url: `/user/${id}`,
      method: 'delete'
    })
  }

  update = (id, data) => {
    return request({
      url: `/user/${id}`,
      method: 'put',
      data
    })
  }

}

const userService = new UserService();
export default userService;
