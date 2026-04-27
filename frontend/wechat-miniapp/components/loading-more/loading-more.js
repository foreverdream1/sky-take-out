Component({
  properties: {
    loading: {
      type: Boolean,
      value: false
    },
    noMore: {
      type: Boolean,
      value: false
    },
    text: {
      type: String,
      value: '加载中...'
    },
    noMoreText: {
      type: String,
      value: '没有更多了'
    }
  }
})
