import { Base } from "../../utils/base.js";
var base = new Base();

class Cart extends Base {
    constructor() {
        super();
        this._strorageKeyName = "cart";
    }

    /**
     * 请求后台接口，验证购物车中商品数据
     */
    checkProductFromServer(callback){
        var storageData = this._getStorage(),   //购物车缓存数据
            len = storageData.length;
            if(len==0){
                callback([]);
                return ;
            }
        var data = [];  //要传入后台的二维数组数据
        for(var i=0; i<len; i++){
            var itemData = {};
            itemData.id = storageData[i].id;
            itemData.counts = storageData[i].counts;
            itemData.isSelect = storageData[i].isSelect;
            data.push(itemData);
        }
        if(len!=0){
            var params = {
                url: 'api/v1/newsProduct',
                type: 'POST',
                data: { cartProducts: data },
                callback: callback
            };
            base.request(params);
        }
    
    }
    /**
     * 从后台返回最新数据后，过滤下架商品，重新缓存
     */
    storageNewsProducts(productArr){
        var len = productArr.length;
        var arr = [];
        for(var i=0; i<len; i++){
            if(productArr[i].notPass==true){
                continue;
            }else{
                if (productArr[i].isSelect==1){
                    productArr[i].isSelect=true;
                }else{
                    productArr[i].isSelect = false;
                }
                productArr[i].price = parseFloat(productArr[i].price);
                productArr[i].counts = parseInt(productArr[i].counts);
                arr.push(productArr[i]);
            }
        }
        wx.setStorageSync(this._strorageKeyName, arr);
    }


    /**
     * 添加商品到购物车，缓存本地
     * {id,name,price,imgurl}
     */
    add(param, count) {
        //判断缓存中是否有此商品
        var rst = this._checkIdIsHave(param.id);
        if (rst.index == -1) {  //缓存新增
            param.counts = count;
            rst.data.push(param);
        } else {
            rst.data[rst.index].counts += count;
        }
        //更新缓存
        wx.setStorageSync(this._strorageKeyName, rst.data);
    }

    /**
     * 判断缓存中是否有此商品
     * id 商品id
     * return -1/index商品在数组中的位置
     */
    _checkIdIsHave(id) {
        var storageData = this._getStorage();   //购物车缓存数据
        var len = storageData.length;
        var index = -1;
        for (var i = 0; i < len; i++) {
            if (storageData[i].id == id) {
                index = i;
            }
        }
        return {
            index: index,
            data: storageData
        };
    }

    /**
     * 计算购物车总数量
     * flag   是否区分选择 或 不选中
     * count1   所有商品总数量
     * count2   商品类目 数量
     */
    getTotalCounts(flage = false) {
        var storageData = this._getStorage();
        var len = storageData.length,
            count1 = 0,
            count2 = 0;
        for (var i = 0; i < len; i++) {
            if (flage) {
                if (storageData[i].isSelect) {
                    count1 += storageData[i].counts;
                    count2++;
                }
            } else {
                count1 += storageData[i].counts;
                count2++;
            }
        }
        return {
            count1: count1,
            count2: count2
        }
    }

    /**
     * 计算选中 的商品总价钱
     * return float 价格
     */
    getSelectPrice() {
        var storageData = this._getStorage();
        var len = storageData.length,
            price = 0;
        for (var i = 0; i < len; i++) {
            if (storageData[i].isSelect) {
                price += storageData[i].price * 100 * storageData[i].counts;
            }
        }
        return price / 100;
    }

    //从缓存获取数据对象
    _getStorage() {
        var rst = wx.getStorageSync(this._strorageKeyName);
        if (!(rst instanceof Array)) {
            rst = [];
        }
        return rst;
    }

    /**
     * 获取所有选择商品
     */
    getSelectStorage(){
        var rst = this._getStorage(),
            len = rst.length,
            newArr = [];
        for(var i=0; i<len; i++){
            if(rst[i].isSelect){
                newArr.push(rst[i]);
            }
        }
        return newArr;
    }

    /**
     * 点击某一个商品 选中 或为选择按钮 更改缓存
     * param int id 商品id
     */
    toggleSelect(id) {
        var obj = this._checkIdIsHave(id);
        var storageData = obj.data;
        if(obj.index!=-1){
            storageData[obj.index].isSelect = !storageData[obj.index].isSelect;
            wx.setStorageSync(this._strorageKeyName, storageData);
        }
        
    }

    /**
     * 全部 选择/不选择
     * flage=true 全部选择 反之 全部不选择
     */
    selectAll(flage = true) {
        var storageData = this._getStorage();
        var len = storageData.length;
        for (var i = 0; i < len; i++) {
            if (flage) {
                storageData[i].isSelect = true;
            } else {
                storageData[i].isSelect = false;
            }
        }
        wx.setStorageSync(this._strorageKeyName, storageData);
    }

    /**
     * 增加/减少 商品
     */
    addOrIncProduct(id, flage = -1) {
        var obj = this._checkIdIsHave(id);
        var storageData = obj.data;
        if (obj.index != -1) {
            if (flage == -1) {
                if (storageData[obj.index].counts > 1) {
                    storageData[obj.index].counts--;
                }
            } else {
                storageData[obj.index].counts++;
            }
        }
        wx.setStorageSync(this._strorageKeyName, storageData);
    }
    /**
     * 从缓存中删除商品
     * id 商品id 或者id数组
     * isArr 传入的是否是数组
     */
    deleteProduct(id,isArr=false){
        if(!isArr){
            var obj = this._checkIdIsHave(id);
            var storageData = obj.data;
            if (obj.index != -1) {
                storageData.splice(obj.index, 1);
            }
            wx.setStorageSync(this._strorageKeyName, storageData);
        }else{
            for(var i=0;i<id.length;i++){
                var obj = this._checkIdIsHave(id[i]);
                var storageData = obj.data;
                if (obj.index != -1) {
                    storageData.splice(obj.index, 1);
                }
                wx.setStorageSync(this._strorageKeyName, storageData);
            }
        }   
        
    }

}

export { Cart };