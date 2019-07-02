import axios from 'axios'
import cookie from "./cookie";
import authService from '../services/auth';
import { message } from 'antd';


const service = axios.create({
  baseURL: "api",
  timeout: 5000
})

service.interceptors.request.use(
  config => {
    if (cookie.getToken()) {
      config.headers['Authorization'] = 'JWT ' + cookie.getToken()
    }
    return config
  },
  error => {
    console.log(error)
    return Promise.reject(error)
  }
)

service.interceptors.response.use(
  response => {
    if (cookie.getToken() && response.config.url !== 'api/auth/') {
      authService.refresh()
    }

    return response.data
  },
  error => {
    switch (error.response.status) {
      case 401:
        message.error("登录超时");
        authService.logout();
        break;
      case 403:
        message.error("权限拒绝")
        break;
      case 500:
        message.error("服务器错误");
        break;
      case 504:
        message.error("网络超时")
        break;
      default:
        break;
    }

    console.log(error.response)
    return Promise.reject(error)
  }
)

export default service;
