
import {Config} from "config.js";


class Token{
    constructor(){
        this.getTokenUrl = Config.restUrl + "api/v1/token";   //获取令牌的url
        this.checkTokenUrl = Config.restUrl + "api/v1/verifyToken";   //检测令牌的url
    }

    /**
     * 小程序初始化时 校验令牌
     * websocketBack回调函数 2019-5-11增加
     * 为了保证可以拿到有效的token，然后再去连接websocket，将token拼接参数传入
     * 为了连接成功时，服务器可以找到该用户是谁，然后返回未读消息数量，设置小红点
     */
    verifyToken(websocketBack){
        var token = wx.getStorageSync('token');
        if(token){  //去服务器校验是否过期
          this._checkTokenFromServer(token, websocketBack);
        }else{  //请求服务器获取token 存入本地
          this.getTokenFromServer(websocketBack);
        }
    }

    //校验令牌
  _checkTokenFromServer(token, websocketBack){
        var that = this;
        wx.request({
            url: this.checkTokenUrl,
            data: {token:token},
            header:{'content-type':'application/json'},
            method:'POST',
            success:function(res){
                if (!res.data.isValid){
                  that.getTokenFromServer(websocketBack);
                } else {
                  websocketBack && websocketBack(token)
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
                          callback && callback(res2.data.token);
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