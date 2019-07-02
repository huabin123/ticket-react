import cookie from 'js-cookie'

const TokenKey = 'token'

export default {
  setToken(token) {
    cookie.set(TokenKey, token)
  },
  
  getToken() {
    return cookie.get(TokenKey)
  },

  removeToken() {
    return cookie.remove(TokenKey)
  }
}