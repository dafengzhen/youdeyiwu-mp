import { clientQueryAllSection } from '@apis/forum/section';
import { hasText, isHttpOrHttps, parseError } from '@/tools';
import { type ISectionClient } from '@interfaces/section';
import config from '@/config';
import memoryCache from '@/tools/cache';
import { queryPath } from '@apis/path';
import { type IPath } from '@interfaces/path';
import ICustomShareContent = WechatMiniprogram.Page.ICustomShareContent;
import ICustomTimelineContent = WechatMiniprogram.Page.ICustomTimelineContent;
import IAddToFavoritesContent = WechatMiniprogram.Page.IAddToFavoritesContent;

Page({
  data: {
    pathData: null as IPath | null,
    sectionData: {} as Record<string, ISectionClient[]>,
    keys: [] as string[],
    defaultSgKey: '0_0',
    cacheKey: 'sectionData_keys_card_page',
    tip: '抱歉，访问此资源遇到错误',
    showTip: false,
    hideTip: false,
    isPullDownRefresh: false,
  },

  async onLoad() {
    try {
      const cacheKey = this.data.cacheKey;
      const cache = await memoryCache;
      const cacheData:
        | {
            pathData: IPath;
            sectionData: Record<string, ISectionClient[]>;
            keys: string[];
          }
        | undefined = await cache.get(cacheKey);

      let pathData: IPath | null = null;
      let sectionData: Record<string, ISectionClient[]> = {};
      let keys: string[] = [];
      if (cacheData === undefined) {
        const pathReq = queryPath();
        const clientQueryAllSectionReq = clientQueryAllSection();
        const responses = await Promise.all([
          pathReq,
          clientQueryAllSectionReq,
        ]);
        const defaultSgKey = this.data.defaultSgKey;

        pathData = responses[0];
        sectionData = responses[1].reduce<Record<string, ISectionClient[]>>(
          (previousValue, currentValue) => {
            this.handleSectionData(currentValue);
            if (currentValue.sectionGroup != null) {
              const id =
                currentValue.sectionGroup.id +
                '_' +
                currentValue.sectionGroup.sort;
              if (id in previousValue) {
                previousValue[id].push(currentValue);
              } else {
                previousValue[id] = [currentValue];
              }
            } else {
              previousValue[defaultSgKey].push(currentValue);
            }
            return previousValue;
          },
          { [defaultSgKey]: [] }
        );

        keys = Object.keys(sectionData)
          .sort((a, b) =>
            a === defaultSgKey || b === defaultSgKey
              ? -1
              : parseInt(b.split('_')[1]) - parseInt(a.split('_')[1])
          )
          .filter((key) => sectionData[key].length > 0);

        await cache.set(
          cacheKey,
          {
            pathData,
            sectionData,
            keys,
          },
          30000
        );
      } else {
        pathData = cacheData.pathData;
        sectionData = cacheData.sectionData;
        keys = cacheData.keys;
      }

      this.setData({ pathData, sectionData, keys });
    } catch (e) {
      this.openTip(parseError(e).message);
      this.closeTip(3000);
    }

    void wx.setNavigationBarTitle({
      title: config.APP_NAME,
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

  handleSectionData(item: ISectionClient) {
    const cover = item.cover;
    if (hasText(cover)) {
      // @ts-expect-error xxx
      item.cover = isHttpOrHttps(cover) ? cover : config.APP_OSS_SERVER + cover;
    }

    item.overview = item.overview ?? '';
  },

  handleShare(
    source: string
  ): ICustomShareContent | ICustomTimelineContent | IAddToFavoritesContent {
    const custom:
      | ICustomShareContent
      | ICustomTimelineContent
      | IAddToFavoritesContent = {
      title: '全部内容 - ' + config.APP_NAME_ABBR,
    };

    if (source === 'f') {
      (custom as ICustomShareContent).path = '/pages/card/index?s=f';
    } else if (source === 'f') {
      (custom as ICustomTimelineContent).query = 's=fc';
    } else if (source === 'f') {
      (custom as IAddToFavoritesContent).query = 's=fa';
    }

    return custom;
  },
});
