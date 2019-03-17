import {Base} from "../../utils/base.js";

class My extends Base{
    constructor(){
        super();
    }

    /**
     * 获取到用户 微信信息后 去后台保存
     */
    saveUserInfo(userInfo,callback){
        var params = {
            url:'api/v1/userInfo',
            type:'POST',
            data: { userInfo: userInfo},
            callback: callback
        };
        this.request(params);
    }

    /**
     * 获取订单列表
     */
    getOrderList(page, callback){
        var params = {
            url: 'api/v1/order_list',
            type: 'GET',
            data: { page: page },
            callback: callback
        };
        this.request(params);
    }

    /**
     * 取消 待支付订单
     */
    orderCancel(orderId,callback){
        var params = {
            url: 'api/v1/order_cancel',
            type: 'GET',
            data: { id: orderId },
            callback: callback
        };
        this.request(params);
    }

    /**
     * 删除 已取消订单
     */
    orderDelete(orderId, callback) {
        var params = {
            url: 'api/v1/order_delete',
            type: 'GET',
            data: { id: orderId },
            callback: callback
        };
        this.request(params);
    }

    /**
    * 订单收货
    */
    orderConfirm(orderId, callback) {
        var params = {
            url: 'api/v1/order_confirm',
            type: 'GET',
            data: { id: orderId },
            callback: callback
        };
        this.request(params);
    }

    /**
     * 申请退款
     */
    refundOrder(orderId,content,callback){
        var params = {
            url: 'api/v1/order_refund',
            type: 'POST',
            data: { id: orderId, content: content },
            callback: callback
        };
        this.request(params);
    }

    /**
     * 获取订单id在当前数组的位置
     * @param orderId
     * @param array OrderList
     */
    getIdxByOrderList(orderId, orderList){
        var len = orderList.length,
            idx = -1;
        for(var i=0;i<len;i++){
            if (orderId == orderList[i].ord_id){
                idx = i;
            }
        }
        return idx;
    } 
}

export {My};