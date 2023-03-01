import { parseError } from '@/tools';
import { clientQueryUserDetails } from '@apis/user';
import { type IUserClientDetails } from '@interfaces/user';
import { queryPath } from '@apis/path';
import memoryCache from '@tools/cache';
import ICustomShareContent = WechatMiniprogram.Page.ICustomShareContent;
import ICustomTimelineContent = WechatMiniprogram.Page.ICustomTimelineContent;
import IAddToFavoritesContent = WechatMiniprogram.Page.IAddToFavoritesContent;

Page({
  data: {
    tip: '抱歉，访问此资源遇到错误',
    showTip: false,
    hideTip: false,
    isLoading: true,
    isMine: false,
    userData: null as null | IUserClientDetails,
    loadQuery: {} as {
      id?: string;
      sid?: string;
      tid?: string;
    },
    cacheKey: 'related_user_page',
  },

  async onLoad(query = {}) {
    const id = query.id;
    const sid = query.sid ?? '';
    const tid = query.tid ?? '';
    if (!id) {
      this.setData({
        isLoading: false,
      });
      return;
    }

    try {
      const cacheKey = `${id}_${sid}_${tid}_${this.data.cacheKey}`;
      const cache = await memoryCache;
      const cacheData:
        | {
            userData: IUserClientDetails;
            isMine: boolean;
          }
        | undefined = await cache.get(cacheKey);

      let userData: IUserClientDetails;
      let isMine: boolean;
      if (cacheData) {
        userData = cacheData.userData;
        isMine = cacheData.isMine;
      } else {
        const queryPathReq = queryPath();
        const clientQueryUserDetailsReq = clientQueryUserDetails({
          id,
          query: {
            sectionId: query.sid,
            tagId: query.tid,
          },
        });
        const responses = await Promise.all([
          queryPathReq,
          clientQueryUserDetailsReq,
        ]);
        const pathData = responses[0];
        userData = responses[1];
        isMine = !!pathData.user && pathData.user.id === userData.user.id;
        await cache.set(cacheKey, { userData, isMine }, 30000);
      }

      this.setData({
        cacheKey,
        userData,
        isLoading: false,
        isMine,
      });

      void wx.setNavigationBarTitle({
        title: `${isMine ? '我的' : '用户'}相关 - ${userData.user.alias}`,
      });
    } catch (e) {
      this.openTip(parseError(e).message);
      this.closeTip(3000);
      this.setData({
        isLoading: false,
      });
    }

    this.setData({ loadQuery: query }, () => {
      setTimeout(() => {
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
      }, 500);
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

  async onUnload() {
    await (await memoryCache).del(this.data.cacheKey);
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
    const alias = this.data.userData ? this.data.userData.user.alias : '';
    const isMine = this.data.isMine;

    const custom:
      | ICustomShareContent
      | ICustomTimelineContent
      | IAddToFavoritesContent = {
      title: `${isMine ? '我的' : '用户'}相关 - ` + alias,
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
