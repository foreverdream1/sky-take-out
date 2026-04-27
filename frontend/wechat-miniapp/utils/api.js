/**
 * API 请求工具
 * 统一封装 wx.request，自动注入 token，统一错误处理
 */
const BASE_URL = 'http://localhost:8080'

/**
 * 通用请求封装
 * @param {object} config
 *   url         请求路径（自动拼接 BASE_URL）
 *   method      GET/POST/PUT/DELETE，默认 GET
 *   data        请求参数
 *   header      自定义请求头（可选）
 *   loading     是否显示 loading 遮罩，默认 true
 * @returns Promise
 */
function request({ url, method = 'GET', data, header = {}, loading = true }) {
  return new Promise((resolve, reject) => {
    if (loading) {
      wx.showLoading({ title: '加载中...', mask: true })
    }

    const token = wx.getStorageSync('token')
    const headers = {
      'Content-Type': 'application/json',
      ...(token ? { token } : {}),
      ...header,
    }

    wx.request({
      url: BASE_URL + url,
      method,
      data,
      header: headers,
      success: (res) => {
        if (loading) wx.hideLoading()

        // 后端拦截器返回 401 = token 失效/未登录
        if (res.statusCode === 401) {
          wx.showToast({ title: '登录已过期，请重新登录', icon: 'none', duration: 2000 })
          setTimeout(() => {
            wx.removeStorageSync('token')
            wx.removeStorageSync('userInfo')
            wx.reLaunch({ url: '/pages/login/login' })
          }, 1500)
          reject({ code: 401, msg: '登录已过期' })
          return
        }

        if (res.statusCode === 200) {
          const { code, msg, data: responseData } = res.data
          if (code === 1) {
            resolve(responseData)
          } else {
            wx.showToast({ title: msg || '请求失败', icon: 'none', duration: 2000 })
            reject({ code, msg })
          }
        } else {
          wx.hideLoading()
          wx.showToast({ title: '网络错误 (' + res.statusCode + ')', icon: 'none' })
          reject({ code: res.statusCode, msg: '网络错误' })
        }
      },
      fail: (err) => {
        if (loading) wx.hideLoading()
        wx.showToast({ title: '网络请求失败', icon: 'none' })
        reject(err)
      },
    })
  })
}

// 员工相关
const employeeApi = {
  login: (data) => request({ url: '/admin/employee/login', method: 'POST', data }),
  wxLogin: (data) => request({ url: '/admin/employee/wxLogin', method: 'POST', data }),
  logout: () => request({ url: '/admin/employee/logout', method: 'POST' }),
  page: (params) => request({ url: '/admin/employee/page', method: 'GET', data: params }),
  getById: (id) => request({ url: '/admin/employee/' + id, method: 'GET' }),
  save: (data) => request({ url: '/admin/employee', method: 'POST', data }),
  update: (data) => request({ url: '/admin/employee', method: 'PUT', data }),
  setStatus: (status, id) => request({
    url: '/admin/employee/status/' + status + '?id=' + id,
    method: 'POST',
  }),
}

// 分类相关
const categoryApi = {
  list: (type) => request({ url: '/admin/category/list?type=' + type, method: 'GET', loading: false }),
  page: (params) => request({ url: '/admin/category/page', method: 'GET', data: params }),
  save: (data) => request({ url: '/admin/category', method: 'POST', data }),
  update: (data) => request({ url: '/admin/category', method: 'PUT', data }),
  delete: (id) => request({ url: '/admin/category?id=' + id, method: 'DELETE' }),
  setStatus: (status, id) => request({
    url: '/admin/category/status/' + status + '?id=' + id,
    method: 'POST',
  }),
}

// 菜品相关
const dishApi = {
  page: (params) => request({ url: '/admin/dish/page', method: 'GET', data: params }),
  getById: (id) => request({ url: '/admin/dish/' + id, method: 'GET' }),
  save: (data) => request({ url: '/admin/dish', method: 'POST', data }),
  update: (data) => request({ url: '/admin/dish', method: 'PUT', data }),
  delete: (ids) => request({ url: '/admin/dish?ids=' + ids.join(','), method: 'DELETE' }),
}

// 文件上传（需用 uploadFile，不能用 request）
function uploadApi(filePath) {
  return new Promise((resolve, reject) => {
    wx.showLoading({ title: '上传中...', mask: true })
    const token = wx.getStorageSync('token')
    wx.uploadFile({
      url: BASE_URL + '/admin/common/upload',
      filePath: filePath,
      name: 'file',
      header: { token },
      success: (res) => {
        wx.hideLoading()
        if (res.statusCode === 200) {
          const data = JSON.parse(res.data)
          if (data.code === 1) {
            resolve(data.data)
          } else {
            wx.showToast({ title: data.msg || '上传失败', icon: 'none' })
            reject(data)
          }
        } else {
          wx.showToast({ title: '上传失败', icon: 'none' })
          reject({ msg: '上传失败' })
        }
      },
      fail: () => {
        wx.hideLoading()
        wx.showToast({ title: '上传失败', icon: 'none' })
        reject({ msg: '上传失败' })
      },
    })
  })
}

module.exports = {
  request,
  employeeApi,
  categoryApi,
  dishApi,
  uploadApi,
  BASE_URL,
}
