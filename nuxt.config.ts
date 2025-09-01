// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  compatibilityDate: '2024-11-01',
  devtools: { enabled: true },
  modules: [
    'nuxtjs-naive-ui',
    '@pinia/nuxt',
    '@nuxt/eslint',
    '@vueuse/nuxt',
    '@nuxt/test-utils/module'
  ],

  ssr: false,
  app: { head: { link: [{ rel: 'icon', type: 'image/png', href: '/favicon.png' }] } },
  srcDir: 'src/',
  spaLoadingTemplate: false,
  dir: {
    pages: 'app/routes',
    layouts: 'app/layouts',
    middleware: 'app/middleware',
    assets: 'app/assets',
    shared: 'app/shared',
    public: '../public',
    plugins: '../plugins'
  },
  serverDir: 'server',
  components: [
    { path: '~/shared', extensions: ['.vue'], pathPrefix: false }
    // {
    //   path: '~/entities',
    //   extensions: ['.vue'],
    //   pathPrefix: false
    // },
    // {
    //   path: '~/pages',
    //   extensions: ['.vue'],
    //   pathPrefix: false
    // }
  ],
  imports: {
    // dirs: ['~/shared/**/*.ts', '~/entities/**/*.ts', '~/pages/**/*.ts']
  },
  css: ['~/app/assets/styles/app.css'],
  $production: {
    vite: {
      esbuild: {
        pure: ['console.log']
      }
    },
    runtimeConfig: {
      public: {
        apiBase: process.env.BASE_URL_PROD ?? '',
        apiGateway: process.env.BASE_URL_GATEWAY_PROD ?? ''
      }
    }
  },

  $development: {
    sourcemap: { client: true },

    runtimeConfig: {
      public: {
        apiBase: process.env.BASE_URL_DEV ?? '',
        apiGateway: process.env.BASE_URL_GATEWAY_DEV ?? ''
      }
    },

    routeRules: {
      '/apiauth/**': {
        proxy: {
          to:
            process.env.API_MODE === 'debugg'
              ? 'http://10.10.10.77:64439/apiauth/**'
              : process.env.BASE_URL_PROXY + 'apiauth/**'
        }
      },
      '/apissz/**': {
        proxy: {
          to:
            process.env.API_MODE === 'debugg'
              ? 'http://10.10.10.77:64439/apissz/**'
              : process.env.BASE_URL_PROXY + 'apissz/**'
        }
      },
      '/apiadmin/**': {
        proxy: {
          to:
            process.env.API_MODE === 'debugg'
              ? 'http://10.10.10.77:64439/apiadmin/**'
              : process.env.BASE_URL_PROXY + 'apiadmin/**'
        }
      },
      '/apiTmp/**': {
        proxy: {
          to:
            process.env.API_MODE === 'debugg'
              ? 'http://10.10.10.77:64439/apiadmin/**'
              : process.env.BASE_URL_PROXY + 'apiTmp/**'
        }
      },
      '/api-gateway/**': { proxy: { to: process.env.BASE_URL_GATEWAY_PROXY + 'api/**' } }
    }
  }
})
