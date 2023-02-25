import {
  decodeToken,
  hideLoading,
  isHttpOrHttps,
  parseError,
  setStorageSync,
  showToast,
} from '@/tools';
import config from '@/config';
import {
  updateWeixinMpUserInfo,
  uploadWeixinMpAvatarFile,
  weixinMpUserLoginByPhone,
} from '@apis/weixin';
import Constants from '@/constants';
import { type IApp } from '@/interfaces';

const loginApp = getApp<IApp>();

Page({
  data: {
    tip: '抱歉，访问此资源遇到错误',
    showTip: false,
    hideTip: false,
    appName: config.APP_NAME,
    appNameAbbr: config.APP_NAME_ABBR,
    checked: false,
    step: 1,
    defaultAvatarUrl: '../../assets/images/logo.svg',
    alias: '',
    isRegister: false,
    loginCode: null as null | string,
    token: '',
    isLoadReq: false,
    id: null as null | number,
    u: '',
  },

  async onLoad(query = {}) {
    let loginCode = null;
    try {
      const result = await wx.login();
      loginCode = result.code;
    } catch (e) {
      this.openTip(parseError(e).message);
      this.closeTip(3000);
    }

    this.setData({
      u: query.u ?? '',
      isRegister: query.r === 't',
      loginCode,
    });

    void wx.setNavigationBarTitle({
      title: query.r === 't' ? '快捷注册' : '快捷登录',
    });
  },

  closeTip(ms: number = 2000) {
    this.setData({
      hideTip: true,
    });
    setTimeout(() => {
      this.setData({
        showTip: false,
        hideTip: false,
      });
    }, ms);
  },

  openTip(tip: string = 'ok') {
    this.setData({
      tip,
      showTip: true,
    });
  },

  bindchangeCheckbox(e: any) {
    this.setData({
      checked: e.detail.value[0] === 'agree',
    });
  },

  async bindgetphonenumber(e: any) {
    const checked = this.data.checked;
    if (!checked) {
      await showToast({ title: '请阅读服务协议和隐私政策' });
      return;
    }

    const loginCode = this.data.loginCode;
    if (!loginCode) {
      this.setData({
        loginCode: null,
      });
      return;
    }

    const code = e.detail.code;
    if (!code) {
      await showToast({ title: '请授权获取您的手机号' });
      return;
    }

    this.setData({ isLoadReq: true });
    try {
      const response = await weixinMpUserLoginByPhone({
        data: {
          loginCode,
          code,
        },
      });

      const exp = decodeToken(response.token.split('.')[1]).exp;
      if (exp) {
        setStorageSync(Constants.TICKET, response, new Date(exp * 1000));
      }

      this.setData({
        step: 2,
        id: response.id,
        alias: response.alias,
        token: response.token,
        isLoadReq: false,
      });
    } catch (e) {
      this.openTip(parseError(e).message);
      this.closeTip(3000);
      this.setData({ isLoadReq: false });
    }
  },

  async binderrorgetphonenumber(e: any) {
    console.error(e);
    await showToast({ title: '获取手机号发生错误', icon: 'error' });
  },

  async bindchooseavatar(e: any) {
    let avatarUrl = e.detail.avatarUrl;

    const token = this.data.token;
    if (!token) {
      await showToast({
        title: `请重新${this.data.isRegister ? '注册' : '登录'}`,
        icon: 'error',
      });
      this.setData({
        loginCode: null,
      });
      return;
    }

    this.setData({ isLoadReq: true });
    try {
      avatarUrl = await uploadWeixinMpAvatarFile({
        data: {
          avatarUrl,
          token,
        },
      });

      this.setData({
        defaultAvatarUrl: isHttpOrHttps(avatarUrl)
          ? avatarUrl
          : config.APP_OSS_SERVER + avatarUrl ?? this.data.defaultAvatarUrl,
        step: 3,
        isLoadReq: false,
      });
    } catch (e) {
      this.openTip(parseError(e).message);
      this.closeTip(3000);
      this.setData({
        isLoadReq: false,
      });
    }
  },

  async binderrorchooseavatar(e: any) {
    console.error(e);
    await showToast({ title: '获取头像发生错误', icon: 'error' });
  },

  async bindtapLogin() {
    const id = this.data.id;
    const avatarUrl = this.data.defaultAvatarUrl;
    const alias = this.data.alias;

    if (loginApp.globalData._isQuickLogin) {
      await showToast({ title: '已登录', icon: 'success' });
      await wx.navigateBack();
      return;
    }

    if (!id) {
      await showToast({ title: '保存失败，请重试', icon: 'error' });
      this.setData({
        loginCode: null,
      });
      return;
    }

    if (!avatarUrl || !alias) {
      this.setData({
        isLoadSaveInfo: false,
      });
      await hideLoading();
      await wx.switchTab({
        url: '/pages/index/index',
      });
      return;
    }

    this.setData({ isLoadReq: true });
    try {
      await updateWeixinMpUserInfo({
        id,
        data: {
          avatarUrl,
          alias,
        },
      });

      await showToast({ title: '保存完成', icon: 'success', duration: 1500 });
      loginApp.globalData._isQuickLogin = true;

      const url = decodeURIComponent(this.data.u);
      setTimeout(() => {
        this.setData({ isLoadReq: false });
        if (url) {
          void wx.navigateTo({
            url,
          });
        } else {
          void wx.switchTab({
            url: '/pages/index/index',
          });
        }
      }, 1500);
    } catch (e) {
      this.openTip(parseError(e).message);
      this.closeTip(3000);
      this.setData({ isLoadReq: false });
      loginApp.globalData._isQuickLogin = false;
    }
  },

  async bindtapLoginRetry() {
    await this.onLoad({ r: this.data.isRegister ? 't' : '' });
  },
});
