import {Base} from "../../utils/base.js";

class Category extends Base{
    constructor(){
        super();
    }

    /**
     * 获取所有分类
     */
    getAllCategorys(callback){
        var params = {
            url:"api/v1/categorys",
            callback:callback
        };
        this.request(params);
    }

    /**
     * 根据分类id 获取 商品
     */
    getInfoByCatId(cat_id,callback){
        var params = {
            url: '/api/v1/category/products?cat_id='+cat_id,
            callback:callback
        };
        this.request(params);
    }

}

export {Category};