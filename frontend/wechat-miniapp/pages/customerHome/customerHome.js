const { categoryApi, dishApi, setmealApi, cartApi, shopApi } = require('../../utils/customerApi.js')

Page({
  data: {
    // 店铺状态
    shopStatus: 1,
    
    // 分类数据
    categories: [],
    activeCategoryId: null,
    
    // 菜品数据
    dishList: [],
    setmealList: [],
    
    // 购物车数据（来自后端）
    cartList: [],
    cartTotalCount: 0,
    cartTotalAmount: 0,
    
    // 加载状态
    loading: true,
    categoryLoading: true,
    
    // 菜品规格弹窗
    showDishPopup: false,
    currentDish: null,
    
    // 套餐详情弹窗
    showSetmealModal: false,
    currentSetmeal: null,
    setmealDishes: [],
    setmealQuantity: 1,
    setmealTotalPrice: '0.00',
  },

  onLoad() {
    this.loadShopStatus()
    this.loadCategories()
    this.loadCart()
  },

  onShow() {
    // 每次显示页面刷新购物车
    this.loadCart()
  },

  // ========== 店铺状态 ==========
  loadShopStatus() {
    shopApi.getStatus().then(status => {
      this.setData({ shopStatus: status })
    }).catch(() => {
      // 默认营业
      this.setData({ shopStatus: 1 })
    })
  },

  // ========== 分类 ==========
  loadCategories() {
    this.setData({ categoryLoading: true })
    categoryApi.list(1).then(list => {
      if (list && list.length > 0) {
        this.setData({
          categories: list,
          activeCategoryId: list[0].id,
          categoryLoading: false,
        })
        this.loadGoodsByCategory(list[0].id)
      } else {
        this.setData({ categoryLoading: false, loading: false })
      }
    }).catch(() => {
      this.setData({ categoryLoading: false, loading: false })
    })
  },

  onCategoryTap(e) {
    const id = e.currentTarget.dataset.id
    if (id === this.data.activeCategoryId) return
    this.setData({
      activeCategoryId: id,
      dishList: [],
      setmealList: [],
      loading: true,
    })
    this.loadGoodsByCategory(id)
  },

  // ========== 加载菜品和套餐 ==========
  loadGoodsByCategory(categoryId) {
    this.setData({ loading: true })
    
    // 同时加载菜品和套餐
    Promise.all([
      dishApi.list(categoryId).catch(() => []),
      setmealApi.list(categoryId).catch(() => []),
    ]).then(([dishes, setmeals]) => {
      this.setData({
        dishList: dishes || [],
        setmealList: setmeals || [],
        loading: false,
      })
    }).catch(() => {
      this.setData({ loading: false })
    })
  },

  // ========== 购物车（对接后端） ==========
  loadCart() {
    cartApi.list().then(list => {
      const totalCount = list.reduce((sum, item) => sum + item.number, 0)
      const totalAmount = list.reduce((sum, item) => sum + (item.amount * item.number), 0)
      this.setData({
        cartList: list || [],
        cartTotalCount: totalCount,
        cartTotalAmount: totalAmount,
      })
    }).catch(() => {
      // 未登录时不报错
    })
  },

  // 获取购物车中某商品的数量
  getCartItemCount(id, type, flavorText = '') {
    const item = this.data.cartList.find(cartItem => {
      const matchId = type === 'dish' 
        ? cartItem.dishId === id 
        : cartItem.setmealId === id
      const matchFlavor = type === 'dish' 
        ? (cartItem.dishFlavor || '') === flavorText 
        : true
      return matchId && matchFlavor
    })
    return item ? item.number : 0
  },

  // ========== 加购逻辑 ==========
  // 点击加号按钮
  onAddTap(e) {
    const { item, type } = e.currentTarget.dataset
    
    if (type === 'dish') {
      // 有口味 → 弹出口味选择
      if (item.flavors && item.flavors.length > 0) {
        this.openFlavorModal(item)
      } else {
        // 无口味 → 直接加购
        this.addToCart({
          dishId: item.id,
          dishFlavor: '',
        })
      }
    } else {
      // 套餐 → 弹出套餐详情
      this.openSetmealModal(item)
    }
  },

  // 添加到购物车（调用后端）
  addToCart(data) {
    cartApi.add(data).then(() => {
      wx.showToast({ title: '已加入购物车', icon: 'success' })
      this.loadCart()
    }).catch(err => {
      console.error('加购失败:', err)
    })
  },

  // 减少数量
  onMinusTap(e) {
    const { item, type } = e.currentTarget.dataset
    const data = type === 'dish' 
      ? { dishId: item.id, dishFlavor: '' }
      : { setmealId: item.id }
    
    cartApi.sub(data).then(() => {
      this.loadCart()
    }).catch(err => {
      console.error('减少失败:', err)
    })
  },

  // ========== 菜品规格弹窗（使用组件） ==========
  openFlavorModal(dish) {
    this.setData({
      showDishPopup: true,
      currentDish: dish
    })
  },

  closeDishPopup() {
    this.setData({ showDishPopup: false })
  },

  // 弹窗确认加购
  onDishPopupAdd(e) {
    const { dishId, flavors } = e.detail
    cartApi.add({
      dishId: dishId,
      dishFlavor: flavors
    }).then(() => {
      wx.showToast({ title: '已加入购物车', icon: 'success' })
      this.loadCart()
    }).catch(err => {
      console.error('加购失败:', err)
    })
  },

  // ========== 套餐弹窗 ==========
  openSetmealModal(setmeal) {
    this.setData({
      showSetmealModal: true,
      currentSetmeal: setmeal,
      setmealDishes: [],
      setmealQuantity: 1,
      setmealTotalPrice: (setmeal.price * 1).toFixed(2),
    })
    
    // 加载套餐包含的菜品
    setmealApi.getDishes(setmeal.id).then(list => {
      this.setData({ setmealDishes: list || [] })
    }).catch(() => {
      this.setData({ setmealDishes: [] })
    })
  },

  closeSetmealModal() {
    this.setData({ showSetmealModal: false })
  },

  // 套餐数量变化
  onSetmealQuantityChange(e) {
    const type = e.currentTarget.dataset.type
    let quantity = this.data.setmealQuantity
    
    if (type === 'minus' && quantity > 1) {
      quantity--
    } else if (type === 'plus' && quantity < 99) {
      quantity++
    }
    
    const price = this.data.currentSetmeal ? this.data.currentSetmeal.price : 0
    this.setData({
      setmealQuantity: quantity,
      setmealTotalPrice: (price * quantity).toFixed(2),
    })
  },

  // 套餐确认加购
  onSetmealConfirm() {
    const { currentSetmeal, setmealQuantity } = this.data
    
    // 多次调用 add 接口
    const addPromises = []
    for (let i = 0; i < setmealQuantity; i++) {
      addPromises.push(cartApi.add({
        setmealId: currentSetmeal.id,
      }))
    }
    
    Promise.all(addPromises).then(() => {
      wx.showToast({ title: '已加入购物车', icon: 'success' })
      this.closeSetmealModal()
      this.loadCart()
    }).catch(err => {
      console.error('加购失败:', err)
    })
  },

  // ========== 底部购物车栏 ==========
  onCartTap() {
    if (this.data.cartTotalCount === 0) {
      wx.showToast({ title: '购物车是空的', icon: 'none' })
      return
    }
    wx.navigateTo({ url: '/pages/customerCart/customerCart' })
  },

  onSubmitOrder() {
    if (this.data.cartTotalCount === 0) {
      wx.showToast({ title: '购物车是空的', icon: 'none' })
      return
    }
    wx.navigateTo({ url: '/pages/orderConfirm/orderConfirm' })
  },
})
