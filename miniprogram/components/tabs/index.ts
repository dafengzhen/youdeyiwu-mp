Component({
  options: {
    addGlobalClass: true,
    pureDataPattern: /^_/,
    multipleSlots: true,
  },

  properties: {
    tabs: { type: Array, value: [] },
    tabClass: { type: String, value: '' },
    swiperClass: { type: String, value: '' },
    activeClass: { type: String, value: '' },
    tabUnderlineColor: { type: String, value: '#07c160' },
    tabActiveTextColor: { type: String, value: '#000000' },
    tabInactiveTextColor: { type: String, value: '#000000' },
    tabBackgroundColor: { type: String, value: '#ffffff' },
    activeTab: null,
    activeTabIndex: { type: Number, value: 0 },
    duration: { type: Number, value: 500 },
  },

  data: {
    scrollIntoView: 0,
  },

  observers: {
    activeTab: function (activeTab) {
      this.setData({ scrollIntoView: activeTab });
    },
  },

  methods: {
    handleTabClick(e: any) {
      const index = e.currentTarget.dataset.index;
      const id = this.data.tabs[index].id;
      this.triggerEvent('tabClick', { id, index });
    },

    handleSwiperChange(e: any) {
      const index = e.detail.current;
      const id = this.data.tabs[index].id;
      this.triggerEvent('change', { id, index });
    },
  },
});
