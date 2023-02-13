import { defineConfig, type UserConfig } from 'vite';
import path from 'path';
import youdeyiwuMp from '@youdeyiwu/vite-plugin-mp';
import youdeyiwuMpAxios from '@youdeyiwu/vite-plugin-mp-axios';

export default defineConfig(({ command }) => {
  const defaultConfig: UserConfig = {
    appType: 'custom',
    resolve: {
      alias: [
        {
          find: '@types',
          replacement: path.resolve(__dirname, 'miniprogram/types'),
        },
        {
          find: '@interfaces',
          replacement: path.resolve(__dirname, 'miniprogram/interfaces'),
        },
        {
          find: '@apis',
          replacement: path.resolve(__dirname, 'miniprogram/apis'),
        },
        {
          find: '@components',
          replacement: path.resolve(__dirname, 'miniprogram/components'),
        },
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
        delFileTargets: [
          path.resolve(__dirname, 'dist/miniprogram/assets/styles/weui.wxss'),
        ],
      }),
      youdeyiwuMpAxios(),
    ],
  };

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
