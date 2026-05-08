import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { VitePWA } from 'vite-plugin-pwa';

const ICON_SVG = "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 512 512'%3E%3Crect width='512' height='512' rx='120' fill='%237C6EFA'/%3E%3Ctext x='256' y='340' text-anchor='middle' font-size='280'%3E%F0%9F%8F%8B%EF%B8%8F%3C/text%3E%3C/svg%3E";

export default defineConfig({
  test: {
    environment: 'jsdom',
    globals: true,
    setupFiles: ['./src/__tests__/setup.js'],
    // Only include tests we own — exclude git worktrees and node_modules
    include: ['src/__tests__/[^._]*.test.{js,jsx}'],
    exclude: ['.claude/**', 'node_modules/**', 'src/__tests__/._*'],
  },
  define: {
    __BUILD_TIME__: JSON.stringify(new Date().toISOString()),
  },
  plugins: [
    react(),
    VitePWA({
      strategies: 'injectManifest',
      registerType: 'prompt',
      srcDir: 'src',
      filename: 'sw.js',
      manifest: {
        name: 'IronLog',
        short_name: 'IronLog',
        description: 'Track. Lift. Grow.',
        start_url: '/',
        display: 'standalone',
        background_color: '#0c0c12',
        theme_color: '#0c0c12',
        orientation: 'portrait',
        icons: [
          {
            src: ICON_SVG,
            sizes: '512x512',
            type: 'image/svg+xml',
            purpose: 'any maskable',
          },
        ],
      },
      injectManifest: {
        globPatterns: ['**/*.{js,css,html}'],
      },
      devOptions: {
        enabled: false,
      },
    }),
  ],
});
