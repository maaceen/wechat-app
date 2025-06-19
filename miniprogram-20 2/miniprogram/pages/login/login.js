import Dialog from '@vant/weapp/dialog/dialog';
Page({

  /**
   * 页面的初始数据
   */
  data: {
    username: '',
    password: '',
    rememberMe: false,
    loading: false
  },
  // 用户名输入变化
  onUsernameChange: function(e) {
    this.setData({
      username: e.detail
    });
  },

  // 密码输入变化
  onPasswordChange: function(e) {
    this.setData({
      password: e.detail
    });
  },

  // 提交表单
  onSubmit: function() {
    const { username, password } = this.data;
    // 这里可以添加表单验证
    if (!username || !password) {
      wx.showToast({
        title: '请填写完整信息',
        icon: 'none'
      });
      return;
    }
    //向本地mysql请求数据
    var that = this
    wx.request({
        url: 'http://127.0.0.1:3000/',
        success: function (res) {
            console.log(res.data);
            console.log(res.data[0].username)
            console.log(res.data[0].password)
            // that.setData({ names: res.data })
            if(username === res.data[0].username && password == res.data[0].password){
                wx.showToast({
                    title: '登录成功',
                    icon: 'success'
                  });
                  
                  wx.redirectTo({
                    url: '/pages/index/index',
                  })
  
            }else{
                Dialog.confirm({
                    title: '',
                    message: '您还未注册，需要注册吗？',
                  })
                    .then(() => {
                        wx.redirectTo({
                            url: '/pages/register/register',
                          })
                    })
                    .catch(() => {
                      // on cancel
                    });
            }
        }
    }) 
  },
  onForgotPwd() {
    wx.showToast({
      title: '请联系管理员重置密码',
      icon: 'none'
    });
  },
  /**
   * 生命周期函数--监听页面加载
   */
  onLoad(options) {
    
  },



})