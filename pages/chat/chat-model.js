import {Base} from "../../utils/base.js"

class Chat extends Base{
  constructor() {
    super();
  }

  getChatList(page, callback){
    var params = {
      url: "api/v1/chat/list?page=" + page,
      callback: callback
    };
    this.request(params);
  }

  chatToRead(){
    var params = {
      url: "api/v1/chat/read?type=1"
    };
    this.request(params);
  }

}

export {Chat}