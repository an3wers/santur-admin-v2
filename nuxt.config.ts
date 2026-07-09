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

  devServer: {
    port: 3001
  },

  ssr: false,
  experimental: {
    viteEnvironmentApi: true,
    appManifest: false
  },
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
  components: [{ path: '~/shared', extensions: ['.vue'], pathPrefix: false }],

  css: ['~/app/assets/styles/app.css'],

  $production: {
    sourcemap: {
      client: false,
      server: false
    },

    vite: {
      build: {
        minify: 'esbuild',
        target: ['es2018'],
        sourcemap: false
      }
    },
    esbuild: {
      options: {
        pure: ['console.log']
      }
    },
    runtimeConfig: {
      public: {
        apiBase: process.env.BASE_URL_PROD ?? '',
        apiGateway: process.env.BASE_URL_GATEWAY_PROD ?? '',
        santurS3Url: ''
      }
    },

    routeRules: {
      '/api-logger/**': {
        proxy: {
          to: process.env.API_BFF + '**'
        }
      }
    }
  },

  $development: {
    sourcemap: false,

    runtimeConfig: {
      public: {
        apiBase: process.env.BASE_URL_DEV ?? '',
        apiGateway: process.env.BASE_URL_GATEWAY_DEV ?? '',
        santurS3Url: ''
      }
    },

    routeRules: {
      '/api-gateway/**': { proxy: { to: process.env.BASE_URL_GATEWAY_PROXY + 'api/**' } },
      '/s3/**': {
        proxy: {
          to: `${process.env.NUXT_PUBLIC_SANTUR_S3_URL}/**`
        }
      },
      '/api-logger/**': {
        proxy: {
          to: process.env.API_BFF + '**'
        }
      }
    }
  }
})
