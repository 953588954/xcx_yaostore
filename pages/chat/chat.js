// pages/chat/chat.js
import {Chat} from "./chat-model.js"
import { Websocket } from "../../utils/websocket.js"
var chat = new Chat()
var app = getApp();
Page({

  /**
   * 页面的初始数据
   */
  data: {
    headimg:'',  //用户头像
    message: '',  //用户输入的问题
    page: 1,
    has_more: false,
    msg_list:[],
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    this.setData({ headimg: app.globalData.userInfo.avatarUrl})
    this._loadChatData()
    this.rewriteOnMessage()
  },

  //重写onmessage
  rewriteOnMessage:function(){
    var that = this
    const socketTask = app.globalData.socketTask
    socketTask.onMessage(this.onMessageCallback)
  },

  onMessageCallback:function(data){
    var datas = JSON.parse(data.data)
    var that = this
    var list = {
      msg: datas.msg,
      type: 1
    }
    var msg_list = that.data.msg_list
    that.setData({
      msg_list: msg_list.concat(list)
    })
  },

  //加载更多
  loadMore:function(){
    this._loadChatData()
  },

  //请求列表数据
  _loadChatData:function(){
    this.setData({has_more:false})
    var that = this
    chat.getChatList(this.data.page, (res) => {
      var msg_list = that.data.msg_list
      that.setData({
        page: res.next_page,
        has_more: res.has_more,
        msg_list: res.list.concat(msg_list)
      })
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
   * 生命周期函数--监听页面卸载
   */
  onUnload: function () {
    //将未读变为已读，将小红消息
    chat.chatToRead()
    app.globalData.noreadnum = 0
    wx.removeTabBarBadge({
      index: 3,
    })
   
  },

  /**
   * 页面相关事件处理函数--监听用户下拉动作
   */
  onPullDownRefresh: function () {

  },

  /**
   * 页面上拉触底事件的处理函数
   */
  onReachBottom: function () {

  },

  /**
   * 用户点击右上角分享
   */
  onShareAppMessage: function () {

  },

  getMsg:function(evt){
    this.setData({
      message: evt.detail.value
    })
  },
  sendMessage:function(){ //发送数据
    let message = chat.trim(this.data.message)
    if (message == '') {
      chat.toast('请输入文字',true,'none')
      return
    }
    const socketTask = app.globalData.socketTask
    var data = { msg: message, type: '2'}
    var that = this
    socketTask.send({
      data: JSON.stringify(data),
      success:function(){
        that.setData({
          message: '',
          msg_list: that.data.msg_list.concat({
            type: 2,
            msg: message,
            date: ''
          })
        })
      },
      fail:function(){
        chat._showModal('错误','发送失败，请联系管理员',()=>{},false)
        var websocket = new Websocket()
        var socketTask = websocket.connet(token)
        that.globalData.socketTask = socketTask
        socketTask.onMessage(that.onMessageCallback)
        socketTask.send({
          data: JSON.stringify(data),
          success: function () {
            that.setData({
              message: '',
              msg_list: that.data.msg_list.concat({
                type: 2,
                msg: message,
                date: ''
              })
            })
          }
        })
      }
    })
  },
})