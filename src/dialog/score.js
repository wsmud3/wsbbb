

export default {
    footer: [["属性", null],
    ["详细", null], ["称号", null], ["真意", null]],

    selectIndex: 0,
    onData: function (data) {
        console.log(data);
        this.data = data;
        // 存储禁地解锁状态，控制真意面板显示
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

        // 门派禁地未解锁时隐藏真意面板
        var showCount = this.has_jd ? this.footer.length : (this.footer.length - 1);
        for (var i = 0; i < showCount; i++) {
            $("<span class='footer-item " + (this.selectIndex == i ? "select" : "") + "' for='" + i + "'>"
                + this.footer[i][0] + "</span>").appendTo(Dialog.footerElement);
        }
        this.isShow = true;
        // 如果之前选中了不存在的标签则回退
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
            // 每次切回真意页都刷新一次，避免玄晶、悟痕和启用状态使用旧缓存。
            SendCommand("zhenyi");
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
            html.push(this.titles[i].use ? "<red>取消</red>" : "使用");
            html.push("</span>");

            html.push("</div>");
        }
        panel.html(html.length ? html.join("") : "<div class='empty'>你还没有获得任何称号</div>");
    },

    create_zhenyi: function () {
        var panel = $(".dialog-zhenyi");
        var html = [];
        html.push("<div class='zy-summary'><hio>");
        html.push(this.zy_name);
        html.push("</hio><span>", this.zy_area || "门派禁地", "</span></div>");
        for (var i = 0; i < this.zhenyiList.length; i++) {
            var z = this.zhenyiList[i];
            html.push("<div class='skill-item zy-item grade", z.grade || 0, z.acquired ? "" : " zy-locked", z.active ? " enable" : "", "' data-zy-id='", z.id, "'>");
            html.push("<span class='glyphicon glyphicon-ok enable-flag'></span>");
            html.push("<span class='zy-name'>", z.name, "</span>");
            html.push("<span class='skill-level'>");
            if (z.active) html.push("<hig>已启用</hig> · ");
            html.push(z.acquired ? ("第" + z.level + "重") : "未领悟");
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
        html.push("<div class='zy-detail-title'><hio>【", z.mech, "】</hio>", z.trial ? ("　" + z.trial) : "", "</div>");
        html.push("<div class='zy-desc'>", z.desc, "</div>");
        if (z.acquired && z.level >= 10) html.push("<div class='zy-meta'><hig>已臻圆满</hig></div>");
        else if (!z.acquired) {
            html.push("<div class='zy-meta'>完成对应禁地试炼后领悟</div>");
        }
        if (z.mechanic_only) html.push("<div class='zy-meta'><hiy>纯机制真意，无需升级。</hiy></div>");
        html.push("<div class='item-commands'>");
        if (z.acquired) html.push("<span cmd='zhenyi active ", z.id, "'>", z.active ? "卸下" : "启用", "</span>");
        if (z.acquired && z.level < 10 && !z.mechanic_only) html.push("<span cmd='zhenyi upgrade ", z.id, "'>升级</span>");
        html.push("<span class='sub-close' style='float:right;color:#888;cursor:pointer'>✕</span>");
        html.push("</div></div>");
        $(html.join("")).insertAfter(elem);
    },


    template_score: `
<div class="dialog-score" cellpadding="0" cellspacing="1">
            <div class="score-section">
                <span class="title">
                    <hic>【性别】</hic>
                </span><span data-prop="gender" class="value"></span>
                <span class="title">
                    <hic>【等级】</hic>
                </span><span data-prop="level" class="value"></span><br />
                <span class="title">
                    <hic>【年龄】</hic>
                </span><span data-prop="age" style="width:10em;" class="value">14</span><br />
                <span class="title">
                    <hic>【经验】</hic>
                </span>
                <hic><span data-prop="exp" class="value">0</span></hic>
                <span class="title">
                    <hic>【潜能】</hic>
                </span>
                <hic><span data-prop="pot" class="value">0</span></hic>
            </div>
            <div class="score-section">
                <div><span class="title">
                        <hig>【气血】</hig>
                    </span>
                    <hig><span data-prop="hp" class="value"
                            style="text-align:right">0</span><span>&nbsp;/&nbsp;</span><span class="value"
                            data-prop="max_hp">0</span></hig>
                </div>
                <div><span class="title">
                        <hig>【内力】</hig>
                    </span>
                    <hig><span data-prop="mp" class="value"
                            style="text-align:right">0</span><span>&nbsp;/&nbsp;</span><span class="value"
                            data-prop="max_mp">0</span></hig>
                </div>
                <span class="title" style="width:6em;">
                    <hic>【内力上限】</hic>
                </span>
                <hic><span data-prop="limit_mp" class="value">0</span></hic><br />
                <span class="title" style="width:6em;">
                    <hic>【精力】</hic>
                </span>
                <hic><span data-prop="jingli" class="value">0</span></hic>
            </div>
            <div class="score-section">
                <span class="title">
                    <hiy>【臂力】</hiy>
                </span><span class="value">
                    <hiy><span data-prop="str">0</span></hiy>
                    <NOR> (+<span data-prop="str_add">0</span>)</NOR>
                </span>
                <span class="title">
                    <hiy>【根骨】</hiy>
                </span><span class="value">
                    <hiy><span data-prop="con">0</span></hiy>
                    <NOR>(+<span data-prop="con_add">0</span>)</NOR>
                </span><br />
                <span class="title">
                    <hiy>【身法】</hiy>
                </span><span class="value">
                    <hiy><span data-prop="dex">0</span></hiy>
                    <NOR>(+<span data-prop="dex_add">0</span>)</NOR>
                </span>
                <span class="title">
                    <hiy>【悟性】</hiy>
                </span><span class="value">
                    <hiy><span data-prop="int">0</span></hiy>
                    <NOR>(+<span data-prop="int_add">0</span>)</NOR>
                </span><br />
                <span class="title">
                    <hiy>【容貌】</hiy>
                </span><span class="value">
                    <hiy><span data-prop="per">0</span></hiy>
                </span>
            </div>
            <div class="score-section">
                <span class="title">
                    <hic>【攻击】</hic>
                </span>
                <hic><span data-prop="gj" class="value">0</span></hic>
                <span class="title">
                    <hic>【防御】</hic>
                </span>
                <hic><span data-prop="fy" class="value">0</span></hic><br />
                <span class="title">
                    <hic>【命中】</hic>
                </span>
                <hic><span data-prop="mz" class="value">0</span></hic>
                <span class="title">
                    <hic>【躲闪】</hic>
                </span>
                <hic><span data-prop="ds" class="value">0</span></hic><br />
                <span class="title">
                    <hic>【招架】</hic>
                </span>
                <hic><span data-prop="zj" class="value">0</span></hic>
                <span class="title">
                    <hic>【暴击】</hic>
                </span>
                <hic><span data-prop="bj" class="value">0</span></hic><br />
                <span class="title" style="width:6em;">
                    <hic>【攻击速度】</hic>
                </span>
                <hic><span data-prop="gjsd" class="value">0</span></hic>
            </div>
            <div class="score-section">
                <span class="title">
                    <hic>【门派】</hic>
                </span>
                <hic><span data-prop="family" class="value">无门无派</span></hic><br />
                <span class="title">
                    <hic>【师傅】</hic>
                </span>
                <hic><span data-prop="master" class="value">无</span></hic><br />
                <span class="title">
                    <hic>【功绩】</hic>
                </span>
                <hic><span data-prop="gongji" class="value">0</span></hic><br />
            </div>
        </div>`,
    template_score2: `     <div class="dialog-score2">
            <span class="title">
                <hic>【最终伤害】</hic>
            </span>
            <hic>
                <span data-prop="add_sh" class="value">0</span>
            </hic>
            <br />
            <span class="title">
                <hic>【忽视防御】</hic>
            </span>
            <hic>
                <span data-prop="diff_fy" class="value">0</span>
            </hic><br />

            <span class="title">
                <hic>【暴击伤害】</hic>
            </span>
            <hic>
                <span data-prop="add_bj" class="value">0</span>
            </hic>
            <br />

            <span class="title">
                <hic>【伤害减免】</hic>
            </span>
            <hic>
                <span data-prop="diff_sh" class="value">0</span>
            </hic>
            <br />
            <span class="title">
                <hic>【暴击抵抗】</hic>
            </span>
            <hic>
                <span data-prop="diff_bj" class="value">0</span>
            </hic><br />
            <span class="title">
                <hic>【释放时间减少】</hic>
            </span>
            <hic>
                <span data-prop="releasetime" class="value">0</span>
            </hic><br />
            <span class="title">
                <hic>【忙乱时间】</hic>
            </span>
            <hic>
                <span data-prop="busy" class="value">0</span>
            </hic><br />
            <span class="title">
                <hic>【忽视忙乱】</hic>
            </span>
            <hic>
                <span data-prop="diff_busy" class="value">0</span>
            </hic><br />
            <span class="title">
                <hic>【冷却时间减少】</hic>
            </span>
            <hic>
                <span data-prop="distime" class="value">0</span>
            </hic><br />
            <span class="title">
                <hic>【内力消耗减少】</hic>
            </span>
            <hic>
                <span data-prop="expend_mp" class="value">0</span>
            </hic><br />
            <span class="title">
                <hic>【负面抵抗】</hic>
            </span>
            <hic>
                <span data-prop="downside_per" class="value">0</span>
            </hic><br />
            <span class="title">
                <hic>【打坐效率】</hic>
            </span>
            <hic>
                <span data-prop="dazuo_per" class="value">0</span>
            </hic><br />
            <span class="title">
                <hic>【学习效率】</hic>
            </span>
            <hic>
                <span data-prop="study_per" class="value">0</span>
            </hic><br />
            <span class="title">
                <hic>【练习效率】</hic>
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

