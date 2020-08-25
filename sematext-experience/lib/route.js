const { parse } = require('url')
let routes

module.exports = (arg, action, state = {}) => {
  if (!routes) {
    routes = {
      'index': require('../ui')
    }
  }

  if (!action) {
    action = arg.payload.action
  }

  const { pathname, query } = parse(action, true)
  for (const [p, fn] of Object.entries(routes)) {
    if (p === pathname) {
      return fn(arg, { params: query, state })
    }
  }
}
