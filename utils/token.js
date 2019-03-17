
import {Config} from "config.js";


class Token{
    constructor(){
        this.getTokenUrl = Config.restUrl + "api/v1/token";   //获取令牌的url
        this.checkTokenUrl = Config.restUrl + "api/v1/verifyToken";   //检测令牌的url
    }

    /**
     * 小程序初始化时 校验令牌
     */
    verifyToken(){
        var token = wx.getStorageSync('token');
        if(token){  //去服务器校验是否过期
            this._checkTokenFromServer(token);
        }else{  //请求服务器获取token 存入本地
            this.getTokenFromServer();
        }
    }

    //校验令牌
    _checkTokenFromServer(token){
        var that = this;
        wx.request({
            url: this.checkTokenUrl,
            data: {token:token},
            header:{'content-type':'application/json'},
            method:'POST',
            success:function(res){
                if (!res.data.isValid){
                    that.getTokenFromServer();
                }
            }
        });
    }

    //获取token
    getTokenFromServer(callback){
        var that = this;

        wx.login({
            success:function(res){
                if(res.code){
                    wx.request({
                        url: that.getTokenUrl,
                        data: { code: res.code},
                        header: { 'content-type': 'application/json' },
                        method: 'POST',
                        success: function (res2) {
                            wx.setStorageSync('token', res2.data.token);
                            callback && callback();
                        }
                    });
                }else{
                    console.log('获取用户登录态失败！'+res.errMsg);
                }
            }
        });
    }
}

export {Token};