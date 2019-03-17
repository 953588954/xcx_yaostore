import { Base } from "../../utils/base.js";

class Index extends Base{
    constructor(){
        super();
    }

    /**
     * 获取轮播图
     */
    getBanners(callback){
        var params = {
            'url': 'api/v1/banner',
            'callback':callback
        };
        this.request(params);
    }

    /**
     * 获取家中常备 随机10条商品数据
     */
    getRandomProducts(callback){
        var params = {
            'url': 'api/v1/products/random',
            'callback': callback
        };
        this.request(params);
    }

    /**
     * 搜索商品
     */
    searchProducts(str,callback){
        var params = {
            url:'api/v1/products/search',
            type:'POST',
            data: { searchStr:str},
            callback:callback
        };
        this.request(params);
    }
}

export {Index};
