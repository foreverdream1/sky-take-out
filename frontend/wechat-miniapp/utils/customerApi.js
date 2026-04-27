/**
 * 顾客端 API 封装 - 对接苍穹外卖后端接口
 * 所有接口 baseURL: /user/（对应后端 /user/** 拦截路径）
 * token 从 Storage 读取，由后端 JwtTokenUserInterceptor 校验
 * 后端 user-token-name: authentication（配置于 application.yml）
 */

const BASE_URL = 'http://localhost:8080'

/**
 * 无需 token 的请求（用于获取店铺状态等公开接口）
 */
function requestWithoutToken({ url, method = 'GET', data = {}, header = {}, showLoading = true }) {
  return new Promise((resolve, reject) => {
    if (showLoading) {
      wx.showLoading({ title: '加载中...', mask: true })
    }
    wx.request({
      url: BASE_URL + url,
      method,
      data,
      header: {
        'content-type': 'application/json',
        ...header,
      },
      success: (res) => {
        if (showLoading) wx.hideLoading()

        if (res.statusCode === 200) {
          const { code, msg, data: responseData } = res.data
          if (code === 1) {
            resolve(responseData)
          } else {
            wx.showToast({ title: msg || '请求失败', icon: 'none' })
            reject({ code, msg })
          }
        } else {
          wx.showToast({ title: '网络错误', icon: 'none' })
          reject({ code: res.statusCode, msg: '网络错误' })
        }
      },
      fail: (err) => {
        if (showLoading) wx.hideLoading()
        wx.showToast({ title: '请求失败', icon: 'none' })
        reject(err)
      },
    })
  })
}

/**
 * 需要 token 的请求
 * token 存储在 wx.getStorageSync('userToken')
 * 请求头字段名：authentication（与后端 user-token-name 一致）
 */
function request({ url, method = 'GET', data = {}, header = {}, showLoading = true }) {
  return new Promise((resolve, reject) => {
    if (showLoading) {
      wx.showLoading({ title: '加载中...', mask: true })
    }
    wx.request({
      url: BASE_URL + url,
      method,
      data,
      header: {
        'content-type': 'application/json',
        'authentication': wx.getStorageSync('userToken') || '',
        ...header,
      },
      success: (res) => {
        if (showLoading) wx.hideLoading()

        // token 失效 → 跳转登录页
        if (res.statusCode === 401) {
          wx.showToast({ title: '请先登录', icon: 'none' })
          setTimeout(() => {
            wx.removeStorageSync('userToken')
            wx.removeStorageSync('userInfo')
            wx.reLaunch({ url: '/pages/customerLogin/customerLogin' })
          }, 1500)
          reject({ code: 401, msg: '登录已过期' })
          return
        }

        if (res.statusCode === 200) {
          const { code, msg, data: responseData } = res.data
          if (code === 1) {
            resolve(responseData)
          } else {
            wx.showToast({ title: msg || '请求失败', icon: 'none' })
            reject({ code, msg })
          }
        } else {
          wx.showToast({ title: '网络错误', icon: 'none' })
          reject({ code: res.statusCode, msg: '网络错误' })
        }
      },
      fail: (err) => {
        if (showLoading) wx.hideLoading()
        wx.showToast({ title: '请求失败', icon: 'none' })
        reject(err)
      },
    })
  })
}

// ========== 登录相关 ==========
const customerLoginApi = {
  /**
   * 微信登录（传入 wx.login() 获取的 code，无需 token）
   * 后端接口：POST /user/user/wxLogin
   * Body: { code: '微信返回的code' }
   * 返回: { id, openid, token }
   */
  wxLogin: (code) => requestWithoutToken({
    url: '/user/user/wxLogin',
    method: 'POST',
    data: { code },
  }),

  /**
   * 退出登录（前端清本地存储即可，后端未实现该接口）
   */
  logout: () => Promise.resolve(),
}

// ========== 店铺相关 ==========
const shopApi = {
  /**
   * 获取店铺营业状态（无需 token，已在拦截器白名单）
   * 后端接口：GET /user/shop/status
   * 返回: 1=营业中  0=打烊
   */
  getStatus: () => requestWithoutToken({ url: '/user/shop/status', showLoading: false }),
}

