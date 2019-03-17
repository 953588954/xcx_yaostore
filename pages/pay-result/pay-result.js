// pages/pay-result/pay-result.js
Page({

  /**
   * 页面的初始数据
   */
  data: {
      payResult: '',//支付结果
      orderId:-1
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
      var payResult = options.result,
          orderId = options.orderId;
        this.setData({
            payResult: payResult,
            orderId: orderId
        });
  },

  //查看订单
  viewOrder:function(){
    wx.navigateBack({
        delta: 1
    });
  },

  /**
   * 生命周期函数--监听页面显示
   */
  onShow: function () {
      wx.setStorageSync("isFromPayResultToMy", true);
  },

  /**
   * 生命周期函数--监听页面隐藏
   */
  onHide: function () {
      
  }
})