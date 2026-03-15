import { defineConfig } from 'bumpp'

export default defineConfig({
  commit: true,
  tag: true,
  push: false,
  all: true,
  confirm: true,
  noVerify: false,
  recursive: true,
  printCommits: true,
})
