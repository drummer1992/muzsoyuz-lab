class Config {
  getApiPath() {
    return process.env.REACT_APP_HOST + process.env.REACT_APP_API_PREFIX
  }
}

export const config = new Config()