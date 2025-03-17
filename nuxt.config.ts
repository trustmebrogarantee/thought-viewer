// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  compatibilityDate: '2024-11-01',
  devtools: { enabled: true },
  pages: true,
  modules: ['@vueuse/nuxt'], 
  vite: {
    server: {
      watch: {
        usePolling: true,
        interval: 500
      }
    }
  }
})
