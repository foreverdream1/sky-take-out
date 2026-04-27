const { orderApi } = require('../../utils/customerApi.js')

const STATUS_TEXT = {
  1: '待付款', 2: '待接单', 3: '已接单',
  4: '派送中', 5: '已完成', 6: '已取消',
}

const STATUS_TAG = {
  1: 'yellow', 2: 'orange', 3: 'blue',
  4: 'green', 5: 'gray', 6: 'red',
}

Page({
  data: {
    activeStatus: -1,
    orderList: [],
    loading: false,
    loadingMore: false,
    page: 1,
    pageSize: 10,
    hasMore: true,
    statusTextMap: STATUS_TEXT,
    statusTagMap: STATUS_TAG,
  },

  onShow() {
    this.checkLogin()
    this.loadOrders(true)
  },

  checkLogin() {
    if (!wx.getStorageSync('userToken')) {
      wx.reLaunch({ url: '/pages/customerLogin/customerLogin' })
    }
  },

  // 切换状态 Tab
  switchTab(e) {
    const status = parseInt(e.currentTarget.dataset.status)
    this.setData({ activeStatus: status, orderList: [], page: 1, hasMore: true })
    this.loadOrders(true)
  },

  // 加载订单列表
  loadOrders(refresh = false) {
    if (this.data.loading) return
    this.setData({ loading: !refresh })
    if (refresh) this.setData({ loading: true })

    const page = refresh ? 1 : this.data.page

    orderApi.history(page, this.data.pageSize).then(res => {
      const list = (res && res.records) ? res.records : (res || [])
      const newList = refresh ? list : [...this.data.orderList, ...list]
      this.setData({
        orderList: newList,
        page: page + 1,
        hasMore: list.length >= this.data.pageSize,
        loading: false,
        loadingMore: false,
      })
    }).catch(() => {
      // 后端未实现时，显示空
      this.setData({ orderList: [], loading: false, loadingMore: false })
    })
  },

  loadMore() {
    if (this.data.loadingMore || !this.data.hasMore) return
    this.setData({ loadingMore: true })
    this.loadOrders(false)
  },

  // 去付款（模拟）
  payOrder(e) {
    wx.showToast({ title: '调用支付中...', icon: 'none' })
    // TODO: 对接微信支付
  },

  // 取消订单
  cancelOrder(e) {
    wx.showModal({
      title: '确认取消',
      content: '确定要取消该订单吗？',
      success: res => {
        if (!res.confirm) return
        orderApi.cancel(e.currentTarget.dataset.id, '用户主动取消').then(() => {
          wx.showToast({ title: '已取消', icon: 'success' })
          this.loadOrders(true)
        }).catch(() => {
          wx.showToast({ title: '取消失败', icon: 'none' })
        })
      },
    })
  },

  // 再来一单
  repeatOrder(e) {
    orderApi.repetition(e.currentTarget.dataset.id).then(() => {
      wx.switchTab({ url: '/pages/customerHome/customerHome' })
    })
  },

  // 确认收货
  confirmReceive(e) {
    wx.showToast({ title: '已确认收货', icon: 'success' })
    this.loadOrders(true)
  },

  goShopping() {
    wx.switchTab({ url: '/pages/customerHome/customerHome' })
  },
})
