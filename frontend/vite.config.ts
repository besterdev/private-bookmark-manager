import { defineConfig } from 'vitest/config'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  build: {
    rollupOptions: {
      output: {
        manualChunks(id) {
          if (id.includes('/node_modules/@mui/icons-material/')) return 'mui-icons'
          if (id.includes('/node_modules/@mui/') || id.includes('/node_modules/@emotion/')) return 'mui-core'
          if (id.includes('/node_modules/@auth0/')) return 'auth0'
          if (id.includes('/node_modules/react/') || id.includes('/node_modules/react-dom/') || id.includes('/node_modules/react-router/')) return 'react-router'
          return undefined
        },
      },
    },
  },
  test: {
    environment: 'jsdom',
    setupFiles: ['./src/test/setup.ts'],
  },
})
