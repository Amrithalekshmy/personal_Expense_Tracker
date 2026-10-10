import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    // Forward API calls to the Flask backend (backend/app.py)
    proxy: { '/api': 'http://localhost:5000' },
  },
})
