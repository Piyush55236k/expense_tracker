import react from '@vitejs/plugin-react'
import { defineConfig } from 'vite'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    host: true, // Listen on all local IPs (0.0.0.0) so phone and laptop can connect
    port: 5173
  },
  envPrefix: ['VITE_', 'SUPABASE_'] // Allow both VITE_ and SUPABASE_ env vars
})

