import {
  getNavQueryStrings,
  isHttpOrHttps,
  parseError,
  removeStorageSync,
  showModal,
  showToast,
} from '@/tools';
import memoryCache from '@tools/cache';
import { clientQueryUserDetails, logout } from '@apis/user';
import { type IUserClientDetails } from '@interfaces/user';
import { queryPath } from '@apis/path';
import { type IPath } from '@interfaces/path';
import config from '@/config';
import { type IApp } from '@/interfaces';
import Constants from '@/constants';
import ICustomShareContent = WechatMiniprogram.Page.ICustomShareContent;
import ICustomTimelineContent = WechatMiniprogram.Page.ICustomTimelineContent;
import IAddToFavoritesContent = WechatMiniprogram.Page.IAddToFavoritesContent;

const userApp = getApp<IApp>();

Page({
  data: {
    pathData: {} as IPath,
    userData: null as IUserClientDetails | null,
    cacheKey: 'pathData_userData_page',
    tip: '抱歉，访问此资源遇到错误',
    showTip: false,
    hideTip: false,
    isPullDownRefresh: false,
    isMine: false,
    isLogin: false,
    appName: '欢迎来到' + config.APP_NAME,
    btnFeedbackColor: '#8f9293',
    isLoading: true,
    isHide: false,
    loadQuery: {} as {
      id?: any;
    },
  },

  async onLoad(query = {}) {
    const qid = getNavQueryStrings(userApp, 'id') ?? query.id;
    queryPath()
      .then(async (pathData) => {
        query.id = qid ?? pathData?.user?.id;

        if (query.id) {
          try {
            const cacheKey = `${query.id}_${this.data.cacheKey}`;
            const cache = await memoryCache;
            const cacheData:
              | {
                  userData: IUserClientDetails;
                  pathData: IPath;
                }
              | undefined = await cache.get(cacheKey);

            let userData: IUserClientDetails;
            if (cacheData === undefined) {
              const clientQueryUserDetailsReq = clientQueryUserDetails({
                id: query.id,
              });
              const responses = await Promise.all([clientQueryUserDetailsReq]);
              userData = responses[0];

              const mediumAvatarUrl = userData.user.details.mediumAvatarUrl;
              userData.user.details._avatarUrl = mediumAvatarUrl
                ? isHttpOrHttps(mediumAvatarUrl)
                  ? mediumAvatarUrl
                  : config.APP_OSS_SERVER + mediumAvatarUrl
                : '../../assets/images/avatar.png';

              const personalizedSignature =
                userData.user.details.personalizedSignature;
              userData.user.details.personalizedSignature =
                personalizedSignature ?? '欢迎来到' + config.APP_NAME;

              await cache.set(cacheKey, { userData, pathData }, 30000);
            } else {
              userData = cacheData.userData;
            }

            const isMine =
              !!pathData.user && pathData.user.id === userData.user.id;
            this.setData({
              cacheKey,
              userData,
              pathData,
              isLogin: isMine,
              isMine,
              isLoading: false,
            });
          } catch (e) {
            this.openTip(parseError(e).message);
            this.closeTip(3000);
            this.setData({
              isLoading: false,
            });
          }
        } else {
          this.setData({
            pathData,
            isLogin: false,
            isMine: false,
            isLoading: false,
          });
        }

        this.setData({ loadQuery: { ...query } });
      })
      .catch((reason) => {
        this.openTip(parseError(reason).message);
        this.closeTip(3000);
        this.setData({
          isLoading: false,
        });
      });

    void wx.setNavigationBarTitle({
      title: config.APP_NAME,
    });
  },

  async onShow() {
    const hide = this.data.isHide;
    if (hide) {
      this.setData({
        isHide: false,
      });
      await this.onLoad(this.data.loadQuery);
    }
  },

  onHide() {
    this.setData({
      isHide: true,
    });
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

  bindTapFeedback() {
    this.setData({
      btnFeedbackColor: '#07c160',
    });

    setTimeout(() => {
      this.setData({
        btnFeedbackColor: '#8f9293',
      });
    }, 200);
  },

  async bindTapLogout() {
    const result = await showModal({
      title: '温馨提示',
      content: '确定要退出登录吗?',
      confirmText: '退出',
      confirmColor: '#07c160',
    });
    if (result.cancel) {
      return;
    }

    removeStorageSync(Constants.TICKET);
    userApp.globalData._isQuickLogin = false;

    try {
      await logout();
      await showToast({
        title: '退出登录完成',
        icon: 'success',
        duration: 1500,
      });
      await wx.reLaunch({ url: '/pages/index/index' });
    } catch (e) {
      this.openTip(parseError(e).message);
      this.closeTip(3000);
    }
  },

  handleShare(
    source: string
  ): ICustomShareContent | ICustomTimelineContent | IAddToFavoritesContent {
    const id = this.data.userData?.user.id ?? '';
    const alias = this.data.userData
      ? this.data.userData.user.alias
      : config.APP_NAME_ABBR;

    const custom:
      | ICustomShareContent
      | ICustomTimelineContent
      | IAddToFavoritesContent = {
      title: `用户主页 - ${alias}`,
    };

    if (source === 'f') {
      (custom as ICustomShareContent).path = `/pages/user/index?s=f&id=${id}`;
    } else if (source === 'f') {
      (custom as ICustomTimelineContent).query = `s=fc&id=${id}`;
    } else if (source === 'f') {
      (custom as IAddToFavoritesContent).query = `s=fa&id=${id}`;
    }

    return custom;
  },
});
