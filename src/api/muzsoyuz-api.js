import {Request} from './request'
import {config} from "../config"

export class MuzSoyuzRequest extends Request {
  setToken(token) {
    this.setHeaders({
      Authorization: `Bearer ${token}`,
    })

    return this
  }

  static getUserProfile() {
    return this.get('/user/profile')
  }

  static getChatUsers() {
    return this.get('/chat/users')
  }

  static makeAuthentication(route, body) {
    return this.post(`/auth/${route}`, body)
  }

  static getTokenAfterSocialOauth(provider, query) {
    return this.get(`/auth/oauth/${provider}/callback/${query}`)
  }


  static register(email, password) {
    return this.makeAuthentication('register', { email, password })
  }

  static login(email, password) {
    return this.makeAuthentication('login', { email, password })
  }

  props(array) {
    this.body.props = array

    return this
  }

  isSucceededStatus(response) {
    return !response.status || super.isSucceededStatus(response)
  }

  async execute() {
    this.url = config.getApiPath() + this.url

    return super.execute()
      .then(this.checkStatus.bind(this))
      .catch(e => {
        e.message = Array.isArray(e.message)
          ? e.message.join(', ')
          : e.message

        throw e
      })
  }
}