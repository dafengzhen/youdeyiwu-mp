const accountInfo = wx.getAccountInfoSync();

export default {
  APP_NAME: '尤得一物',
  APP_NAME_ABBR: 'youdeyiwu',
  APP_URL: 'http://localhost:3000',
  APP_URL_HOST: 'localhost:3000',
  APP_DESCRIPTION:
    '这里是尤得一物论坛，欢迎光临。尤得一物是一个开源论坛程序，它可以作为简单管理或分享文章的论坛博客，也可以在此基础上进行自定义开发',
  APP_API_SERVER: 'http://localhost:8080',
  APP_OSS_SERVER: 'http://heaven:9000',
  TOKEN_SECRET: '123456',
  REFRESH_TOKEN_SECRET: '123456',
  DEBUG: accountInfo.miniProgram.envVersion === 'develop',
};