const createLogDrain = require('../lib/create-log-drain')
const getMetadata = require('../lib/get-metadata')
const route = require('../lib/route')

module.exports = async arg => {
  const { payload } = arg
  const { clientState, configurationId, teamId, token } = payload
  const { name, projectId, logsToken, region } = clientState

  if (logsToken.length !== 36) {
    return route(arg, 'new-drain', {
      errorMessage:
        'Invalid Logs Token. Logs Token format must be "xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx".'
    })
  }

  const urlUs = 'https://logs-vercel-receiver.sematext.com'
  const urlEu = 'https://logs-vercel-receiver.eu.sematext.com'
  let url = `${urlUs}/${logsToken}`
  if (region === 'eu') {
    url = `${urlEu}/${logsToken}`
  }

  console.log('getting metadata')
  const metadata = await getMetadata({ configurationId, token, teamId })

  console.log('creating a new log drain')
  try {
    await createLogDrain(
      {
        token: metadata.token,
        teamId
      },
      {
        name,
        projectId: projectId || null,
        type: 'json',
        url
      }
    )
  } catch (err) {
    if (err.body && err.body.error) {
      return route(arg, 'new-drain', {
        errorMessage: err.body.error.message
      })
    } else {
      throw err
    }
  }

  return route(arg, 'list-drains')
}
