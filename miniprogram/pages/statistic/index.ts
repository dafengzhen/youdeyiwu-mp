import { parseError } from '@/tools';
import { clientQueryUserDetails } from '@apis/user';
import { type IStatistic } from '@interfaces/user';
import ICustomShareContent = WechatMiniprogram.Page.ICustomShareContent;
import ICustomTimelineContent = WechatMiniprogram.Page.ICustomTimelineContent;
import IAddToFavoritesContent = WechatMiniprogram.Page.IAddToFavoritesContent;

Page({
  data: {
    tip: '抱歉，访问此资源遇到错误',
    showTip: false,
    hideTip: false,
    isLoading: true,
    statistic: {} as IStatistic,
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
        title: `相关统计 - ${userData.user.alias}`,
      });

      const statistic = userData.user.statistic;
      this.setData({
        statistic,
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

  handleShare(
    source: string
  ): ICustomShareContent | ICustomTimelineContent | IAddToFavoritesContent {
    const id = this.data.loadQuery.id ?? '';
    const alias = this.data.alias;

    const custom:
      | ICustomShareContent
      | ICustomTimelineContent
      | IAddToFavoritesContent = {
      title: '相关统计 - ' + alias,
    };

    if (source === 'f') {
      (
        custom as ICustomShareContent
      ).path = `/pages/statistic/index?s=f&id=${id}`;
    } else if (source === 'f') {
      (custom as ICustomTimelineContent).query = `s=fc&id=${id}`;
    } else if (source === 'f') {
      (custom as IAddToFavoritesContent).query = `s=fa&id=${id}`;
    }

    return custom;
  },
});
