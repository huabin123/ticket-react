import request from '../utils/request';
import { observable } from "mobx";

import cookie from "../utils/cookie";


class AuthService {
  @observable loginSuccess = false;
  @observable userInfo = {
    id: null,
    account: "",
    name: "",
    is_super: null,
    email: "",
    phone: ""
  }

  setLogin = data => {
    cookie.setToken(data.token)
    if (this.loginSuccess === false) {
      this.setUserInfo()
    }
  }

  setUserInfo = () => {
    request({
      url: '/user/info',
      method: 'get'
    })
      .then(data => {
        this.userInfo.id = data.id
        this.userInfo.account = data.account
        this.userInfo.name = data.name
        this.userInfo.is_super = data.is_super
        this.userInfo.email = data.email
        this.userInfo.phone = data.phone
        this.loginSuccess = true
      })
  }

  login = data => {
    return request({
      url: '/auth/',
      method: 'post',
      data
    })
  }

  refresh = () => {
    request({
      url: '/auth/',
      method: 'get'
    })
      .then(data => {
        this.setLogin(data)
      })
  }

  logout = () => {
    cookie.removeToken()
    this.userInfo.id = null
    this.userInfo.account = ""
    this.userInfo.name = ""
    this.userInfo.is_super = null
    this.userInfo.email = ""
    this.userInfo.phone = ""
    this.loginSuccess = false
  }
}

const authService = new AuthService()
export default authService