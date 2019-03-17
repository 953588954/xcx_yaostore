import {Base} from "../../utils/base.js";

class Address extends Base{
    constructor(){
        super();
    }

    /**
     * 请求服务器，添加地址
     */
    addAddress(addressInfo,callback){
        var params = {
            url:'api/v1/address_add',
            type:'POST',
            data: { addressInfo: addressInfo},
            callback:callback
        };
        this.request(params);
    }

    /**
     * 获取所有地址
     */
    getAllAddress(callback){
        var params = {
            url:'api/v1/allAddress',
            type:'GET',
            callback: callback
        };
        this.request(params);
    }

    /**
     * 删除某一个地址
     */
    deleteProduct(id,callback){
        var params={
            url:'api/v1/address_del',
            type:'GET',
            data:{id:id},
            callback:callback
        };
        this.request(params);
    }

    /**
     * 设置默认收货地址
     */
    setDefaultAddress(id,callback){
        var params = {
            url:"api/v1/address_default",
            type:"GET",
            data:{id:id},
            callback:callback
        };
        this.request(params);
    }
}

export {Address};