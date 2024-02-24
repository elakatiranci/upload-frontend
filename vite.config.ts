import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import postcssNested from 'postcss-nested'; // PostCSS iç içe geçmiş özelliklerini desteklemek için eklenti

// @ts-ignore
export default defineConfig({
  plugins: [
    react(),
    // PostCSS eklentisini burada etkinleştirin
    postcssNested()
  ]
});

