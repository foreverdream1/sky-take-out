const { dishApi, cartApi } = require('../../utils/customerApi')

Page({
  data: {
    dish: {},
    selectedFlavors: {},
    cartCount: 0,
    cartTotal: 0
  },

  onLoad(options) {
    const { id, categoryId } = options
    if (id) {
      this.loadDishDetail(id)
    } else if (categoryId) {
      this.loadDishByCategory(categoryId)
    }
    this.loadCartInfo()
  },

  onShow() {
    this.loadCartInfo()
  },

  // 加载菜品详情
  async loadDishDetail(id) {
    try {
      const res = await dishApi.getById(id)
      if (res) {
        this.setData({ dish: res })
      } else {
        throw new Error('未找到菜品')
      }
    } catch (err) {
      // 后端用户端暂无 /user/dish/{id} 接口，降级使用占位数据
      this.setData({
        dish: {
          id: parseInt(id),
          name: '加载中...',
          price: 0,
          description: '暂无详情，请返回首页重新选择菜品',
          flavors: []
        }
      })
    }
  },

  // 从分类加载
  async loadDishByCategory(categoryId) {
    try {
      const list = await dishApi.list(categoryId)
      if (list && list.length > 0) {
        this.setData({ dish: list[0] })
      }
    } catch (err) {
      console.log('加载菜品失败', err)
    }
  },

  // 加载购物车信息
  async loadCartInfo() {
    try {
      const cart = await cartApi.list()
      const count = cart.reduce((sum, item) => sum + item.number, 0)
      const total = cart.reduce((sum, item) => sum + (item.amount * item.number), 0)
      this.setData({
        cartCount: count,
        cartTotal: total.toFixed(2)
      })
    } catch (err) {
      console.log('加载购物车失败', err)
    }
  },

  // 选择规格
  selectFlavor(e) {
    const { flavor, value } = e.currentTarget.dataset
    this.setData({
      [`selectedFlavors.${flavor}`]: value
    })
  },

  // 检查是否可以选择
  canAdd() {
    const { dish, selectedFlavors } = this.data
    if (!dish.flavors || dish.flavors.length === 0) return true
    return dish.flavors.every(f => selectedFlavors[f.name])
  },

  // 加入购物车
  async addToCart() {
    if (!this.canAdd()) {
      wx.showToast({ title: '请选择规格', icon: 'none' })
      return
    }

    const { dish, selectedFlavors } = this.data
    const flavorStr = Object.entries(selectedFlavors)
      .map(([k, v]) => `${k}:${v}`)
      .join(';')

    try {
      await cartApi.add({
        dishId: dish.id,
        dishFlavor: flavorStr
      })
      wx.showToast({ title: '已加入购物车', icon: 'success' })
      this.loadCartInfo()
    } catch (err) {
      wx.showToast({ title: '添加失败', icon: 'none' })
    }
  },

  // 立即购买
  buyNow() {
    if (!this.canAdd()) {
      wx.showToast({ title: '请选择规格', icon: 'none' })
      return
    }
    
    this.addToCart().then(() => {
      wx.navigateTo({ url: '/pages/orderConfirm/orderConfirm' })
    })
  },

  // 返回
  goBack() {
    wx.navigateBack()
  },

  // 去购物车
  goToCart() {
    wx.switchTab({ url: '/pages/customerCart/customerCart' })
  }
})
