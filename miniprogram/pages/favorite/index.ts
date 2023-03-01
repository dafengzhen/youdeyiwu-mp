import { parseError } from '@/tools';
import memoryCache from '@tools/cache';
import { queryPostFavourites } from '@apis/forum/post';
import { type IPostFavourite } from '@interfaces/post';

Page({
  data: {
    tip: '抱歉，访问此资源遇到错误',
    showTip: false,
    hideTip: false,
    isLoading: true,
    favorites: [] as IPostFavourite[],
    cacheKey: 'favorite_user_page',
  },

  async onLoad(query = {}) {
    const id = query.id;
    if (!id) {
      this.setData({
        isLoading: false,
      });
      return;
    }

    try {
      const cacheKey = `${id}_${this.data.cacheKey}`;
      const cache = await memoryCache;
      const cacheData:
        | {
            favorites: IPostFavourite[];
          }
        | undefined = await cache.get(cacheKey);

      let favorites: IPostFavourite[];
      if (cacheData) {
        favorites = cacheData.favorites;
      } else {
        favorites = await queryPostFavourites();
        await cache.set(cacheKey, { favorites }, 30000);
      }

      this.setData({
        cacheKey,
        favorites,
        isLoading: false,
      });
    } catch (e) {
      this.openTip(parseError(e).message);
      this.closeTip(3000);
      this.setData({
        isLoading: false,
      });
    }
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
});
