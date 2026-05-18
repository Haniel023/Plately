import { defineConfig, minimalPreset } from '@vite-pwa/assets-generator/config'

export default defineConfig({
  preset: {
    ...minimalPreset,
    apple: {
      sizes: [180],
      padding: 0.1,
      resizeOptions: { background: '#e67e22' },
    },
    maskable: {
      sizes: [512],
      padding: 0.1,
      resizeOptions: { background: '#e67e22' },
    },
  },
  images: ['public/icon.svg'],
})
