const { addressApi } = require('../../utils/customerApi.js')

Page({
  data: {
    // 地址列表
    addressList: [],
    
    // 编辑弹窗
    showEditModal: false,
    isEdit: false,
    editForm: {
      id: null,
      consignee: '',
      phone: '',
      sex: '1',
      provinceName: '',
      cityName: '',
      districtName: '',
      detail: '',
      label: '',
      isDefault: 0,
    },
    
    // 标签选项
    labelOptions: ['家', '公司', '学校'],
  },

  onLoad() {
    this.loadAddressList()
  },

  onShow() {
    this.loadAddressList()
  },

  // 加载地址列表
  loadAddressList() {
    addressApi.list().then(list => {
      this.setData({ addressList: list || [] })
    }).catch(() => {
      this.setData({ addressList: [] })
    })
  },

  // 显示新增弹窗
  onAddAddress() {
    this.setData({
      showEditModal: true,
      isEdit: false,
      editForm: {
        id: null,
        consignee: '',
        phone: '',
        sex: '1',
        provinceName: '',
        cityName: '',
        districtName: '',
        detail: '',
        label: '',
        isDefault: 0,
      },
    })
  },

  // 显示编辑弹窗
  onEditAddress(e) {
    const address = e.currentTarget.dataset.address
    this.setData({
      showEditModal: true,
      isEdit: true,
      editForm: { ...address },
    })
  },

  // 关闭弹窗
  closeEditModal() {
    this.setData({ showEditModal: false })
  },

  // 表单输入
  onInputChange(e) {
    const { field } = e.currentTarget.dataset
    const { value } = e.detail
    this.setData({
      [`editForm.${field}`]: value,
    })
  },

  // 性别选择
  onSexChange(e) {
    this.setData({
      'editForm.sex': e.detail.value,
    })
  },

  // 标签选择
  onLabelSelect(e) {
    const label = e.currentTarget.dataset.label
    this.setData({
      'editForm.label': label,
    })
  },

  // 默认地址切换
  onDefaultChange(e) {
    this.setData({
      'editForm.isDefault': e.detail.value ? 1 : 0,
    })
  },

  // 保存地址
  onSaveAddress() {
    const { editForm, isEdit } = this.data
    
    // 表单验证
    if (!editForm.consignee.trim()) {
      wx.showToast({ title: '请输入联系人', icon: 'none' })
      return
    }
    if (!editForm.phone.trim()) {
      wx.showToast({ title: '请输入手机号', icon: 'none' })
      return
    }
    if (!editForm.detail.trim()) {
      wx.showToast({ title: '请输入详细地址', icon: 'none' })
      return
    }

    // 简单处理省市区的拆分（实际应该用省市区选择器）
    const addressData = {
      ...editForm,
      provinceCode: '',
      cityCode: '',
      districtCode: '',
    }

    wx.showLoading({ title: '保存中...' })

    const apiCall = isEdit 
      ? addressApi.update(addressData)
      : addressApi.add(addressData)

    apiCall.then(() => {
      wx.hideLoading()
      wx.showToast({ title: '保存成功', icon: 'success' })
      this.closeEditModal()
      this.loadAddressList()
    }).catch(err => {
      wx.hideLoading()
      wx.showToast({ title: err.msg || '保存失败', icon: 'none' })
    })
  },

  // 删除地址
  onDeleteAddress(e) {
    const { id } = e.currentTarget.dataset
    wx.showModal({
      title: '提示',
      content: '确定删除该地址吗？',
      success: (res) => {
        if (res.confirm) {
          addressApi.delete(id).then(() => {
            wx.showToast({ title: '删除成功', icon: 'success' })
            this.loadAddressList()
          }).catch(err => {
            wx.showToast({ title: err.msg || '删除失败', icon: 'none' })
          })
        }
      },
    })
  },

  // 设置默认地址
  onSetDefault(e) {
    const { id } = e.currentTarget.dataset
    addressApi.setDefault(id).then(() => {
      wx.showToast({ title: '设置成功', icon: 'success' })
      this.loadAddressList()
    }).catch(err => {
      wx.showToast({ title: err.msg || '设置失败', icon: 'none' })
    })
  },
})