// ========== 分类相关 ==========
const categoryApi = {
  /**
   * 查询分类列表（type: 1=菜品分类  2=套餐分类）
   * 后端接口：GET /user/category/list?type=1
   */
  list: (type) => request({ url: '/user/category/list', data: { type } }),
}

// ========== 菜品相关 ==========
const dishApi = {
  /**
   * 根据分类 ID 查询菜品列表（含口味）
   * 后端接口：GET /user/dish/list?categoryId=xxx
   * 返回: List<DishVO>，每项含 flavors 数组
   */
  list: (categoryId) => request({ url: '/user/dish/list', data: { categoryId } }),

  /**
   * 根据菜品 ID 查询菜品详情
   * 注意：后端用户端暂未提供 /user/dish/{id}，通过分类列表查询第一个匹配项作为替代
   * 如需精确查询，可使用 list + filter 方式
   */
  getById: (id) => {
    // 尝试从 admin 接口获取（该接口有 JWT 校验，通常会返回 401）
    // 降级方案：返回 null，由调用方使用 Mock 数据
    return request({ url: `/user/dish/list`, data: { categoryId: null }, showLoading: false })
      .then(list => {
        if (list && list.length > 0) {
          const found = list.find(d => d.id === parseInt(id) || d.id === id)
          if (found) return found
        }
        return Promise.reject(new Error('未找到菜品'))
      })
  },
}

// ========== 套餐相关 ==========
const setmealApi = {
  /**
   * 根据分类 ID 查询套餐列表
   * 后端接口：GET /user/setmeal/list?categoryId=xxx
   */
  list: (categoryId) => request({ url: '/user/setmeal/list', data: { categoryId } }),

  /**
   * 根据套餐 id 查询包含的菜品
   * 后端接口：GET /user/setmeal/dish/{id}
   */
  getDishes: (id) => request({ url: `/user/setmeal/dish/${id}` }),
}

// ========== 本地模拟数据（购物车接口后端未完全实现时使用） ==========
let mockCart = []

// ========== 购物车相关 ==========
const cartApi = {
  /**
   * 查看购物车
   * 后端接口：GET /user/shoppingCart/list
   * 注意：后端已有 Mapper.list()，但 Controller 暂未暴露该接口，降级为 Mock
   */
  list: () => {
    return request({ url: '/user/shoppingCart/list', showLoading: false })
      .catch(() => {
        console.log('[Mock] 使用本地购物车数据')
        return mockCart
      })
  },

  /**
   * 添加购物车（后端已实现）
   * 后端接口：POST /user/shoppingCart/add
   * Body: { dishId?, setmealId?, dishFlavor? }
   */
  add: (data) => {
    return request({
      url: '/user/shoppingCart/add',
      method: 'POST',
      data,
    }).catch(() => {
      console.log('[Mock] 模拟添加购物车', data)
      const existing = mockCart.find(item =>
        (data.dishId && item.dishId === data.dishId && (item.dishFlavor || '') === (data.dishFlavor || '')) ||
        (data.setmealId && item.setmealId === data.setmealId)
      )
      if (existing) {
        existing.number++
      } else {
        mockCart.push({
          id: Date.now(),
          dishId: data.dishId || null,
          setmealId: data.setmealId || null,
          dishFlavor: data.dishFlavor || '',
          name: data.name || '商品',
          image: data.image || '',
          amount: data.amount || 0,
          number: 1,
        })
      }
      return { success: true }
    })
  },

  /**
   * 删除购物车中一个商品（数量减1）
   * 后端接口：POST /user/shoppingCart/sub
   * Body: { dishId?, setmealId?, dishFlavor? }
   * 注意：后端暂未实现该接口，降级为 Mock
   */
  sub: (data) => {
    return request({
      url: '/user/shoppingCart/sub',
      method: 'POST',
      data,
    }).catch(() => {
      console.log('[Mock] 模拟减少购物车数量', data)
      const existing = mockCart.find(item =>
        (data.dishId && item.dishId === data.dishId && (item.dishFlavor || '') === (data.dishFlavor || '')) ||
        (data.setmealId && item.setmealId === data.setmealId)
      )
      if (existing) {
        existing.number--
        if (existing.number <= 0) {
          mockCart = mockCart.filter(item => item.id !== existing.id)
        }
      }
      return { success: true }
    })
  },

  /**
   * 清空购物车
   * 后端接口：DELETE /user/shoppingCart/clean
   * 注意：后端暂未实现该接口，降级为 Mock
   */
  clean: () => {
    return request({
      url: '/user/shoppingCart/clean',
      method: 'DELETE',
    }).catch(() => {
      console.log('[Mock] 模拟清空购物车')
      mockCart = []
      return { success: true }
    })
  },
}

