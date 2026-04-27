Page({
  data: {
    orderId: '',
    amount: '0.00',
    payTime: ''
  },

  onLoad(options) {
    const { orderId, amount } = options
    const now = new Date()
    const payTime = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')} ${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}:${String(now.getSeconds()).padStart(2, '0')}`
    
    this.setData({
      orderId: orderId || '',
      amount: amount || '0.00',
      payTime
    })
  },

  // 查看订单
  viewOrder() {
    wx.switchTab({ url: '/pages/customerOrder/customerOrder' })
  },

  // 返回首页
  backHome() {
    wx.switchTab({ url: '/pages/customerHome/customerHome' })
  }
})
