import config from '@/config';

Page({
  data: {
    title: '操作完成',
    desc: '',
    tip: '',
    appNameAbbr: config.APP_NAME_ABBR,
  },

  onLoad(query = {}) {
    this.setData({
      title: query.t ?? '操作完成',
      desc: query.d ?? '',
      tip: query.p ?? '',
    });
  },
});
