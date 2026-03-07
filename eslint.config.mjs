import antfu from '@antfu/eslint-config'
import tailwindcss from 'eslint-plugin-better-tailwindcss'

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
    ],
    settings: {
      'better-tailwindcss': {
        entryPoint: '/packages/extension/src/assets/tailwind.css',
      },
    },
    ignores: ['.agents/skills'],
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
)
