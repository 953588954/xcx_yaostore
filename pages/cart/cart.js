// pages/cart/cart.js
import {Cart} from "cart-model.js";
import {Base} from "../../utils/base.js";
var base = new Base();
var cart= new Cart();

Page({

  /**
   * 页面的初始数据
   */
  data: {
    localData:[],   //本地缓存购物车数据
    selectPrice:0,  //选择商品中价格
    selectCount:0,  //选择的商品总数量
    selectTypeCount:0,  //选择的商品 类目数量
    isLoading:true,
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    //初次加载，需要调用后台接口 重新赋值购物车中商品名、价格
    //防止后台修改数据后，购物车中数据与后台不一致
    //如果后台商品删除或下架，则从购物车中删除此商品
      this.setData({
          isLoading: false
      });
      var that = this;
      cart.checkProductFromServer((res)=>{
          //console.log(res);
          cart.storageNewsProducts(res);
          that._bindData(() => {
              that.setData({
                  isLoading: true
              });
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
      
      this._bindData();
  },

  /**
   * 点击某一个商品选择或为选择按钮
   */
  toggleSelect:function(event){
      var id = base.getData(event,'id');    //商品id
      cart.toggleSelect(id);    //改变缓存中该商品选中情况
      this._bindData();
  },

  /**
   * 全部不选择
   */
  allNotSelect:function(){
      cart.selectAll(false);
      this._bindData();
  },
  //全部选择
  allSelect:function(){
      cart.selectAll(true);
      this._bindData();
  },
  //减少商品数量
  decProduct:function(event){
      var id = base.getData(event, 'id');    //商品id
      cart.addOrIncProduct(id,-1);
      this._bindData();
  },
  //增加商品数量
  incProduct: function (event){
      var id = base.getData(event, 'id');    //商品id
      cart.addOrIncProduct(id, 1);
      this._bindData();
  },
  //从购物车中删除某一个商品
  delProduct:function(event){
      var that =this;
      base._showModal("删除提示","您确定从购物车内删除此商品吗？",(res)=>{
          //console.log(res);
          if (res.confirm){
              var id = base.getData(event, 'id');    //商品id
              cart.deleteProduct(id);
              that._bindData();
          }
      });
      
  },

  //没变换一次缓存数据，需重新数据绑定
  _bindData:function(callback){
      var localData = cart._getStorage(); //获取本地缓存数据
      var selectPrice = cart.getSelectPrice();  //选择总价格
      var selectCountObj = cart.getTotalCounts(true);  //选中的商品数量
      this.setData({
          localData: localData,
          selectPrice: selectPrice,
          selectCount: selectCountObj.count1,
          selectTypeCount: selectCountObj.count2
      });
      callback && callback();
  },

  /**
   * 去下单页面
   */
  goOrder:function(){
      wx.navigateTo({
          url: '/pages/order/order?price=' + this.data.selectPrice+'&from=cart',
      })
  }


})
