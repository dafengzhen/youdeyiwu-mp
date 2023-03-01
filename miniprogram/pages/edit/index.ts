import { queryPath } from '@apis/path';
import memoryCache from '@tools/cache';
import {
  diffData,
  isHttpOrHttps,
  parseError,
  showModal,
  showToast,
} from '@/tools';
import { type IPath } from '@interfaces/path';
import { type IPostEditInfo, type IPostNewInfo } from '@interfaces/post';
import {
  queryPostEditInfo,
  queryPostNewInfo,
  updatePostEditInfo,
  updatePostNewInfo,
  uploadPostContent,
  uploadPostNewFile,
} from '@apis/forum/post';
import config from '@/config';
import { type ISection } from '@interfaces/section';

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
    loadQuery: {
      id: null,
      sid: null,
    } as {
      id?: any;
      sid?: any;
    },
    sectionRange: [] as ISection[],
    sectionRangeIndex: 0,
  },

  async onLoad(query = {}) {
    const id = query.id;
    const sid = query.sid;
    if (!sid) {
      return;
    }

    try {
      const cacheKey = `${id ? id + '' : 'new'}_${sid}_${this.data.cacheKey}`;
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

      let name = '';
      let content = '';
      let sectionId;
      if (id) {
        name = (postInfoData as IPostEditInfo).basic.name;
        content = (postInfoData as IPostEditInfo).content;
        sectionId = (postInfoData as IPostEditInfo).section.id;
      } else {
        sectionId = parseInt(sid);
      }

      this.setData({
        cacheKey,
        pathData,
        postInfoData,
        form: {
          name,
          content,
          sectionId,
        },
        sectionRange: postInfoData.sections,
        sectionRangeIndex: postInfoData.sections.findIndex(
          (item) => item.id + '' === sid
        ),
        isLoading: false,
      });
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

    this.setData({ loadQuery: query });
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

  async bindTapSavePost() {
    if (this.data.isLoadSavePost) {
      return;
    }

    try {
      const postInfoData = this.data.postInfoData;
      const content = await this.getContents();
      const form = { ...this.data.form };
      if (!form.name) {
        await showToast({ title: '标题不能为空' });
        return;
      } else if (!content.text) {
        await showToast({ title: '内容不能为空' });
        return;
      } else if (!form.sectionId) {
        await showToast({ title: '未选择发布版块' });
        return;
      }

      this.setData({ isLoadSavePost: true });

      let id: string;
      if (postInfoData && 'basic' in postInfoData) {
        const diffObj = diffData(
          {
            name: postInfoData.basic.name,
            content: postInfoData.content,
            sectionId: postInfoData.section.id,
          },
          {
            ...form,
            content: content.html,
          }
        );

        if (Object.keys(diffObj).length === 0) {
          await showToast({ title: '保存完成', icon: 'success' });
          return;
        }

        await updatePostEditInfo({
          id: postInfoData.basic.id,
          data: diffObj,
        });

        id = postInfoData.basic.id + '';
      } else {
        const response = await updatePostNewInfo({
          data: {
            name: form.name,
            content: content.html,
            sectionId: form.sectionId,
          },
        });

        const split = response.headers.Location.split('/');
        id = split[split.length - 1] as string;
      }

      await showToast({ title: '保存完成', icon: 'success', duration: 800 });
      setTimeout(() => {
        void showToast({
          title: '即将跳转',
          duration: 1000,
        });
      }, 1000);
      setTimeout(() => {
        void wx.navigateTo({ url: `/pages/details/post/index?id=${id}` });
      }, 1500);

      this.setData({ isLoadSavePost: false });
    } catch (e) {
      this.openTip(parseError(e).message);
      this.closeTip(3000);
      this.setData({ isLoadSavePost: false });
    }
  },

  bindTapEditPostTip() {
    void showModal({
      title: '温馨提示',
      content:
        '1. 如果内容布局是比较复杂的话，建议使用 PC 端来新建或编辑\n2. 如果在小程序端编辑复杂内容布局，可能会使布局发生变化',
      showCancel: false,
    });
  },

  bindTextEditTitle(e: any) {
    const value = e.detail.value.trim();
    this.setData({
      'form.name': value,
    });
  },

  async bindChangeSection(e: any) {
    const sectionRange = this.data.sectionRange;
    const index = e.detail.value;
    const find = sectionRange[index];
    if (!find) {
      await showToast({ title: '版块不存在', icon: 'error' });
      return;
    }

    this.setData(
      {
        sectionRangeIndex: index,
        'form.sectionId': find.id,
      },
      () => {
        void showToast({ title: `已选择 ${find.name}` });
      }
    );
  },

  onEditorReady() {
    wx.createSelectorQuery()
      .select('#editor')
      .context((res) => {
        const context = res.context;
        context.setContents({
          html: this.data.form.content,
          fail: (e: any) => {
            console.error(e);
            void showToast({ title: '初始化内容失败', icon: 'error' });
          },
          complete: () => {
            this.setData({
              isLoadSavePost: false,
            });
          },
        });
        this.setData({
          _editorContext: context,
          isLoadSavePost: true,
        });
      })
      .exec();
  },

  format(e: any) {
    const { name, value } = e.target.dataset;
    this.data._editorContext.format(name, value);
    this.data._editorContext.scrollIntoView();
  },

  async getContents(): Promise<{
    html: string;
    text: string;
    delta: object;
  }> {
    return await new Promise((resolve, reject) => {
      this.data._editorContext.getContents({
        success: resolve,
        fail: reject,
      });
    });
  },

  onStatusChange(e: any) {
    const formats = e.detail;
    this.setData({ formats });
  },

  insertImage() {
    if (this.data.isLoadInsertImage) {
      return;
    }

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
