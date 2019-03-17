import {Base} from "../../utils/base.js";

class Product extends Base{
    constructor(){
        super();
    }

    /**
     * 获取某一商品详细信息
     */
    getProductDetail(id,callback){
        var params = {
            url:'api/v1/product?id=' +id,
            type:'GET',
            callback:callback
        };
        this.request(params);
    }

    /**
     * 获取商品评论
     */
    getComments(proId, page, callback) {
        var params = {
            url: 'api/v1/comments',
            type: 'GET',
            data: { id: proId, page: page },
            callback: callback
        };
        this.request(params);
    }
}

export {Product};