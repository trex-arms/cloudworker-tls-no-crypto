const { Request, Response, fetch, Headers, freezeHeaders, bindCfProperty } = require('./fetch')
const { URL, URLSearchParams } = require('url')

class FetchEvent {
  constructor (type, init) {
    this.request = init.request
  }

  respondWith () {
    throw new Error('unimplemented')
  }

  waitUntil () {
    throw new Error('unimplemented')
  }

  passThroughOnException () {

  }
}

class Context {
  constructor (addEventListener, bindings = {}) {

    this.addEventListener = addEventListener
    this.fetch = fetch
    this.Request = Request
    this.Response = Response
    this.Headers = Headers
    this.FetchEvent = FetchEvent
    this.URL = URL

    Object.assign(this, bindings)
  }
}

module.exports = {
  Context,
  fetch,
  FetchEvent,
  freezeHeaders,
  bindCfProperty,
  Headers,
  Request,
  Response,
  URL
}
