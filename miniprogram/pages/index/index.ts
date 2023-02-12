import { queryPath } from '../../apis/path';
import {
  clientQueryAllSection,
  clientQuerySectionDetailsById,
} from '../../apis/forum/section';
import { clientQueryAllPost } from '../../apis/forum/post';
import type { ISectionClient } from '../../interfaces/section';
import type { IPost } from '../../interfaces/post';
import emitter from '../../tools/emitter';
import {
  formatTotal,
  fromNow,
  hasText,
  isHttpOrHttps,
  parseError,
} from '../../tools';
import config from '../../config';
import type { IPagination } from '../../interfaces';
import memoryCache from '../../tools/cache';
import ICustomShareContent = WechatMiniprogram.Page.ICustomShareContent;
import ICustomTimelineContent = WechatMiniprogram.Page.ICustomTimelineContent;
import IAddToFavoritesContent = WechatMiniprogram.Page.IAddToFavoritesContent;

Page({
  data: {
    tabs: [] as ISectionClient[],
    postData: {
      content: [],
      pageable: {
        next: false,
        page: 0,
        pages: 0,
        previous: false,
        size: 0,
      },
    } as IPagination<IPost>,
    activeTab: 0,
    activeTabIndex: 0,
    indexBoxHeight: '100%',
    queryParams: {
      page: 0,
    },
    isLoadMore: false,
    tip: '抱歉，访问此资源遇到错误',
    showTip: false,
    hideTip: false,
    isPullDownRefresh: false,
  },

  async onLoad() {
    const queryPathReq = queryPath();
    const clientQueryAllSectionReq = clientQueryAllSection();
    const clientQueryAllPostReq = clientQueryAllPost();

    try {
      const responses = await Promise.all([
        queryPathReq,
        clientQueryAllSectionReq,
        clientQueryAllPostReq,
      ]);

      const sections = [
        {
          id: 'all',
          name: '全部',
          _customized: true,
        } as any,
        ...responses[1],
      ].map((item, index) => this.handleSectionData(item, index));
      if (sections.length === 0) {
        return;
      }

      const postData = responses[2];
      postData.content.map((item) => this.handlePostItem(item));

      this.setData(
        {
          tabs: sections,
          activeTab: sections[0].id,
          activeTabIndex: sections[0]._index,
          postData,
        },
        () => {
          emitter.emit('ready_index_page');
        }
      );
    } catch (e) {
      this.openTip(parseError(e).message);
      this.closeTip(3000);
    }
  },

  onReady() {
    emitter.on('ready_index_page', this.initIndexBoxHeight);
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

  onReachBottom() {
    if (!this.data.postData.pageable.next) {
      return;
    }
    this.bindTapLoadMore();
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
    for (let i = 0; i < this.data.tabs.length; i++) {
      const item = this.data.tabs[i];
      await (await memoryCache).del(item.id + '_postData_index_page');
    }
    emitter.all.delete('ready_index_page');
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

  onTabClick(e: any) {
    this.setData({ activeTab: e.detail.id, activeTabIndex: e.detail.index });
  },

  onChange(e: any) {
    const index = e.detail.index;
    const id = e.detail.id;

    const cacheKey = id + '_postData_index_page';
    void memoryCache.then((cache) => {
      void cache.get(cacheKey).then((cacheData) => {
        if (cacheData === undefined) {
          if (id === 'all') {
            void clientQueryAllPost().then(async (response) => {
              await cache.set(
                cacheKey,
                this.handleQueryPostData(response),
                30000
              );
            });
          } else {
            void clientQuerySectionDetailsById({ id }).then(
              async (response) => {
                await cache.set(
                  cacheKey,
                  this.handleQueryPostData(response.data ?? this.data.postData),
                  30000
                );
              }
            );
          }
        } else {
          if (id === 'all') {
            this.handleQueryPostData(cacheData as IPagination<IPost>);
          } else {
            this.handleQueryPostData(cacheData as IPagination<IPost>);
          }
        }
      });
    });

    this.setData({ activeTab: e.detail.id, activeTabIndex: index });
  },

  bindLoadContentCover(e: any) {
    const index: number = e.target.dataset.index;
    this.setData({
      [`tabs[${index}]._loaded`]: true,
    });
  },

  bindTapLoadMore() {
    const activeTab = this.data.activeTab as any;
    const queryParams = this.data.queryParams;
    const pageable = this.data.postData.pageable;
    const content = this.data.postData.content;
    const isLoadMore = this.data.isLoadMore;

    if (isLoadMore || !pageable.next) {
      return;
    }

    this.setData({ isLoadMore: true });

    const query = {
      ...queryParams,
      page: Math.min(queryParams.page + 1, pageable.pages),
    };

    if (activeTab === 'all') {
      void clientQueryAllPost({
        query,
      }).then((response) => {
        const postData = {
          content: [...content, ...response.content].map((item) =>
            this.handlePostItem(item)
          ),
          pageable: response.pageable,
        };

        this.setData(
          {
            postData,
            queryParams: query,
            isLoadMore: false,
          },
          () => {
            this.initIndexBoxHeight();
          }
        );

        void memoryCache.then(async (cache) => {
          await cache.set('all_postData_index_page', postData, 30000);
        });
      });
    } else {
      void clientQuerySectionDetailsById({ id: activeTab }).then(
        async (response) => {
          const data = response.data;
          if (data === undefined) {
            return;
          }

          const postData = {
            content: [...content, ...data.content].map((item) =>
              this.handlePostItem(item)
            ),
            pageable: data.pageable,
          };

          this.setData(
            {
              postData,
              queryParams: query,
              isLoadMore: false,
            },
            () => {
              this.initIndexBoxHeight();
            }
          );

          void memoryCache.then(async (cache) => {
            await cache.set(
              `${activeTab as string}_postData_index_page`,
              postData,
              30000
            );
          });
        }
      );
    }
  },

  initIndexBoxHeight() {
    wx.createSelectorQuery()
      .select(`#tab_content_${this.data.activeTab}`)
      .boundingClientRect((res) => {
        if (res === null) {
          return;
        }

        this.setData({
          indexBoxHeight: `${Math.max(res.height * 2, 0)}`,
        });
      })
      .exec();
  },

  handlePostItem(item: IPost) {
    const mediumAvatarUrl = item.user!.details.mediumAvatarUrl;
    if (hasText(mediumAvatarUrl)) {
      // @ts-expect-error xxx
      item.user!.details._avatarUrl = isHttpOrHttps(mediumAvatarUrl)
        ? mediumAvatarUrl
        : config.APP_OSS_SERVER + mediumAvatarUrl;
    } else {
      item.user!.details._avatarUrl = '../../assets/images/avatar.png';
    }

    item._fromNow = fromNow(item.contentUpdatedOn);
    item.overview = item.overview ?? '';
    item.images = item.images ?? [];
    item.details._commentTotalText = formatTotal(item.details.commentCount);
    item.details._replyTotalText = formatTotal(item.details.replyCount);
    item.details._viewTotalText = formatTotal(item.details.viewCount);
    return item;
  },

  handleSectionData(item: ISectionClient, index: number) {
    const cover = item.cover;
    if (hasText(cover)) {
      // @ts-expect-error xxx
      item.cover = isHttpOrHttps(cover) ? cover : config.APP_OSS_SERVER + cover;
    }

    item.overview = item.overview ?? '';
    item._index = index;
    item._loaded = false;
    item._customized = false;
    return item;
  },

  handleQueryPostData(data: IPagination<IPost>) {
    const newContent = data.content;
    if (newContent.length === 0) {
      return;
    }

    const results: IPost[] = [];
    const content = this.data.postData.content;
    newContent.forEach((newItem) => {
      const find = content.find((item) => item.id === newItem.id);
      if (find !== undefined) {
        results.push(find);
      } else {
        results.push(this.handlePostItem(newItem));
      }
    });

    const postData = {
      content: results,
      pageable: data.pageable,
    };
    this.setData(
      {
        postData,
        queryParams: {
          page: postData.pageable.page,
        },
      },
      () => {
        this.initIndexBoxHeight();
      }
    );
    return postData;
  },

  handleShare(
    source: string
  ): ICustomShareContent | ICustomTimelineContent | IAddToFavoritesContent {
    const custom:
      | ICustomShareContent
      | ICustomTimelineContent
      | IAddToFavoritesContent = {
      title: 'youdeyiwu - 尤得一物',
    };

    if (source === 'f') {
      (custom as ICustomShareContent).path = '/pages/index/index?s=f';
    } else if (source === 'f') {
      (custom as ICustomTimelineContent).query = 's=fc';
    } else if (source === 'f') {
      (custom as IAddToFavoritesContent).query = 's=fa';
    }

    const first = this.data.postData.content[0];
    if (first.images !== undefined && first.images.length !== 0) {
      custom.imageUrl = first.images[0];
    }
    return custom;
  },
});
