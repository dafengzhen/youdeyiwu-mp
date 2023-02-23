import { queryPath } from '@apis/path';
import memoryCache from '@tools/cache';
import {
  formatTotal,
  fromNow,
  hasText,
  isHttpOrHttps,
  parseError,
  showModal,
  showToast,
} from '@/tools';
import { type IPath } from '@interfaces/path';
import config from '@/config';
import { type IPostClientDetails } from '@interfaces/post';
import {
  clientQueryPostDetails,
  createFavourite,
  createFollow,
  postCancelFavourite,
  postCancelFollow,
  postCancelLike,
  postFavourite,
  postFollow,
  postLike,
  postView,
  removeFavourite,
  removeFollow,
} from '@apis/forum/post';
import { type IApp } from '@/interfaces';
import ICustomShareContent = WechatMiniprogram.Page.ICustomShareContent;
import ICustomTimelineContent = WechatMiniprogram.Page.ICustomTimelineContent;
import IAddToFavoritesContent = WechatMiniprogram.Page.IAddToFavoritesContent;

const postApp = getApp<IApp>();

Page({
  data: {
    pathData: null as null | IPath,
    postDetailsData: null as null | IPostClientDetails,
    cacheKey: 'details_post_page',
    tip: '抱歉，访问此资源遇到错误',
    showTip: false,
    hideTip: false,
    isPullDownRefresh: false,
    isLoadLikeReq: false,
    isLoadFollowReq: false,
    isLoadFavoriteReq: false,
    queryParams: {
      page: 0,
    } as {
      page: number;
    },
  },

  async onLoad(query = {}) {
    const id = query.id;
    if (!id) {
      return;
    }

    try {
      const cacheKey = `${id}_${this.data.cacheKey}`;
      const cache = await memoryCache;
      const cacheData:
        | {
            pathData: IPath;
            postDetailsData: IPostClientDetails;
          }
        | undefined = await cache.get(cacheKey);

      let pathData: null | IPath = null;
      let postDetailsData: null | IPostClientDetails = null;
      if (cacheData === undefined) {
        const pathReq = queryPath();
        const clientQueryPostDetailsReq = clientQueryPostDetails({
          id,
        });
        const postViewReq = postView({ id });
        const responses = await Promise.all([
          pathReq,
          clientQueryPostDetailsReq,
          postViewReq,
        ]);

        pathData = responses[0];
        postDetailsData = responses[1];

        this.handlePostDetailsData(postDetailsData);

        await cache.set(cacheKey, { pathData, postDetailsData }, 30000);
      } else {
        pathData = cacheData.pathData;
        postDetailsData = cacheData.postDetailsData;
      }

      await wx.setNavigationBarTitle({
        title: postDetailsData.basic.name,
      });
      this.setData({ pathData, postDetailsData });
    } catch (e) {
      this.openTip(parseError(e).message);
      this.closeTip(3000);
    }
  },

  async onPullDownRefresh() {
    if (this.data.isPullDownRefresh) {
      return;
    }

    this.setData({ isPullDownRefresh: true });
    await this.onLoad();
    wx.stopPullDownRefresh({
      complete: () => {
        setTimeout(() => {
          this.setData({ isPullDownRefresh: false });
        }, 3000);
      },
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
    const name = this.data.postDetailsData
      ? this.data.postDetailsData.basic.name
      : '帖子详情';

    const custom:
      | ICustomShareContent
      | ICustomTimelineContent
      | IAddToFavoritesContent = {
      title: name + ' - ' + config.APP_NAME_ABBR,
    };

    if (source === 'f') {
      (custom as ICustomShareContent).path = '/pages/details/card/index?s=f';
    } else if (source === 'f') {
      (custom as ICustomTimelineContent).query = 's=fc';
    } else if (source === 'f') {
      (custom as IAddToFavoritesContent).query = 's=fa';
    }

    return custom;
  },

  handlePostDetailsData(item: IPostClientDetails) {
    const cover = item.basic.cover;
    if (hasText(cover)) {
      // @ts-expect-error xxx
      item.basic.cover = isHttpOrHttps(cover)
        ? cover
        : config.APP_OSS_SERVER + cover;
    }

    const mediumAvatarUrl = item.user.details.mediumAvatarUrl;
    if (hasText(mediumAvatarUrl)) {
      // @ts-expect-error xxx
      item.user.details._avatarUrl = isHttpOrHttps(mediumAvatarUrl)
        ? mediumAvatarUrl
        : config.APP_OSS_SERVER + mediumAvatarUrl;
    } else {
      item.user.details._avatarUrl = '../../../assets/images/avatar.png';
    }

    item.basic._fromNow = fromNow(item.basic.contentUpdatedOn);
    item.basic.overview = item.basic.overview ?? '';
    item.basic.images = item.basic.images ?? [];
    item.content = item.content ?? '';

    item.details._commentTotalText = formatTotal(item.details.commentCount);
    item.details._replyTotalText = formatTotal(item.details.replyCount);
    item.details._commentReplyTotalText = formatTotal(
      item.details.commentCount + item.details.replyCount
    );
    item.details._viewTotalText = formatTotal(item.details.viewCount);
    item.details._likeTotalText = formatTotal(item.details.likeCount);
    item.details._followTotalText = formatTotal(item.details.followCount);
    item.details._favoriteTotalText = formatTotal(item.details.favoriteCount);
  },

  async bindTapLike() {
    const pathData = this.data.pathData;
    const postDetailsData = this.data.postDetailsData;

    if (!pathData || !postDetailsData) {
      await showToast({ title: '数据不存在', icon: 'error' });
      return;
    }

    if (!pathData.user && !postApp.globalData._isQuickLogin) {
      const result = await showModal({
        title: '温馨提示',
        content: '还未登录，是否进行登录?',
        confirmText: '快捷登录',
        confirmColor: '#07c160',
      });
      if (result.confirm) {
        await this.onUnload();
        await wx.navigateTo({
          url: `/pages/login/index?u=${encodeURIComponent(
            `/pages/details/post/index?id=${postDetailsData.basic.id}`
          )}`,
        });
      }
      return;
    }

    try {
      const id = postDetailsData.basic.id;
      let url = '/pages/success/index';
      let isLike;
      let likeCount;

      if (postDetailsData.isLike) {
        await postCancelLike({ id });
        url += '?t=取消点赞完成';
        isLike = false;
        likeCount = Math.max(postDetailsData.details.likeCount - 1, 0);
      } else {
        await postLike({ id });
        url += '?t=点赞完成';
        isLike = true;
        likeCount = postDetailsData.details.likeCount + 1;
      }

      this.setData({
        'postDetailsData.isLike': isLike,
        'postDetailsData.details.likeCount': likeCount,
        'postDetailsData.details._likeTotalText': formatTotal(likeCount),
      });

      await wx.navigateTo({ url });
    } catch (e) {
      this.openTip(parseError(e).message);
      this.closeTip(3000);
    }
  },

  async bindTapFollow() {
    const pathData = this.data.pathData;
    const postDetailsData = this.data.postDetailsData;

    if (!pathData || !postDetailsData) {
      await showToast({ title: '数据不存在', icon: 'error' });
      return;
    }

    if (!pathData.user && !postApp.globalData._isQuickLogin) {
      const result = await showModal({
        title: '温馨提示',
        content: '还未登录，是否进行登录?',
        confirmText: '快捷登录',
        confirmColor: '#07c160',
      });
      if (result.confirm) {
        await this.onUnload();
        await wx.navigateTo({
          url: `/pages/login/index?u=${encodeURIComponent(
            `/pages/details/post/index?id=${postDetailsData.basic.id}`
          )}`,
        });
      }
      return;
    }

    try {
      const id = postDetailsData.basic.id;
      let url = '/pages/success/index';
      let isFollow;
      let followCount;

      if (postDetailsData.isFollow) {
        const removeFollowReq = removeFollow({ id });
        const postCancelFollowReq = postCancelFollow({ id });
        await Promise.all([removeFollowReq, postCancelFollowReq]);
        url += '?t=取消关注完成';
        isFollow = false;
        followCount = Math.max(postDetailsData.details.followCount - 1, 0);
      } else {
        const createFollowReq = createFollow({ id });
        const postFollowReq = postFollow({ id });
        await Promise.all([createFollowReq, postFollowReq]);
        url += '?t=关注完成';
        isFollow = true;
        followCount = postDetailsData.details.followCount + 1;
      }

      this.setData({
        'postDetailsData.isFollow': isFollow,
        'postDetailsData.details.followCount': followCount,
        'postDetailsData.details._followTotalText': formatTotal(followCount),
      });

      await wx.navigateTo({ url });
    } catch (e) {
      this.openTip(parseError(e).message);
      this.closeTip(3000);
    }
  },

  async bindTapFavorite() {
    const pathData = this.data.pathData;
    const postDetailsData = this.data.postDetailsData;

    if (!pathData || !postDetailsData) {
      await showToast({ title: '数据不存在', icon: 'error' });
      return;
    }

    if (!pathData.user && !postApp.globalData._isQuickLogin) {
      const result = await showModal({
        title: '温馨提示',
        content: '还未登录，是否进行登录?',
        confirmText: '快捷登录',
        confirmColor: '#07c160',
      });
      if (result.confirm) {
        await this.onUnload();
        await wx.navigateTo({
          url: `/pages/login/index?u=${encodeURIComponent(
            `/pages/details/post/index?id=${postDetailsData.basic.id}`
          )}`,
        });
      }
      return;
    }

    try {
      const id = postDetailsData.basic.id;
      let url = '/pages/success/index';
      let isFavourite;
      let favoriteCount;

      if (postDetailsData.isFavourite) {
        const removeFavouriteReq = removeFavourite({ id });
        const postCancelFavouriteReq = postCancelFavourite({ id });
        await Promise.all([removeFavouriteReq, postCancelFavouriteReq]);
        url += '?t=取消收藏完成';
        isFavourite = false;
        favoriteCount = Math.max(postDetailsData.details.favoriteCount - 1, 0);
      } else {
        const createFavouriteReq = createFavourite({ id });
        const postFavouriteReq = postFavourite({ id });
        await Promise.all([createFavouriteReq, postFavouriteReq]);
        url += '?t=收藏完成';
        isFavourite = true;
        favoriteCount = postDetailsData.details.favoriteCount + 1;
      }

      this.setData({
        'postDetailsData.isFavourite': isFavourite,
        'postDetailsData.details.favoriteCount': favoriteCount,
        'postDetailsData.details._favoriteTotalText':
          formatTotal(favoriteCount),
      });

      await wx.navigateTo({ url });
    } catch (e) {
      this.openTip(parseError(e).message);
      this.closeTip(3000);
    }
  },
});
