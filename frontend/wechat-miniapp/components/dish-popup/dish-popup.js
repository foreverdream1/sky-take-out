Component({
  properties: {
    show: {
      type: Boolean,
      value: false,
      observer(newVal) {
        if (newVal) {
          this.initSelectedFlavors()
        }
      }
    },
    dish: {
      type: Object,
      value: {}
    }
  },

  data: {
    selectedFlavors: {}
  },

  computed: {
    canAdd() {
      const { dish, selectedFlavors } = this.data
      if (!dish.flavors || dish.flavors.length === 0) return true
      return dish.flavors.every(f => selectedFlavors[f.name])
    }
  },

  methods: {
    initSelectedFlavors() {
      // 初始化已选规格
      this.setData({ selectedFlavors: {} })
    },

    preventBubble() {
      // 阻止冒泡
    },

    closePopup() {
      this.triggerEvent('close')
    },

    selectFlavor(e) {
      const { flavor, value } = e.currentTarget.dataset
      this.setData({
        [`selectedFlavors.${flavor}`]: value
      })
    },

    addToCart() {
      const { dish, selectedFlavors } = this.data
      
      // 检查是否所有规格都已选择
      if (dish.flavors && dish.flavors.length > 0) {
        const allSelected = dish.flavors.every(f => selectedFlavors[f.name])
        if (!allSelected) {
          wx.showToast({ title: '请选择规格', icon: 'none' })
          return
        }
      }

      // 构建口味字符串
      const flavorStr = Object.entries(selectedFlavors)
        .map(([k, v]) => `${k}:${v}`)
        .join(';')

      this.triggerEvent('add', {
        dishId: dish.id,
        name: dish.name,
        price: dish.price,
        image: dish.image,
        flavors: flavorStr
      })
      
      this.closePopup()
    }
  }
})
