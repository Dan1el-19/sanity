import {defineCliConfig} from 'sanity/cli'

export default defineCliConfig({
  api: {
    projectId: 'REDACTED',
    dataset: 'production'
  },
  deployment: {
    appId: 'REDACTED',
    autoUpdates: true,
  }
})
