App<any>({
  globalData: {},
  async onLaunch() {
    wx.login({
      success: (res) => {
        console.log(res.code);
      },
    });
  },
});
