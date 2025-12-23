import { fileURLToPath, URL } from 'node:url';
import { defineConfig } from 'vite';
import vue from '@vitejs/plugin-vue';
import { quasar, transformAssetUrls } from '@quasar/vite-plugin';
import { VitePWA } from 'vite-plugin-pwa';

export default defineConfig({
  server: { 
    port: 8080, 
    proxy: { '/test': 'http://localhost:3000/' } 
  },
  plugins: [
    vue({ template: { transformAssetUrls } }),
    quasar({ sassVariables: '@/quasar-variables.sass' }),
    VitePWA({
      registerType: 'autoUpdate',
      
      
      workbox: {
        globPatterns: ['**/*.{js,css,html,ico,png,svg,woff,woff2,json}'],
        
      
        mode: 'development',
        
       
        cleanupOutdatedCaches: true,
        clientsClaim: true,
        skipWaiting: false, 
        
        runtimeCaching: [
          {
            urlPattern: /\.(?:png|jpg|jpeg|svg|gif)$/,
            handler: 'CacheFirst',
            options: {
              cacheName: 'images-cache',
              expiration: {
                maxEntries: 50,
                maxAgeSeconds: 60 * 60 * 24 * 30 
              }
            }
          },
          {
            urlPattern: /\.(?:js|css)$/,
            handler: 'StaleWhileRevalidate',
            options: {
              cacheName: 'static-resources',
              expiration: {
                maxEntries: 60,
                maxAgeSeconds: 60 * 60 * 24 * 7 
              }
            }
          },
          {
            urlPattern: /^http:\/\/localhost:8080\/.*/i,
            handler: 'NetworkFirst',
            options: {
              cacheName: 'api-cache',
              networkTimeoutSeconds: 10,
              expiration: {
                maxEntries: 50,
                maxAgeSeconds: 60 * 60 
              }
            }
          }
        ],
        
        // Erweiterte Logging-Optionen (nicht alle werden von Workbox unterstützt)
        maximumFileSizeToCacheInBytes: 4 * 1024 * 1024, 
        

        navigationPreload: true,
        
        cacheId: 'pitchtuna-cache-v1',
        
   
        importScripts: []
      },
      
      includeAssets: [
        'favicon.ico', 
        'PitchTuna.png',
        'apple-touch-icon.png',
        'masked-icon.svg'
      ],
      
      manifest: {
        name: 'PitchTuna - Pitch Training App',
        short_name: 'PitchTuna',
        description: 'Professional pitch training with real-time detection',
        theme_color: '#00C2A3',
        background_color: '#F8F9FA',
        display: 'standalone',
        start_url: '/',
        scope: '/',
        orientation: 'portrait',
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
      },
      
      // Dev-Optionen für Debugging
      devOptions: {
        enabled: true, // Service Worker auch in Development
        type: 'module', 
        navigateFallback: 'index.html'
      }
    }),
  ],
  resolve: { alias: { '@': fileURLToPath(new URL('./src', import.meta.url)) } },
  

  build: {
    sourcemap: true, 
    rollupOptions: {
      output: {
        manualChunks: {
          vendor: ['vue', 'quasar', 'pinia'],
          tonal: ['@tonaljs/tonal']
        }
      }
    }
  }
});