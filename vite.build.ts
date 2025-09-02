import { build, defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { resolve } from 'path'

const getBuildConfig = (input: Record<string, string>) => defineConfig({
  plugins: [react()],
  build: {
    outDir: 'dist',
    emptyOutDir: false,
    rollupOptions: {
      input,
      output: {
        entryFileNames: '[name].js',
        chunkFileNames: '[name].js',
        assetFileNames: (assetInfo) => {
          if (assetInfo.name === "style.css") return `popup.css`;
          return assetInfo.name;
        },
        // 确保popup文件被输出到根目录
        dir: 'dist',
        // 使用ES模块格式，确保Service Worker兼容性
        format: 'es',
        // 禁用代码分割，确保Service Worker是独立文件
        manualChunks: (name) => {
          if (name === 'background') {
            return 'background';
          }
          return undefined;
        }
      }
    },
    // 复制静态资源
    copyPublicDir: true,
    // 确保CSS文件被正确处理
    cssCodeSplit: false,
    // 确保所有资源都被复制
    assetsInlineLimit: 0,
    // 为Service Worker优化构建
    target: 'es2015', // 使用较低的目标版本确保兼容性
    minify: false, //  'terser',
    terserOptions: {
      // 保留Service Worker中的console.log
      compress: {
        drop_console: false,
        drop_debugger: true
      },
      // 确保Service Worker中的chrome API可用
      mangle: {
        reserved: ['chrome']
      }
    }
  },
  resolve: {
    alias: {
      '@': resolve(__dirname, 'src')
    }
  },
  // 确保CSS文件被复制
  css: {
    postcss: './postcss.config.js'
  },
  // 为Service Worker添加特殊处理
  define: {
    // 确保Service Worker中的全局变量可用
    global: 'globalThis'
  },
  // 为Service Worker优化
  optimizeDeps: {
    exclude: ['chrome'] // 排除chrome API，避免打包问题
  }
})


const input = {
  popup: resolve(__dirname, 'src/popup/index.html'),
  background: resolve(__dirname, 'src/background/background.ts'),
  content: resolve(__dirname, 'src/content/content.ts'),
  injected: resolve(__dirname, 'src/injected/injected.ts')
}

const seriesAsync = (ps: any[]) => ps.reduce((p: Promise<unknown>, next: () => any) => p.then(next), Promise.resolve());


seriesAsync(Object.entries(input).map(([key, value]) => build(getBuildConfig({ [key]: value }))))