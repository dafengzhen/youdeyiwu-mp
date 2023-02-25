import { parseError, showToast } from '@/tools';
import config from '@/config';
import { uploadAvatarFile } from '@apis/user';

Page({
  data: {
    tip: '抱歉，访问此资源遇到错误',
    showTip: false,
    hideTip: false,
    appNameAbbr: config.APP_NAME_ABBR,
    step: 1,
    defaultAvatarUrl: '../../assets/images/logo.svg',
    isLoadReq: false,
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

  async bindchooseavatar(e: any) {
    const avatarUrl = e.detail.avatarUrl;
    if (!avatarUrl) {
      await showToast({ title: '文件不存在' });
      return;
    }

    this.setData({ isLoadReq: true });
    try {
      await uploadAvatarFile({
        data: {
          avatarUrl,
        },
      });

      this.setData({
        defaultAvatarUrl: avatarUrl,
        step: 2,
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

  bindtapReturn() {
    void wx.navigateBack();
  },
});
