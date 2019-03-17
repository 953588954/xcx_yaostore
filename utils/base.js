import {Config} from 'config.js';
import {Token} from 'token.js';


class Base{
    constructor(){
        this.baseRestUrl = Config.restUrl;
    }

    /*
     * 封装 公共请求 方法
    */
    request(params,again=false){
        var that = this,
            url = this.baseRestUrl + params.url;
        if(!params.type){
            params.type = "GET";
        }
        // 不需要再次组装地址
        if(params.setUpUrl==false){
            url = params.url;
        }
        wx.request({
            url: url,
            data:params.data,
            method:params.type,
            header:{
                // 'content-type':'application/json',
                'token' : wx.getStorageSync('token')
            },
            success:function(res){
                var statusCode = res.statusCode.toString();
                var firstCode = statusCode.charAt(0);
                if(firstCode=='2'){
                    params.callback && params.callback(res.data);
                } else if (statusCode=='401'){//可能是令牌过期，去服务器获取令牌，并重新访问一下接口
                    if(!again){
                        that._getAPIagain(params);
                    }
                } else if (statusCode == '400'){
                    //关闭提示
                    wx.hideLoading();
                    that._showModal('错误提示',res.data.msg,()=>{},false);
                }else{
                    console.log(res);
                }
                
            },
            fail:function(res){
                console.log(res);
            }
        })
    }
    //重新获取令牌，并重新访问
    _getAPIagain(params){
        var that = this;
        var token = new Token();
        token.getTokenFromServer(()=>{
            that.request(params, true);
        });  
    }

    /**
     * 公共 获取data- 数据
     */
    getData(event,str){
        return event.currentTarget.dataset[str];
    }

    /**
     * 公共截取商品名方法 
     * 截取8个字符
     */
    subProductName(proArr){
        var len = proArr.length;
        for(var i=0;i<len;i++){
            proArr[i].pro_name = proArr[i].pro_name.substr(0,8);
        }
        return proArr;
    }

    /**
     * 公共弹出框
     * title 标题  content 提示内容
     * showCancel 是否显示取消按钮 cancelText 取消按钮的文字
     */
    _showModal(title, content, callback, showCancel = true, cancelText ="手滑了"){
        wx.showModal({
            title: title,
            content: content,
            showCancel: showCancel,
            cancelText: cancelText,
            success:function(res){
                callback && callback(res);
            }
        })
    }

    /**
     * 提示框  几秒后自动消除
     * title 提示的文字
     * mask 是否防止触摸穿透
     * icon 图标
     * duration 提示的延迟时间
     */
    toast(title, mask =true,icon = 'success', duration = 1500){
        wx.showToast({
            title: title,
            icon:icon,
            duration: duration,
            mask: mask
        })
    }

    /***
     * 提示框 需要主动调用 隐藏
     * 
     */
    loading(title, mask=true){
        wx.showLoading({
            title: title,
            mask:mask
        })
    }

    //去除字符串空格
    trim(str){
        return str.replace(/(^\s*)|(\s*$)/g, "");
    }

    //将浮点数*100倍返回  解决运算精度问题
    numberFloat(price){
        //   var pri = "36.05";
    //   console.log(Number(pri.replace(".",""))); 3605
    //   console.log(Number(pri.replace(".", ""))/100); 36.05
    var priceStr = price.toString();
    return Number(priceStr.replace(".", ""));
    }

}

export {Base};