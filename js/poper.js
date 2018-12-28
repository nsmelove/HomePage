

layui.define(["jquery","laytpl"], function(exports){
    var $ = layui.jquery;
    var layTpl = layui.laytpl;
    var tplCode =
        ['<div id="{{ d.id }}" class="pop-down">',
            '<div class="down"></div>',
            '<div class="title">{{ d.title }}</div>',
            '<div class="content">',
            '<ul>',
                '{{# layui.each(d.items, function(index, item){ }}',
                '<li>{{ item }}</li>',
                '{{# }); }}',
            '</ul>',
            '</div>',
        '</div>'].join("");
    var showFunc = function(e){
        var id = e.data.id;
        var top = $(this).offset().top + $(this).outerHeight() + 10;
        var left = $(this).offset().left + $(this).outerWidth()/2 - $("#"+id+ ".pop-down").width()/2;
        left = (left < 0 ? 0 : left);
        var downLeft = $(this).offset().left + $(this).outerWidth()/2 - 10;
        $("#"+id + ".pop-down").show();
        $("#"+id + ".pop-down").offset({top:top, left:left});
        $("#"+id + ".pop-down .down").offset({left:downLeft});

    };
    var hideFunc = function(e){
        var id = e.data.id;
        if(e.pageX <= $(this).offset().left || e.pageX >= $(this).offset().left + $(this).outerWidth()
            || e.pageY <= $(this).offset().top || e.pageY >= $(this).offset().top + $(this).outerHeight()) {
            $("#"+id + ".pop-down").hide();
        }
    };
    var poper = {
        popDown: function($node, title, items){
            if(!$node.attr("id")) {
                $node.attr("id", Math.ceil(Math.random() * 10000));
            }
            var id = "pop-down-" + $node.attr("id");
            if($("#"+id).length > 0){
                return;
            }
            layTpl(tplCode).render({
                id: id,
                title: title,
                items: items
            }, function(html){
                $(document.body).append(html);
                $node.on("mouseenter", {id:id}, showFunc);
                $node.on("mouseleave", {id:id}, hideFunc);
                $("#"+id + ".pop-down").on("mouseleave", {id:id}, hideFunc);
            });
        },
        remove:function($node){
            if(!$node.attr("id")) {
                return;
            }
            var id = "pop-down-" + $node.attr("id");
            if($("#"+id).length == 0){
                return;
            }
            $node.off("mouseenter", showFunc);
            $node.off("mouseleave", showFunc);
            $("#"+id).remove();
        }
    };
    exports("poper", poper);
});