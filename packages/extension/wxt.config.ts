import tailwindcss from '@tailwindcss/vite'
import TurboConsole from 'unplugin-turbo-console/vite'
import { defineConfig } from 'wxt'

// See https://wxt.dev/api/config.html
export default defineConfig({
  srcDir: 'src',
  modules: ['@wxt-dev/module-react'],
  vite: () => ({
    plugins: [tailwindcss(), TurboConsole()],
  }),
  manifest: {
    name: 'Browser Pilot',
    permissions: ['storage'],
    host_permissions: ['<all_urls>'],
  },
})
