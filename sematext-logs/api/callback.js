const { parse } = require('url')
const { HOST } = require('../lib/env')
const redirectUri = `${HOST}/api/callback`
const getAccessToken = require('../lib/get-access-token')
const setMetadata = require('../lib/set-metadata')

module.exports = async (req, res) => {
  const {
    query: { code, configurationId, next, teamId }
  } = parse(req.url, true)
  if (!code) {
    res.statusCode = 400
    res.end('missing query parameter: code')
    return
  }

  console.log('Getting accessToken')
  console.log('redirectUri: ', redirectUri)
  const token = await getAccessToken({
    code,
    redirectUri
  })

  console.log('Storing accessToken to metadata')
  await setMetadata({ configurationId, token, teamId }, { token })

  res.statusCode = 302
  res.setHeader('Location', next)
  res.end()
}
