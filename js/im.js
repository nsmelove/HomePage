layui.define(['element',"jquery","laytpl","layer"], function(exports){
    const $ = layui.jquery;
    const element = layui.element;
    const laytpl = layui.laytpl;
    const layer = layui.layer;
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
                '<div class="user-info" status ="{{ d.status || 0 }}" data-id="{{ d.id }}">',
                    '<img src="{{ d.img || \"https://tva2.sinaimg.cn/crop.0.8.751.751.180/961a9be5jw8fczq7q98i7j20kv0lcwfn.jpg\" }}">',
                    '<span class="nick-name" inputting>{{ d.name }}</span>',
                '</div>',
                '<i class="close layui-icon layui-icon-close"></i>',
                '<ul class="msg-show">',
                    '<li>',
                        '<img src="https://img.gcall.com/dca5/M00/03/2C/wKhoNleoLduEd68rAAAAAAAAAAA961_260x260.jpg">',
                        '<span class="name">小马哥</span>',
                        '<span class="time">2018-12-21 14:47:22</span>',
                        '<div class="content">在？</div>',
                    '</li>',
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
                    '<button>发送</button>',
                    '<button>关闭</button>',
                '</div>',
            '</div>',
        '</div>'].join("");

    const tplChatListItem =
        ['<li class="item-user" status ="{{ d.status || 0 }}" data-id="{{ d.id }}" select>',
        '<img src="{{ d.img || \"https://tva2.sinaimg.cn/crop.0.8.751.751.180/961a9be5jw8fczq7q98i7j20kv0lcwfn.jpg\" }}">',
        '<span class="name">{{ d.name }}</span>',
        '<div class="close"><i class="layui-icon layui-icon-close-fill"></i></div>',
        '</li>',].join("");

    const StoreType = {
        StoreContact: "user-contact",
        StoreGroup: "user-group",
        StoreHis : "user-history",
        MsgHis: "msg-history"
    };
    function storeData(storeType, data){
        if(data){
            window.sessionStorage.setItem(storeType, JSON.stringify(data));
        }else {
            let storeData = window.sessionStorage.getItem(storeType);
            return storeData ? JSON.parse(storeData) : undefined;
        }
    }
    let Im = function(){};
    Im.prototype.init = function(user, contFunc, groupFunc, hisFunc){
        let $contacts = $(".contacts");
        if($contacts.length > 0) {
            return ;
        }
        this.contFunc = contFunc;
        this.groupFunc = groupFunc;
        this.hisFunc = hisFunc;
        let that = this;
        laytpl(tplContacts).render(user, function(html){
            $(document.body).append(html);
            $contacts = $(".contacts");
            $contacts.css({
                left: $(window).width() - $contacts.width(),
                top: $(window).height()
            }).stop().animate({
                left: $(window).width() - $contacts.width(),
                top: $(window).height() - $contacts.height()
            });
            if(contFunc){
                that.renderContact();
            }
            /**更换图像*/
            $contacts.on("click", ".upload-icon .layui-icon", function(){
                $contacts.find(".upload-icon input[type='file']").click();
            });
            $contacts.on("change", ".upload-icon input[type='file']", function(){
                let iconImg = this.files[0];
                let fr = new FileReader();
                fr.readAsDataURL(iconImg);
                fr.onload = function(){
                    $contacts.find(".user-info img").attr("src", fr.result);
                }
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
                        that.renderHis();
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
                    that.renderHis(true);
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
            let dragging;
            $contacts.on("mousedown", ".move", function(event){
                $(document).css("cursor", "move");
                dragging = {
                    lastX: event.pageX,
                    lastY: event.pageY
                };
            });
            $(window).mouseup(function(){
                $(document).css("cursor", "");
                dragging = undefined;
            });
            $(window).mousemove(function(event){
                if(dragging) {
                    var lastOffset = $contacts.offset();
                    var moveX = event.pageX - dragging.lastX;
                    var moveY = event.pageY - dragging.lastY;
                    var minLeft = $(document).scrollLeft();
                    var maxLeft = $(window).width() + $(document).scrollLeft() - $contacts.width();
                    var minTop = $(document).scrollTop();
                    var maxTop = $(window).height() + $(document).scrollTop() - $contacts.height();
                    $contacts.offset({
                        left: Math.min(Math.max(lastOffset.left + moveX, minLeft), maxLeft),
                        top: Math.min(Math.max(lastOffset.top + moveY, minTop), maxTop)
                    });
                    dragging.lastX = event.pageX;
                    dragging.lastY = event.pageY;
                }
            });
            /**关闭窗口*/
            $contacts.on("click", ".layui-icon-close", function(){that.hide()});
            /**打开聊天对话框*/
            $contacts.on("click", ".contacts-content li", function(){
                let contactInfo = {};
                contactInfo.id = $(this).attr("data-id");
                contactInfo.img = $(this).find("img").attr("src");
                contactInfo.name =$(this).find(".name").text();
                contactInfo.status = $(this).attr("status") || 0;
                that.showChatDialog(contactInfo);
            });
        });
    };

    Im.prototype.renderContact = function(reload){
        let $contactsContent = $(".contacts .contacts-content"), cachedData, that = this;
        $contactsContent.empty().append(tplLoading);
        let render = data => {
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
        };
        if(reload || !(cachedData = storeData(StoreType.StoreContact))){
            that.contFunc && that.contFunc(contData => {
                storeData(StoreType.StoreContact, contData);
                render(contData);
            });
        }else {
            render(cachedData);
        }
    };
    Im.prototype.renderGroup = function(reload){
        let $contactsContent = $(".contacts .contacts-content"), cachedData, that = this;
        $contactsContent.empty().append(tplLoading);
        if(reload ||!(cachedData = storeData(StoreType.StoreGroup))){
            that.groupFunc && that.groupFunc(groupData => {
                storeData(StoreType.StoreGroup, groupData);
                laytpl(tplItems).render(groupData, function(html){
                    $contactsContent.empty().append(html);
                });
            });
        }else {
            laytpl(tplItems).render(cachedData, function(html){
                $contactsContent.empty().append(html);
            });
        }
    };
    Im.prototype.renderHis = function(reload){
        let $contactsContent = $(".contacts .contacts-content"), cachedData, that = this;
        $contactsContent.empty().append(tplLoading);
        if(reload ||!(cachedData = storeData(StoreType.StoreHis))){
            that.hisFunc && that.hisFunc(hisData => {
                storeData(StoreType.StoreHis, hisData);
                laytpl(tplItems).render(hisData, function(html){
                    $contactsContent.empty().append(html);
                });
            });
        }else {
            laytpl(tplItems).render(cachedData, function(html){
                $contactsContent.empty().append(html);
            })
        }
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


    Im.prototype.showChatDialog = function(contactInfo){
        let that = this;
        let $chatDialog = $(".chat-dialog");
        if($chatDialog.length == 0) {
            laytpl(tplChat).render(contactInfo, function(html){
                $(document.body).append(html);
                $chatDialog = $(".chat-dialog");
                laytpl(tplChatListItem).render(contactInfo, function(html){
                        $chatDialog.find(".chat-list ul").append(html);
                });
                $chatDialog.find(".chat-list").hide();
                /**关闭聊天对话框*/
                $chatDialog.on("click", ".chat-main .close", function(){
                    that.closeChatDialog();
                });
                /**选中聊天对象*/
                $chatDialog.on("click", ".chat-list li", function(){
                    that.selectChatItem($(this).attr("data-id"));
                });
            });
        }else {
            let $selectChatItem = $chatDialog.find(".chat-list li[data-id="+contactInfo.id+"]");
            if($selectChatItem.length == 0) {
                laytpl(tplChatListItem).render(contactInfo, function(html){
                    $chatDialog.find(".chat-list ul").append(html);
                    $chatDialog.find(".chat-list").show();
                    that.selectChatItem(contactInfo.id);
                });
            }else {
                that.selectChatItem(contactInfo.id);
            }
        }
    };
    Im.prototype.selectChatItem = function(id){
        let $selectChatItem = $(".chat-dialog").find(".chat-list li[data-id="+id+"]");
        console.log($selectChatItem);
        $selectChatItem.attr("select", "").siblings().removeAttr("select");
        let $chatMain = $(".chat-dialog").find(".chat-main");
        $chatMain.find(".user-info").attr("status", $selectChatItem.attr("status") || 0);
        $chatMain.find(".user-info").find("img").attr("src", $selectChatItem.find("img").attr("src"));
        $chatMain.find(".user-info").find(".nick-name").text($selectChatItem.find(".name").text());
    };
    Im.prototype.closeChatDialog = function(id){
        let $chatDialog = $(".chat-dialog");
        if(id){

        }else {
            $chatDialog.remove();
        }
    };
    let im =new Im();
    exports("im", im);
});