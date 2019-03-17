import { My } from "./my-model.js";
import {Order} from "../order/order-model.js";
// import { Base } from "../../utils/base.js";
// var base = Base();
var order = new Order();
var my = new My();

Page({

    /**
     * 页面的初始数据
     */
    data: {
        userInfo: { avatarUrl: '', nickName: '' },  //用户信息
        page: 1,
        orderList: [], //订单列表信息
        isGetAllOrders: false, //是否加载了所有订单
        hideModal:true,    //退款的模态框显隐
        refundId:-1,    //要退款的订单id
    },

    /**
     * 生命周期函数--监听页面加载
     */
    onLoad: function (options) {
        this._getUserInfo();
        this._getOrders(this.data.page);
    },
    //获取用户信息
    _getUserInfo: function () {
        var that = this;
        wx.getUserInfo({
            lang: 'zh_CN',
            success: function (res) {
                //console.log(res.userInfo.avatarUrl);
                var idx = res.userInfo.avatarUrl.lastIndexOf('/');
                // console.log(res.userInfo.avatarUrl.slice(0,idx)+'/64');
                //获取64x64大小头像
                var userInfo = res.userInfo;
                if (userInfo.avatarUrl != '') {
                    userInfo.avatarUrl = userInfo.avatarUrl.slice(0, idx) + '/96';
                }
                that.setData({ userInfo: userInfo });
                //保存用户信息
                my.saveUserInfo(userInfo);
            }
        })
    },
    //获取订单列表
    _getOrders: function (page) {
        var that = this;
        my.getOrderList(page, (res) => {
            //console.log(res);
            if (res.length == 0) {
                that.setData({ isGetAllOrders: true });
            } else {
                that.setData({
                    orderList: that.data.orderList.concat(res),
                    page: parseInt(page) + 1
                });
                wx.stopPullDownRefresh();
            }

        });
    },

    /**
     * 取消待支付订单
     */
    cancelOrder: function (event) {
        var orderId = my.getData(event, 'id'),
            that = this;
        my._showModal('提示', '您确定要取消该订单吗？', (res1) => {
            if (res1.confirm) { //用户点击确定
                my.orderCancel(orderId, (res2) => {
                    if (res2.error == 0) {
                        my.toast(res2.msg);  //显示成功提示
                        //改变当前数组对应的ord_status状态
                        var idx = my.getIdxByOrderList(orderId, that.data.orderList);
                        var orderInfo = that.data.orderList;
                        orderInfo[idx].ord_status = 6;
                        that.setData({
                            orderList: orderInfo
                        });
                    }

                });
            }

        }, true, '我再想想');

    },

    /**
     * 删除 已取消的订单
     */
    deleteOrder: function (event) {
        var orderId = my.getData(event, 'id'),
            that = this;
        my._showModal('提示', '您确定要删除该订单吗？', (res1) => {
            if (res1.confirm) { //用户点击确定
                my.orderDelete(orderId, (res2) => {
                    if (res2.error == 0) {
                        my.toast(res2.msg);  //显示成功提示
                        //重新获取订单列表
                        my.getOrderList(1, (res3) => {

                            that.setData({
                                orderList: res3,
                                page: 2,
                                isGetAllOrders: false
                            });


                        });
                    }
                });
            }
        }, true, '不删除');
    },

    /**
     * 待支付订单 再次支付
     */
    goPay:function(event){
        var orderId = my.getData(event, 'id'),
            that = this;
        //显示支付提示
        my.loading('支付中');
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
        },1);
    },
    /**
     * 点击订单 去下单页面 查看详情
     */
    showOrderDetail:function(event){
        var orderId = my.getData(event, 'id');
        wx.navigateTo({
            url: '../order/order?from=my&order_id=' + orderId,
        })
    },
    /**
     * 确认收货
     */
    confirmReceipt:function(event){
        var orderId = my.getData(event, 'id'),
            that = this;
        my._showModal('提示', '您是否收到该订单商品？', (res1) => {
            if (res1.confirm) { //用户点击确定
                my.orderConfirm(orderId, (res) => {
                    if (res.error == 0) {
                        my.toast('收货成功');
                        //数据绑定 改变该订单状态 5为已完成状态
                        var idx = my.getIdxByOrderList(orderId, that.data.orderList);
                        var newList = that.data.orderList;
                        newList[idx].ord_status = 5;
                       
                        that.setData({
                            orderList: newList
                        });
                    } else {
                        my._showModal('失败提示', '收货失败，原因：' + res.msg, () => { }, false);
                    }
                });
            }
        },true,'未收货');
        
    },
    /**
     * 申请退款
     */
    applyRefund:function(event){
        var orderId = my.getData(event, 'id'),
            that = this;
        my._showModal('提示', '您确定要退款吗？', (res1) => {
            if (res1.confirm) { //用户点击确定
                that.setData({
                    hideModal: false,
                    refundId:orderId
                });
            }
        });
    },
    //提交理由
    submitRefund:function(event){
        var content = event.detail.value,
            refundId = this.data.refundId,
            that = this;
        this.setData({
            hideModal: true,
            refundId: -1
        });
    
        my.refundOrder(refundId, content,(res)=>{
            if (res.error == 0) {
                //数据绑定 改变该订单状态 5为已完成状态
                var idx = my.getIdxByOrderList(refundId, that.data.orderList);
                var newList = that.data.orderList;
                newList[idx].ord_status = 4;

                that.setData({
                    orderList: newList
                });
            } else {
                my._showModal('失败提示', '申请退款失败，请稍后重试', () => { }, false);
            }
        });
    },

    /**
     * 点击 地址管理
     */
    goAddress: function () {
        wx.navigateTo({
            url: '../address/address?from=my',
        });
    },
    /**
     * 点击设置
     */
    goScope: function () {
        wx.openSetting({

        });
    },
    /**
     * 去关于我们 页面
     */
    goAboutOur: function () {
        wx.navigateTo({
            url: '../about-our/about-our',
        })
    },
    /**
     * 跳转物流查询页面
     */
    goLogistics: function (event) {
        var orderId = my.getData(event, 'id');
        wx.navigateTo({
            url: '../logistics/logistics?orderId='+orderId
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
        
        if (wx.getStorageSync("isFromPayResultToMy")==true) {
            wx.setStorageSync("isFromPayResultToMy", false);
            var that = this;
            //重新获取订单列表
            my.getOrderList(1, (res3) => {

                that.setData({
                    orderList: res3,
                    page: 2,
                    isGetAllOrders: false
                });
            })
        }
    },

    /**
     * 页面相关事件处理函数--监听用户下拉动作
     */
    onPullDownRefresh: function () {
        this.setData({
            page: 1,
            orderList: [], //订单列表信息
            isGetAllOrders: false, //是否加载了所有订单
            hideModal: true,    //退款的模态框显隐
            refundId: -1,    //要退款的订单id
        });
        this._getOrders(this.data.page);
    },

    /**
     * 页面上拉触底事件的处理函数
     */
    onReachBottom: function () {
        if (this.data.isGetAllOrders == true) {
            return;
        }
        this._getOrders(this.data.page);
    },

    //隐藏模态框
    hiddenModal:function(){
        this.setData({
            hideModal:true,
            refundId:-1
        });
    }
})