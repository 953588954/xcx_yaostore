import { Logistics} from "./logistics-model.js";
var logistic = new Logistics();

Page({

  /**
   * 页面的初始数据
   */
  data: {
      isLoading:false
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
     
    var orderId = options.orderId,
        that = this;
    logistic.getLogisticsInfo(orderId,(res)=>{
       // console.log(res);
        that.setData({
            logisticsInfo:res,
            isLoading:true
        });
    });
  },

  /**
   * 生命周期函数--监听页面初次渲染完成
   */
  onReady: function () {
    
  },

  /**
   * 生命周期函数--监听页面显示
   */
  onShow: function () {
    
  },


})