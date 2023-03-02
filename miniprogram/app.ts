import { type IApp } from '@/interfaces';
import { showModal } from '@/tools';

App<IApp>({
  globalData: {
    _isQuickLogin: false,
    _queryStrings: {},
  },

  onLaunch() {
    const updateManager = wx.getUpdateManager();
    updateManager.onUpdateReady(() => {
      void showModal({
        title: '更新提示',
        content: '新版本已经准备好，是否重启应用？',
      }).then((res) => {
        if (res.confirm) {
          updateManager.applyUpdate();
        }
      });
    });
  },
});
