import {Base} from "../../utils/base.js";

class Theme extends Base{
    constructor(){
        super();
    }

    /**
     * 获取主题图 以及 商品信息
     */
    getThemeData(theme,page,callback){
        var params = {
            url:'api/v1/theme?theme='+theme+'&page='+page,
            callback:callback
        };
        this.request(params);
    }


}

export {Theme};