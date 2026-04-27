const app = getApp()

Page({
  data: {
    userInfo: {},
  },

  onShow() {
    const userInfo = wx.getStorageSync('userInfo') || {}
    const name = userInfo.name || '微信用户'
    this.setData({
      userInfo: {
        ...userInfo,
        name: name,
      },
    })
  },

  // 切换头像（调用微信头像选择）
  changeAvatar() {
    wx.chooseAvatar({
      success: (res) => {
        const avatarUrl = res.avatarUrl
        const userInfo = wx.getStorageSync('userInfo') || {}
        userInfo.avatarUrl = avatarUrl
        wx.setStorageSync('userInfo', userInfo)
        this.setData({ userInfo })
        wx.showToast({ title: '头像已更新', icon: 'success' })
      },
    })
  },

  // 跳转订单页
  goToOrders(e) {
    const status = e.currentTarget.dataset.status
    if (status) {
      wx.navigateTo({ url: `/pages/customerOrder/customerOrder?status=${status}` })
    } else {
      wx.switchTab({ url: '/pages/customerOrder/customerOrder' })
    }
  },

  // 跳转地址管理
  goToAddress() {
    wx.navigateTo({ url: '/pages/addressList/addressList' })
  },

  showService() {
    wx.showToast({ title: '客服功能开发中', icon: 'none' })
  },

  showAbout() {
    wx.showModal({
      title: '关于我们',
      content: '瑞吉外卖 v1.0.0\n精选美食，送到家门口\n\n如有疑问请联系客服',
      showCancel: false,
    })
  },

  onLogout() {
    wx.showModal({
      title: '退出登录',
      content: '确定要退出登录吗？',
      success: res => {
        if (res.confirm) {
          wx.removeStorageSync('userToken')
          wx.removeStorageSync('userInfo')
          app.globalData.token = ''
          wx.reLaunch({ url: '/pages/customerLogin/customerLogin' })
        }
      },
    })
  },
})
