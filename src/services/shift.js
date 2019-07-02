import request from '../utils/request';


class ShiftService {

  lists = () => {
    // 不分页
    return request({
      url: "/shift/",
      method: 'get'
    })
  }

  add = data => {
    return request({
      url: '/shift/',
      method: 'post',
      data
    })
  }

  delete = id => {
    return request({
      url: `/shift/${id}`,
      method: 'delete'
    })
  }

  update = (id, data) => {
    return request({
      url: `/shift/${id}`,
      method: 'put',
      data
    })
  }
}

const shiftService = new ShiftService();
export default shiftService;
