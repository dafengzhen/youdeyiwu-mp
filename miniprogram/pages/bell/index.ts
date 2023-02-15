import { queryAllMessage } from '@apis/message';
import { type IClientMessage } from '@interfaces/message';
import { type IPagination } from '@/interfaces';
import { queryPath } from '@apis/path';
import memoryCache from '@tools/cache';
import { defaultPagination, parseError, simplifyYearMonth } from '@/tools';
import config from '@/config';
import ICustomShareContent = WechatMiniprogram.Page.ICustomShareContent;
import ICustomTimelineContent = WechatMiniprogram.Page.ICustomTimelineContent;
import IAddToFavoritesContent = WechatMiniprogram.Page.IAddToFavoritesContent;

Page({
  data: {
    messageData: defaultPagination() as IPagination<IClientMessage>,
    cacheKey: 'messages_bell_page',
    tip: '抱歉，访问此资源遇到错误',
    showTip: false,
    hideTip: false,
    isPullDownRefresh: false,
  },

  async onLoad() {
    queryPath()
      .then(async (pathData) => {
        const defaultMessages = [
          {
            id: -1,
            name: '学而时习之',
            _overview: '学而时习之，不亦说乎？',
            content: '学而时习之，不亦说乎？',
            _content: {},
            messageType: 'OTHER',
            messageRange: 'USER',
            messageStatus: 'HAVE_READ',
            _createdOn: '02/15',
            _builtInStatic: true,
          },
          {
            id: -2,
            name: '有朋自远方来',
            _overview: '有朋自远方来，不亦乐乎？',
            content: '有朋自远方来，不亦乐乎？',
            _content: {},
            messageType: 'OTHER',
            messageRange: 'USER',
            messageStatus: 'HAVE_READ',
            _createdOn: '02/15',
            _builtInStatic: true,
          },
          {
            id: -3,
            name: '欢迎来到',
            _overview: `欢迎来到${config.APP_NAME}`,
            content: `欢迎来到${config.APP_NAME}`,
            _content: {},
            messageType: 'OTHER',
            messageRange: 'USER',
            messageStatus: 'HAVE_READ',
            _createdOn: '02/15',
            _builtInStatic: true,
          },
        ] as any;

        if (pathData.user) {
          try {
            const cacheKey = this.data.cacheKey;
            const cache = await memoryCache;
            const cacheData:
              | {
                  messageData: IPagination<IClientMessage>;
                }
              | undefined = await cache.get(cacheKey);

            let messageData: IPagination<IClientMessage> = defaultPagination();
            if (cacheData === undefined) {
              const queryAllMessageReq = queryAllMessage();
              const responses = await Promise.all([queryAllMessageReq]);
              messageData = responses[0];
              messageData.content.forEach((item) => {
                item._content = JSON.parse(item.content);
                item._createdOn = simplifyYearMonth(item.createdOn);
                item._overview = item.overview ?? '';
              });
              messageData.content.push(...defaultMessages);
              await cache.set(cacheKey, { messageData }, 30000);
            } else {
              messageData = cacheData.messageData;
            }

            this.setData({ messageData });
          } catch (e) {
            this.openTip(parseError(e).message);
            this.closeTip(3000);
          }
        } else {
          this.setData({
            messageData: {
              ...this.data.messageData,
              content: defaultMessages,
            },
          });
        }
      })
      .catch((reason) => {
        this.openTip(parseError(reason).message);
        this.closeTip(3000);
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

  handleShare(
    source: string
  ): ICustomShareContent | ICustomTimelineContent | IAddToFavoritesContent {
    const custom:
      | ICustomShareContent
      | ICustomTimelineContent
      | IAddToFavoritesContent = {
      title: '我的消息 - youdeyiwu',
    };

    if (source === 'f') {
      (custom as ICustomShareContent).path = '/pages/bell/index?s=f';
    } else if (source === 'f') {
      (custom as ICustomTimelineContent).query = 's=fc';
    } else if (source === 'f') {
      (custom as IAddToFavoritesContent).query = 's=fa';
    }

    return custom;
  },
});
