const { withUiHook } = require('@zeit/integration-utils')
const route = require('../lib/route')

module.exports = withUiHook(async arg => {
  let {
    payload: { action }
  } = arg
  if (action === 'view') {
    action = 'list-drains'
  }
  if (action === 'region') {
    action = 'new-drain'
  }
  return route(arg, action)
})
