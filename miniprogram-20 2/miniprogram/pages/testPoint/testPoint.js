// pages/chapter-practice/chapter-practice.js
Page({
  /**
   * 页面的初始数据
   */
  data: {
    chapters: [
      {
        id: 'info-protection',
        title: '信息保护',
        desc: '涵盖数据加密、隐私保护等知识点',
        icon: '/images/info-protection.png'
      },
      {
        id: 'network-protection',
        title: '网络防护',
        desc: '包含防火墙、入侵检测等网络防护技术',
        icon: '/images/network-protection.png'
      },
      {
        id: 'app-security',
        title: '应用安全',
        desc: '涉及Web安全、移动应用安全等实际应用',
        icon: '/images/app-security.png'
      }
    ]
  },

  /**
   * 跳转到对应章节的练习页面
   */
  navigateToPractice: function(e) {
    const chapterId = e.currentTarget.dataset.chapter;
    wx.navigateTo({
      url: `/pages/practice/practice?chapter=${chapterId}`,
    });
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function(options) {
    // 可以在这里获取章节数据，如果需要从服务器获取
    // this.getChapterData();
  },

  /**
   * 示例：从服务器获取章节数据
   */
  getChapterData: function() {
    wx.showLoading({
      title: '加载中...',
    });
    
    // 这里替换为实际的API请求
    wx.request({
      url: 'https://your-api-domain.com/api/chapters',
      method: 'GET',
      success: (res) => {
        if (res.data.code === 200) {
          this.setData({
            chapters: res.data.data
          });
        }
      },
      complete: () => {
        wx.hideLoading();
      }
    });
  }
});