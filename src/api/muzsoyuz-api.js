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
    return this.get('/user')
  }

  static makeAuthentication(route, body) {
    return this.post(`/auth/${route}`, body)
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