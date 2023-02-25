import { parseError, showToast } from '@/tools';
import { clientQueryUserDetails } from '@apis/user';

Page({
  data: {
    tip: '抱歉，访问此资源遇到错误',
    showTip: false,
    hideTip: false,
    isLoading: true,
    about: '',
  },

  async onLoad(query = {}) {
    const id = query.id;
    if (!id) {
      this.setData({
        isLoading: false,
      });
      return;
    }

    try {
      const userData = await clientQueryUserDetails({
        id,
      });

      void wx.setNavigationBarTitle({
        title: `关于我 - ${userData.user.alias}`,
      });

      const about = userData.user.details.about ?? '';
      this.setData({
        about,
        isLoading: false,
      });
    } catch (e) {
      this.openTip(parseError(e).message);
      this.closeTip(3000);
      this.setData({
        isLoading: false,
      });
    }
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

  bindTapCopy() {
    const about = this.data.about;
    if (!about) {
      return;
    }
    wx.setClipboardData({
      data: about,
      success: (_res) => {
        void showToast({ title: '复制到剪贴板完成' });
      },
      fail: (rea) => {
        void showToast({ title: rea.errMsg });
      },
    });
  },
});
