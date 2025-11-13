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
    sourcemap: {
      client: false,
      server: false
    },

    vite: {
      build: {
        minify: 'esbuild',
        target: ['es2016', 'edge88', 'firefox78', 'chrome87', 'safari12'],
        sourcemap: false
      },

      esbuild: {
        pure: ['console.log']
      }
    },
    runtimeConfig: {
      public: {
        apiBase: process.env.BASE_URL_PROD ?? '',
        apiGateway: process.env.BASE_URL_GATEWAY_PROD ?? '',
        santurS3Url: ''
      }
    }
  },

  $development: {
    sourcemap: { client: true, server: true },

    runtimeConfig: {
      public: {
        apiBase: process.env.BASE_URL_DEV ?? '',
        apiGateway: process.env.BASE_URL_GATEWAY_DEV ?? '',
        santurS3Url: ''
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
      '/api-gateway/**': { proxy: { to: process.env.BASE_URL_GATEWAY_PROXY + 'api/**' } },
      '/s3/**': {
        proxy: {
          to: `${process.env.NUXT_PUBLIC_SANTUR_S3_URL}/**`
        }
      }
    }
  }
})
