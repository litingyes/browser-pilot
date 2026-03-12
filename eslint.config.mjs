import antfu from '@antfu/eslint-config'
import pluginQuery from '@tanstack/eslint-plugin-query'
import tailwindcss from 'eslint-plugin-better-tailwindcss'
import formatjs from 'eslint-plugin-formatjs'

export default antfu(
  {
    formatters: true,
    react: true,
    rules: {
      'e18e/ban-dependencies': ['warn', {
        allowed: ['lint-staged'],
      }],
    },
    extends: [
      tailwindcss.configs.recommended,
      pluginQuery.configs.recommended,
    ],
    settings: {
      'better-tailwindcss': {
        entryPoint: '/packages/extension/src/assets/tailwind.css',
      },
    },
    ignores: [
      '.agents/skills',
      '.claude/skills',
      'packages/extension/src/components/ui',
      'packages/extension/src/components/ai-elements',
      'packages/extension/src/hooks/use-mobile.ts',
      'packages/extension/src/lib/utils.ts',
    ],
  },
  {
    files: ['pnpm-workspace.yaml'],
    rules: {
      'pnpm/yaml-enforce-settings': ['warn', {
        settings: {
          trustPolicy: 'off',
        },
      }],
    },
  },
  formatjs.configs.recommended,
)
