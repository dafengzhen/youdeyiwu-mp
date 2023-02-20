import { type IPath } from '@interfaces/path';
import { type IPostClientDetails } from '@interfaces/post';
import memoryCache from '@tools/cache';
import { queryPath } from '@apis/path';
import { clientQueryPostDetails } from '@apis/forum/post';
import { parseError } from '@/tools';

Page({
  data: {
    pathData: null as null | IPath,
    postDetailsData: null as null | IPostClientDetails,
    cacheKey: 'details_reply_page',
    tip: '抱歉，访问此资源遇到错误',
    showTip: false,
    hideTip: false,
    isPullDownRefresh: false,
    isViewAdmin: false,
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
          query: this.data.queryParams,
        });
        const responses = await Promise.all([
          pathReq,
          clientQueryPostDetailsReq,
        ]);

        pathData = responses[0];
        postDetailsData = responses[1];

        await cache.set(cacheKey, { pathData, postDetailsData }, 30000);
      } else {
        pathData = cacheData.pathData;
        postDetailsData = cacheData.postDetailsData;
      }

      await wx.setNavigationBarTitle({
        title: postDetailsData.basic.name + ' - 评论回复',
      });
      this.setData({ pathData, postDetailsData });
    } catch (e) {
      this.openTip(parseError(e).message);
      this.closeTip(3000);
    }
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
});
