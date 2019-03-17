// pages/index/index.js
import {Index} from "index-model.js";
import {Base} from "../../utils/base.js";
var index = new Index();
var base = new Base();

Page({

  /**
   * 页面的初始数据
   */
  data: {
    'banners':{},
    'products':{},
    showCloseImg:false, //是否显示关闭搜索 图标
    searchProducts:{},  //搜索出来的商品
    isLoading:true,
    
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    this.loadData();
  },
  /**
   * 获取数据
   */
  loadData:function(callback){
      var that = this;
      //获取banner信息
      index.getBanners((res)=>{
          //console.log(res);
        that.setData({
            'banners':res
        });
      });
      //获取家中常备 10条数据
      index.getRandomProducts((res)=>{
          var products = base.subProductName(res); //截取商品名称
          that.setData({
              'products': products
          });
          callback && callback();
      });
  },

  /**
   * 主题跳转
   */
  goTheme:function(event){
        var str = base.getData(event,'theme');
        if(str=='category'){
            wx.switchTab({
                url: '/pages/category/category'
            })
        }else{
            wx.navigateTo({
                url: '/pages/theme/theme?theme='+str
            })
        }
  },
/**
 * 点击某一商品
 */
  touchProduct:function(event){
      var id = base.getData(event,'id');
     
      wx.navigateTo({
          url: '../product/product?id=' +id
      });
      this.setData({ showCloseImg: false });  //首页返回正常
  },
  /**
   * 点击搜索商品
   */
  searchProduct:function(e){
      var str = e.detail.value;
      var trimStr = base.trim(str);
      if (trimStr == '' || trimStr.length<3){
          base._showModal('提示','商品名或商品首字母必须输入三个以上',()=>{},false);
          return ;
      }
     // console.log(str.length); console.log(str2.length); return ;
        this.setData({
            showCloseImg:true,
            isLoading:false
        });
        var that = this;
        index.searchProducts(trimStr,(res)=>{
            //console.log(res);
            that.setData({
                searchProducts: res.searchProducts,
                isLoading:true
            });
        });
  },
  /**
   * 点击关闭 搜索按钮时
   */
  catchCloseImg:function(){
      this.setData({
          showCloseImg: false,
          searchProducts:{} //清空搜索出来的商品信息
      });
  },

  /**
   * 页面相关事件处理函数--监听用户下拉动作
   */
  onPullDownRefresh: function () {
      if (this.data.showCloseImg){
          wx.stopPullDownRefresh();
          return ;
      }
      this.loadData(() => {
          wx.stopPullDownRefresh();
      });
  },

  /**
   * 用户点击右上角分享
   */
  onShareAppMessage: function () {
    return {
        'title':'铭玺大药房',
        'path':'/pages/index/index'
    };
  }
})