// ========== 本地模拟订单数据 ==========
let mockOrders = []

// ========== 订单相关 ==========
// 注意：后端订单控制器（OrderController）暂未实现，所有接口均降级为 Mock
const orderApi = {
  /**
   * 提交订单
   * 后端接口：POST /user/order/submit
   * Body: OrdersSubmitDTO { addressBookId, payMethod, remark, deliveryStatus, tablewareNumber, tablewareStatus, packAmount, amount }
   * 注意：后端 Controller 存在 Bug，返回的是 DTO 而非 OrderSubmitVO，
   *       此处做标准化兜底，确保前端始终能拿到 { id, orderNumber, orderAmount } 结构
   */
  submit: (data) => {
    return request({
      url: '/user/order/submit',
      method: 'POST',
      data,
    }).then(res => {
      // 兼容后端 bug：若返回的是 DTO（无 id 字段），则补充默认值
      if (!res || (!res.id && !res.orderNumber)) {
        console.warn('[orderApi.submit] 后端返回异常（可能是 DTO 而非 VO），尝试补充默认值', res)
        return {
          id: null,
          orderNumber: res && res.number ? res.number : '',
          orderAmount: data.amount,
        }
      }
      return res
    }).catch(() => {
      console.log('[Mock] 模拟提交订单', data)
      const newOrder = {
        id: Date.now(),
        orderNumber: '20250422' + String(Math.random()).slice(-4),
        status: 1,
        orderTime: new Date().toLocaleString(),
        amount: data.amount,
        orderDetails: []
      }
      mockOrders.unshift(newOrder)
      return { id: newOrder.id, orderNumber: newOrder.orderNumber, orderAmount: newOrder.amount }
    })
  },

  /**
   * 查询历史订单
   * 后端接口：GET /user/order/historyOrders?page=&pageSize=&status=
   */
  history: (page, pageSize = 10, status) => {
    return request({
      url: '/user/order/historyOrders',
      data: { page, pageSize, status },
    }).catch(() => {
      console.log('[Mock] 使用本地订单数据')
      let list = mockOrders
      if (status !== undefined && status !== null && status !== '') {
        list = list.filter(o => o.status === parseInt(status))
      }
      return {
        total: list.length,
        records: list.slice((page - 1) * pageSize, page * pageSize)
      }
    })
  },

  /**
   * 查询订单详情
   * 后端接口：GET /user/order/orderDetail/{id}
   */
  detail: (id) => {
    return request({ url: `/user/order/orderDetail/${id}` }).catch(() => {
      return mockOrders.find(o => o.id === parseInt(id)) || null
    })
  },

  /**
   * 取消订单
   * 后端接口：PUT /user/order/cancel/{id}
   */
  cancel: (id) => {
    return request({
      url: `/user/order/cancel/${id}`,
      method: 'PUT',
    }).catch(() => {
      console.log('[Mock] 模拟取消订单', id)
      const order = mockOrders.find(o => o.id === parseInt(id))
      if (order) order.status = 6
      return { success: true }
    })
  },

  /**
   * 再来一单
   * 后端接口：POST /user/order/repetition/{id}
   */
  repetition: (id) => {
    return request({
      url: `/user/order/repetition/${id}`,
      method: 'POST',
    }).catch(() => {
      console.log('[Mock] 模拟再来一单', id)
      return { success: true }
    })
  },

  /**
   * 催单
   * 后端接口：GET /user/order/reminder/{id}
   */
  reminder: (id) => {
    return request({ url: `/user/order/reminder/${id}` }).catch(() => {
      console.log('[Mock] 模拟催单', id)
      return { success: true }
    })
  },

  /**
   * 订单支付
   * 后端接口：PUT /user/order/payment
   * Body: { orderNumber, payMethod }
   */
  payment: (data) => {
    return request({
      url: '/user/order/payment',
      method: 'PUT',
      data,
    }).catch(() => {
      console.log('[Mock] 模拟支付', data)
      return {
        nonceStr: 'mock_' + Date.now(),
        paySign: 'mock_sign',
        timeStamp: String(Date.now()),
        signType: 'MD5',
        packageStr: 'prepay_id=mock'
      }
    })
  },
}

