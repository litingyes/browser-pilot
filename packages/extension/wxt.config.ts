import tailwindcss from '@tailwindcss/vite'
import TurboConsole from 'unplugin-turbo-console/vite'
import { defineConfig } from 'wxt'

// See https://wxt.dev/api/config.html
export default defineConfig({
  srcDir: 'src',
  modules: ['@wxt-dev/module-react', '@wxt-dev/auto-icons'],
  vite: () => ({
    plugins: [tailwindcss(), TurboConsole()],
  }),
  manifest: {
    name: 'Pilo',
    permissions: ['storage', 'debugger'],
    host_permissions: ['<all_urls>'],
  },
})
