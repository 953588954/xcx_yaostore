import {Base} from "../../utils/base.js";
var base = new Base();

class Logistics extends Base{
    constructor(){
        super();
    }

    /**
     * 根据订单id获取物流
     */
    getLogisticsInfo(id,callback){
        var params = {
            url: 'api/v1/order_logistic',
            type: 'GET',
            data: { id: id },
            callback: callback
        };
        this.request(params);
    }
}

export {Logistics};