import { parseError, showToast } from '@/tools';
import { type IContact } from '@interfaces/user';
import { clientQueryUserDetails } from '@apis/user';
import ICustomShareContent = WechatMiniprogram.Page.ICustomShareContent;
import ICustomTimelineContent = WechatMiniprogram.Page.ICustomTimelineContent;
import IAddToFavoritesContent = WechatMiniprogram.Page.IAddToFavoritesContent;

Page({
  data: {
    tip: '抱歉，访问此资源遇到错误',
    showTip: false,
    hideTip: false,
    isLoading: true,
    contacts: [] as IContact[],
    loadQuery: {} as {
      id?: string;
    },
    alias: '',
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
        title: `联系方式 - ${userData.user.alias}`,
      });

      const contacts = userData.user.details.contacts ?? [];
      contacts.forEach((item) => {
        item._isUnderline = item.val.includes('@') && item.val.includes('.');
      });

      this.setData({
        contacts,
        alias: userData.user.alias,
        isLoading: false,
      });
    } catch (e) {
      this.openTip(parseError(e).message);
      this.closeTip(3000);
      this.setData({
        isLoading: false,
      });
    }

    this.setData({ loadQuery: query });
  },

  onShareAppMessage() {
    return this.handleShare('f');
  },

  onShareTimeline() {
    return this.handleShare('fc');
  },

  onAddToFavorites() {
    return this.handleShare('fa');
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

  bindTapCopy(e: any) {
    const item: IContact = e.currentTarget.dataset.item;
    if (!item.val) {
      return;
    }
    wx.setClipboardData({
      data: item.val,
      success: (_res) => {
        void showToast({ title: '复制到剪贴板完成' });
      },
      fail: (rea) => {
        void showToast({ title: rea.errMsg });
      },
    });
  },

  handleShare(
    source: string
  ): ICustomShareContent | ICustomTimelineContent | IAddToFavoritesContent {
    const id = this.data.loadQuery.id ?? '';
    const alias = this.data.alias;

    const custom:
      | ICustomShareContent
      | ICustomTimelineContent
      | IAddToFavoritesContent = {
      title: '联系方式 - ' + alias,
    };

    if (source === 'f') {
      (
        custom as ICustomShareContent
      ).path = `/pages/contact/index?s=f&id=${id}`;
    } else if (source === 'f') {
      (custom as ICustomTimelineContent).query = `s=fc&id=${id}`;
    } else if (source === 'f') {
      (custom as IAddToFavoritesContent).query = `s=fa&id=${id}`;
    }

    return custom;
  },
});
