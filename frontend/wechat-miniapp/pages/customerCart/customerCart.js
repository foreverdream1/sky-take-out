const { cartApi, addressApi, orderApi } = require('../../utils/customerApi.js')

Page({
  data: {
    // 购物车数据
    cartList: [],
    totalAmount: 0,
    totalCount: 0,
    
    // 地址
    addressList: [],
    selectedAddress: null,
    showAddressModal: false,
    
    // 备注
    remark: '',
    
    // 配送时间
    deliveryTime: '立即送达',
    showTimeModal: false,
    timeOptions: ['立即送达', '12:00', '12:30', '13:00', '17:30', '18:00', '18:30'],
  },

  onLoad() {
    this.loadCart()
    this.loadAddressList()
  },

  onShow() {
    this.loadCart()
    this.loadAddressList()
  },

  // ========== 购物车（对接后端） ==========
  loadCart() {
    cartApi.list().then(list => {
      const totalCount = list.reduce((sum, item) => sum + item.number, 0)
      const totalAmount = list.reduce((sum, item) => sum + (item.amount * item.number), 0)
      this.setData({
        cartList: list || [],
        totalCount,
        totalAmount,
      })
    }).catch(() => {
      this.setData({ cartList: [], totalCount: 0, totalAmount: 0 })
    })
  },

  // 增加数量
  onPlusTap(e) {
    const item = e.currentTarget.dataset.item
    const data = item.dishId 
      ? { dishId: item.dishId, dishFlavor: item.dishFlavor || '' }
      : { setmealId: item.setmealId }
    
    cartApi.add(data).then(() => {
      this.loadCart()
    })
  },

  // 减少数量
  onMinusTap(e) {
    const item = e.currentTarget.dataset.item
    const data = item.dishId 
      ? { dishId: item.dishId, dishFlavor: item.dishFlavor || '' }
      : { setmealId: item.setmealId }
    
    cartApi.sub(data).then(() => {
      this.loadCart()
    })
  },

  // 清空购物车
  onClearCart() {
    wx.showModal({
      title: '提示',
      content: '确定清空购物车吗？',
      success: (res) => {
        if (res.confirm) {
          cartApi.clean().then(() => {
            wx.showToast({ title: '已清空', icon: 'success' })
            this.loadCart()
          })
        }
      },
    })
  },

  // ========== 地址 ==========
  loadAddressList() {
    addressApi.list().then(list => {
      // 找出默认地址
      const defaultAddr = list.find(a => a.isDefault === 1)
      this.setData({
        addressList: list || [],
        selectedAddress: defaultAddr || list[0] || null,
      })
    }).catch(() => {
      this.setData({ addressList: [], selectedAddress: null })
    })
  },

  // 点击地址栏 → 跳转地址列表页
  onSelectAddressTap() {
    wx.navigateTo({ url: '/pages/addressList/addressList?from=cart' })
  },

  closeAddressModal() {
    this.setData({ showAddressModal: false })
  },

  // 选择地址（弹窗内）
  onAddressSelect(e) {
    const address = e.currentTarget.dataset.address
    this.setData({
      selectedAddress: address,
      showAddressModal: false,
    })
  },

  // 管理地址 / 新增地址
  onManageAddress() {
    wx.navigateTo({ url: '/pages/addressList/addressList?from=cart' })
  },

  // ========== 配送时间 ==========
  onSelectTimeTap() {
    this.setData({ showTimeModal: true })
  },

  closeTimeModal() {
    this.setData({ showTimeModal: false })
  },

  onTimeSelect(e) {
    const time = e.currentTarget.dataset.time
    this.setData({
      deliveryTime: time,
      showTimeModal: false,
    })
  },

  // ========== 备注 ==========
  onRemarkInput(e) {
    this.setData({ remark: e.detail.value })
  },

  // ========== 提交订单 ==========
  onSubmitOrder() {
    const { cartList, selectedAddress, totalAmount, remark, deliveryTime } = this.data
    
    if (cartList.length === 0) {
      wx.showToast({ title: '购物车是空的', icon: 'none' })
      return
    }
    
    if (!selectedAddress) {
      wx.showToast({ title: '请选择收货地址', icon: 'none' })
      return
    }

    // 计算预计送达时间（后端要求 yyyy-MM-dd HH:mm:ss 格式的 LocalDateTime）
    const now = new Date()
    // 若选择"立即送达"则加30分钟，否则解析用户选择的时间
    let estimatedDate = new Date(now.getTime() + 30 * 60 * 1000)
    if (deliveryTime && deliveryTime !== '立即送达') {
      const parts = deliveryTime.split(':')
      if (parts.length === 2) {
        estimatedDate = new Date(now)
        estimatedDate.setHours(parseInt(parts[0]), parseInt(parts[1]), 0, 0)
        // 如果已过当日该时间，顺延到明天
        if (estimatedDate <= now) {
          estimatedDate.setDate(estimatedDate.getDate() + 1)
        }
      }
    }
    const pad = n => String(n).padStart(2, '0')
    const estimatedDeliveryTime = `${estimatedDate.getFullYear()}-${pad(estimatedDate.getMonth() + 1)}-${pad(estimatedDate.getDate())} ${pad(estimatedDate.getHours())}:${pad(estimatedDate.getMinutes())}:${pad(estimatedDate.getSeconds())}`

    // 构建订单提交数据（字段对应后端 OrdersSubmitDTO）
    const orderData = {
      addressBookId: selectedAddress.id,
      amount: parseFloat(totalAmount.toFixed(2)),
      deliveryStatus: deliveryTime === '立即送达' ? 1 : 0,
      estimatedDeliveryTime: estimatedDeliveryTime,
      packAmount: 0,
      payMethod: 1, // 1=微信支付
      remark: remark || '',
      tablewareNumber: 1,
      tablewareStatus: 1, // 1=按餐量提供
    }

    wx.showLoading({ title: '提交中...' })
    
    orderApi.submit(orderData).then(res => {
      wx.hideLoading()
      
      // 提交成功后主动清空购物车（后端 ServiceImpl 有 Bug 导致可能未清空，前端兜底处理）
      cartApi.clean().then(() => {
        this.loadCart()
      }).catch(() => {
        this.loadCart()
      })

      // 兼容后端返回 DTO（res 可能没有 id/orderAmount 字段）
      const orderId = (res && res.id) ? res.id : ''
      const orderAmount = (res && res.orderAmount) ? res.orderAmount : totalAmount.toFixed(2)

      // 跳转到支付成功页
      wx.redirectTo({
        url: `/pages/paySuccess/paySuccess?orderId=${orderId}&amount=${orderAmount}`
      })
    }).catch(err => {
      wx.hideLoading()
      wx.showToast({ title: (err && err.msg) ? err.msg : '下单失败，请重试', icon: 'none' })
    })
  },
})
