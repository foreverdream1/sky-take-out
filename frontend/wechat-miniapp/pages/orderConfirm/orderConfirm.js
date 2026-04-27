const { cartApi, addressApi, orderApi } = require('../../utils/customerApi')

Page({
  data: {
    address: null,
    cartList: [],
    totalAmount: '0.00',
    deliveryTime: '',
    remark: '',
    tableware: '1份',
    payMethod: 1
  },

  onLoad() {
    this.loadCartData()
    this.loadDefaultAddress()
    this.setDeliveryTime()
  },

  onShow() {
    // 从地址列表返回时刷新地址
    const selectedAddress = wx.getStorageSync('selectedAddress')
    if (selectedAddress) {
      this.setData({ address: selectedAddress })
      wx.removeStorageSync('selectedAddress')
    }
  },

  // 设置预计送达时间
  setDeliveryTime() {
    const now = new Date()
    now.setMinutes(now.getMinutes() + 30)
    const hours = now.getHours().toString().padStart(2, '0')
    const minutes = now.getMinutes().toString().padStart(2, '0')
    this.setData({ deliveryTime: `${hours}:${minutes}` })
  },

  // 加载购物车数据
  async loadCartData() {
    try {
      const cart = await cartApi.list()
      const total = cart.reduce((sum, item) => sum + (item.amount * item.number), 0)
      this.setData({
        cartList: cart,
        totalAmount: total.toFixed(2)
      })
    } catch (err) {
      console.log('加载购物车失败', err)
    }
  },

  // 加载默认地址
  async loadDefaultAddress() {
    try {
      const address = await addressApi.getDefault()
      this.setData({ address })
    } catch (err) {
      console.log('加载地址失败', err)
    }
  },

  // 选择地址
  selectAddress() {
    wx.navigateTo({ url: '/pages/addressList/addressList?from=order' })
  },

  // 选择备注
  selectRemark() {
    wx.showModal({
      title: '订单备注',
      editable: true,
      placeholderText: '请输入备注信息（如：少放辣、不要葱等）',
      success: (res) => {
        if (res.confirm && res.content) {
          this.setData({ remark: res.content })
        }
      }
    })
  },

  // 选择餐具
  selectTableware(e) {
    this.setData({ tableware: e.currentTarget.dataset.value })
  },

  // 选择支付方式
  selectPayMethod(e) {
    this.setData({ payMethod: parseInt(e.currentTarget.dataset.method) })
  },

  // 提交订单
  async submitOrder() {
    const { address, cartList, remark, payMethod, totalAmount } = this.data
    
    if (!address) {
      wx.showToast({ title: '请选择收货地址', icon: 'none' })
      return
    }

    if (cartList.length === 0) {
      wx.showToast({ title: '购物车为空', icon: 'none' })
      return
    }

    try {
      wx.showLoading({ title: '提交中...' })
      
      const orderData = {
        addressBookId: address.id,
        remark: remark,
        payMethod: payMethod,
        amount: parseFloat(totalAmount)
      }

      const res = await orderApi.submit(orderData)
      wx.hideLoading()

      // 清空购物车
      await cartApi.clean()

      // 跳转到支付成功页（后端返回 OrderSubmitVO: { id, orderNumber, orderAmount }）
      wx.redirectTo({
        url: `/pages/paySuccess/paySuccess?orderId=${res.id}&amount=${res.orderAmount || totalAmount}`
      })
    } catch (err) {
      wx.hideLoading()
      wx.showToast({ title: '提交失败', icon: 'none' })
    }
  }
})
