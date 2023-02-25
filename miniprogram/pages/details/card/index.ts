import { queryPath } from '@apis/path';
import memoryCache from '@tools/cache';
import {
  formatTotal,
  fromNow,
  hasText,
  isHttpOrHttps,
  parseError,
  setNavQueryStrings,
  uniqBy,
} from '@/tools';
import { clientQuerySectionDetailsById } from '@apis/forum/section';
import { type IPath } from '@interfaces/path';
import { type ISectionDetails } from '@interfaces/section';
import config from '@/config';
import { type IPost } from '@interfaces/post';
import { type IApp } from '@/interfaces';
import ICustomShareContent = WechatMiniprogram.Page.ICustomShareContent;
import ICustomTimelineContent = WechatMiniprogram.Page.ICustomTimelineContent;
import IAddToFavoritesContent = WechatMiniprogram.Page.IAddToFavoritesContent;

const cardDetailsApp = getApp<IApp>();

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
    queryParams: {
      page: 0,
    } as {
      page: number;
    },
    isLoading: true,
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
            sectionDetailsData: ISectionDetails;
          }
        | undefined = await cache.get(cacheKey);

      let pathData: null | IPath = null;
      let sectionDetailsData: null | ISectionDetails = null;
      if (cacheData === undefined) {
        const pathReq = queryPath();
        const clientQuerySectionDetailsByIdReq = clientQuerySectionDetailsById({
          id,
        });
        const responses = await Promise.all([
          pathReq,
          clientQuerySectionDetailsByIdReq,
        ]);

        pathData = responses[0];
        sectionDetailsData = responses[1];
        this.handleSectionDetailsData(sectionDetailsData);

        await cache.set(cacheKey, { pathData, sectionDetailsData }, 30000);
      } else {
        pathData = cacheData.pathData;
        sectionDetailsData = cacheData.sectionDetailsData;
      }

      await wx.setNavigationBarTitle({
        title: sectionDetailsData.basic.name,
      });
      this.setData({ pathData, sectionDetailsData, isLoading: false });
    } catch (e) {
      this.openTip(parseError(e).message);
      this.closeTip(3000);
      this.setData({ isLoading: false });
    }
  },

  async onPullDownRefresh() {
    if (this.data.isPullDownRefresh) {
      return;
    }

    const sectionDetailsData = this.data.sectionDetailsData;
    if (!sectionDetailsData) {
      return;
    }

    this.setData({ isPullDownRefresh: true });
    await this.onLoad({ id: sectionDetailsData.basic.id as any });
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

  async bindTapImage(e: any) {
    const item: IPost = e.currentTarget.dataset.item;
    if (!item) {
      return;
    }

    if (!item.images || item.images.length === 0) {
      return;
    }

    await wx.previewImage({
      urls: item.images,
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

  bindTapUserNavigator(e: any) {
    const id = e.currentTarget.dataset.id;
    if (!id) {
      return;
    }

    setNavQueryStrings(cardDetailsApp, { id });
  },

  async bindTapLoadNextPage() {
    if (
      this.data.isLoadNextPage ||
      !this.data.sectionDetailsData ||
      !this.data.sectionDetailsData.data ||
      !this.data.sectionDetailsData.data.pageable.next
    ) {
      return;
    }

    this.setData({
      isLoadNextPage: true,
    });

    const id = this.data.sectionDetailsData.basic.id;
    const data = this.data.sectionDetailsData.data;
    const queryParams = this.data.queryParams;
    const pages = data.pageable.pages;

    const response = await clientQuerySectionDetailsById({
      id,
    });
    if (!response.data) {
      return;
    }

    await this.onUnload();
    const content = uniqBy([...data.content, ...response.data.content], 'id');
    const pageable = response.data.pageable;

    this.setData({
      isLoadNextPage: false,
      'sectionDetailsData.data': {
        content,
        pageable,
      },
      queryParams: {
        page: Math.min(queryParams.page + 1, pages),
      },
    });
  },
});
