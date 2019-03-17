import {Token} from "/utils/token.js";


App({

  /**
   * 当小程序初始化完成时，会触发 onLaunch（全局只触发一次）
   */
  onLaunch: function () {
      var token = new Token();
      token.verifyToken();
      //利用缓存 存入 点击地址id
      wx.setStorageSync("addressId", 0);
      //利用缓存 是否从支付结果页面 跳转到‘我的’页面 用来刷新我的页面订单
      wx.setStorageSync("isFromPayResultToMy", false);
  },

  /**
   * 当小程序启动，或从后台进入前台显示，会触发 onShow
   */
  onShow: function (options) {
  },

  /**
   * 当小程序从前台进入后台，会触发 onHide
   */
  onHide: function () {
    
  },

  /**
   * 当小程序发生脚本错误，或者 api 调用失败时，会触发 onError 并带上错误信息
   */
  onError: function (msg) {
    
  }
})
