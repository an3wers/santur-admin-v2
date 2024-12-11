// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  compatibilityDate: '2024-11-01',
  devtools: { enabled: true },
  modules: ['nuxtjs-naive-ui', '@pinia/nuxt', '@nuxt/eslint'],
  ssr: false,
  app: {
    head: {
      link: [{ rel: 'icon', type: 'image/png', href: '/favicon.png' }]
    }
  },
  srcDir: 'src/',
  spaLoadingTemplate: false,
  dir: {
    pages: 'app/routes',
    layouts: 'app/layouts',
    middleware: 'app/middleware',
    assets: 'app/assets'
  },
  css: ['~/app/assets/styles/app.css'],
  $production: {
    vite: {
      esbuild: {
        pure: ['console.log', 'debugger']
      }
    }
  },

  $development: {
    sourcemap: {
      client: true
    },
    routeRules: {
      '/apiauth/**': {
        proxy: {
          to:
            process.env.API_MODE === 'debugg'
              ? 'http://10.10.10.77:64439/apiauth/**'
              : 'https://isantur.ru/apiauth/**'
        }
      },
      '/apissz/**': {
        proxy: {
          to:
            process.env.API_MODE === 'debugg'
              ? 'http://10.10.10.77:64439/apissz/**'
              : 'https://isantur.ru/apissz/**'
        }
      },
      '/apiadmin/**': {
        proxy: {
          to:
            process.env.API_MODE === 'debugg'
              ? 'http://10.10.10.77:64439/apiadmin/**'
              : 'https://isantur.ru/apiadmin/**'
        }
      },
      '/api-gateway/**': {
        proxy: {
          to: 'https://gateway.santur.ru/api/**'
        }
      }
    }
  }
})
