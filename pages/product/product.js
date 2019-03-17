import {Product} from "product-model.js";
import {Cart} from "../cart/cart-model.js";
var cart = new Cart();
var product = new Product();

Page({

  /**
   * 页面的初始数据
   */
  data: {
    id:2,   //商品id
    proName:'', //商品名字
    idx:1,  //商品图片位置 初始值
    imgsCount:0,    //商品图片个数
    range: [1, 2, 3, 4, 5, 6, 7, 8, 9], //picker选择器值
    number:1,   //选择商品数量初始值
    attrIndex:0, //商品属性，评论，售后，下标 
    productInfo:{},  //商品信息
    isFly:false,     //是否在执行动画
    cartTotalCounts:0,   //购物车中总数量
    isLoading:true,
    page: 1,
    commentData: {
        isGetAllOrders: false, //是否加载出所有的评论了
        commentsInfo: [],  //评论数据数组
        totalCounts: 0,    //商品评论总数量
    },
    voicePlayIndex:-1
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
      this.setData({ isLoading:false});
      var cartTotalCounts = cart.getTotalCounts();  //购物车中总数量
      this.setData({
          cartTotalCounts: cartTotalCounts.count1
      });
    var id = options.id,
        that = this;
        this.setData({
            id: id
        });
    product.getProductDetail(id,(res)=>{
        that.setData({ 
            imgsCount: res.product_imgs.length,  //商品图片总个数
            productInfo:res,
            proName:res.pro_name,
            isLoading:true
            });
        //console.log(res);
    });
    this._getComments(id,this.data.page);
  },
  //获取商品评论
  _getComments: function (proId, page) {
      var that = this;
      product.getComments(proId, page, (res) => {
          var coomments = that.data.commentData.commentsInfo;
          if (res.comments.length == 0) {
              that.setData({
                  page: parseInt(page) + 1,
                  commentData: {
                      isGetAllOrders: true,
                      //commentsInfo: coomments.concat(res.comments),
                      commentsInfo: coomments,
                      totalCounts: res.totalCounts
                  }
              });
          } else {
              that.setData({
                  page: parseInt(page) + 1,
                  commentData: {
                      isGetAllOrders: false,
                      commentsInfo: coomments.concat(res.comments),
                      totalCounts: res.totalCounts
                  }
              });
          }
          //console.log(res);

      });
  },
  /**
   * picker选择器改变商品数量
   */
  changeNumber: function (event) {
      this.setData({
          number: this.data.range[event.detail.value]
      });
  },
  /**
   * 滑动轮播图 位置
   */
  getSwiperIndex: function (event) {
      var idx = parseInt(event.detail.current);
      this.setData({ 'idx': idx + 1 });
  },
  /**
   * 属性、评论、售后 切换
   */
  touchTitle: function (event) {
      var idx = event.currentTarget.dataset.index;
      this.setData({ attrIndex: idx });
  },
  /**
   * 点击加入购物车
   */
  addCart:function(event){
    if(this.data.isFly){
        return;
    }
    this._flyToCart(event);
    //添加到购物车缓存
    var param = {
        id:this.data.id,    //商品id
        name: this.data.proName,    //商品名字
        price: this.data.productInfo.pro_price, //商品价格
        imgUrl: this.data.productInfo.product_imgs[0].ima_url,
        postage: this.data.productInfo.pro_postage,
        isSelect:true
    };
    var count = this.data.number;
    cart.add(param,count);
  },
  //加入购物车动画
  _flyToCart:function(event){
      var touches = event.touches[0];
      var diff = {
          x: '18px',
          y: 25 - touches.clientY + 'px'
      },
          style = 'display: block;-webkit-transform:translate(' + diff.x + ',' + diff.y + ') rotate(350deg) scale(0.6)';  //移动距离
      this.setData({
          isFly: true,
          translateStyle: style
      });
      var that = this;
      setTimeout(() => {
          that.setData({
              isFly: false,
              translateStyle: '-webkit-transform: none;',  //恢复到最初状态
              isShake: true,
          });
          setTimeout(() => {
              var count = that.data.number;
              that.setData({
                  isShake: false,
                  cartTotalCounts: that.data.cartTotalCounts + count
              });
          }, 200);
      }, 1000);
  },
  //跳转去购物车页面
  goCart:function(){
    wx.switchTab({
        url: '/pages/cart/cart'
    })
  },

  /**
   * 页面上拉触底事件的处理函数
   */
  onReachBottom: function () {
      if (this.data.commentData.isGetAllOrders == false && this.data.attrIndex==1) {
          this._getComments(this.data.id, this.data.page);
      }
  },

  /**
   * 用户点击右上角分享
   */
  onShareAppMessage: function () {
    return {
        'title':this.data.proName,
        'path':'/pages/product/product?id=' + this.data.id
    }
  },
  //播放语音
  bofangVoice: function (event) {
      var idx = event.currentTarget.dataset.idx,
          filepath = event.currentTarget.dataset.path,
          nowIdx = this.data.voicePlayIndex,
          that = this;
      console.log(idx);
      console.log(filepath);
      console.log(nowIdx);
      if (idx == nowIdx) {
          wx.stopVoice();
          that.setData({ voicePlayIndex: -1 });
      } else {
          wx.stopVoice();
          that.setData({ voicePlayIndex: idx });
          wx.playVoice({
              filePath: filepath,
              success:function(){
                  console.log('调用成功');
              },
              fail:function(res){
                  console.log('调用失败');
                  console.log(res);
              },
              complete: function () {
                  that.setData({ voicePlayIndex: -1 });
              }
          })
      }

  },
})
