import * as path from 'node:path'
import { defineConfig } from '@rspress/core'

export default defineConfig({
  root: path.join(__dirname, 'docs'),
  title: 'Browser Pilot',
  themeConfig: {
    socialLinks: [
      {
        icon: 'github',
        mode: 'link',
        content: 'https://github.com/litingyes/browser-pilot',
      },
    ],
  },
})
