Page({
  data: {
    username: '',
    password: '',
    confirmPassword: '',
    phone: '',
    loading: false,
    agreed: false
  },

  onUsernameChange(event) {
    this.setData({ username: event.detail });
  },

  onPasswordChange(event) {
    this.setData({ password: event.detail });
  },

  onConfirmPasswordChange(event) {
    this.setData({ confirmPassword: event.detail });
  },

  onPhoneChange(event) {
    this.setData({ phone: event.detail });
  },

  onAgreeChange(event) {
    this.setData({ agreed: event.detail });
  },

  onViewAgreement() {
    wx.navigateTo({
      url: '/pages/agreement/agreement'
    });
  },

  onNavigateToLogin() {
    wx.navigateTo({
      url: '/pages/login/login'
    });
  },

  onRegister() {
    const { username, password, confirmPassword, phone } = this.data;

    // 表单验证
    if (!this.validateForm()) {
      return;
    }

    this.setData({ loading: true });

    // 模拟注册请求
    setTimeout(() => {
      this.setData({ loading: false });
      wx.showToast({
        title: '注册成功',
        icon: 'success'
      });
      
      // 注册成功后跳转到登录页面
      setTimeout(() => {
        wx.navigateTo({
          url: '/pages/login/login'
        });
      }, 1500);
    }, 2000);
  },

  validateForm() {
    const { username, password, confirmPassword, phone, agreed } = this.data;

    if (!username) {
      wx.showToast({
        title: '请输入用户名',
        icon: 'none'
      });
      return false;
    }

    if (username.length < 4 || username.length > 16) {
      wx.showToast({
        title: '用户名需4-16位字符',
        icon: 'none'
      });
      return false;
    }

    if (!password) {
      wx.showToast({
        title: '请输入密码',
        icon: 'none'
      });
      return false;
    }

    if (password.length < 6 || password.length > 20) {
      wx.showToast({
        title: '密码需6-20位字符',
        icon: 'none'
      });
      return false;
    }

    if (password !== confirmPassword) {
      wx.showToast({
        title: '两次密码不一致',
        icon: 'none'
      });
      return false;
    }

    if (phone && !/^1[3-9]\d{9}$/.test(phone)) {
      wx.showToast({
        title: '请输入正确的手机号',
        icon: 'none'
      });
      return false;
    }

    if (!agreed) {
      wx.showToast({
        title: '请同意服务协议',
        icon: 'none'
      });
      return false;
    }

    return true;
  }
});