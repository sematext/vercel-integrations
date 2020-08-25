const { withUiHook } = require('@zeit/integration-utils')
const route = require('../lib/route')

module.exports = withUiHook(async arg => {
  let {
    payload: { action }
  } = arg
  if (action === 'view') {
    action = 'index'
  }
  if (action === 'region') {
    action = 'index'
  }

  return route(arg, action)
})