// ========== 本地模拟地址数据 ==========
let mockAddresses = [
  {
    id: 1,
    consignee: '张三',
    phone: '13800138000',
    sex: '1',
    provinceName: '北京市',
    cityName: '北京市',
    districtName: '朝阳区',
    detail: '建国路88号SOHO现代城A座1201',
    label: '家',
    isDefault: 1
  },
]

// ========== 地址相关 ==========
// 注意：后端地址控制器（AddressBookController）暂未实现，所有接口均降级为 Mock
const addressApi = {
  /**
   * 查询当前登录用户的所有地址
   * 后端接口：GET /user/addressBook/list
   */
  list: () => {
    return request({ url: '/user/addressBook/list' }).catch(() => {
      console.log('[Mock] 使用本地地址数据')
      return mockAddresses
    })
  },

  /**
   * 查询默认地址
   * 后端接口：GET /user/addressBook/default
   */
  getDefault: () => {
    return request({ url: '/user/addressBook/default' }).catch(() => {
      const defaultAddr = mockAddresses.find(a => a.isDefault === 1)
      return defaultAddr || mockAddresses[0] || null
    })
  },

  /**
   * 根据id查询地址
   * 后端接口：GET /user/addressBook/{id}
   */
  getById: (id) => {
    return request({ url: `/user/addressBook/${id}` }).catch(() => {
      return mockAddresses.find(a => a.id === id || a.id === parseInt(id)) || null
    })
  },

  /**
   * 新增地址
   * 后端接口：POST /user/addressBook
   */
  add: (data) => {
    return request({
      url: '/user/addressBook',
      method: 'POST',
      data,
    }).catch(() => {
      console.log('[Mock] 模拟添加地址', data)
      const newAddr = { id: Date.now(), ...data, isDefault: data.isDefault || 0 }
      mockAddresses.push(newAddr)
      return newAddr
    })
  },

  /**
   * 修改地址
   * 后端接口：PUT /user/addressBook
   */
  update: (data) => {
    return request({
      url: '/user/addressBook',
      method: 'PUT',
      data,
    }).catch(() => {
      console.log('[Mock] 模拟修改地址', data)
      const idx = mockAddresses.findIndex(a => a.id === data.id)
      if (idx >= 0) mockAddresses[idx] = { ...mockAddresses[idx], ...data }
      return { success: true }
    })
  },

  /**
   * 删除地址
   * 后端接口：DELETE /user/addressBook?id=xxx
   */
  delete: (id) => {
    return request({
      url: `/user/addressBook?id=${id}`,
      method: 'DELETE',
    }).catch(() => {
      console.log('[Mock] 模拟删除地址', id)
      mockAddresses = mockAddresses.filter(a => a.id !== id && a.id !== parseInt(id))
      return { success: true }
    })
  },

  /**
   * 设置默认地址
   * 后端接口：PUT /user/addressBook/default
   * Body: { id }
   */
  setDefault: (id) => {
    return request({
      url: '/user/addressBook/default',
      method: 'PUT',
      data: { id },
    }).catch(() => {
      console.log('[Mock] 模拟设置默认地址', id)
      mockAddresses.forEach(a => {
        a.isDefault = (a.id === id || a.id === parseInt(id)) ? 1 : 0
      })
      return { success: true }
    })
  },
}

module.exports = {
  request,
  requestWithoutToken,
  customerLoginApi,
  shopApi,
  categoryApi,
  dishApi,
  setmealApi,
  cartApi,
  orderApi,
  addressApi,
}
