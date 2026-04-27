// app.js
App({
  globalData: {
    baseUrl: 'http://localhost:8080',
    token: '',
    userInfo: null,   // { id, name, username, avatarUrl, token }
    nickName: '',
    avatarUrl: '',
    phone: '',
  },

  onLaunch() {
    const token = wx.getStorageSync('userToken')
    const userInfo = wx.getStorageSync('userInfo')
    if (token) this.globalData.token = token
    if (userInfo) {
      this.globalData.userInfo = userInfo
      this.globalData.nickName = userInfo.name || userInfo.nickName || ''
      this.globalData.avatarUrl = userInfo.avatarUrl || ''
    }
  },
})
