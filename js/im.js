layui.extend({
    "crypto-js": "crypto-js/core",
    "hmac": "crypto-js/hmac",
    "sha1": "crypto-js/sha1",
    "cos-js": "cos-js-sdk-v5"
}).define(function(exports){
    exports("crypto-js","");
    exports("hmac","");
    exports("sha1","");
    exports("cos-js","");
}).define(["jquery","laytpl", "layer", "util","crypto-js","hmac","sha1", "cos-js"], function(exports){
    const $ = layui.jquery;
    //console.log($.ajaxSettings);
    //const element = layui.element;
    const laytpl = layui.laytpl;
    const layer = layui.layer;
    const util = layui.util;
    const cosBuket = "img-1254458373";
    const cosHost = "https://img-1254458373.cos.ap-guangzhou.myqcloud.com";
    const secretId = "AKIDdCZluteVCleR2RLeCeu1F3kFaormi4Rb";
    const secretKey = "APVQ9PZYM6kCfy8A3mKhy50kU4Thlvyq";

    /**
     * 构建鉴权字段
     *
     * q-sign-algorithm	sha1	签名算法，目前仅支持 sha1，即为 sha1 。	是
     * q-ak	参数[SecretID]	帐户 ID，即 SecretId，在访问管理控制台的 API 密钥管理 页面可获取。
     * 例如：AKIDQjz3ltompVjBni5LitkWHFlFpwkn9U5q 。	是
     * q-sign-time	参数[SignTime]	本签名的有效起止时间，通过 Unix 时间戳 描述起始和结束时间，以秒为单位，格式为 [start-seconds];[end-seconds]。
     * 例如： 1480932292;1481012298 。	是
     * q-key-time	参数[KeyTime]	与 q-sign-time 值相同。	是
     * q-header-list	参数[SignedHeaderList]	HTTP 请求头部。需从 key:value 中提取部分或全部 key，且 key 需转化为小写，并将多个 key 之间以字典顺序排序，如有多组 key，可用“;”连接。
     * 例如： HTTP 请求 “ Host: bucket1-1254000000.cos.ap-beijing.myqcloud.com Content-Type: image/jpeg ”，其 SignedHeaderList 为 content-type;host 。	是
     * q-url-param-list	参数[SignedParameterList]	HTTP 请求参数。需从 key=value 中提取部分或全部 key，且 key 需转化为小写，并将多个 key 之间以字典顺序排序，如有多组 key，可用“;”连接。
     * 例如： HTTP 请求 “ GET /?prefix=abc&max-keys=20 ” ，其则 SignedParameterList 为 max-keys;prefix 或者 prefix 。	是
     * q-signature	参数[Signature]	HTTP 内容签名，请查看 Signature 计算。
     * @param uri
     * @param header
     * @param param
     */
    function authorization(uri, header, param){
        let nowTime = Math.round(new Date().getTime() / 1000);
        let qSignTime = nowTime + ";"+ (nowTime + 600);
        let qKeyTime = qSignTime;
        let httpHeaders = function(){
            let headerStr ="";
            for(let key in header){
                headerStr += key + "=" + header[key] + ";";
            }
            headerStr.length > 0 && (headerStr =  headerStr.substr(0, headerStr.length - 1));
            return headerStr.toLowerCase();
        }();
        let httpParameters = function(){
            let paramStr ="";
            for(let key in param){
                paramStr += key + "=" + param[key] + ";";
            }
            paramStr.length > 0 && (paramStr.length =  paramStr.length -1);
            return paramStr.toLowerCase();
        }();
        /**
         * SignKey = HMAC-SHA1(SecretKey,"[q-key-time]")
         * HttpString = [HttpMethod]\n[HttpURI]\n[HttpParameters]\n[HttpHeaders]\n
         * StringToSign = [q-sign-algorithm]\n[q-sign-time]\nSHA1-HASH(HttpString)\n
         * Signature = HMAC-SHA1(SignKey,StringToSign)
         * */
        let signKey = CryptoJS.HmacSHA1(qKeyTime, secretKey).toString();
        let httpString = "put\n" + uri + "\n" + httpParameters + "\n" + httpHeaders + "\n";
        let stringToSign = "sha1\n" + qSignTime + "\n" + CryptoJS.SHA1(httpString) + "\n";
        let signature = CryptoJS.HmacSHA1(stringToSign, signKey).toString()
        let authorization = [
                "q-sign-algorithm=sha1",
                "&q-ak=" + secretId,
                "&q-sign-time=" + qSignTime,
                "&q-key-time=" + qKeyTime,
                "&q-header-list=" + Object.keys(header).join(";").toLowerCase(),
                "&q-url-param-list=" + Object.keys(param).join(";").toLowerCase(),
                "&q-signature=" + signature
            ].join("");

        return authorization;
    }
    //console.log(CryptoJS.HmacSHA1(secretKey, new Date().getTime()+"").toString());
    /**联系人模板*/
    const tplContacts =
        ['<div id ="chat-contact" class="contacts">',
            '<div class="contacts-head">',
                '<div class="user-info">',
                    '<img src="{{ d.img || \"https://img.gcall.com/dca5/M00/03/2C/wKhoNleoLduEd68rAAAAAAAAAAA961_260x260.jpg\" }}" />',
                    '<div class="upload-icon">',
                        '<i class="layui-icon layui-icon-camera-fill" title="更改图像"></i>',
                        '<input type="file" accept="image/*"/>',
                    '</div>',
                    '<div class="name">{{ d.name }}</div>',
                    '<input placeholder="编辑签名" value="{{ d.sign }}" />',
                '</div>',
                '<i class="layui-icon layui-icon-close"></i>',
                '<div class="move"></div>',
                '<ul>',
                    '<li id ="history-tab" class="layui-icon layui-icon-reply-fill contacts-tab" title="历史会话"></li>',
                    '<li id ="contact-tab" class="layui-icon layui-icon-friends contacts-tab" title="联系人" checked></li>',
                    '<li id ="group-tab" class="layui-icon layui-icon-group contacts-tab" title="群组"></li>',
                '</ul>',
            '</div>',
            '<div class="contacts-content">',
            '</div>',
            '<div class="contacts-tool">',
                '<ul>',
                    '<li class="contact-search"><i class="layui-icon layui-icon-search" title="搜索"></i></li>',
                    '<li class="contact-add"><i class="layui-icon layui-icon-add-circle" title="添加"></i></li>',
                    '<li class="contact-notice" data-count="3"><i class="layui-icon layui-icon-speaker" title="消息通知"></i></li>',
                    '<li class="contact-refresh"><i class="layui-icon layui-icon-refresh" title="刷新"></i></li>',
                    '<li class="contact-about"><i class="layui-icon layui-icon-set" title="设置"></i></li>',
                '</ul>',
                '<div class="input">',
                    '<input type="text"/>',
                    '<i class="close layui-icon layui-icon-close"></i>',
                '</div>',
            '</div>',
        '</div>'].join("");
    const tplGrouping =
        ['<h5 id ="grouping-{{ d.id }}" class="contacts-grouping">' +
            '<i class="layui-icon {{ d.collapsed ? \"layui-icon-right\" : \"layui-icon-down\" }}">&nbsp;</i>' +
        '{{ d.name }}</h5>'].join("");
    const tplItems =
        ['<ul>',
            '{{# layui.each(d, function(idx, item){ }}',
            '<li status ="{{ item.status || 0 }}" data-id="{{ item.id }}">',
                '<img src="{{ item.img || \"https://img.gcall.com/dca5/M00/03/2C/wKhoNleoLduEd68rAAAAAAAAAAA961_260x260.jpg\" }}" />',
                '<span class="name">{{ item.name }}</span>',
                '<p class="sign">{{ item.sign || item.latest }} </p>',
            '</li>',
            '{{# }); }}',
        '</ul>'].join("");
    const tplLoading =
        "<div class='loading'><i class='layui-icon layui-icon-loading layui-anim layui-anim-rotate layui-anim-loop'></i><div>loading</div></div>";

    /**聊天对话框模板*/
    const tplChat =
        ['<div class="chat-dialog">',
            '<div class="chat-list">',
                '<ul></ul>',
            '</div>',
            '<div class="chat-main">',
            '</div>',
        '</div>'].join("");

    const tplChatListItem =
        ['<li class="item-user  {{ d.select ? \"select\":\"\" }}" status ="{{ d.status || 0 }}" data-id="{{ d.id }}">',
            '<img src="{{ d.img || \"https://tva2.sinaimg.cn/crop.0.8.751.751.180/961a9be5jw8fczq7q98i7j20kv0lcwfn.jpg\" }}">',
            '<span class="name">{{ d.name }}</span>',
            '<div class="close"><i class="layui-icon layui-icon-close-fill"></i></div>',
        '</li>',].join("");

    const tplChatMain =
        ['<div class="user-info" status ="{{ d.status || 0 }}" data-id="{{ d.id }}">',
            '<img src="{{ d.img || \"https://tva2.sinaimg.cn/crop.0.8.751.751.180/961a9be5jw8fczq7q98i7j20kv0lcwfn.jpg\" }}">',
            '<span class="nick-name {{ d.inputting ? \"inputting\" : \"\"}}">{{ d.name }}</span>',
        '</div>',
        '<i class="close-all layui-icon layui-icon-close"></i>',
        '<div class="move"></div>',
        '<ul class="msg-show">',
        '</ul>',
        '<div class="chat-tool">',
            '<ul>',
                '<li><i class="layui-icon layui-icon-face-smile-fine" title="发送表情"></i></li>',
                '<li><i class="layui-icon layui-icon-picture-fine" title="发送图片"></i></li>',
                '<li><i class="layui-icon layui-icon-file" title="发送文件"></i></li>',
                '<li><i class="layui-icon layui-icon-video" title="发送视频"></i></li>',
                '<li><i class="layui-icon layui-icon-search" title="搜索消息"></i></li>',
            '</ul>',
        '</div>',
        '<div class="msg-input">',
            '<textarea></textarea>',
        '</div>',
        '<div class="msg-send">',
            '<button class="send">发送</button>',
            '<button class="close">关闭</button>',
        '</div>'].join("");

    const tplMsg =
        ['<li class="{{ d.mine ? \"mine \" : \"\" }}" data-userId="{{ d.userId }}"  data-msgId= {{ d.id }}>',
            '<img src="{{ d.img || \"https://img.gcall.com/dca5/M00/03/2C/wKhoNleoLduEd68rAAAAAAAAAAA961_260x260.jpg\" }}">',
            '<span class="name">{{ d.name }}</span>',
            '<span class="time">{{ d.time }}</span>',
            '<div class="content">{{ d.content }}</div>',
        '</li>'].join("");

    /**表情模板*/
    const tplFace =
        ['<ul class="chat-face">',
            '{{# d.forEach(function(item){ }}',
            '<li title="{{ item.title }}">',
                '<img src="{{ item.src }}" />',
            '</li>',
            '{{# }); }}',
        '</ul>'].join("");
    const dataFaceArray =
        [{"src":"img/face/0.gif","title":"[微笑]"},{"src":"img/face/1.gif","title":"[嘻嘻]"},{"src":"img/face/2.gif","title":"[哈哈]"},{"src":"img/face/3.gif","title":"[可爱]"},{"src":"img/face/4.gif","title":"[可怜]"},{"src":"img/face/5.gif","title":"[挖鼻]"},{"src":"img/face/6.gif","title":"[吃惊]"},{"src":"img/face/7.gif","title":"[害羞]"},{"src":"img/face/8.gif","title":"[挤眼]"},{"src":"img/face/9.gif","title":"[闭嘴]"},{"src":"img/face/10.gif","title":"[鄙视]"},{"src":"img/face/11.gif","title":"[爱你]"},{"src":"img/face/12.gif","title":"[泪]"},{"src":"img/face/13.gif","title":"[偷笑]"},{"src":"img/face/14.gif","title":"[亲亲]"},{"src":"img/face/15.gif","title":"[生病]"},{"src":"img/face/16.gif","title":"[太开心]"},{"src":"img/face/17.gif","title":"[白眼]"},{"src":"img/face/18.gif","title":"[右哼哼]"},{"src":"img/face/19.gif","title":"[左哼哼]"},{"src":"img/face/20.gif","title":"[嘘]"},{"src":"img/face/21.gif","title":"[衰]"},{"src":"img/face/22.gif","title":"[委屈]"},{"src":"img/face/23.gif","title":"[吐]"},{"src":"img/face/24.gif","title":"[哈欠]"},{"src":"img/face/25.gif","title":"[抱抱]"},{"src":"img/face/26.gif","title":"[怒]"},{"src":"img/face/27.gif","title":"[疑问]"},{"src":"img/face/28.gif","title":"[馋嘴]"},{"src":"img/face/29.gif","title":"[拜拜]"},{"src":"img/face/30.gif","title":"[思考]"},{"src":"img/face/31.gif","title":"[汗]"},{"src":"img/face/32.gif","title":"[困]"},{"src":"img/face/33.gif","title":"[睡]"},{"src":"img/face/34.gif","title":"[钱]"},{"src":"img/face/35.gif","title":"[失望]"},{"src":"img/face/36.gif","title":"[酷]"},{"src":"img/face/37.gif","title":"[色]"},{"src":"img/face/38.gif","title":"[哼]"},{"src":"img/face/39.gif","title":"[鼓掌]"},{"src":"img/face/40.gif","title":"[晕]"},{"src":"img/face/41.gif","title":"[悲伤]"},{"src":"img/face/42.gif","title":"[抓狂]"},{"src":"img/face/43.gif","title":"[黑线]"},{"src":"img/face/44.gif","title":"[阴险]"},{"src":"img/face/45.gif","title":"[怒骂]"},{"src":"img/face/46.gif","title":"[互粉]"},{"src":"img/face/47.gif","title":"[心]"},{"src":"img/face/48.gif","title":"[伤心]"},{"src":"img/face/49.gif","title":"[猪头]"},{"src":"img/face/50.gif","title":"[熊猫]"},{"src":"img/face/51.gif","title":"[兔子]"},{"src":"img/face/52.gif","title":"[ok]"},{"src":"img/face/53.gif","title":"[耶]"},{"src":"img/face/54.gif","title":"[good]"},{"src":"img/face/55.gif","title":"[NO]"},{"src":"img/face/56.gif","title":"[赞]"},{"src":"img/face/57.gif","title":"[来]"},{"src":"img/face/58.gif","title":"[弱]"},{"src":"img/face/59.gif","title":"[草泥马]"},{"src":"img/face/60.gif","title":"[神马]"},{"src":"img/face/61.gif","title":"[囧]"},{"src":"img/face/62.gif","title":"[浮云]"},{"src":"img/face/63.gif","title":"[给力]"},{"src":"img/face/64.gif","title":"[围观]"},{"src":"img/face/65.gif","title":"[威武]"},{"src":"img/face/66.gif","title":"[奥特曼]"},{"src":"img/face/67.gif","title":"[礼物]"},{"src":"img/face/68.gif","title":"[钟]"},{"src":"img/face/69.gif","title":"[话筒]"},{"src":"img/face/70.gif","title":"[蜡烛]"},{"src":"img/face/71.gif","title":"[蛋糕]"}];
    const dataFace = function(){
        let face = {};
        dataFaceArray.forEach(function(item){
            face[item.title] = item.src;
        });
        return face;
    }();
    const StoreType = {
        StoreContact: "user-contact",
        StoreGroup: "user-group",
        StoreChatHis : "user-chat-history",
        StoreChatDialog: "chat-dialog",
        StoreMsgHis: function(id){return "msg-history-" + id}
    };
    function storeData(storeType, data){
        if(data == undefined){
            let storeData = window.sessionStorage.getItem(storeType);
            return storeData ? JSON.parse(storeData) : undefined;
        }else if(!data){
            window.sessionStorage.removeItem(storeType);
        }else{
            window.sessionStorage.setItem(storeType, JSON.stringify(data));
        }
    }
    let Im = function(){};
    /**user, contFunc, groupFunc, chatHisFunc, msgHisFunc*/
    Im.prototype.init = function(conifg){
        let that = this;
        let $contacts = $(".contacts");
        if($contacts.length > 0) {
            return ;
        }
        this.user = conifg.user;
        this.contFunc = conifg.contFunc ? function(callback){
            let data = storeData(StoreType.StoreContact);
            if(data){
                callback(data);
            }else {
                conifg.contFunc(function(data){
                    storeData(StoreType.StoreContact, data);
                    callback(data);
                });
            }
        } : undefined;
        this.groupFunc = conifg.groupFunc ? function(callback){
            let data = storeData(StoreType.StoreGroup);
            if(data) {
                callback(data);
            }else{
                conifg.groupFunc(function(data){
                    storeData(StoreType.StoreGroup, data);
                    callback(data);
                });
            }
        } : undefined;
        this.chatHisFunc = conifg.chatHisFunc ? function(callback){
            let data = storeData(StoreType.StoreChatHis);
            if(data){
                callback(data);
            }else {
                conifg.chatHisFunc(function(data){
                    storeData(StoreType.StoreChatHis, data);
                    callback(data);
                });
            }
        } : undefined;
        /**消息倒序查询*/
        this.msgHisFunc = conifg.msgHisFunc ? function(id, lastMsgId, limit, callback){
            if(lastMsgId == undefined){
                lastMsgId = 0;
            }
            let data = storeData(StoreType.StoreMsgHis(id));
            /**要查询的数据不在本地*/
            if(lastMsgId = 0 || !data || lastMsgId > data[0]){
                conifg.msgHisFunc(id, lastMsgId, limit, function(callBackData){
                    if(callBackData && callBackData.length > 0){
                        if(!data){
                            //本地没有数据直接存储
                            storeData(StoreType.StoreMsgHis(id), callBackData)
                        }else {
                            let lastMsg= callBackData[callBackData.length -1];
                            if(lastMsg.id > data[0].id){
                                //查询的数据还不在本地，存储一个空数据，表示空数据的地方还要从网络再次拉取
                                data.unshift({});
                                data.splice(0, 0, callBackData);
                            }else{
                                //查询的数据部分在本地,网络查询到的数据从该地方插入
                                while(data.length > 0 && data[0] >= lastMsg.id) {
                                    data.shift();
                                }
                                let firstMsg= callBackData[0], idx1 ;
                                for(idx1 = 0; idx1 < data.length; idx1 ++){
                                    if(firstMsg.id >= data[idx1]){
                                        break;
                                    }
                                }
                                let idx2 ;
                                for(idx2 = 0; idx2 < data.length; idx2 ++){
                                    if(lastMsg.id = data[idx2]){
                                        idx2++;
                                        break;
                                    }else if(lastMsg.id > data[idx2]){
                                        break;
                                    }
                                }
                                data.splice(idx1, idx2 - idx1, callBackData);
                            }
                            storeData(StoreType.StoreMsgHis(id), data);
                        }
                    }
                    callback(callBackData);
                });
            }else {
                /**要查询的数据在本地*/
                let callbackData= [], idx;
                for (idx = 0; idx < data.length; idx ++){
                    if(lastMsgId == data[idx].id){
                        idx ++;
                        break;
                    }else if(lastMsgId > data[idx].id){
                        break;
                    }
                }
                for(let i = idx ; i < data.length && limit > 0; i ++, limit --){
                    if(!$.isEmptyObject(data[i])){
                        callback.push(data[i]);
                    }else{
                        //本地数据存储空，表示要从网络取数据补充
                        conifg.msgHisFunc(id, i - 1 >= 0 ? data[i - 1].id : 0, limit, function(cbData){
                            if(cbData && cbData.length > 0){
                                for(let j = 0; i< cbData.length; j++){
                                    if(i+1 >= data.length || cbData[j].id > data[i+1].id){
                                        data.splice(i, 0, cbData[j]);
                                    }else {
                                        //数据填补完了，删除空数据
                                        data.splice(i, 1);
                                        break;
                                    }
                                }
                                storeData(StoreType.StoreMsgHis(id), data);
                                callbackData.splice(callbackData.length, 0, cbData);
                            }else {
                                //取不到数据，去除后面所有的数据
                                data.splice(i, data.length - i);
                                storeData(StoreType.StoreMsgHis(id), data);
                            }
                        });
                        break;
                    }
                }
            }
        } : function(id, lastMsgId, limit, callback){
            let data = storeData(StoreType.StoreMsgHis(id));
            if(data && data.length > 0){
                for(let i = 0 ; i< data.length ; i ++){
                    if(!lastMsgId || lastMsgId > data[i].id){
                        callback(data.slice(i, i+ limit));
                        return;
                    }
                }
                callback([]);
            }else{
                callback([]);
            }
        };

        laytpl(tplContacts).render(that.user, function(html){
            $(document.body).append(html);
            $contacts = $(".contacts");
            $contacts.css({
                left: $(window).width() - $contacts.width(),
                top: $(window).height()
            }).stop().animate({
                left: $(window).width() - $contacts.width(),
                top: $(window).height() - $contacts.height()
            });
            if(that.contFunc){
                that.renderContact();
            }
            /**更换图像*/
            $contacts.on("click", ".upload-icon .layui-icon", function(){
                $contacts.find(".upload-icon input[type='file']").click();
            });
            $contacts.on("change", ".upload-icon input[type='file']", function(){
                let that = this;
                let iconImg = this.files[0];
                let imgSuffix = iconImg.name.substr(iconImg.name.lastIndexOf("."));
                let uri = "/" + CryptoJS.SHA1(Math.random()+"") + imgSuffix;
                let url = cosHost + uri;
                console.log(Math.random());
                let xhr = new XMLHttpRequest();
                xhr.open("put", url, true);
                xhr.setRequestHeader("Authorization", authorization(uri, {}, {}));
                xhr.send(iconImg);
                xhr.onreadystatechange = function(){
                    if (xhr.readyState==4)
                    {
                        $contacts.find(".user-info img").attr("src", url);
                    }
                };
            });

            /**tab切换*/
            $contacts.on("click", ".contacts-tab", function(){
                if(!this.hasAttribute("checked")) {
                    $(".contacts-tab").removeAttr("checked");
                    $(this).attr("checked","");
                    if($(this).attr("id") == "contact-tab"){
                        that.renderContact();
                    }else if($(this).attr("id") == "group-tab"){
                        that.renderGroup();
                    }else if($(this).attr("id") == "history-tab"){
                        that.renderChatHis();
                    }
                }
            });

            /**刷新*/
            $contacts.on("click", ".contact-refresh .layui-icon", function(event){
                let $checkTab = $(".contacts-tab[checked]");
                if($checkTab.attr("id") == "contact-tab"){
                    that.renderContact(true);
                }else if($checkTab.attr("id") == "group-tab"){
                    that.renderGroup(true);
                }else if($checkTab.attr("id") == "history-tab"){
                    that.renderChatHis(true);
                }
            });

            /**联系人分组展开收起*/
            $contacts.on("click", ".contacts-grouping", function(event){
                let $icon = $(this).children().first();
                let domId = $(this).attr("id");
                let contactData = storeData(StoreType.StoreContact);
                if($icon.hasClass("layui-icon-down")){
                    $icon.removeClass("layui-icon-down").addClass("layui-icon-right");
                    $(this).next().hide();
                    domId && contactData && contactData.forEach(grouping =>{
                        if(domId == "grouping-" + grouping.groupId){
                            grouping.collapsed = 1;
                        }
                    });
                }else if($icon.hasClass("layui-icon-right")){
                    $icon.removeClass("layui-icon-right").addClass("layui-icon-down");
                    $(this).next().show();
                    domId && contactData && contactData.forEach(grouping =>{
                        if(domId == "grouping-" + grouping.groupId){
                            delete grouping["collapsed"];
                        }
                    });
                }
                storeData(StoreType.StoreContact, contactData);
            });

            /**窗口改变尺寸*/
            $(window).resize(function(){
                $contacts.css({
                    left: $(window).width() - $contacts.width(),
                    top: $(window).height() - $contacts.height()
                });
            });

            /**联系人窗口拖动效果*/
            $contacts.on("mousedown", ".move", function(e){that.drag(e, $contacts)});
            $(window).mouseup(function(){
                that.stopDrag($contacts);
            });

            /**关闭窗口*/
            $contacts.on("click", ".contacts-head .layui-icon-close", function(){that.hide()});
            /**工具栏搜索*/
            $contacts.on("click", ".contacts-tool .contact-search", function(){
                $contacts.find(".contacts-tool .input").show().find("input").focus().attr("placeholder", "搜索我的联系人");
            });
            $contacts.on("click", ".contacts-tool .input .close", function(){
                $(this).parent().hide().find("input").val("");
            });
            /**工具栏添加*/
            $contacts.on("click", ".contacts-tool .contact-add", function(){
                $contacts.find(".contacts-tool .input").show().find("input").focus().attr("placeholder", "搜索添加联系人");
            });

            /**打开聊天对话框*/
            $contacts.on("click", ".contacts-content li", function(){
                let contactInfo = {};
                contactInfo.id = $(this).attr("data-id");
                contactInfo.img = $(this).find("img").attr("src");
                contactInfo.name =$(this).find(".name").text();
                contactInfo.status = $(this).attr("status") || 0;
                that.newChatItem(contactInfo);
            });

            /**聊天对话框渲染*/
            that.renderChatDialog();
        });
    };

    Im.prototype.renderContact = function(reload){
        let $contactsContent = $(".contacts .contacts-content");
        $contactsContent.empty().append(tplLoading);
        if(reload){
            storeData(StoreType.StoreContact,"");
        }
        this.contFunc && this.contFunc(function(data){
            $contactsContent.empty();
            for(let i = 0; i < data.length; i++){
                let grouping = {
                    id: data[i].groupId,
                    name: data[i].groupName,
                    collapsed: data[i].collapsed
                };
                laytpl(tplGrouping).render(grouping, function(groupingHtml){
                    $contactsContent.append(groupingHtml);
                    if(data[i].list){
                        laytpl(tplItems).render(data[i].list, function(contactsHtml){
                            $contactsContent.append(contactsHtml);
                            if(data[i].collapsed){
                                $contactsContent.children().last().hide();
                            }
                        });
                    }
                });
            }
        });
    };
    Im.prototype.renderGroup = function(reload){
        let $contactsContent = $(".contacts .contacts-content");
        $contactsContent.empty().append(tplLoading);
        if(reload){
            storeData(StoreType.StoreGroup, "");
        }
        this.groupFunc && this.groupFunc(function(data){
            laytpl(tplItems).render(data, function(html){
                $contactsContent.empty().append(html);
            });
        });
    };
    Im.prototype.renderChatHis = function(reload){
        let $contactsContent = $(".contacts .contacts-content");
        $contactsContent.empty().append(tplLoading);
        if(reload){
            storeData(StoreType.StoreChatHis, "");
        }
        this.chatHisFunc && this.chatHisFunc(function(data){
            laytpl(tplItems).render(data, function(html){
                $contactsContent.empty().append(html);
            });
        });
    };
    Im.prototype.hide = function(){
        let $contacts = $(".contacts"), that = this;
        $contacts.css({
            "box-shadow": "none",
            left: $(window).width() - $contacts.width(),
            top: $(window).height() - 1
        });
        $(".contacts .move").css({cursor:"pointer"}).one("mouseenter", () => that.show());

    };
    Im.prototype.show = function(){
        let $contacts = $(".contacts");
        $contacts.css({
            "box-shadow": "",
            top: $(window).height() - $contacts.height()
        });
        $(".contacts .move").css({cursor:""});
    };

    Im.prototype.drag = function(event, $element){
        let that = this;
        this.dragging = {lastX: event.pageX, lastY: event.pageY, $element: $element};
        if(!this.mouseMove){
            this.mouseMove = function(event){
                var lastOffset = that.dragging.$element.offset();
                var moveX = event.pageX - that.dragging.lastX;
                var moveY = event.pageY - that.dragging.lastY;
                var minLeft = $(document).scrollLeft();
                var maxLeft = $(window).width() + $(document).scrollLeft() - that.dragging.$element.width();
                var minTop = $(document).scrollTop();
                var maxTop = $(window).height() + $(document).scrollTop() - that.dragging.$element.height();
                that.dragging.$element.offset({
                    left: Math.min(Math.max(lastOffset.left + moveX, minLeft), maxLeft),
                    top: Math.min(Math.max(lastOffset.top + moveY, minTop), maxTop)
                });
                that.dragging.lastX = event.pageX;
                that.dragging.lastY = event.pageY;
            };
        }
        $(window).on("mousemove", that.mouseMove);
    };
    Im.prototype.stopDrag = function(){
        $(document).css({cursor: ""});
        this.mouseMove && $(window).off("mousemove", this.mouseMove);
    };
    Im.prototype.renderChatDialog = function(){
        let that = this;
        let data = storeData(StoreType.StoreChatDialog);
        if(data) {
            let $chatDialog = $(".chat-dialog");
            if($chatDialog.length > 0){
                $chatDialog.find(".chat-list ul, .chat-main").empty();
            }else {
                laytpl(tplChat).render({}, function(html){
                    $(document.body).append(html);
                    $chatDialog = $(".chat-dialog");
                    $chatDialog.css({
                        left: ($(window).width() - $chatDialog.width())/2,
                        top: ($(window).height() - $chatDialog.height())/2
                    });
                    /**关闭聊天对话框*/
                    $chatDialog.on("click", ".chat-main .close-all", function(){
                        that.closeChatDialog();
                    });
                    /**选中聊天对象*/
                    $chatDialog.on("click", ".chat-list li", function(){
                        that.selectChatItem($(this).attr("data-id"));
                    });
                    /**关闭聊天对象*/
                    $chatDialog.on("click", ".chat-list li .close .layui-icon", function(){
                        that.closeChatDialog($(this).parent().parent().attr("data-id"));
                        return false;
                    });
                    $chatDialog.on("click", ".msg-send .close", function(){
                        that.closeChatDialog($chatDialog.find(".chat-main .user-info").attr("data-id"));
                        return false;
                    });
                    /**拖动效果*/
                    $chatDialog.on("mousedown", ".chat-main .move", function(event){
                        that.drag(event, $chatDialog);
                    });
                    $(window).on("mouseup", function(){
                        that.stopDrag($chatDialog);
                    });
                    /**发送消息*/
                    $chatDialog.on("click", ".msg-send .send", function(){
                        that.sendMsg();
                    });
                    $chatDialog.on("keydown", ".msg-input textarea", function(event){
                        if(event.which == 13) {
                            that.sendMsg();
                            event.preventDefault();
                        }
                    });
                    /**聊天表情*/
                    $chatDialog.on("click", function(event){
                        if(event.target == $chatDialog.find(".chat-tool .layui-icon-face-smile-fine")[0]){
                            that.showFace($(event.target));
                        }else {
                            $chatDialog.find(".chat-face").hide();
                        }
                    });
                    $chatDialog.on("click", ".chat-face li", function(event){
                        let $msgInput = $chatDialog.find(".msg-input textarea");
                        $msgInput.val($msgInput.val()+$(this).attr("title"));
                        $msgInput.focus();
                    });
                    /**窗口改变尺寸*/
                    $(window).resize(function(){
                        let maxLeft = $(window).width() - $chatDialog.width();
                        let maxTop = $(window).height() - $chatDialog.height();
                        let offset = $chatDialog.offset();
                        if(offset.left > maxLeft || offset.top > maxTop){
                            $chatDialog.css({
                                left: Math.min(offset.left, maxLeft),
                                top: Math.min(offset.top, maxTop)
                            });
                        }
                    });
                });
                /**位置*/
                $chatDialog.css({
                    left: data.left || ($(window).width() - $chatDialog.width())/2,
                    top: data.top  || ($(window).height() - $chatDialog.height())/2
                });
            }
            /**聊天主主对话对象渲染*/
            laytpl(tplChatMain).render(data, function(html){
                $chatDialog.find(".chat-main").append(html);
            });
            /**历史消息渲染*/
            if(that.msgHisFunc){
                that.msgHisFunc(data.id, 0, 10, function(data){
                    data && data.reverse().forEach(function(msg){
                        if(msg.userId == data.id){
                            msg.mine = 1;
                        }
                        that.showHisMsg(msg, false);
                    });
                });
            }
            /**历史消息滚动*/
            $chatDialog.find(".msg-show").on("scroll", function(event){
                if($(this).scrollTop() == 0){
                    let userId = $chatDialog.find(".chat-main .user-info").attr("data-id");
                    let msgId = $(this).find("li").first().attr("data-msgId");
                    let beforeHeight = $(this)[0].scrollHeight;
                    that.msgHisFunc(userId, msgId, 10, function(data){
                        data.forEach(function(msg){
                            that.showHisMsg(msg, true);
                        });
                    });
                    $(this).scrollTop($(this)[0].scrollHeight - beforeHeight);
                }
            });
            /**聊天列表渲染*/
            if(data.chatList){
                data.chatList.forEach(function(chatItem){
                    if(data.id == chatItem.id){
                        chatItem.select = 1;
                    }
                    laytpl(tplChatListItem).render(chatItem, function(html){
                        $chatDialog.find(".chat-list ul").append(html);
                    });
                });
                if(data.chatList.length <= 1){
                    $chatDialog.find(".chat-list").hide();
                    $chatDialog.css({
                        width: $chatDialog.find(".chat-main").width()
                    });
                }else {
                    $chatDialog.css({
                        width: $chatDialog.find(".chat-main").width() + $chatDialog.find(".chat-list").show().width()
                    });
                }
            }
        }
    };
    Im.prototype.newChatItem= function(contactInfo){
        let that = this;
        let data = storeData(StoreType.StoreChatDialog) || {};
        data.id = contactInfo.id;
        data.name =contactInfo.name;
        data.img = contactInfo.img;
        data.status = contactInfo.status;
        data.inputting = 1;
        data.chatList || (data.chatList = []);
        let exist = false;
        data.chatList.forEach(function(chatItem){
            if(chatItem.id == contactInfo.id){
                exist = true;
            }
        });
        if(!exist) {
            data.chatList.push(contactInfo);
        }
        storeData(StoreType.StoreChatDialog, data);
        that.renderChatDialog();

    };
    Im.prototype.selectChatItem = function(id){
        let data = storeData(StoreType.StoreChatDialog);
        if(data && data.chatList){
            data.chatList.forEach(function(chatItem){
                if(chatItem.id == id){
                    data.id = chatItem.id;
                    data.name =chatItem.name;
                    data.img = chatItem.img;
                    data.status = chatItem.status;
                    data.inputting = 0;
                }
            });
            storeData(StoreType.StoreChatDialog, data);
            this.renderChatDialog();
        }
    };
    Im.prototype.closeChatDialog = function(id){
        let $chatDialog = $(".chat-dialog");
        if(id){
            let data = storeData(StoreType.StoreChatDialog);
            if(data && data.chatList){
                if(data.chatList.length <= 1){
                    storeData(StoreType.StoreChatDialog, "");
                    $chatDialog.remove();
                }else {
                    for(let i = 0 ; i < data.chatList.length ; i++) {
                        let chatItem = data.chatList[i];
                        if(chatItem.id == id){
                            data.chatList.splice(i, 1);
                            if(chatItem.id == data.id){
                                chatItem = data.chatList[i] || data.chatList[i-1];
                                data.id = chatItem.id;
                                data.name =chatItem.name;
                                data.img = chatItem.img;
                                data.status = chatItem.status;
                                data.inputting = 0;
                            }
                            break;
                        }
                    }
                    storeData(StoreType.StoreChatDialog, data);
                    this.renderChatDialog();
                }
            }
        }else {
            storeData(StoreType.StoreChatDialog, "");
            $chatDialog.remove();
        }
    };
    Im.prototype.sendMsg = function(){
        let $chatDialog = $(".chat-dialog");
        let msg = $chatDialog.find(".msg-input textarea").val();
        if(msg.replace(/(^s*)|(s*$)/g, "").length == 0){
            return;
        }
        console.log(msg.length);
        $chatDialog.find(".msg-input textarea").val("");
        let data = $.extend(true, {}, this.user);
        data.id = new Date().getTime();
        data.mine = 1;
        data.content = msg;
        data.time = util.toDateString(new Date());
        let targetId = $chatDialog.find(".chat-main .user-info").attr("data-id");
        let msgHis = storeData(StoreType.StoreMsgHis(targetId))|| [];
        msgHis.unshift(data);
        storeData(StoreType.StoreMsgHis(targetId), msgHis);
        this.showHisMsg(data);

        /**模拟回复*/
        let revData = {};
        revData.id = new Date().getTime();
        revData.userId = targetId;
        revData.name = $chatDialog.find(".chat-main .user-info .nick-name").text();
        revData.img = $chatDialog.find(".chat-main .user-info img").prop("src");
        revData.time = util.toDateString(new Date());
        revData.content = "我没明白你的意思，能再说一遍吗？";
        this.receiveMsg(revData);
    };
    Im.prototype.receiveMsg = function(data){
        let msgHis = storeData(StoreType.StoreMsgHis(data.userId))|| [];
        msgHis.unshift(data);
        storeData(StoreType.StoreMsgHis(data.userId), msgHis);
        this.showHisMsg(data);
    };
    Im.prototype.showHisMsg = function(data, before, scroll=true){
        if(data){
            let content = data.content, bg, ed;
            for(let i = 0 ; i< content.length ; i++){
                if(content[i] =='['){
                    bg = i;
                }else if(content[i] ==']' && bg != undefined){
                    ed = i;
                    let face = content.substring(bg, ed+1);
                    if(dataFace[face]){
                        let img = '<img src="' + dataFace[face]+'" />';
                        content = content.replace(face, img);
                        bg = ed = undefined ;
                    }
                }
            }
            data.content = content;
        }else{
            return;
        }
        let $msgShow = $(".chat-dialog .msg-show");
        laytpl(tplMsg).render(data, function(html){
            if(before){
                $msgShow.prepend(html);
                if(scroll){
                    $msgShow.scrollTop(0)
                }
            }else {
                $msgShow.append(html);
                if(scroll){
                    $msgShow.scrollTop($msgShow.prop("scrollHeight"));
                }
            }
        });
    };
    Im.prototype.showFace = function($node){
        let $chatDialog = $(".chat-dialog");
        let $chatFace = $chatDialog.find(".chat-face");
        if($chatFace.length > 0){
            $chatFace.show();
        }else {
            laytpl(tplFace).render(dataFaceArray, function(html){
                $chatDialog.append(html);
                $chatFace = $chatDialog.find(".chat-face");
            });
        }
        $chatFace.css({
            left: $node.offset().left - $chatDialog.offset().left - 6,
            top: $node.offset().top - $chatDialog.offset().top - $chatFace.outerHeight(true) - 10
        });
    };
    let im =new Im();
    exports("im", im);
});