// pages/address/address.js
import {Base} from "../../utils/base.js";
import {Address} from "./address-model.js";
var address = new Address();
var base = new Base();

Page({

  /**
   * 页面的初始数据
   */
  data: {
      addressInfo:{},   //地址信息
      isLoading:true,
      fromPage:'',      //从下单页面 还是 我的页面 过来
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
      var fromPage = options.from;
    
      this.setData({ isLoading: false, fromPage: fromPage});
      this._getAddressInfo();
  },
  //获取该用户所有地址信息
  _getAddressInfo:function(){
      var that = this;
      address.getAllAddress((res)=>{
          //console.log(res);
          that.setData({
              addressInfo:res.addressInfo,
              isLoading:true
          });
      });
  },
  /**
   * 点击添加地址按钮，调用微信地址信息 
   */
  addAddress:function(){
      var that = this;
    wx.chooseAddress({
        success:function(res){
            //console.log(res);
            address.addAddress(res,(res2)=>{
                if(res2.error==0){
                    wx.showToast({
                        title: '添加成功',
                        icon:'success'
                    });
                    that._getAddressInfo();
                }else{
                    wx.showToast({
                        title: '添加地址失败',
                        icon: 'none'
                    })
                }
            });
        },
        fail:function(){
            //console.log('调用失败');
            base._showModal('提示','如拒绝授权后，可在我的页面设置中开启',()=>{},false);
        }
    });
  },
  /**
   * 删除某一个地址信息
   */
  delAddress:function(event){
      var id = base.getData(event,'id'); //地址id
      var that = this;

      base._showModal('提示','您确定要删除此地址信息吗？',(res1)=>{
          if (res1.confirm) {
              address.deleteProduct(id, (res2) => {
                  if (res2.error == 0) {
                      wx.showToast({
                          title: '删除成功',
                          icon: 'success'
                      });
                      that._getAddressInfo();
                  } else {
                      wx.showToast({
                          title: '删除地址失败',
                          icon: 'none'
                      })
                  }
              });
          }
      });
      
  },
  /**
   * 设置默认地址
   */
  setDefaultAddress:function(event){
      var id = base.getData(event, 'id'); //地址id
      var that = this;
      that.setData({ isLoading: false });
      address.setDefaultAddress(id,(res)=>{
          that.setData({ isLoading: true });
          if (res.error == 0) {
              wx.showToast({
                  title: '设置成功',
                  icon: 'success'
              });
              that._getAddressInfo();
          } else {
              wx.showToast({
                  title: '设置失败',
                  icon: 'none'
              })
          }
      });
  },
  /**
   * 从下单页面过来，选择地址返回，从我的页面过来将不执行
   */
  selectAddress: function (event){
      if (this.data.fromPage=='order'){
          var id = base.getData(event, 'id'); //地址id
          //利用缓存 存入 点击地址id
          wx.setStorageSync("addressId", id);
          //返回上一级页面
          wx.navigateBack({
              delta: 1
          });
      }
      
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

})
