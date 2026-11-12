import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    react(),
    tailwindcss(),
  ],
  base: '/savdo-dasturi/', // <-- Mana shu qatorni qo'shasiz (repository nomingiz bilan bir xil bo'lishi shart)
})