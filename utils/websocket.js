import {Config} from "./config.js"

class Websocket{
  //连接服务器websocket
  connet(token){
    var socketTask = wx.connectSocket({
      url: Config.websocketUrl + '?token=' + token,
      header: {
        'content-type': 'application/json'
      },
      method: 'GET',
      success: function (obj) {
      },
      fail: function (err) {
        wx.showToast({
          title: 'websocket连接失败',
          icon: 'none'
        })
      }
    })
    const version = wx.getSystemInfoSync().SDKVersion
    if (this.compareVersion(version, '1.7.0') >= 0) {
      socketTask.onClose((obj) => {
        console.log('close', obj)
      })
      socketTask.onOpen((obj) => {
        console.log('open', obj)
      })
      socketTask.onError((obj) => {
        console.log('error', obj)
      })
      socketTask.onMessage((data)=>{
        console.log('data', data)
        var app = getApp()
        app.globalData.noreadnum = app.globalData.noreadnum + 1
        if (app.globalData.noreadnum>0) {
          wx.setTabBarBadge({
            index: 3,
            text: ''+app.globalData.noreadnum
          })
        }
      })
    }

    return socketTask
  }

  compareVersion(v1, v2) {
    v1 = v1.split('.')
    v2 = v2.split('.')
    const len = Math.max(v1.length, v2.length)

    while (v1.length < len) {
      v1.push('0')
    }
    while (v2.length < len) {
      v2.push('0')
    }

    for (let i = 0; i < len; i++) {
      const num1 = parseInt(v1[i])
      const num2 = parseInt(v2[i])

      if (num1 > num2) {
        return 1
      } else if (num1 < num2) {
        return -1
      }
    }

    return 0
  }

}

export {Websocket}