const { addressApi } = require('../../utils/customerApi')

Page({
  data: {
    addressList: [],
    from: '' // 来源页面，如果是order则选择后返回
  },

  onLoad(options) {
    this.setData({ from: options.from || '' })
  },

  onShow() {
    this.loadAddressList()
  },

  // 加载地址列表
  async loadAddressList() {
    try {
      const list = await addressApi.list()
      // 默认地址排在前面
      list.sort((a, b) => (b.isDefault || 0) - (a.isDefault || 0))
      this.setData({ addressList: list })
    } catch (err) {
      console.log('加载地址失败', err)
      wx.showToast({ title: '加载失败', icon: 'none' })
    }
  },

  // 选择地址
  selectAddress(e) {
    const item = e.currentTarget.dataset.item
    if (this.data.from === 'order') {
      wx.setStorageSync('selectedAddress', item)
      wx.navigateBack()
    }
  },

  // 阻止冒泡
  preventBubble() {
    // 什么都不做，只是阻止冒泡
  },

  // 编辑地址
  editAddress(e) {
    const id = e.currentTarget.dataset.id
    wx.navigateTo({ url: `/pages/addressEdit/addressEdit?id=${id}` })
  },

  // 删除地址
  deleteAddress(e) {
    const id = e.currentTarget.dataset.id
    wx.showModal({
      title: '提示',
      content: '确定删除该地址吗？',
      success: async (res) => {
        if (res.confirm) {
          try {
            await addressApi.delete(id)
            wx.showToast({ title: '删除成功', icon: 'success' })
            this.loadAddressList()
          } catch (err) {
            wx.showToast({ title: '删除失败', icon: 'none' })
          }
        }
      }
    })
  },

  // 设置默认地址
  setDefault(e) {
    const id = e.currentTarget.dataset.id
    addressApi.setDefault(id).then(() => {
      wx.showToast({ title: '设置成功', icon: 'success' })
      this.loadAddressList()
    }).catch(err => {
      wx.showToast({ title: err.msg || '设置失败', icon: 'none' })
    })
  },

  // 添加地址
  addAddress() {
    wx.navigateTo({ url: '/pages/addressEdit/addressEdit' })
  }
})
