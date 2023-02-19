import { queryPath } from '@apis/path';
import memoryCache from '@tools/cache';
import {
  formatTotal,
  fromNow,
  hasText,
  isHttpOrHttps,
  parseError,
} from '@/tools';
import { clientQuerySectionDetailsById } from '@apis/forum/section';
import { type IPath } from '@interfaces/path';
import { type ISectionDetails } from '@interfaces/section';
import config from '@/config';
import { type IPost } from '@interfaces/post';
import ICustomShareContent = WechatMiniprogram.Page.ICustomShareContent;
import ICustomTimelineContent = WechatMiniprogram.Page.ICustomTimelineContent;
import IAddToFavoritesContent = WechatMiniprogram.Page.IAddToFavoritesContent;

Page({
  data: {
    pathData: null as null | IPath,
    sectionDetailsData: null as null | ISectionDetails,
    cacheKey: 'details_card_page',
    tip: '抱歉，访问此资源遇到错误',
    showTip: false,
    hideTip: false,
    isPullDownRefresh: false,
    isViewAdmin: false,
    isLoadNextPage: false,
    queryParams: {} as {
      page?: number;
    },
  },

  async onLoad(query = {}) {
    const id = query.id;
    if (!id) {
      return;
    }

    try {
      const cacheKey = this.data.cacheKey;
      const cache = await memoryCache;
      const cacheData:
        | {
            pathData: IPath;
            sectionDetailsData: ISectionDetails;
          }
        | undefined = await cache.get(cacheKey);

      let pathData: null | IPath = null;
      let sectionDetailsData: null | ISectionDetails = null;
      if (cacheData === undefined) {
        const pathReq = queryPath();
        const clientQuerySectionDetailsByIdReq = clientQuerySectionDetailsById({
          id,
          query: this.data.queryParams,
        });
        const responses = await Promise.all([
          pathReq,
          clientQuerySectionDetailsByIdReq,
        ]);

        pathData = responses[0];
        sectionDetailsData = responses[1];

        this.handleSectionDetailsData(sectionDetailsData);

        await wx.setNavigationBarTitle({
          title: sectionDetailsData.basic.name,
        });
        await cache.set(cacheKey, { pathData, sectionDetailsData }, 30000);
      } else {
        pathData = cacheData.pathData;
        sectionDetailsData = cacheData.sectionDetailsData;
      }

      this.setData({ pathData, sectionDetailsData });
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

    if (this.data.sectionDetailsData?.data?.pageable.next) {
      const queryParams = this.data.queryParams;
      if (
        Object.keys(queryParams).length &&
        typeof queryParams.page === 'number'
      ) {
        const page = this.data.sectionDetailsData.data?.pageable.page ?? 0;
        const pages = this.data.sectionDetailsData.data?.pageable.pages ?? 0;
        this.setData({
          queryParams: {
            ...queryParams,
            page: Math.min(page + 1, pages),
          },
        });
      } else {
        this.setData({ queryParams: {} });
      }

      await new Promise((resolve) => {
        setTimeout(() => {
          resolve('loading');
        }, 500);
      });
    }

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
    const name = this.data.sectionDetailsData
      ? this.data.sectionDetailsData.basic.name
      : '内容详情';

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

  handlePostItem(item: IPost) {
    const mediumAvatarUrl = item.user!.details.mediumAvatarUrl;
    if (hasText(mediumAvatarUrl)) {
      // @ts-expect-error xxx
      item.user!.details._avatarUrl = isHttpOrHttps(mediumAvatarUrl)
        ? mediumAvatarUrl
        : config.APP_OSS_SERVER + mediumAvatarUrl;
    } else {
      item.user!.details._avatarUrl = '../../../assets/images/avatar.png';
    }

    item._fromNow = fromNow(item.contentUpdatedOn);
    item.overview = item.overview ?? '';

    item.images = item.images ?? [];
    item.details._commentTotalText = formatTotal(item.details.commentCount);
    item.details._replyTotalText = formatTotal(item.details.replyCount);
    item.details._viewTotalText = formatTotal(item.details.viewCount);
    return item;
  },

  handleSectionDetailsData(item: ISectionDetails) {
    const cover = item.basic.cover;
    if (hasText(cover)) {
      // @ts-expect-error xxx
      item.basic.cover = isHttpOrHttps(cover)
        ? cover
        : config.APP_OSS_SERVER + cover;
    }

    item.basic.overview = item.basic.overview ?? '';
    item.content = item.content ?? '';
    item.data?.content.forEach((postItem) => this.handlePostItem(postItem));
  },

  bindTapViewAdmin() {
    this.setData({
      isViewAdmin: !this.data.isViewAdmin,
    });
  },

  async bindTapLoadNextPage() {
    if (this.data.isLoadNextPage) {
      return;
    }

    this.setData({
      isLoadNextPage: true,
    });

    if (!this.data.sectionDetailsData?.data?.pageable.next) {
      return;
    }

    const queryParams = this.data.queryParams;
    const page = this.data.sectionDetailsData.data?.pageable.page ?? 0;
    const pages = this.data.sectionDetailsData.data?.pageable.pages ?? 0;
    await this.onLoad();

    this.setData({
      isLoadNextPage: false,
      queryParams: {
        ...queryParams,
        page: Math.min(page + 1, pages),
      },
    });
  },
});
