const { customerLoginApi, shopApi } = require('../../utils/customerApi.js')

Page({
  data: {
    shopOpen: true,
    logging: false,
  },

  onLoad() {
    // 先检查是否已登录，已登录直接跳转
    const token = wx.getStorageSync('userToken')
    if (token) {
      this.checkTokenAndRedirect()
    }
    // 获取店铺营业状态
    this.fetchShopStatus()
  },

  // 检查 token 是否有效（简单方式：直接尝试跳转）
  checkTokenAndRedirect() {
    wx.switchTab({ url: '/pages/customerHome/customerHome' })
  },

  // 获取店铺状态
  fetchShopStatus() {
    shopApi.getStatus().then(status => {
      this.setData({ shopOpen: status === 1 })
    }).catch(() => {
      this.setData({ shopOpen: true }) // 默认营业
    })
  },

  // 微信头像选择触发登录（chooseAvatar 方式，不需要 getUserProfile）
  onChooseAvatar(e) {
    const avatarUrl = e.detail.avatarUrl
    this.setData({ logging: true })

    // 1. 先拿 code
    wx.login({
      success: (loginRes) => {
        if (!loginRes.code) {
          wx.showToast({ title: '获取授权失败', icon: 'none' })
          this.setData({ logging: false })
          return
        }

        // 2. 拿 code + 头像 发后端登录
        customerLoginApi.wxLogin(loginRes.code).then(res => {
          // 3. 存 token 和用户信息
          wx.setStorageSync('userToken', res.token)
          wx.setStorageSync('userInfo', {
            id: res.id,
            openid: res.openid,
            avatarUrl: avatarUrl || '',
          })

          wx.showToast({ title: '登录成功', icon: 'success' })
          setTimeout(() => {
            wx.switchTab({ url: '/pages/customerHome/customerHome' })
          }, 1200)
        }).catch(err => {
          console.error('登录失败', err)
          wx.showToast({ title: '登录失败，请重试', icon: 'none' })
          this.setData({ logging: false })
        })
      },
      fail: () => {
        wx.showToast({ title: '微信授权失败', icon: 'none' })
        this.setData({ logging: false })
      },
    })
  },
})
