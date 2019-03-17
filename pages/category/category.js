// pages/category/category.js
import {Category} from "category-model.js";
import {Base} from "../../utils/base.js";
var base = new Base();
var category = new Category();

Page({

  /**
   * 页面的初始数据
   */
  data: {
      categorys:[],   //所有分类数据
      isLoading:true,    //初始化 不显示加载动画
      catInfo:{},        //分类头图信息
      proInfo:{},       //分类下的商品信息
      index:0,          //默认分类下标 0开始
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    this._loadData();
  },
  _loadData:function(){
      this.setData({ isLoading:false});

      var that = this;
        //获取所有分类
      category.getAllCategorys((res1)=>{
          that.setData({
              categorys:res1
          });
          //获取第一个分类 头图 及商品
          category.getInfoByCatId(res1[0].cat_id,(res2)=>{
              that.setData({
                  isLoading: true,
                  catInfo:res2.catInfo,
                  proInfo:res2.proInfo
              });
          });
      });
  },

  /**
   * 用户点击分类
   */
  changCategory:function(events){
      var catId = base.getData(events,'id'),    //分类id
          idx = base.getData(events, 'idx');    //分类下标
      this.setData({ isLoading:false,index:idx});
      var that = this;
      category.getInfoByCatId(catId,(res)=>{
            that.setData({
                isLoading: true,
                catInfo: res.catInfo,
                proInfo: res.proInfo
            });
      });
  },

  /**
 * 点击某一商品
 */
  touchProduct: function (event) {
      var id = base.getData(event, 'id');
      wx.navigateTo({
          url: '../product/product?id=' + id
      })
  },

  /**
   * 用户点击右上角分享
   */
  onShareAppMessage: function () {
        return {
            'title': '铭玺大药房',
            'path': '/pages/category/category'
        };
  }
})
