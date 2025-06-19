Page({
  data: {
    avatarUrl: '',
    defaultAvatarUrl: '/images/default_avatar.png',
    nickName: '',
    defaultNickName: '点击设置昵称',
    userId: 'NCRE20230001',
    userLevel: '二级考生',
    examCount: 12,
    correctRate: '82%',
    studyDays: 45,
    nextExam: {
      name: '计算机网络安全知识活动',
      timeLeft: '15天6小时'
    }
  },

  onLoad() {
    // 可以在这里添加从服务器获取用户数据的逻辑
    this.getUserInfo();
  },

  getUserInfo() {
    // 模拟获取用户信息
    setTimeout(() => {
      this.setData({
        avatarUrl: '/images/user_avatar.png',
        nickName: '编程小能手'
      });
    }, 500);
  },

  onChangeAvatar() {
    wx.chooseMedia({
      count: 1,
      mediaType: ['image'],
      sourceType: ['album', 'camera'],
      success: (res) => {
        this.setData({
          avatarUrl: res.tempFiles[0].tempFilePath
        });
        wx.showToast({
          title: '头像更新成功',
          icon: 'success'
        });
      }
    });
  },

  onOpenNicknameLayer() {
    wx.showModal({
      title: '修改昵称',
      content: '请输入新的昵称',
      editable: true,
      placeholderText: this.data.nickName || this.data.defaultNickName,
      success: (res) => {
        if (res.confirm && res.content) {
          this.setData({
            nickName: res.content
          });
          wx.showToast({
            title: '昵称修改成功',
            icon: 'success'
          });
        }
      }
    });
  },

  onShareAppMessage() {
    return {
      title: '计算机等级考试系统',
      path: '/pages/user/user'
    };
  }
});