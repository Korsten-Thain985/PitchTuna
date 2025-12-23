import { fileURLToPath, URL } from 'node:url';
import { defineConfig } from 'vite';
import vue from '@vitejs/plugin-vue';
import { quasar, transformAssetUrls } from '@quasar/vite-plugin';
import { VitePWA } from 'vite-plugin-pwa';

export default defineConfig({
  server: { port: 8080, proxy: { '/test': 'http://localhost:3000/' } },
  plugins: [
    vue({ template: { transformAssetUrls } }),
    quasar({ sassVariables: '@/quasar-variables.sass' }),
    VitePWA({
      registerType: 'autoUpdate',
      workbox: { globPatterns: ['**/*.{js,css,html,ico,png,svg}'] },
      includeAssets: ['favicon.ico'],
      manifest: {
        name: 'PitchTuna',
        short_name: 'Pitch',
        theme_color: '#00C2A3',
        background_color: '#F8F9FA',
        display: 'standalone',
        icons: [
          {
            src: 'PitchTuna.png',
            sizes: '192x192',
            type: 'image/png',
            purpose: 'any maskable',
          },
          {
            src: 'PitchTuna.png',
            sizes: '512x512',
            type: 'image/png',
          },
        ],
        apple: {
          sizes: '180x180',
          src: 'PitchTuna.png',
        },
      },
    }),
  ],
  resolve: { alias: { '@': fileURLToPath(new URL('./src', import.meta.url)) } },
});
