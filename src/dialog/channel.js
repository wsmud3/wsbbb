

export default {
    footer: [["全部", ""], ["世界", "chat"], ["队伍", "tm"], ["门派", "fam"], ["全区", "es"], ["帮派", "pty"], ["系统", "sys"]],
    isScroll: true,
    last_click: 0,
    show: function (nosend) {
        // 防连点守卫：吞掉 500ms 内的重复点击。
        // 注意条件必须是 <500（原来写成 >500 导致首次点击必然被吞掉，
        // 只有快速双击才能打开频道）
        if (nosend !== null && Date.now() - this.last_click < 500) {
            this.last_click = Date.now();
            return;
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
                name = "队伍";
                break;
            case "fam":
                color = "hiy";
                name = data.fam || "门派";
                break;
            case "rumor":
                color = "him";
                name = "谣言";
                data.name = "某人";
                break;
            case "sys":
                color = "hir";
                name = "系统";
                data.name = "";
                break;
            case "es":
                color = "hio";
                name = data.server;
                data.uid = null;
                break;
            case "pty":
                color = "hiz";
                name = "帮派";
                break;
            default:
                name = ["闲聊", "闲聊", "闲聊", "<hiy>宗师</hiy>", "<HIZ>武圣</HIZ>", "<hio>武帝</hio>", "<ord>武神</ord>"][data.lv];
                if (data.lv6) {
                    name = ["<ord>武神</ord>", "<ord>剑神</ord>", "<ord>刀皇</ord>", "<ord>兵主</ord>", "<ord>战神</ord>"][data.lv6];
                }
                break;
        }
        var html = ["<", color, ">【"];
        html.push(name);
        html.push("】");
        if (data.name) {
            html.push("<span");
            if (data.uid) html.push(" cmd='look3 " + data.uid + "'");
            html.push(">");
            html.push(data.name);
            html.push("</span>：");
        }
        html.push(data.content);
        // if (isTop) {
        //     html.push("\n");
        // }
        var str = html.join("");
        if (this.datas.length > 800) {
            // 保留最近 200 条（原来先 length=0 再 splice 是无效操作，等于全清空）
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
