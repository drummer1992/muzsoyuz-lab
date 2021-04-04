import {Request} from './request'
import {config} from "../config"

export class MuzSoyuzRequest extends Request {
  setToken(token) {
    this.setHeaders({
      authorization: `Bearer ${token}`,
    })

    return this
  }

  static getUserProfile(token) {
    return this.get('/user').setToken(token)
  }

  static makeAuthentication(route, body) {
    return this.post(`/auth/${route}`, body)
  }

  static getTokenAfterSocialOauth(provider, query) {
    return this.get(`/oauth/${provider}/callback${query}`)
  }

  static login(email, password) {
    return this.makeAuthentication('signIn', { email, password })
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