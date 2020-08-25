const { htm } = require('@zeit/integration-utils')
const ms = require('ms')
const { stringify } = require('querystring')
const getLogDrains = require('../lib/get-log-drains')
const getIntegration = require('../lib/get-integration')
const getProject = require('../lib/get-project')
const route = require('../lib/route')
const { parse } = require('url')
const detectRegion = require('../lib/detect-region')

module.exports = async (arg, { state }) => {
  const { payload } = arg
  const { integrationId, team, teamId, token, user } = payload
  const { errorMessage } = state
  const drains = await getLogDrains({ teamId, token })
  drains.sort((a, b) => b.createdAt - a.createdAt)

  const otherIntergraionIds = new Set(
    drains.filter(d => d.clientId !== integrationId).map(d => d.clientId)
  )

  let otherIntergraionsMap
  if (otherIntergraionIds.size) {
    const otherIntegrations = await Promise.all(
      [...otherIntergraionIds].map(id =>
        getIntegration({ teamId, token }, { id })
      )
    )
    otherIntergraionsMap = new Map(otherIntegrations.map(i => [i.id, i]))
  }

  const projectIds = new Set(drains.map(d => d.projectId).filter(Boolean))
  const projectMap = new Map(
    await Promise.all(
      [...projectIds].map(async id => {
        let project = null
        try {
          project = await getProject({ teamId, token }, id)
        } catch (err) {
          if (!err.res || err.res.status !== 404) {
            throw err
          }
        }
        return [id, project]
      })
    )
  )

  const newDrain = await route(arg, 'new-drain')
  // e8e99fff-8af6-4877-a9f2-8317249d40ae

  return htm`
    <Page>
      ${
        drains.length === 0
          ? ''
          : htm`
          <Box display="flex" justifyContent="space-between" alignItems="center" marginBottom="20px">
            <H1>Log Drains</H1>
            <Button action="new-drain" background="#FF0000">Create Drain</Button>
          </Box>
          `
      }
      ${errorMessage ? htm`<Notice type="error">${errorMessage}</Notice>` : ''}
      ${
        drains.length
          ? drains.map(drain => {
              const { hostname, pathname } = parse(drain.url)
              const logsToken = pathname.split('/').pop()
              const logsTokenToDisplay =
                logsToken.slice(0, 9) + '*'.repeat(14) + logsToken.slice(-13)
              const region = detectRegion(hostname)
              const project = drain.projectId
                ? projectMap.get(drain.projectId)
                : null
              return htm`
            <Fieldset>
              <FsContent>
                <Box display="flex" justifyContent="space-between">
                  <Box>
                    <H2>${drain.name}</H2>

                    <P>You logs are being forwarded using the following Logs Token in your account.</P>
                    <Box alignItems="center" display="flex" justifyContent="start" margin="20px 0 0 0">
                      <H2>${logsTokenToDisplay}</H2>
                    </Box>

                    ${
                      project
                        ? htm`<P><B>Project:</B> <Link href=${`https://zeit.co/${encodeURIComponent(
                            team ? team.slug : user.username
                          )}/${encodeURIComponent(project.name)}`}>${
                            project.name
                          }</Link></P>`
                        : drain.projectId
                        ? htm`<Box color="red"><P>The project subscribing is already deleted (ID: ${drain.projectId})</P></Box>`
                        : ''
                    }
                  </Box>
                  <Box alignItems="flex-end" display="flex" flexDirection="column" justifyContent="space-between">
                    <P><Box color="#666">${ms(
                      Date.now() - drain.createdAt
                    )}</Box></P>
                    ${
                      drain.clientId === integrationId
                        ? htm`<Button action=${`delete-drain?${stringify({
                            id: drain.id
                          })}`} small type="error">DELETE</Button>`
                        : htm`
                          <P>
                            Created by <Link href=${`https://zeit.co/dashboard/integrations/${encodeURIComponent(
                              drain.configurationId
                            )}`}>${
                            otherIntergraionsMap.get(drain.clientId).name
                          }</Link>
                          </P>
                        `
                    }
                  </Box>
                </Box>
              </FsContent>
              <FsFooter>
                <Box display="flex" flex="0 0 100%" justifyContent="space-between">
                  <P><Link href=${`https://apps.${
                    region === 'us' ? '' : 'eu.'
                  }sematext.com/ui/logs`} target="_blank">View logs in Sematext (${region.toUpperCase()})</Link></P>
                </Box>
              </FsFooter>
            </Fieldset>
          `
            })
          : newDrain
      }
      <AutoRefresh timeout="60000" />
    </Page>
  `
}
