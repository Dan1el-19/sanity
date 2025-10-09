import {defineCliConfig} from 'sanity/cli'

const projectId = process.env.SANITY_STUDIO_PROJECT_ID

const appId = process.env.SANITY_STUDIO_APP_ID
if (!appId) {
  throw new Error('Missing SANITY_STUDIO_APP_ID environment variable')
}

export default defineCliConfig({
  api: {
    projectId: projectId,
    dataset: 'production'
  },
  deployment: {
    appId: appId,
    autoUpdates: true,
  },
  vite: async (viteConfig) => {
    const {default: tailwindcss} = await import('@tailwindcss/vite')
    return {
      ...viteConfig,
      plugins: [
        ...(viteConfig.plugins ?? []),
        tailwindcss()
      ],
    }
  }
})
