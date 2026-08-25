

export default {
    footer: [["鍏ㄩ儴", ""], ["涓栫晫", "chat"], ["闃熶紞", "tm"], ["闂ㄦ淳", "fam"], ["鍏ㄥ尯", "es"], ["甯淳", "pty"], ["绯荤粺", "sys"]],
    isScroll: true,
    last_click: 0,
    show: function (nosend) {
        // 闃茶繛鐐瑰畧鍗細鍚炴帀 500ms 鍐呯殑閲嶅鐐瑰嚮銆?
        // 娉ㄦ剰鏉′欢蹇呴』鏄?<500锛堝師鏉ュ啓鎴?>500 瀵艰嚧棣栨鐐瑰嚮蹇呯劧琚悶鎺夛紝
        // 鍙湁蹇€熷弻鍑绘墠鑳芥墦寮€棰戦亾锛?
        if (nosend !== null) {
            const now = Date.now();
            if (now - this.last_click < 500) return;
            this.last_click = now;
        }
        if (Dialog.channel.isShow) return;
        Dialog.select("channel");
        Dialog.icon("comment");
        Dialog.title("");
        Dialog.footer("");
        for (var i = 0; i < Dialog.channel.footer.length; i++) {
            var elem = $("<span class='footer-item channel-item' for='" + Dialog.channel.footer[i][1] + "'>"
                + Dialog.channel.footer[i][0] + "</span>").appendTo(Dialog.footerElement);
            if (i == 0) elem.addClass("select");
        }
        Dialog.contentElement.html("").append(Process.ChannelElement.addClass("channel-dialog"));

        Dialog.channel.isShow = true;
        Dialog.channel.scrollBottom();

    }, hide: function () {
        Dialog.channel.footerChanged("");
        Process.ChannelElement.removeClass("channel-dialog").insertBefore(".content-message");

        this.scrollBottom();
        this.isShow = false;
    }, close: function () {
        this.hide();
    }, scrollBottom: function () {
        Process.channel.scroll2end();
    },
    footerChanged: function (type) {
        if (Dialog.channel.select_item == type) return;
        Dialog.channel.select_item = type;

        Process.channel.clear();
        for (var i = 0; i < this.datas.length; i++) {
            var item = this.datas[i];
            if (!type || item[0] == type) {
                Process.channel.push(item[1]);
            }
        }
        Process.channel.scroll2end();
    }, datas: [],
    createElement: function (data, isTop) {
        var color = "hic";
        var name = "";
        switch (data.ch) {
            case "tm":
                color = "hig";
                name = "闃熶紞";
                break;
            case "fam":
                color = "hiy";
                name = data.fam || "闂ㄦ淳";
                break;
            case "rumor":
                color = "him";
                name = "璋ｈ█";
                data.name = "鏌愪汉";
                break;
            case "sys":
                color = "hir";
                name = "绯荤粺";
                data.name = "";
                break;
            case "es":
                color = "hio";
                name = data.server;
                data.uid = null;
                break;
            case "pty":
                color = "hiz";
                name = "甯淳";
                break;
            default:
                name = ["闂茶亰", "闂茶亰", "闂茶亰", "<hiy>瀹楀笀</hiy>", "<HIZ>姝﹀湥</HIZ>", "<hio>姝﹀笣</hio>", "<ord>姝︾</ord>"][data.lv];
                if (data.lv6) {
                    name = ["<ord>姝︾</ord>", "<ord>鍓戠</ord>", "<ord>鍒€鐨?/ord>", "<ord>鍏典富</ord>", "<ord>鎴樼</ord>"][data.lv6];
                }
                break;
        }
        var html = ["<", color, ">銆?];
        html.push(name);
        html.push("銆?);
        if (data.name) {
            html.push("<span");
            if (data.uid) html.push(" cmd='look3 " + data.uid + "'");
            html.push(">");
            html.push(data.name);
            html.push("</span>锛?);
        }
        html.push(data.content);
        // if (isTop) {
        //     html.push("\n");
        // }
        var str = html.join("");
        if (this.datas.length > 800) {
            // 淇濈暀鏈€杩?200 鏉★紙鍘熸潵鍏?length=0 鍐?splice 鏄棤鏁堟搷浣滐紝绛変簬鍏ㄦ竻绌猴級
            this.datas.splice(0, this.datas.length - 200);
        }
        // Classify rumor as sys for filtering, but don't mutate input
        var filterCh = data.ch == "rumor" ? "sys" : data.ch;
        this.datas.push([
            filterCh, str
        ]);
        if (this.select_item && this.select_item != filterCh) {
            return "";
        }
        return str;
    }

};

