import { parseError, setNavQueryStrings } from '@/tools';
import { clientQueryUserDetails } from '@apis/user';
import { type IUserClientDetails } from '@interfaces/user';
import { type ISection } from '@interfaces/section';
import { type IApp } from '@/interfaces';
import ICustomShareContent = WechatMiniprogram.Page.ICustomShareContent;
import ICustomTimelineContent = WechatMiniprogram.Page.ICustomTimelineContent;
import IAddToFavoritesContent = WechatMiniprogram.Page.IAddToFavoritesContent;

const relatedApp = getApp<IApp>();

Page({
  data: {
    tip: '抱歉，访问此资源遇到错误',
    showTip: false,
    hideTip: false,
    isLoading: true,
    userData: null as null | IUserClientDetails,
    loadQuery: {} as {
      id?: string;
      sid?: string;
      tid?: string;
    },
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
        query: {
          sectionId: query.sid,
          tagId: query.tid,
        },
      });

      void wx.setNavigationBarTitle({
        title: `我的相关 - ${userData.user.alias}`,
      });

      this.setData({
        userData,
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

    let s = query.s;
    if (s === 's') {
      s = '#sections';
    } else if (s === 't') {
      s = '#tags';
    } else {
      return;
    }
    void wx.pageScrollTo({
      selector: s,
    });
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

  bindTapSection(e: any) {
    const loadQuery = this.data.loadQuery;
    if (!loadQuery.id) {
      return;
    }

    const item: null | ISection = e.currentTarget.dataset.item;
    if (item) {
      setNavQueryStrings(relatedApp, { id: loadQuery.id, sid: item.id });
    } else {
      setNavQueryStrings(relatedApp, { id: loadQuery.id });
    }
  },

  bindTapTag(e: any) {
    const loadQuery = this.data.loadQuery;
    if (!loadQuery.id) {
      return;
    }

    const item: null | ISection = e.currentTarget.dataset.item;
    if (item) {
      setNavQueryStrings(relatedApp, { id: loadQuery.id, tid: item.id });
    } else {
      setNavQueryStrings(relatedApp, { id: loadQuery.id });
    }
  },

  handleShare(
    source: string
  ): ICustomShareContent | ICustomTimelineContent | IAddToFavoritesContent {
    const id = this.data.loadQuery.id ?? '';
    const alias = this.data.userData ? this.data.userData.user.alias : '';

    const custom:
      | ICustomShareContent
      | ICustomTimelineContent
      | IAddToFavoritesContent = {
      title: '我的相关 - ' + alias,
    };

    if (source === 'f') {
      (
        custom as ICustomShareContent
      ).path = `/pages/related/index?s=f&id=${id}`;
    } else if (source === 'f') {
      (custom as ICustomTimelineContent).query = `s=fc&id=${id}`;
    } else if (source === 'f') {
      (custom as IAddToFavoritesContent).query = `s=fa&id=${id}`;
    }

    return custom;
  },
});
