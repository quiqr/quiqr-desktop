import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [
    react({
      babel: {
        plugins: [
          ['@babel/plugin-transform-flow-strip-types']
        ]
      }
    })
  ],
  server: {
    port: 4002,
    open: false
  },
  build: {
    outDir: 'build',
    sourcemap: true
  },
  define: {
    global: 'globalThis',
  },
  resolve: {
    alias: {
      // Handle Node.js polyfills for browser
      path: 'path-browserify'
    }
  }
})
