// pages/about-our/about-our.js
import {Base} from "../../utils/base.js";
var base = new Base();

Page({

  /**
   * 页面的初始数据
   */
  data: {
    storeInfo:{},   //门店信息
    isLoading:true
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
      var that = this;
      this.setData({ isLoading:false});
    var params = {
        url:"api/v1/store",
        type:"GET",
        callback:(res)=>{
            //console.log(res);
            that.setData({ storeInfo: res.storeInfo, isLoading:true});
        }
    };
    base.request(params);
  },
  /**
   * 拨打电话
   */
  callPhone:function(event){
      var phone = base.getData(event,'phone');
      wx.makePhoneCall({
          phoneNumber: phone
      })
  },
  /**
   * 打开微信内置地图
   */
  openlocation:function(event){
      var lat = base.getData(event,'lat');
      var lng = base.getData(event,'lng');
      wx.openLocation({
          latitude: parseFloat(lat),
          longitude: parseFloat(lng),
          name:"铭玺大药房"
      })
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

  /**
   * 生命周期函数--监听页面隐藏
   */
  onHide: function () {
    
  },

  /**
   * 用户点击右上角分享
   */
  onShareAppMessage: function () {
    
  }
})
