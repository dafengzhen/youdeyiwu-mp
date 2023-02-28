import { queryPath } from '@apis/path';
import memoryCache from '@tools/cache';
import { isHttpOrHttps, parseError, showToast } from '@/tools';
import { type IPath } from '@interfaces/path';
import { type IPostClientDetails } from '@interfaces/post';
import {
  clientQueryPostDetails,
  postView,
  uploadPostNewFile,
} from '@apis/forum/post';
import config from '@/config';

Page({
  data: {
    pathData: null as null | IPath,
    postDetailsData: null as null | IPostClientDetails,
    cacheKey: 'edit_post_page',
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
    isLoading: true,
    placeholder: '然后分享点什么呢',
    formats: {},
    _editorContext: null as unknown as Record<string, any>,
  },

  async onLoad(query = {}) {
    const id = query.id;

    try {
      const cacheKey = `_${this.data.cacheKey}`;
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
        await cache.set(cacheKey, { pathData, postDetailsData }, 30000);
      } else {
        pathData = cacheData.pathData;
        postDetailsData = cacheData.postDetailsData;
      }

      await wx.setNavigationBarTitle({
        title: postDetailsData.basic.name,
      });
      this.setData({ pathData, postDetailsData, isLoading: false });
    } catch (e) {
      this.openTip(parseError(e).message);
      this.closeTip(3000);
      this.setData({ isLoading: false });
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

  bindTapSavePost() {},

  bindTextEditTitle() {},

  onEditorReady() {
    wx.createSelectorQuery()
      .select('#editor')
      .context((res) => {
        this.setData({
          _editorContext: res.context,
        });
        console.log(res.context);
      })
      .exec();
  },

  format(e: any) {
    const { name, value } = e.target.dataset;
    console.log('format', name, value);
    this.data._editorContext.format(name, value);
  },

  onStatusChange(e: any) {
    const formats = e.detail;
    this.setData({ formats });
  },

  insertImage() {
    wx.chooseMedia({
      count: 1,
      mediaType: ['image'],
      success: (res) => {
        const mediaFile = res.tempFiles[0];
        const tempFilePath = mediaFile.tempFilePath;

        void uploadPostNewFile({
          data: {
            filePath: tempFilePath,
          },
        }).then((value) => {
          const response = JSON.parse(value).data;
          let src = response.urls.default;
          if (!isHttpOrHttps(src)) {
            src = config.APP_OSS_SERVER + src;
          }

          this.data._editorContext.insertImage({
            src,
            width: '100%',
            fail: () => {
              void showToast({ title: '插入图片失败', icon: 'error' });
            },
          });
        });
      },
    });
  },
});
