// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
    devtools: { enabled: true },
    srcDir: 'src/',
    modules: [
        '@nuxt/ui',
        'nuxt-icon',
        '@vueuse/nuxt',
    ],
    routeRules: {
        // Homepage pre-rendered at build time
        '/': { ssr: false },
    },
})
