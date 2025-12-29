import { defineConfig } from 'vite';
import { resolve } from 'path'
import {ViteEjsPlugin} from "vite-plugin-ejs";
import htmlPurge from 'vite-plugin-purgecss';
import mqpacker from 'mqpacker';
import autoprefixer from 'autoprefixer';

export default defineConfig({
  base: '',
  build: {
    rollupOptions: {
      input: {
        index: resolve(__dirname, 'index.html')


      },
      output: {
        entryFileNames: 'assets/js/[name]-[hash].js',
        chunkFileNames: 'assets/js/[name]-[hash].js',
        assetFileNames: (assetInfo) => {
          if (assetInfo.name && assetInfo.name.endsWith('.css')) {
            return 'assets/css/[name]-[hash][extname]';
          }
          if (assetInfo.name && /\.(png|jpe?g|gif|svg|webp|avif)$/i.test(assetInfo.name)) {
            return 'assets/img/[name]-[hash][extname]';
          }
          // Fonts
          if (assetInfo.name && /\.(woff|woff2|eot|ttf|otf)$/i.test(assetInfo.name)) {
            return 'assets/fonts/[name]-[hash][extname]';
          }
          // Videos
          if (assetInfo.name && /\.(mp4|webm|ogg|mov|avi|mkv)$/i.test(assetInfo.name)) {
            return 'assets/video/[name]-[hash][extname]';
          }
          return 'assets/[name]-[hash][extname]';
        },
      },
    },
    outDir: 'dist',
    emptyOutDir: true,
  },
  css: {
    postcss: {
      plugins: [
        autoprefixer({
          overrideBrowserslist: [
            '> 1%',
            'last 2 versions',
            'not dead',
            'not ie 11'
          ]
        }),
        mqpacker({
          sort: (a, b) => {
            const numA = parseInt(a.match(/\d+/));
            const numB = parseInt(b.match(/\d+/));
            return numB - numA; // du plus grand au plus petit
          }
        })
        
      ]
    }
  },
  plugins: [
    ViteEjsPlugin((viteConfig) => {
      return {
        root: viteConfig.root,
        domain: "example.com",
        slogan: ""
      }
    }),
    htmlPurge()
  ],
});