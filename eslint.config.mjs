import antfu from '@antfu/eslint-config'

export default antfu({
  formatters: true,
  react: true,
  rules: {
    'e18e/ban-dependencies': ['warn', {
      allowed: ['lint-staged'],
    }],
  },
})
