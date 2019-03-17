import {Base} from "../../utils/base.js";
// var base = new Base();

class Order extends Base{
    constructor(){
        super();
    }

    /**
     * 根据商品id 从后台获取地址 和邮费
     */
    getAddressAndPostage(productsArr,addressId,callback){
        var params = {
            url:'api/v1/address_postage',
            type:'POST',
            data: { productsArr: productsArr, addressId: addressId},
            callback:callback
        };
        this.request(params);
    }

    /**
     * 下单
     * productsArr 商品信息数字
     * addressId 地址id
     */
    placeOrder(productsArr, addressId,callback){
        var oProducts = this.settleProductsArr(productsArr);
        //console.log(oProducts);
        //console.log(addressId);
        var params = {
            url:'api/v1/place_order',
            type:'POST',
            data: { oProducts: oProducts, addressId: addressId},
            callback:callback
        };
        this.request(params);
    }

    //将商品数组 整理成 [['id': ,'count': ],[]...]
    settleProductsArr(productsArr){
        var len = productsArr.length,
            newArr = [];
        if(len==0){
            return productsArr;
        }
        for(var i=0;i<len;i++){
            var item = {};
            item.id = productsArr[i].id;
            item.count = productsArr[i].counts;
            newArr.push(item);
        }
        return newArr;
    }

    /**
     * 拉起微信支付
     * needCheckPrice 0代表不需要检测订单商品的价格，1需要检测。
     * 通常在刚下单支付不需要检测，第一次下单每支付，下次需检测
     */
    requestPay(order_id,callback,needCheckPrice=0){
        var params = {
            url: 'api/v1/pay/pay',
            type: 'GET',
            data: { order_id: order_id, needCheckPrice: needCheckPrice},
            callback: function(res){
                var payment = res.paySign;
                if (payment.timeStamp){
                    wx.requestPayment({
                        timeStamp: payment.timeStamp.toString(),
                        nonceStr: payment.nonceStr,
                        package: payment.package,
                        signType: payment.signType,
                        paySign: payment.paySign,
                        success:function(){
                            callback && callback(2);
                        },
                        fail:function(){
                            callback && callback(1);
                        }
                    });
                }else{
                    callback && callback(0);
                }
            }
        };
        this.request(params);
    }

    /**
     * 根据订单id获取详情
     */
    getDetailInfo(orderId,callback){
        var params = {
            url: 'api/v1/order_detail',
            type: 'GET',
            data: { id: orderId },
            callback: callback
        };
        this.request(params);
    }
}

export {Order};