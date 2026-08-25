

export default {
    footer: [["灞炴€?, null],
    ["璇︾粏", null], ["绉板彿", null], ["鐪熸剰", null]],

    selectIndex: 0,
    onData: function (data) {
        this.data = data;
        // 瀛樺偍绂佸湴瑙ｉ攣鐘舵€侊紝鎺у埗鐪熸剰闈㈡澘鏄剧ず
        if (data.has_jd !== undefined) this.has_jd = data.has_jd;
        this.init_elem();
        Dialog.titleElement.html(data.name);
        Dialog.icon("user");
        if (data.titles) {
            this.titles = data.titles;
            this.create_titles();
        } else if (data.zhenyi) {
            this.zhenyiList = data.zhenyi;
            this.zy_name = data.zy_name;
            this.zy_key = data.zy_key;
            this.zy_area = data.zy_area;
            this.create_zhenyi();
        } else {
            if (data.id && data.id != this.uid) {
                this.uid = data.id;
                if (this.uid != Process.player) {
                    Dialog.footerElement.find(".footer-item:eq(2)").hide();
                } else {
                    Dialog.footerElement.find(".footer-item:eq(2)").show();
                }
            }
            var panel = $(data.name ? this.footer[0][1] : this.footer[1][1]);
            var elems = panel.find("span");
            for (var i = 0; i < elems.length; i++) {
                var elem = $(elems[i]);
                var prop = elem.attr("data-prop");
                if (prop) {
                    elem.html(data[prop] || 0);
                }
            }
        }
    },
    init: function () {
        this.footer[0][1] = $(this.template_score);
        this.footer[1][1] = $(this.template_score2);
        this.footer[2][1] = $(this.template_title);
        this.footer[3][1] = $(this.template_zhenyi);
    },
    init_elem: function () {
        Dialog.init();
        Dialog.curItem = "score";
        if (this.isShow) return;
        Dialog.footer("");

        // 闂ㄦ淳绂佸湴鏈В閿佹椂闅愯棌鐪熸剰闈㈡澘
        var showCount = this.has_jd ? this.footer.length : (this.footer.length - 1);
        for (var i = 0; i < showCount; i++) {
            $("<span class='footer-item " + (this.selectIndex == i ? "select" : "") + "' for='" + i + "'>"
                + this.footer[i][0] + "</span>").appendTo(Dialog.footerElement);
        }
        this.isShow = true;
        // 濡傛灉涔嬪墠閫変腑浜嗕笉瀛樺湪鐨勬爣绛惧垯鍥為€€
        if (this.selectIndex >= showCount) this.selectIndex = 0;
        this.footerChanged(this.selectIndex);

    },
    show: function (nosend) {
        if (nosend) return;
        if (!this.selectIndex) SendCommand("score");
        else if (this.selectIndex == 1) SendCommand("score2");
        else if (this.selectIndex == 2) SendCommand("score title");
        else if (this.has_jd) SendCommand("zhenyi");
        else { this.selectIndex = 0; SendCommand("score"); }
        this.init_elem();
    },
    close: function () {
        this.footer[this.selectIndex][1].remove();
        Dialog.footer("");
        this.isShow = false;
    },
    footerChanged: function (item) {
        item = parseInt(item);
        this.footer[this.selectIndex][1].remove();
        this.selectIndex = item;

        var panel = $(this.footer[this.selectIndex][1]).appendTo(Dialog.contentElement.empty());
        if (item == 1) {
            if (this.uid && Process.player != this.uid)
                SendCommand("score2 " + this.uid);
            else
                SendCommand("score2");
        }
        else if (item == 2) {
            if (!this.titles)
                SendCommand("score title");
            panel.off("click", ".btn-noused").on("click", ".btn-noused", function (e) {
                var elem = $(e.target);
                if (elem.is("red")) elem = elem.parent();
                var index = parseInt(elem.attr("index"));
                for (var i = 0; i < this.titles.length; i++) {
                    if (i == index) this.titles[i].use = this.titles[i].use ? false : true;
                    else this.titles[i].use = false;
                }
                SendCommand("title " + index);
                this.create_titles();
            }.bind(this));
        }
        else if (item == 3) {
            panel.off("click.zhenyi", ".zy-item").on("click.zhenyi", ".zy-item", function (e) {
                this.show_zhenyi_detail($(e.currentTarget));
            }.bind(this));
            panel.off("click.zhenyi", ".zy-detail .sub-close").on("click.zhenyi", ".zy-detail .sub-close", function () {
                panel.find(".zy-detail").remove();
            });
            // 姣忔鍒囧洖鐪熸剰椤甸兘鍒锋柊涓€娆★紝閬垮厤鐜勬櫠銆佹偀鐥曞拰鍚敤鐘舵€佷娇鐢ㄦ棫缂撳瓨銆?            SendCommand("zhenyi");
        }
    },

    create_titles: function () {
        var panel = $(".dialog-titles");
        var html = [];
        for (var i = 0; i < this.titles.length; i++) {
            html.push("<div class='title-item", this.titles[i].use ? " selected" : "", "'>");
            html.push(this.titles[i].title);
            html.push("<span class='btn-noused' index='");
            html.push(i);
            html.push("'>");
            html.push(this.titles[i].use ? "<red>鍙栨秷</red>" : "浣跨敤");
            html.push("</span>");

            html.push("</div>");
        }
        panel.html(html.length ? html.join("") : "<div class='empty'>浣犺繕娌℃湁鑾峰緱浠讳綍绉板彿</div>");
    },

    create_zhenyi: function () {
        var panel = $(".dialog-zhenyi");
        var html = [];
        html.push("<div class='zy-summary'><hio>");
        html.push(this.zy_name);
        html.push("</hio><span>", this.zy_area || "闂ㄦ淳绂佸湴", "</span></div>");
        for (var i = 0; i < this.zhenyiList.length; i++) {
            var z = this.zhenyiList[i];
            html.push("<div class='skill-item zy-item grade", z.grade || 0, z.acquired ? "" : " zy-locked", z.active ? " enable" : "", "' data-zy-id='", z.id, "'>");
            html.push("<span class='glyphicon glyphicon-ok enable-flag'></span>");
            html.push("<span class='zy-name'>", z.name, "</span>");
            html.push("<span class='skill-level'>");
            if (z.active) html.push("<hig>宸插惎鐢?/hig> 路 ");
            html.push(z.acquired ? ("绗? + z.level + "閲?) : "鏈鎮?);
            html.push("</span>");
            html.push("</div>");
        }
        panel.html(html.join(""));
    },

    show_zhenyi_detail: function (elem) {
        if (!elem || !this.zhenyiList) return;
        var id = parseInt(elem.attr("data-zy-id"));
        var z = null;
        for (var i = 0; i < this.zhenyiList.length; i++) {
            if (parseInt(this.zhenyiList[i].id) === id) {
                z = this.zhenyiList[i];
                break;
            }
        }
        if (!z) return;

        var panel = elem.closest(".dialog-zhenyi");
        panel.find(".zy-detail").remove();
        var html = ["<div class='zy-detail'>"];
        html.push("<div class='zy-detail-title'><hio>銆?, z.mech, "銆?/hio>", z.trial ? ("銆€" + z.trial) : "", "</div>");
        html.push("<div class='zy-desc'>", z.desc, "</div>");
        if (z.acquired && z.level >= 10) html.push("<div class='zy-meta'><hig>宸茶嚮鍦嗘弧</hig></div>");
        else if (!z.acquired) {
            html.push("<div class='zy-meta'>瀹屾垚瀵瑰簲绂佸湴璇曠偧鍚庨鎮?/div>");
        }
        if (z.mechanic_only) html.push("<div class='zy-meta'><hiy>绾満鍒剁湡鎰忥紝鏃犻渶鍗囩骇銆?/hiy></div>");
        html.push("<div class='item-commands'>");
        if (z.acquired) html.push("<span cmd='zhenyi active ", z.id, "'>", z.active ? "鍗镐笅" : "鍚敤", "</span>");
        if (z.acquired && z.level < 10 && !z.mechanic_only) html.push("<span cmd='zhenyi upgrade ", z.id, "'>鍗囩骇</span>");
        html.push("<span class='sub-close' style='float:right;color:#888;cursor:pointer'>鉁?/span>");
        html.push("</div></div>");
        $(html.join("")).insertAfter(elem);
    },


    template_score: `
<div class="dialog-score" cellpadding="0" cellspacing="1">
            <div class="score-section">
                <span class="title">
                    <hic>銆愭€у埆銆?/hic>
                </span><span data-prop="gender" class="value"></span>
                <span class="title">
                    <hic>銆愮瓑绾с€?/hic>
                </span><span data-prop="level" class="value"></span><br />
                <span class="title">
                    <hic>銆愬勾榫勩€?/hic>
                </span><span data-prop="age" style="width:10em;" class="value">14</span><br />
                <span class="title">
                    <hic>銆愮粡楠屻€?/hic>
                </span>
                <hic><span data-prop="exp" class="value">0</span></hic>
                <span class="title">
                    <hic>銆愭綔鑳姐€?/hic>
                </span>
                <hic><span data-prop="pot" class="value">0</span></hic>
            </div>
            <div class="score-section">
                <div><span class="title">
                        <hig>銆愭皵琛€銆?/hig>
                    </span>
                    <hig><span data-prop="hp" class="value"
                            style="text-align:right">0</span><span>&nbsp;/&nbsp;</span><span class="value"
                            data-prop="max_hp">0</span></hig>
                </div>
                <div><span class="title">
                        <hig>銆愬唴鍔涖€?/hig>
                    </span>
                    <hig><span data-prop="mp" class="value"
                            style="text-align:right">0</span><span>&nbsp;/&nbsp;</span><span class="value"
                            data-prop="max_mp">0</span></hig>
                </div>
                <span class="title" style="width:6em;">
                    <hic>銆愬唴鍔涗笂闄愩€?/hic>
                </span>
                <hic><span data-prop="limit_mp" class="value">0</span></hic><br />
                <span class="title" style="width:6em;">
                    <hic>銆愮簿鍔涖€?/hic>
                </span>
                <hic><span data-prop="jingli" class="value">0</span></hic>
            </div>
            <div class="score-section">
                <span class="title">
                    <hiy>銆愯噦鍔涖€?/hiy>
                </span><span class="value">
                    <hiy><span data-prop="str">0</span></hiy>
                    <NOR> (+<span data-prop="str_add">0</span>)</NOR>
                </span>
                <span class="title">
                    <hiy>銆愭牴楠ㄣ€?/hiy>
                </span><span class="value">
                    <hiy><span data-prop="con">0</span></hiy>
                    <NOR>(+<span data-prop="con_add">0</span>)</NOR>
                </span><br />
                <span class="title">
                    <hiy>銆愯韩娉曘€?/hiy>
                </span><span class="value">
                    <hiy><span data-prop="dex">0</span></hiy>
                    <NOR>(+<span data-prop="dex_add">0</span>)</NOR>
                </span>
                <span class="title">
                    <hiy>銆愭偀鎬с€?/hiy>
                </span><span class="value">
                    <hiy><span data-prop="int">0</span></hiy>
                    <NOR>(+<span data-prop="int_add">0</span>)</NOR>
                </span><br />
                <span class="title">
                    <hiy>銆愬璨屻€?/hiy>
                </span><span class="value">
                    <hiy><span data-prop="per">0</span></hiy>
                </span>
            </div>
            <div class="score-section">
                <span class="title">
                    <hic>銆愭敾鍑汇€?/hic>
                </span>
                <hic><span data-prop="gj" class="value">0</span></hic>
                <span class="title">
                    <hic>銆愰槻寰°€?/hic>
                </span>
                <hic><span data-prop="fy" class="value">0</span></hic><br />
                <span class="title">
                    <hic>銆愬懡涓€?/hic>
                </span>
                <hic><span data-prop="mz" class="value">0</span></hic>
                <span class="title">
                    <hic>銆愯翰闂€?/hic>
                </span>
                <hic><span data-prop="ds" class="value">0</span></hic><br />
                <span class="title">
                    <hic>銆愭嫑鏋躲€?/hic>
                </span>
                <hic><span data-prop="zj" class="value">0</span></hic>
                <span class="title">
                    <hic>銆愭毚鍑汇€?/hic>
                </span>
                <hic><span data-prop="bj" class="value">0</span></hic><br />
                <span class="title" style="width:6em;">
                    <hic>銆愭敾鍑婚€熷害銆?/hic>
                </span>
                <hic><span data-prop="gjsd" class="value">0</span></hic>
            </div>
            <div class="score-section">
                <span class="title">
                    <hic>銆愰棬娲俱€?/hic>
                </span>
                <hic><span data-prop="family" class="value">鏃犻棬鏃犳淳</span></hic><br />
                <span class="title">
                    <hic>銆愬笀鍌呫€?/hic>
                </span>
                <hic><span data-prop="master" class="value">鏃?/span></hic><br />
                <span class="title">
                    <hic>銆愬姛缁┿€?/hic>
                </span>
                <hic><span data-prop="gongji" class="value">0</span></hic><br />
            </div>
        </div>`,
    template_score2: `     <div class="dialog-score2">
            <span class="title">
                <hic>銆愭渶缁堜激瀹炽€?/hic>
            </span>
            <hic>
                <span data-prop="add_sh" class="value">0</span>
            </hic>
            <br />
            <span class="title">
                <hic>銆愬拷瑙嗛槻寰°€?/hic>
            </span>
            <hic>
                <span data-prop="diff_fy" class="value">0</span>
            </hic><br />

            <span class="title">
                <hic>銆愭毚鍑讳激瀹炽€?/hic>
            </span>
            <hic>
                <span data-prop="add_bj" class="value">0</span>
            </hic>
            <br />

            <span class="title">
                <hic>銆愪激瀹冲噺鍏嶃€?/hic>
            </span>
            <hic>
                <span data-prop="diff_sh" class="value">0</span>
            </hic>
            <br />
            <span class="title">
                <hic>銆愭毚鍑绘姷鎶椼€?/hic>
            </span>
            <hic>
                <span data-prop="diff_bj" class="value">0</span>
            </hic><br />
            <span class="title">
                <hic>銆愰噴鏀炬椂闂村噺灏戙€?/hic>
            </span>
            <hic>
                <span data-prop="releasetime" class="value">0</span>
            </hic><br />
            <span class="title">
                <hic>銆愬繖涔辨椂闂淬€?/hic>
            </span>
            <hic>
                <span data-prop="busy" class="value">0</span>
            </hic><br />
            <span class="title">
                <hic>銆愬拷瑙嗗繖涔便€?/hic>
            </span>
            <hic>
                <span data-prop="diff_busy" class="value">0</span>
            </hic><br />
            <span class="title">
                <hic>銆愬喎鍗存椂闂村噺灏戙€?/hic>
            </span>
            <hic>
                <span data-prop="distime" class="value">0</span>
            </hic><br />
            <span class="title">
                <hic>銆愬唴鍔涙秷鑰楀噺灏戙€?/hic>
            </span>
            <hic>
                <span data-prop="expend_mp" class="value">0</span>
            </hic><br />
            <span class="title">
                <hic>銆愯礋闈㈡姷鎶椼€?/hic>
            </span>
            <hic>
                <span data-prop="downside_per" class="value">0</span>
            </hic><br />
            <span class="title">
                <hic>銆愭墦鍧愭晥鐜囥€?/hic>
            </span>
            <hic>
                <span data-prop="dazuo_per" class="value">0</span>
            </hic><br />
            <span class="title">
                <hic>銆愬涔犳晥鐜囥€?/hic>
            </span>
            <hic>
                <span data-prop="study_per" class="value">0</span>
            </hic><br />
            <span class="title">
                <hic>銆愮粌涔犳晥鐜囥€?/hic>
            </span>
            <hic>
                <span data-prop="lianxi_per" class="value">0</span>
            </hic>
        </div>`,
    template_title: `      <div class="dialog-titles">
        </div>
`,
    template_zhenyi: `      <div class="dialog-zhenyi">
        </div>
`,


};

