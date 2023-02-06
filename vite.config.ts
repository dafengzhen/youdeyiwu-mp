import { defineConfig, type UserConfig } from 'vite';
import path from 'path';
import youdeyiwuMp from '@youdeyiwu/vite-plugin-mp';
import youdeyiwuMpAxios from '@youdeyiwu/vite-plugin-mp-axios';

const defaultConfig: UserConfig = {
  appType: 'custom',
  resolve: {
    alias: [
      {
        find: '@assets',
        replacement: path.resolve(__dirname, 'miniprogram/assets'),
      },
      {
        find: '@pages',
        replacement: path.resolve(__dirname, 'miniprogram/pages'),
      },
      {
        find: '@tools',
        replacement: path.resolve(__dirname, 'miniprogram/tools'),
      },
    ],
  },
  plugins: [
    youdeyiwuMp({
      buildDir: path.resolve(__dirname, 'miniprogram'),
      outputDir: path.resolve(__dirname, 'dist'),
      copyPrivateConfigUrlCheck: true,
    }),
    youdeyiwuMpAxios(),
  ],
};

export default defineConfig(({ command }) => {
  if (command === 'serve') {
    return {
      ...defaultConfig,
    };
  } else {
    return {
      ...defaultConfig,
    };
  }
});
