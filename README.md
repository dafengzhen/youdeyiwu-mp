# youdeyiwu-mp

youdeyiwu-mp 尤得一物-小程序

尤得一物是一个开源论坛程序，可以作为简单管理或分享文章的论坛博客，也可以在此基础上进行自定义扩展开发.

Tip：尤得一物也是一个前后端分离开发的程序，当前仓库为小程序，它依赖着后端提供服务运行

Tip：正在开发中

## 1. 相关

尤得一物-后端 [youdeyiwu-backend](https://github.com/dafengzhen/youdeyiwu-backend)

<br />

![index](https://s1.ax1x.com/2023/02/12/pS5bkb4.png "index")

## 2. 技术

- vite + typescript + sass + 微信小程序
- tailwind css
- weui-wxss
- axios

## 3. 部署

- 新建 ```project.private.config.json``` 文件，并修改 appid 字段。

或者复制 project.template.config.json 文件内容到 ```project.private.config.json``` 中并修改 appid 字段

```json
{
  "appid": "填入小程序 appid"
}
```

- 打开 ```miniprogram/config.ts``` 配置文件，并修改相关应用信息

```text
{
  APP_NAME: '尤得一物',
  APP_NAME_ABBR: 'youdeyiwu',
  APP_URL: 'http://localhost:3000',
  APP_URL_HOST: 'localhost:3000',
  APP_DESCRIPTION: '这里是尤得一物论坛，欢迎光临。尤得一物是一个开源论坛程序，它可以作为简单管理或分享文章的论坛博客，也可以在此基础上进行自定义开发',
  APP_API_SERVER: 'http://localhost:8080',
  APP_OSS_SERVER: 'http://localhost:9000',
  TOKEN_SECRET: '123456',
  REFRESH_TOKEN_SECRET: '123456',
}
```

- 安装

安装依赖

```bash
yarn install
```

- 编译

构建编译小程序

```bash
yarn build
```

- 上传

上传项目生成的 dist 目录

# 4. 问题

- 直转平台小程序

一般目标平台都提供小程序转换工具，可以查看相关文档。
例如抖音小程序的 [wx-to-tt](https://developer.open-douyin.com/docs/resource/zh-CN/mini-app/develop/developer-instrument/development-assistance/one-key-move 'wx-to-tt')
工具

- 间接转跨平台小程序

存在多个目标平台，可以使用小程序跨平台框架提供的转换工具。

例如 taro 的 [wx-to-taro](https://docs.taro.zone/docs/taroize 'wx-to-taro') 工具；
uniapp 的 [wx-to-uniapp](https://ask.dcloud.net.cn/article/35786 'wx-to-uniapp') 工具等

# 5. 其它

如果你在使用中有相关建议或问题反馈、PR 等，可以与我交流改进

- [issues](https://github.com/dafengzhen/youdeyiwu-mp/issues)

# 6. License

[MIT](https://opensource.org/licenses/MIT)
