import {defineCliConfig} from 'sanity/cli'

export default defineCliConfig({
  api: {
    projectId: 'REDACTED',
    dataset: 'production'
  },
  deployment: {
    appId: 'REDACTED',
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
