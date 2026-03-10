import { initStoragesForDevelopment } from './development'

export default defineBackground(() => {
  if (import.meta.env.DEV) {
    initStoragesForDevelopment()
  }
})
