const debounce = (fn, ms) => {
  let callAvailable = true

  return (...args) => {
    if (callAvailable) {
      callAvailable = false

      const result = fn(...args)

      setTimeout(() => {
        callAvailable = true
      }, ms)

      return result
    }
  }
}

export default debounce