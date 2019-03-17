import {Base} from "../../utils/base.js";

class Comment extends Base{
    constructor(){
        super();
    }

    //提示模态框
    modal(t, c, showCancel = true, cancelText='取消',callback=()=>{}){
        wx.showModal({
            title: t,
            content: c,
            showCancel: showCancel,
            cancelText: cancelText,
            success:function(){
                callback && callback();
            }
        })
    }
    //提示成功
    toast(t, icon ='success', mask=true){
        wx.showToast({
           title: t,
           icon: icon,
           mask: mask
        })
    }
    //需主动关闭的提示框
    loading(t, mask=true){
        wx.showLoading({
            title: t,
            mask:mask
        })
    }

    /**
     * 发送评论
     */
    sendMsg(description, product_id,ord_id,imgArr,callback){
        this.loading('正在上传');
        var that = this;
        wx.request({
            url: this.baseRestUrl +'api/v1/comment/word',
            //url: 'https://weixinhkj.xyz/index.php/api/v1/comment/word',
            data: { description: description, product_id: product_id,ord_id:ord_id},
            header:{
                'content-type':'application/json',
                'token': wx.getStorageSync('token')
            },
            method:'POST',
            success:function(res){
                if (res.statusCode == 200 && res.data.com_id){
                    if(imgArr.length!=0){
                        that.uploadImg(res.data.com_id, imgArr,callback);
                    }else{
                        wx.hideLoading();
                        that.toast('评论成功');
                        //恢复初始状态
                        callback && callback();
                    }
                    
                }else{
                    that.modal('失败','发表评论失败',false);
                }
            },
            fail:function(res){
                console.log(res);
            }

        });
    }
    //上传图片
    uploadImg(com_id,imgArr,callback){
        var len = imgArr.length,
            that = this;
        for(let i=0;i<len;i++){
            wx.uploadFile({
                url: this.baseRestUrl +'api/v1/comment/img',
                //url: 'https://weixinhkj.xyz/index.php/api/v1/comment/img',
                filePath: imgArr[i],
                name: 'image',
                header:{
                    'content-type':'multipart/form-data',
                    'token': wx.getStorageSync('token')
                },
                formData: { com_id: com_id},
                success:function(res){
                    var rst = JSON.parse(res.data);
                    wx.hideLoading();
                    if (rst.error==0){
                        if(i==(len-1)){
                           
                            that.toast('评论成功');
                            //恢复初始状态
                            callback && callback();
                        }
                    }else{
                        that.modal('上传图片失败',rst.msg,false);
                    }
                },
                fail:function(res){
                    console.log('图片上传失败');
                    console.log(res);
                }
            })
        }
    }

    /**
     * 上传语音文件
     * 商品id 订单id 语音文件路径 录音时长
     */
    uploadVoice(product_id,order_id, voiceTemp,second,callback){
        this.loading('正在上传');
        var that=this;
        wx.uploadFile({
            url: this.baseRestUrl+'api/v1/comment/voice',
            //url: 'https://weixinhkj.xyz/index.php/api/v1/comment/voice',
            filePath: voiceTemp,
            name: 'voiceTemp',
            header: {
                'content-type': 'multipart/form-data',
                'token': wx.getStorageSync('token')
            },
            formData: { product_id: product_id,ord_id:order_id, second: second },
            success: function (res) {
                wx.hideLoading();
                //console.log(res);
                var rst = JSON.parse(res.data);
                if (rst.error == 0) {
                        that.toast('评论成功');
                        //恢复初始状态
                        callback && callback(res);
                } else {
                    that.modal('上传语音失败', rst.msg, false);
                }
            },
            fail: function (res) {
                that.modal('出错了', '语音发送失败，请稍后重试', false);
            }
        })
    }

    /**
     * 获取商品评论
     */
    getComments(proId,page,callback){
        var params = {
            url: 'api/v1/comments',
            type: 'GET',
            data: { id: proId,page:page },
            callback: callback
        };
        this.request(params);
    }
}
export { Comment};