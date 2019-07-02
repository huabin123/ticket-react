import React from 'react';
import cookie from "./cookie";
import authService from '../services/auth';


export const inject = obj => Comp => props => <Comp {...obj} {...props} />;

export const userInfo = Comp => props => {
  if (cookie.getToken() && authService.loginSuccess === false) {
    authService.setUserInfo()
  }
  return <Comp {...props} />
}

export const pagination = data => {
  return {
    total: data.count,
    showSizeChanger: true,
    showQuickJumper: true,
    current: data.page,
    pageSize: data.page_size,
    pageSizeOptions: ["10", "20", "50", "100"],
    showTotal: () => {
      return `共${data.count}条`
    }
  }
}
