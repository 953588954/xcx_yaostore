// pages/comment/comment.js
import { Comment } from "./comment-model.js";
var comment = new Comment();
Page({
    showYuYin: function () {
        this.setData({
            speackFlag: false,
            sendMoreMsgFlag: false
        });
    },
    showWenZi: function () {
        this.setData({
            speackFlag: true
        });
    },
    showImage: function () {
        this.setData({
            sendMoreMsgFlag: !this.data.sendMoreMsgFlag,
            speackFlag: true
        });
    },
    //改变输入框的值
    changeVal: function (event) {
        var val = event.detail.value;
        this.setData({ inputVal: val });
    },

    /**
     * 页面的初始数据
     */
    data: {
        recodingClass: "", //recoding
        speackFlag: true,  //隐藏语音页面
        sendMoreMsgFlag: false,    //隐藏图片页面
        chooseFiles: [],   //选择上传图片的列表
        deleteIndex: -1,       //要删除的图片下标
        inputVal: '',  //input框的值
        speakTip: true,   //是否隐藏录音提示
        voicePath: [], //语音临时文件
        voicePlayIndex: -1,    //当前播放的语音文件位置
        ordId: -1,
        proId: -1,
        page: 1,
        commentData: {
            isGetAllOrders: false, //是否加载出所有的评论了
            commentsInfo: [],  //评论数据数组
            totalCounts: 0,    //商品评论总数量
        }

    },

    /**
     * 生命周期函数--监听页面加载
     */
    onLoad: function (options) {
        var proId = options.proId,    //商品id
            ordId = options.ordId;    //订单id
        this.setData({
            ordId: ordId,
            proId: proId,
            commentData: {
                isGetAllOrders: false, //是否加载出所有的评论了
                commentsInfo: [],  //评论数据数组
                totalCounts: 0,    //商品评论总数量
            }
        });
        //console.log(this.data.commentData);
        //获取评论
        this._getComments(proId, this.data.page);
    },
    /**获取评论 */
    _getComments: function (proId, page) {
        var that = this;
        comment.getComments(proId, page, (res) => {
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
    * 录音开始
    */
    recordStart: function () {
        this.setData({
            recodingClass: 'recoding',
            speakTip: false
        });
        var that = this;
        this.startTime = (new Date()).valueOf();//录音开始时间戳
        wx.startRecord({
            success: function (res) {
                var timestamp = that.endTime - that.startTime;
                var second = Math.ceil(timestamp / 1000);
                if (timestamp < 500) {//录音小于0.5s
                    comment.toast('录音时间太短', 'loading');
                    return;
                }

                comment.uploadVoice(that.data.proId, that.data.ordId, res.tempFilePath, second, () => {
                    wx.navigateBack({
                        delta: 1
                    })
                });
            }
        })
    },
    //录音结束
    recordEnd: function () {
        this.endTime = (new Date()).valueOf();//录音结束时间戳
        this.setData({
            recodingClass: '',
            speakTip: true
        });
        wx.stopRecord();
    },
    //播放语音
    bofangVoice: function (event) {
        var idx = event.currentTarget.dataset.idx,
            filepath = event.currentTarget.dataset.path,
            nowIdx = this.data.voicePlayIndex,
            that = this;
        if (idx == nowIdx) {
            wx.stopVoice();
            that.setData({ voicePlayIndex: -1 });
        } else {
            wx.stopVoice();
            that.setData({ voicePlayIndex: idx });
            wx.playVoice({
                filePath: filepath,
                complete: function () {
                    that.setData({ voicePlayIndex: -1 });
                }
            })
        }

    },
    /**
     * 发送评论
     */
    sendComment: function () {
        var description = this.data.inputVal.replace(/(^\s*)|(\s*$)/g, "");
        var that = this;
        if (description == "") {
            comment.modal('提示', '请输入评论', false);
            return;
        }
        comment.sendMsg(description, this.data.proId, this.data.ordId, this.data.chooseFiles, () => {
            that.setData({
                chooseFiles: [],
                inputVal: ''
            });
            wx.navigateBack({
                delta: 1
            })
        });
    },
    /**
     * 选择图片
     */
    chooseImage: function (event) {
        var category = [event.currentTarget.dataset.category];
        //console.log(category);
        var imgArr = this.data.chooseFiles,
            that = this,
            count = 3 - imgArr.length;
        if (count <= 0) {
            comment.modal('提示', '最多可上传三张图片', false);
            return;
        }
        //选择图片
        wx.chooseImage({
            count: count,
            sourceType: category,
            success: function (res) {
                // console.log(res.tempFilePaths);
                // console.log(res.tempFiles);
                that.setData({
                    chooseFiles: imgArr.concat(res.tempFilePaths)
                });
            }
        })
    },
    //删除一张图片
    deleteImage: function (event) {
        var idx = event.currentTarget.dataset.idx;
        var that = this;
        this.setData({ deleteIndex: idx });
        that.data.chooseFiles.splice(idx, 1);
        setTimeout(function () {
            that.setData({
                deleteIndex: -1,
                chooseFiles: that.data.chooseFiles
            });
        }, 500);
    },
    //预览图片
    previewImg: function (event) {
        var idx = event.currentTarget.dataset.idx,
            that = this;
        wx.previewImage({
            current: that.data.chooseFiles[idx],
            urls: that.data.chooseFiles
        })
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
     * 页面上拉触底事件的处理函数
     */
    onReachBottom: function () {
        if (this.data.commentData.isGetAllOrders == false) {
            this._getComments(this.data.proId, this.data.page);
        }

    },


})