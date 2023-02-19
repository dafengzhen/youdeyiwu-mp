import { showToast } from '@/tools';

Component({
  options: {
    addGlobalClass: true,
    pureDataPattern: /^_/,
    multipleSlots: false,
  },

  properties: {
    node: {
      type: Object,
      value: {},
    },
  },

  methods: {
    bindTapCopyLink(e: any) {
      const href = e.currentTarget.dataset.attrs.href;
      wx.setClipboardData({
        data: href,
        success: (_res) => {
          void showToast({ title: '复制链接到剪贴板完成' });
        },
        fail: (rea) => {
          void showToast({ title: rea.errMsg });
        },
      });
    },
    bindTapViewImage(e: any) {
      const src = e.currentTarget.dataset.attrs.src;
      wx.previewImage({
        urls: [src],
        fail: (rea) => {
          void showToast({ title: rea.errMsg });
        },
      });
    },
  },
});
