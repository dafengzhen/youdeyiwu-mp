import { type IPath } from '@interfaces/path';
import { type IPostComment, type IPostCommentReply } from '@interfaces/post';
import memoryCache from '@tools/cache';
import { queryPath } from '@apis/path';
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
import { type IApp } from '@/interfaces';
import config from '@/config';
import {
  createParentReply,
  createReply,
  queryAllReplyByCommentId,
} from '@apis/forum/reply';

const parentReplyApp = getApp<IApp>();

Page({
  data: {
    pathData: null as null | IPath,
    commentData: null as null | IPostComment,
    cacheKey: 'details_reply_parent_page',
    tip: '抱歉，访问此资源遇到错误',
    showTip: false,
    hideTip: false,
    isPullDownRefresh: false,
    queryParams: {
      page: 0,
    } as {
      page: number;
    },
    replyTarget: null as null | IPostCommentReply,
    replyValue: '',
    placeholder: '请输入回复',
    focus: false,
    isLoadSubmit: false,
    id: null as any,
    pid: null as any,
    isLoading: true,
  },

  async onLoad(query = {}) {
    const _id = query.id;
    const _pid = query.pid;
    if (!_id || !_pid) {
      return;
    }

    try {
      const cacheKey = `${_id}_${this.data.cacheKey}`;
      const cache = await memoryCache;
      const cacheData:
        | {
            pathData: IPath;
            commentData: IPostComment;
            id: any;
            pid: any;
          }
        | undefined = await cache.get(cacheKey);

      let id: any = _id;
      let pid: any = _pid;
      let pathData: null | IPath = null;
      let commentData: null | IPostComment = null;
      if (cacheData === undefined) {
        const pathReq = queryPath();
        const queryAllReplyByCommentIdReq = queryAllReplyByCommentId({
          id,
        });
        const responses = await Promise.all([
          pathReq,
          queryAllReplyByCommentIdReq,
        ]);

        pathData = responses[0];
        commentData = responses[1];
        this.handleReplyData(commentData);

        await cache.set(cacheKey, { pathData, commentData, id, pid }, 30000);
      } else {
        pathData = cacheData.pathData;
        commentData = cacheData.commentData;
        id = cacheData.id;
        pid = cacheData.pid;
      }

      await wx.setNavigationBarTitle({
        title: commentData.user.alias + ' - 评论回复',
      });
      this.setData({
        pathData,
        commentData,
        id,
        pid,
        placeholder: `回复 ${commentData.user.alias}`,
        isLoading: false,
      });
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

    const id = this.data.id;
    const pid = this.data.pid;
    if (!id || !pid) {
      return;
    }

    this.setData({ isPullDownRefresh: true });
    await this.onLoad({
      id,
      pid,
    });
    wx.stopPullDownRefresh({
      complete: () => {
        setTimeout(() => {
          this.setData({ isPullDownRefresh: false });
        }, 3000);
      },
    });
  },

  async onReachBottom() {
    const commentData = this.data.commentData;
    if (!commentData) {
      return;
    }

    const pageable = commentData.pageable;
    if (!pageable.next) {
      return;
    }

    await showLoading({ title: '正在加载...', mask: true });
    const queryParams = this.data.queryParams;
    const params = {
      page: Math.min(queryParams.page + 1, pageable.pages),
    };

    const response = await queryAllReplyByCommentId({
      id: this.data.id,
      query: params,
    });
    this.handleReplyData(response);

    const content = uniqBy(
      [...commentData.content, ...response.content],
      '_replyId'
    );

    this.setData({
      'commentData.content': content,
      'commentData.pageable': response.pageable,
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

  handleReplyData(item: IPostComment) {
    item.content.forEach((value) => {
      const mediumAvatarUrl = value.user.details.mediumAvatarUrl;
      if (hasText(mediumAvatarUrl)) {
        // @ts-expect-error xxx
        value.user.details._avatarUrl = isHttpOrHttps(mediumAvatarUrl)
          ? mediumAvatarUrl
          : config.APP_OSS_SERVER + mediumAvatarUrl;
      } else {
        value.user.details._avatarUrl = '../../../../assets/images/avatar.png';
      }

      value._replyId = value.reply.id;
      value.reply._fromNow = fromNow(value.reply.createdOn);
    });
  },

  async bindTapSend(e: any) {
    const item: IPostCommentReply = e.currentTarget.dataset.item;
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
    const commentData = this.data.commentData;
    if (!commentData) {
      return;
    }

    this.setData({
      replyValue: '',
      placeholder: `回复 ${commentData.user.alias}`,
      focus: false,
      replyTarget: null,
    });
  },

  async bindFormSubmit(e: any) {
    if (this.data.isLoadSubmit) {
      return;
    }

    const pathData = this.data.pathData;
    const commentData = this.data.commentData;
    if (!pathData || !commentData) {
      await showToast({ title: '数据不存在', icon: 'error' });
      return;
    }

    if (!pathData.user && !parentReplyApp.globalData._isQuickLogin) {
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
            `/pages/details/post/index?id=${this.data.pid + ''}`
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
      if (this.data.replyTarget?._replyId) {
        await createParentReply({
          data: {
            replyId: this.data.replyTarget._replyId,
            content,
          },
        });
        const alias = this.data.replyTarget.user.alias;
        url += `?t=回复 ${alias} 完成`;
      } else {
        await createReply({
          data: {
            commentId: this.data.id,
            content,
          },
        });
        url += '?t=回复完成';
      }

      this.setData({ isLoadSubmit: false });
      setTimeout(() => {
        void this.refreshData();
      }, 1000);

      await wx.navigateTo({ url });
    } catch (e) {
      this.openTip(parseError(e).message);
      this.closeTip(3000);
      this.setData({ isLoadSubmit: false });
    }
  },

  async refreshData() {
    const commentData = this.data.commentData;
    if (!commentData) {
      return;
    }

    const response = await queryAllReplyByCommentId({
      id: this.data.id,
    });
    this.handleReplyData(response);

    const content = uniqBy(
      [...response.content, ...commentData.content],
      '_replyId'
    );
    const pageable = response.pageable;

    await this.onUnload();
    this.setData({
      replyValue: '',
      'commentData.content': content,
      'commentData.pageable': pageable,
    });
  },

  bindTapUserNavigator(e: any) {
    const id = e.currentTarget.dataset.id;
    if (!id) {
      return;
    }

    setNavQueryStrings(parentReplyApp, { id });
  },
});
