import { defineVitestConfig } from '@nuxt/test-utils/config'

export default defineVitestConfig({
  test: {
    environment: 'nuxt',
    environmentOptions: {
      nuxt: {
        domEnvironment: 'jsdom'
      }
    },
    coverage: {
      enabled: false,
      provider: 'v8',
      include: ['app/**/*.ts', 'app/**/*.vue'],
      exclude: ['node_modules/', 'nuxt/', '**/*.test.ts', '**/*.spec.ts']
    }
  }
})
