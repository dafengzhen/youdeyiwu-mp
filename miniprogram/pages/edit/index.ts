import { queryPath } from '@apis/path';
import memoryCache from '@tools/cache';
import { isHttpOrHttps, parseError, showToast } from '@/tools';
import { type IPath } from '@interfaces/path';
import { type IPostEditInfo, type IPostNewInfo } from '@interfaces/post';
import {
  queryPostEditInfo,
  queryPostNewInfo,
  uploadPostContent,
  uploadPostNewFile,
} from '@apis/forum/post';
import config from '@/config';

Page({
  data: {
    pathData: null as null | IPath,
    postInfoData: null as null | IPostNewInfo | IPostEditInfo,
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
    form: {
      name: '',
      content: '',
    } as {
      name?: string;
      content?: string;
      sectionId?: number;
    },
    isLoadInsertImage: false,
    isLoadSavePost: false,
  },

  async onLoad(query = {}) {
    const id = query.id;
    try {
      const cacheKey = `_${this.data.cacheKey}`;
      const cache = await memoryCache;
      const cacheData:
        | {
            pathData: IPath;
            postInfoData: IPostNewInfo | IPostEditInfo;
          }
        | undefined = await cache.get(cacheKey);

      let pathData: null | IPath = null;
      let postInfoData: null | IPostNewInfo | IPostEditInfo = null;
      if (cacheData === undefined) {
        const pathReq = queryPath();
        let queryPostInfoReq;
        if (id) {
          queryPostInfoReq = queryPostEditInfo({ id });
        } else {
          queryPostInfoReq = queryPostNewInfo();
        }
        const responses = await Promise.all([pathReq, queryPostInfoReq]);
        pathData = responses[0];
        postInfoData = responses[1];
        await cache.set(cacheKey, { pathData, postInfoData }, 30000);
      } else {
        pathData = cacheData.pathData;
        postInfoData = cacheData.postInfoData;
      }

      this.setData({ pathData, postInfoData, isLoading: false });
      void wx.setNavigationBarTitle({
        title:
          (id
            ? `${(postInfoData as IPostEditInfo).basic.name} - 编辑帖子 - `
            : '新建帖子 - ') + pathData.user!.alias,
      });
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

  async bindTapSavePost() {},

  bindTextEditTitle(e: any) {
    const value = e.detail.value.trim();
    this.setData({
      'form.name': value,
    });
  },

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
      success: async (res) => {
        this.setData({ isLoadInsertImage: true });

        try {
          const mediaFile = res.tempFiles[0];
          const tempFilePath = mediaFile.tempFilePath;
          const postInfoData = this.data.postInfoData;

          let uploadFileReq;
          if (postInfoData && 'basic' in postInfoData) {
            uploadFileReq = uploadPostContent({
              id: postInfoData.basic.id,
              data: {
                filePath: tempFilePath,
              },
            });
          } else {
            uploadFileReq = uploadPostNewFile({
              data: {
                filePath: tempFilePath,
              },
            });
          }

          const response = JSON.parse(await uploadFileReq).data;
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
            complete: () => {
              this.setData({ isLoadInsertImage: false });
            },
          });
        } catch (e) {
          this.openTip(parseError(e).message);
          this.closeTip(3000);
          this.setData({ isLoadInsertImage: false });
        }
      },
    });
  },
});
