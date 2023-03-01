import { type IPath } from '@interfaces/path';
import { type IPostClientDetails, type IPostComment } from '@interfaces/post';
import memoryCache from '@tools/cache';
import { queryPath } from '@apis/path';
import { clientQueryPostDetails } from '@apis/forum/post';
import {
  fromNow,
  hasText,
  hideLoading,
  isHttpOrHttps,
  parseError,
  setNavQueryStrings,
  showLoading,
  showModal,
  showToast,
  uniqBy,
} from '@/tools';
import { createComment } from '@apis/forum/comment';
import { type IApp } from '@/interfaces';
import config from '@/config';
import { createReply } from '@apis/forum/reply';

const replyApp = getApp<IApp>();

Page({
  data: {
    pathData: null as null | IPath,
    postDetailsData: null as null | IPostClientDetails,
    cacheKey: 'details_reply_page',
    tip: '抱歉，访问此资源遇到错误',
    showTip: false,
    hideTip: false,
    isPullDownRefresh: false,
    isLoadSubmit: false,
    queryParams: {
      page: 0,
    } as {
      page: number;
    },
    replyTarget: null as null | IPostComment,
    replyValue: '',
    placeholder: '请输入回复',
    focus: false,
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
        const responses = await Promise.all([
          pathReq,
          clientQueryPostDetailsReq,
        ]);

        pathData = responses[0];
        postDetailsData = responses[1];
        this.handleCommentData(postDetailsData);

        await cache.set(cacheKey, { pathData, postDetailsData }, 30000);
      } else {
        pathData = cacheData.pathData;
        postDetailsData = cacheData.postDetailsData;
      }

      await wx.setNavigationBarTitle({
        title: postDetailsData.basic.name + ' - 评论回复',
      });
      this.setData({ pathData, postDetailsData, isLoading: false });
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

    const postDetailsData = this.data.postDetailsData;
    if (!postDetailsData) {
      return;
    }

    this.setData({ isPullDownRefresh: true });
    await this.onLoad({ id: postDetailsData.basic.id as any });
    wx.stopPullDownRefresh({
      complete: () => {
        setTimeout(() => {
          this.setData({ isPullDownRefresh: false });
        }, 3000);
      },
    });
  },

  async onReachBottom() {
    const postDetailsData = this.data.postDetailsData;
    if (!postDetailsData) {
      return;
    }

    const pageable = postDetailsData.data.pageable;
    if (!pageable.next) {
      return;
    }

    await showLoading({ title: '正在加载...', mask: true });
    const queryParams = this.data.queryParams;
    const params = {
      page: Math.min(queryParams.page + 1, pageable.pages),
    };

    const response = await clientQueryPostDetails({
      id: postDetailsData.basic.id,
      query: params,
    });
    this.handleCommentData(response);

    const content = uniqBy(
      [...postDetailsData.data.content, ...response.data.content],
      '_commentId'
    );

    this.setData({
      'postDetailsData.data': {
        content,
        pageable: response.data.pageable,
      },
      queryParams: params,
    });
    await hideLoading();
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

  handleCommentData(item: IPostClientDetails) {
    item.data.content.forEach((value) => {
      const mediumAvatarUrl = value.user.details.mediumAvatarUrl;
      if (hasText(mediumAvatarUrl)) {
        // @ts-expect-error xxx
        value.user.details._avatarUrl = isHttpOrHttps(mediumAvatarUrl)
          ? mediumAvatarUrl
          : config.APP_OSS_SERVER + mediumAvatarUrl;
      } else {
        value.user.details._avatarUrl = '../../../assets/images/avatar.png';
      }

      value._commentId = value.comment.id;
      value.comment._fromNow = fromNow(value.comment.createdOn);
    });
  },

  async bindTapSend(e: any) {
    const item: IPostComment = e.currentTarget.dataset.item;
    if (!item) {
      await showToast({ title: '回复对象不存在' });
      return;
    }

    const alias = item.user.alias;
    this.setData({
      placeholder: `回复 ${alias}`,
      focus: true,
      replyTarget: item,
    });
  },

  bindBlurReply() {
    this.setData({
      replyValue: '',
      placeholder: '请输入回复',
      focus: false,
      replyTarget: null,
    });
  },

  async bindFormSubmit(e: any) {
    if (this.data.isLoadSubmit) {
      return;
    }

    const pathData = this.data.pathData;
    const postDetailsData = this.data.postDetailsData;

    if (!pathData || !postDetailsData) {
      await showToast({ title: '数据不存在', icon: 'error' });
      return;
    }

    const postId = postDetailsData.basic.id;
    if (!pathData.user || !!replyApp.globalData._isQuickLogin) {
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
            `/pages/details/post/index?id=${postId + ''}`
          )}`,
        });
      }
      return;
    }

    const content = e.detail.value.content?.trim();
    if (!hasText(content)) {
      await showToast({ title: '回复内容不能为空' });
      return;
    }

    this.setData({ isLoadSubmit: true });
    try {
      let url = '/pages/success/index';
      if (this.data.replyTarget?._commentId) {
        await createReply({
          data: {
            commentId: this.data.replyTarget._commentId,
            content,
          },
        });
        const alias = this.data.replyTarget.user.alias;
        url += `?t=回复 ${alias} 完成`;
      } else {
        await createComment({
          data: {
            postId,
            content,
          },
        });
        url += '?t=回复完成';
      }

      this.setData({ isLoadSubmit: false });
      setTimeout(() => {
        void this.refreshData(postId);
      }, 1000);

      await wx.navigateTo({ url });
    } catch (e) {
      this.openTip(parseError(e).message);
      this.closeTip(3000);
      this.setData({ isLoadSubmit: false });
    }
  },

  async refreshData(postId: number) {
    const postDetailsData = this.data.postDetailsData;
    if (!postDetailsData) {
      return;
    }

    const response = await clientQueryPostDetails({
      id: postId,
    });
    this.handleCommentData(response);

    const content = uniqBy(
      [...response.data.content, ...postDetailsData.data.content],
      '_commentId'
    );
    const pageable = response.data.pageable;

    await this.onUnload();
    this.setData({
      replyValue: '',
      'postDetailsData.data': {
        content,
        pageable,
      },
    });
  },

  bindTapUserNavigator(e: any) {
    const id = e.currentTarget.dataset.id;
    if (!id) {
      return;
    }

    setNavQueryStrings(replyApp, { id });
  },
});
