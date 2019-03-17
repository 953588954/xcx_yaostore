// pages/order/order.js
import {Cart} from "../cart/cart-model.js";
import {Base} from "../../utils/base.js";
import {Order} from "./order-model.js";
var order = new Order();
var base = new Base();
var cart = new Cart();

Page({

  /**
   * 页面的初始数据
   */
  data: {
    addressInfo:'',  //地址信息
    products:[],    //选择的购物车商品
    productPrice:0, //商品总价格
    postage:0,      //邮费
    //countPrice:0,   //商品加邮费总价格
    pageFrom:'',    //从购物车或我的 页面来
    notPass:1,      //该地区是否配送，1不配送
    isLoading:true,
    allPrice:0,     //邮费和商品总和
    //是否从支付结果页面返回来的，主要解决支付结果返回来直接跳到‘我的’页面，不让显示下单页面了
    isFromPayResult:false,

    orderId:'', //若从我的页面过来，会有订单id
    
  },

  /**
   * 生命周期函数--监听页面加载
   * 有两个地方进入下单页面
   * 从购物车页面过来
   * 从‘我的’页面来 查看订单详情
   */
  onLoad: function (options) {
      var pageFrom = options.from;
      if (pageFrom=='cart'){
          var productPrice = options.price;
          this.setData({
              productPrice: Math.round(productPrice * 100),
              pageFrom: pageFrom
          });
          this._getSelectProduct();
          this._getAddressAndPostage();
      } else if (pageFrom=="my"){
          //this.data.orderId = options.order_id;
          this.setData({
              orderId: options.order_id
          });
      }
      
  },
  //获取选中的商品
  _getSelectProduct:function(){
      var products = cart.getSelectStorage();
      this.setData({
          products: products
      });
  },
  //获取邮费，地址信息
  _getAddressAndPostage:function(){
      this.setData({ isLoading:false});
      //获取地址 和邮费
      var addressId = wx.getStorageSync("addressId");
      var that = this;
      order.getAddressAndPostage(this.data.products, addressId, (res) => {
          //console.log(res);
          that.setData({
              addressInfo: res.addressInfo,
              postage: Math.round(res.postagePrice*100),
              notPass: res.notPass,
              isLoading:true
          });
      });
  },
  /**
   * 下单支付
   */
  payOrder:function(){
      if (this.data.addressInfo==''){
          base._showModal('提示','请选择收货地址',()=>{},false);
          return ;
      }
      if (this.data.notPass==1){
          base._showModal('提示', '该城市暂不支持配送', () => { }, false);
          return ;
      }
      var addressId =this.data.addressInfo.add_id,
            that = this;
    //显示下单提示
      base.loading('创建订单');
      //下单
      order.placeOrder(this.data.products, addressId,(res)=>{
          //关闭提示
          wx.hideLoading();
          
        var orderId = res.order_id;
        //仅将下单的商品除去，并不是清空购物车
        that.deleteProductsFromCart();
        //吊起支付
        that.pay(orderId);
      });
  },
  /**
   * 支付
   */
  pay:function(orderId){
      //显示支付提示
      base.loading('支付中');
      var that = this;
      order.requestPay(orderId, (res) => {
          //关闭提示
          wx.hideLoading();
          if (res == 2) {
              //跳转成功页面
              wx.navigateTo({
                  url: '../pay-result/pay-result?orderId=' + orderId+'&result=true',
                  success: function () {
                      that.setData({ isFromPayResult: true });
                  }
              });
          } else if(res==1) {
              //跳转支付失败页面
              wx.navigateTo({
                  url: '../pay-result/pay-result?orderId=' + orderId + '&result=false',
                  success:function(){
                      that.setData({ isFromPayResult:true});
                  }
              });
          }else{
              base._showModal('支付失败', '服务器繁忙，支付失败', () => { }, false);
          }
      });
  },
  /**从购物车中删除已下单的商品 */
  deleteProductsFromCart:function(){
    var ids = [],
        products = this.data.products;
    for(var i=0;i<products.length;i++){
        ids.push(products[i].id);
    }
    cart.deleteProduct(ids,true);
  },

  /**
   * 再次支付
   */
  payOrderAgin:function(){
      var orderId = this.data.orderId,
          that = this;
      //显示支付提示
      base.loading('支付中');
      order.requestPay(orderId, (res) => {
          //关闭提示
          wx.hideLoading();
          if (res == 2) {
              //跳转成功页面
              wx.navigateTo({
                  url: '../pay-result/pay-result?orderId=' + orderId + '&result=true'
              });
          } else if (res == 1) {
              //跳转支付失败页面
              wx.navigateTo({
                  url: '../pay-result/pay-result?orderId=' + orderId + '&result=false'
              });
          } else {
              my._showModal('支付失败', '服务器繁忙，支付失败', () => { }, false);
          }
      }, 1);
  },

  /**
   * 去地址管理页面
   */
  goAddress:function(){
      wx.navigateTo({
          url: '../address/address?from=order'
      })
  },

  /**
   * 生命周期函数--监听页面显示
   */
  onShow: function () {
      //如果是从我的页面过来，则请求服务器获取数据
      if (this.data.orderId != "") {
          var that = this;
          order.getDetailInfo(this.data.orderId, (res) => {
              //console.log(res);
              that.setData({
                  addressInfo: res.addressInfo,
                  products: res.productInfo,
                  orderInfo: res.orderInfo,
                  notPass: 0,
                  productPrice: Math.round(parseFloat(res.orderInfo.ord_product_price) * 100),
                  postage: Math.round(parseFloat(res.orderInfo.ord_freight_price) * 100)
              });
          });
          return;
      }

      //如果是从支付结果页面返回的，直接跳转到‘我的’页面
      if (this.data.isFromPayResult==true){
          var that = this;
            wx.switchTab({
                url: '/pages/my/my',
                success:function(){
                    that.setData({ isFromPayResult: false });
                }
            });
            return ;
      }
      
    //如果地址id不为0，则请求服务器获取 邮费，地址信息 
    //这是从选择地址页面返回需要执行
      var addressId = wx.getStorageSync("addressId");
      if (addressId!=0){
          this._getAddressAndPostage();
      }
    
  },
  onHide:function(){
      //利用缓存 存入 点击地址id
      //页面一旦隐藏，则设置地址id为0
      wx.setStorageSync("addressId", 0);
  },

  /**
   * 去评论页面
   */
  goComment:function(event){
      var proId = order.getData(event, 'proid');//商品id
      wx.navigateTo({
          url: '../comment/comment?proId=' + proId + '&ordId=' + this.data.orderId,
      });
  }

})
