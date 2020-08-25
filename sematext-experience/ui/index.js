const { htm } = require('@zeit/integration-utils')

module.exports = async (arg, { state }) => {
  const { payload } = arg
  const { clientState, teamId, token } = payload
  const {
    region = 'us'
  } = clientState
  const { errorMessage } = state

  return htm`
    <Page>
     
      <Fieldset>
        <FsContent>
          <H2>Create Your Sematext Account</H2>
          <P>Visit <Link href="https://apps.sematext.com/ui/registration" target="_blank">Sematext</Link> and create an account.</P>
        </FsContent>
        <FsFooter>
          If you already have an account, you can use that account instead.
        </FsFooter>
      </Fieldset>

      <Fieldset>
        <FsContent>
          <H2>Select Region</H2>
          <P>The region you chose when creating your account.</P>
          <Select name="region" value=${region} action="region">
            <Option value="us" caption="US" />
            <Option value="eu" caption="EU" />
          </Select>
        </FsContent>
      </Fieldset>

      <Fieldset>
        <FsContent>
          <H2>Create an Experience App</H2>
          <P>Go to <Link href=${`https://apps.${
            region === 'us' ? '' : 'eu.'
          }sematext.com/ui/rum`} target="_blank">Sematext Experience</Link> and click on the <B>"+ New Experience App"</B> button to create an App.</P>
          <P>Once the App is created, follow the <B>"Experience Script Installation"</B> to activate real user monitoring.</P>
        </FsContent>
      </Fieldset>

      ${errorMessage ? htm`<Notice type="error">${errorMessage}</Notice>` : ''}
    </Page>
  `
}
