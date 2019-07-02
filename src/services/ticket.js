import request from '../utils/request';


class TicketService {

  list = params => {
    return request({
      url: "/ticket/",
      method: 'get',
      params
    })
  }

  add = data => {
    return request({
      url: "/ticket/",
      method: 'post',
      data
    })
  }

  destroy = id => {
    return request({
      url: `/ticket/${id}`,
      method: 'get',
    })
  }

  update = (id, data) => {
    return request({
      url: `/ticket/${id}`,
      method: 'post',
      data
    })
  }

  assign = data => {
    return request({
      url: `/ticket/assign`,
      method: 'post',
      data
    })
  }

}

const ticketService = new TicketService();
export default ticketService;
