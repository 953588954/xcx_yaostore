// pages/theme/theme.js
import { Theme } from "theme-model.js";
import { Base } from "../../utils/base.js";
var theme = new Theme();
var base = new Base();

Page({

    /**
     * 页面的初始数据
     */
    data: {
        name: "",    //当前页面标题
        themeStr: "",    //主题参数
        page: 1,      //初始化当前页数
        proInfo: {},     //商品信息
        theInfo: {},      //主题信息
        hasProduct: true     //控制上划更多
    },

    /**
     * 生命周期函数--监听页面加载
     */
    onLoad: function (options) {
        var themeStr = options.theme;  //主题参数
        if (themeStr == 'all') {
            this.data.name = "所有商品";
        }
        if (themeStr == 'new') {
            this.data.name = "新品上市";
        }
        if (themeStr == 'hot') {
            this.data.name = "热卖商品";
        }
        if (themeStr == 'recommend') {
            this.data.name = "推荐商品";
        }
        if (themeStr == 'postage') {
            this.data.name = "卖家包邮";
        }
        this.data.themeStr = themeStr;

        this._loadData(themeStr);
    },
    _loadData: function (themeStr) {
        var that = this;
        //获取主题信息
        theme.getThemeData(themeStr, this.data.page, (res) => {
            //截取商品名
            var products = base.subProductName(res.proInfo);
            that.setData({
                page: res.page,
                proInfo: products,
                theInfo: res.theInfo,
                name: this.data.name
            });
        });
    },
    onReady: function () {
        //动态设置标题
        wx.setNavigationBarTitle({
            title: this.data.name
        })
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
     * 页面上拉触底事件的处理函数
     */
    onReachBottom: function () {
        if (this.data.hasProduct) {
            var that = this;
            var page = parseInt(this.data.page) + 1;

            //获取主题信息
            theme.getThemeData(this.data.themeStr, page, (res) => {
                //截取商品名
                var products = base.subProductName(res.proInfo);
                var newProInfo = that.data.proInfo.concat(products);
                that.setData({
                    proInfo: newProInfo,
                    page: res.page
                });
                if (res.proInfo.length == 0) {
                    that.setData({
                        hasProduct: false
                    });
                }
            });
        }

    },

    /**
     * 用户点击右上角分享
     */
    onShareAppMessage: function () {
        return {
            'title': this.data.name,
            'path': '/pages/theme/theme?theme=' + this.data.nameStr
        };
    }
})
