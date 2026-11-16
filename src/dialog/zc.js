export default {
    isShow: false,
    step: "view",
    data: null,

    // 当前选择
    selectedWords: [],
    selectedPfms: [],

    init: function () {
        // 按钮沿用全局 .item-commands>span（main.css），颜色用颜色标签（global.css），尺寸一律 em，
        // 这样字号设置（dialog_size）和整体风格对自创面板同样生效。
        Dialog.injectStyle(`
.dialog-zc {
    padding: 0.5em;
    line-height: 1.6em;
}

.dialog-zc>.zc-line {
    margin: 0.25em 0;
}

.dialog-zc>.zc-section {
    margin: 0.75em 0 0.25em;
    color: #808000;
    font-weight: bold;
}

.dialog-zc .item-commands>span.already {
    opacity: 0.4;
    pointer-events: none;
}

.dialog-zc .zc-word-item,
.dialog-zc .zc-pfm-item {
    display: flex;
    justify-content: space-between;
    align-items: center;
    line-height: 2em;
    padding: 0 0.5em;
    margin-bottom: 0.5em;
    background-color: #111;
    border-left: 2px solid gray;
    border-radius: 4px;
    cursor: pointer;
}

.dialog-zc .zc-word-item.selected,
.dialog-zc .zc-pfm-item.selected {
    border-left-color: #00FF00;
    background-color: #222;
}

.dialog-zc .word-info,
.dialog-zc .pfm-info {
    flex: 1;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
}

.dialog-zc .word-cost,
.dialog-zc .pfm-cost {
    color: #808080;
    font-size: 0.85em;
    min-width: 3em;
    text-align: right;
}

.dialog-zc>.zc-summary {
    margin: 0.5em 0;
    padding: 0.25em 0.5em;
    background-color: #111;
    border-radius: 4px;
    border-left: 2px solid #00FFFF;
}

.dialog-zc>.zc-summary>span {
    display: inline-block;
    margin-right: 1em;
}

.dialog-zc .zc-cat-tag {
    font-size: 0.75em;
    padding: 0 0.3em;
    border-radius: 2px;
    color: #fff;
    margin-right: 0.3em;
}

.dialog-zc .zc-cat-0 { background-color: #808000; }
.dialog-zc .zc-cat-1 { background-color: #008080; }
.dialog-zc .zc-cat-2 { background-color: #800080; }
.dialog-zc .zc-cat-3 { background-color: #d26900; }
.dialog-zc .zc-cat-4 { background-color: #800000; }
.dialog-zc .zc-cat-passive { background-color: #912CEE; }

.dialog-zc .zc-level-input {
    width: 6em;
    height: 2em;
    background-color: transparent;
    color: #FFFF00;
    border: 1px solid #666666;
    border-radius: 0.25em;
    text-align: center;
    font-size: 1em;
    outline: none;
}

@media (max-width: 480px) {
    .dialog-zc .zc-word-item,
    .dialog-zc .zc-pfm-item {
        line-height: 2.4em;
    }
}
`);
    },

    init_element: function () {
        if (!this._eventsBound) {
            // 绑定到 document 而不是 Dialog.contentElement：
            // 自创面板除了渲染进对话框，还会整块搬进浮窗（floatdialog 挂在
            // document.body 上，不在 .container 里，拿不到全局的 [cmd] 分发）。
            // 词条/招式/确认按钮都没有 cmd 属性，只靠这里的委托生效，
            // 绑在 contentElement 上时浮窗里就完全点不动。
            // 用 .zc-* 类名做委托，作用域足够窄，不会误伤其它面板。
            var self = this;
            $(document).on("click.zc", ".zc-word-item", function () {
                var index = parseInt($(this).attr("data-word"));
                if (!isNaN(index)) self.toggleWord(index);
            });
            $(document).on("click.zc", ".zc-pfm-item", function () {
                var pfmId = $(this).attr("data-pfm");
                if (pfmId) self.togglePfm(pfmId);
            });
            $(document).on("click.zc", ".zc-confirm-btn", function () {
                self.confirmSelection();
            });
            $(document).on("click.zc", ".zc-lvl-confirm", function () {
                self.confirmLevelset();
            });
            $(document).on("keydown.zc", ".zc-level-input", function (e) {
                if (e.keyCode === 13) self.confirmLevelset();
            });
            this._eventsBound = true;
        }
    },

    show: function (nosend) {
        this.isShow = true;
    },

    onData: function (data) {
        this.isShow = true;
        this.init_element();  // ensure events are bound before rendering
        if (!data || typeof data !== "object" || Array.isArray(data)) data = {};
        data.positions = Array.isArray(data.positions) ? data.positions : [];
        data.zc_positions = Array.isArray(data.zc_positions) ? data.zc_positions : [];
        data.available_words = Array.isArray(data.available_words) ? data.available_words : [];
        data.available_pfms = Array.isArray(data.available_pfms) ? data.available_pfms : [];
        data.selected_words = Array.isArray(data.selected_words) ? data.selected_words : [];
        data.selected_pfms = Array.isArray(data.selected_pfms) ? data.selected_pfms : [];
        this.data = data;
        this.step = data.step || "view";
        this._maxWords = Math.max(1, Math.min(6, parseInt(data.max_words) || 6));

        switch (this.step) {
            case "view":
                this.render_view(data);
                break;
            case "select_position":
                this.render_positions(data);
                break;
            case "select_words":
                this.selectedWords = data.selected_words.slice();
                this.selectedPfms = data.selected_pfms.slice();
                if (data.is_force && this.selectedWords.indexOf(506) < 0) this.selectedWords.unshift(506);
                this.render_word_selection(data);
                break;
            case "levelset":
                this.render_levelset(data);
                break;
            default:
                this.render(['<div class="zc-line"><hir>这本秘籍的推演进度对不上，先合上秘籍再重新翻开。</hir></div>']);
                Dialog.title("自创武学");
                Dialog.icon("book");
                break;
        }
    },

    // 内容统一包一层 .dialog-zc，按钮行统一用 .item-commands
    render: function (lines) {
        Dialog.contentElement.html('<div class="dialog-zc">' + lines.join("") + '</div>');
    },

    tip: function (msg) {
        Confirm.Show({ content: "<span class='input-error'>" + msg + "</span>" });
    },

    // === 渲染: 查看 ===
    render_view: function (data) {
        var html = [];
        html.push('<div class="zc-line">状态：' + this.stateLabel(data.zc_state) + '</div>');
        html.push('<div class="zc-line">词条：' + (data.total_words || 0) + '　PFM：' + (data.total_pfms || 0) + '</div>');
        if (data.zc_name) html.push('<div class="zc-line">武功名：<hiy>' + data.zc_name + '</hiy></div>');

        if (data.zc_positions && data.zc_positions.length > 0) {
            html.push('<div class="zc-section">已推演部位</div>');
            html.push('<div class="zc-line">' + data.zc_positions.join("、") + '</div>');
        }

        var cmds = [];
        if (data.zc_state === "blank") cmds.push('<span cmd="zc name ' + data.book_id + '">命名</span>');
        if (data.zc_state === "named" || data.zc_state === "completed") cmds.push('<span cmd="zc deduce ' + data.book_id + '">推演</span>');
        if (data.zc_state === "deducing" && data.book_id) cmds.push('<span cmd="zc abandon ' + data.book_id + '"><hir>放弃推演</hir></span>');
        if (data.zc_state === "completed" && data.zc_skill_id) cmds.push('<span cmd="zc study ' + data.book_id + '">学习</span>');
        if (cmds.length) html.push('<div class="item-commands">' + cmds.join("") + '</div>');

        this.render(html);
        Dialog.title(data.book_name || "自创秘籍");
        Dialog.icon("book");
    },

    // === 渲染: 选部位 ===
    render_positions: function (data) {
        var html = [];
        html.push('<div class="item-commands">');
        for (var i = 0; i < data.positions.length; i++) {
            var pos = data.positions[i];
            if (pos.already) html.push('<span class="already">' + pos.label + '（已推演）</span>');
            else html.push('<span cmd="zc select ' + data.book_id + ' ' + pos.key + '">' + pos.label + '</span>');
        }
        html.push('</div>');
        html.push('<div class="item-commands"><span cmd="zc abandon ' + data.book_id + '"><hir>放弃推演</hir></span></div>');

        this.render(html);
        Dialog.title("选择部位" + (data.book_name ? " - " + data.book_name : ""));
        Dialog.icon("book");
    },

    // === 渲染: 选词条 + PFM ===
    render_word_selection: function (data) {
        var self = this;
        var html = [];
        html.push('<div class="zc-line">武道书：' + (data.wudao_count || 0) + '本　最多' + this._maxWords + '个词条　最多3个PFM</div>');

        if (data.is_force) {
            html.push('<div class="zc-line"><hio>内功部位：第一个词条须为「内力上限」，另可选冷却、释放时间等高级词条。</hio></div>');
        }

        html.push('<div class="zc-section">词条（每条耗武道书1本）</div>');
        html.push('<div class="zc-word-list">');
        for (var i = 0; i < data.available_words.length; i++) {
            var word = data.available_words[i];
            var cls = self.isWordSelected(word.index) ? 'zc-word-item selected' : 'zc-word-item';
            var catCls = 'zc-cat-tag zc-cat-' + (typeof word.category === 'number' ? word.category : 'passive');
            var catName = typeof word.category === 'number' ? ['基础','后天','高级','稀有','特殊'][word.category] : '被动';
            html.push('<div class="' + cls + '" data-word="' + word.index + '">');
            html.push('<span class="word-info"><span class="' + catCls + '">' + catName + '</span>' + word.name + '</span>');
            html.push('<span class="word-cost">1本</span>');
            html.push('</div>');
        }
        html.push('</div>');

        html.push('<div class="zc-section">可选PFM</div>');
        html.push('<div class="zc-pfm-list">');
        for (var i = 0; i < data.available_pfms.length; i++) {
            var pfm = data.available_pfms[i];
            var pfmId = pfm.skill_id + '.' + pfm.pfm_key;
            var cls2 = self.isPfmSelected(pfmId) ? 'zc-pfm-item selected' : 'zc-pfm-item';
            html.push('<div class="' + cls2 + '" data-pfm="' + pfmId + '">');
            html.push('<span class="pfm-info">' + pfm.pfm_name + ' <hik>（' + pfm.skill_name + ' 3000级以上）</hik></span>');
            html.push('<span class="pfm-cost">' + pfm.cost + '本</span>');
            html.push('</div>');
        }
        html.push('</div>');

        var wordCost = self.selectedWords.length;
        var pfmCost = self.getPfmCost();
        html.push('<div class="zc-summary">');
        html.push('<span>词条：' + self.selectedWords.length + '/' + this._maxWords + '（耗' + wordCost + '本）</span>');
        html.push('<span>PFM：' + self.selectedPfms.length + '/3（耗' + pfmCost + '本）</span>');
        html.push('<span>共耗：<hij>' + (wordCost + pfmCost) + '本武道书</hij></span>');
        html.push('</div>');

        html.push('<div class="item-commands">');
        html.push('<span class="zc-confirm-btn">确认推演</span>');
        html.push('<span cmd="zc abandon ' + data.book_id + '"><hir>放弃推演</hir></span>');
        html.push('</div>');

        this.render(html);
        Dialog.title("推演 - " + data.position_label);
        Dialog.icon("book");

        // 存储当前数据供后续使用
        this._bookId = data.book_id;
        this._position = data.position;
        this._availablePfms = data.available_pfms.slice();
    },

    // === 渲染: 输入目标等级 ===
    render_levelset: function (data) {
        var html = [];
        html.push('<div class="zc-line">当前等级：<hig>' + (data.cur_level || 0) + '级</hig></div>');
        html.push('<div class="zc-line"><hik>目标等级：</hik>');
        html.push('<input type="number" class="zc-level-input" value="' + (data.cur_level || 0) + '" min="0"></div>');
        html.push('<div class="item-commands">');
        html.push('<span class="zc-lvl-confirm">确认</span>');
        html.push('<span cmd="_closed">取消</span>');
        html.push('</div>');

        this.render(html);
        Dialog.title("升级 - " + (data.word_name || '词条'));
        Dialog.icon("book");

        // 存储数据供确认使用
        this._lvlBookId = data.book_id;
        this._lvlSkillId = data.skill_id;
        this._lvlWordIndex = data.word_index;
    },

    // === 选择逻辑 ===
    isWordSelected: function (index) {
        return Array.isArray(this.selectedWords) && this.selectedWords.indexOf(index) >= 0;
    },

    isPfmSelected: function (pfmId) {
        for (var i = 0; i < this.selectedPfms.length; i++) {
            var sel = this.selectedPfms[i];
            if ((sel.skill_id + '.' + sel.pfm_key) === pfmId) return true;
        }
        return false;
    },

    findWordByIndex: function (index) {
        var words = this.data && this.data.available_words;
        if (!Array.isArray(words)) return null;
        for (var i = 0; i < words.length; i++) {
            if (words[i].index === index) return words[i];
        }
        return null;
    },

    toggleWord: function (index) {
        var idx = this.selectedWords.indexOf(index);
        if (idx >= 0) {
            if (this.data && this.data.is_force && index === 506) {
                this.tip("内功部位须保留「内力上限」词条。");
                return;
            }
            this.selectedWords.splice(idx, 1);
        } else {
            if (this.selectedWords.length >= this._maxWords) {
                this.tip("最多只能选" + this._maxWords + "个词条。");
                return;
            }
            // 内功部位: 如果是第一个词条，强制为内力上限(506)
            if (this.data && this.data.is_force && this.selectedWords.length === 0 && index !== 506) {
                this.tip("内功部位的第一个词条须为「内力上限」。");
                return;
            }
            // 特殊属性限制: 每个部位只能有一个category 4词条
            var newWord = this.findWordByIndex(index);
            if (newWord && newWord.category === 4) {
                for (var si = 0; si < this.selectedWords.length; si++) {
                    var sw = this.findWordByIndex(this.selectedWords[si]);
                    if (sw && sw.category === 4) {
                        this.tip("每个部位只能有一个特殊属性。");
                        return;
                    }
                }
            }
            this.selectedWords.push(index);
        }
        // 刷新显示
        if (this.data) this.render_word_selection(this.data);
    },

    togglePfm: function (pfmId) {
        var idx = -1;
        for (var i = 0; i < this.selectedPfms.length; i++) {
            if ((this.selectedPfms[i].skill_id + '.' + this.selectedPfms[i].pfm_key) === pfmId) {
                idx = i;
                break;
            }
        }
        if (idx >= 0) {
            this.selectedPfms.splice(idx, 1);
        } else {
            if (this.selectedPfms.length >= 3) {
                this.tip("每个部位最多只能选3个PFM。");
                return;
            }
            var parts = pfmId.split(".");
            this.selectedPfms.push({ skill_id: parts[0], pfm_key: parts[1] });
        }
        // 刷新显示
        if (this.data) this.render_word_selection(this.data);
    },

    getPfmCost: function () {
        var cost = 0;
        for (var i = 0; i < this.selectedPfms.length; i++) {
            var sel = this.selectedPfms[i];
            if (Array.isArray(this._availablePfms)) {
                for (var j = 0; j < this._availablePfms.length; j++) {
                    var pfm = this._availablePfms[j];
                    if (pfm.skill_id === sel.skill_id && pfm.pfm_key === sel.pfm_key) {
                        cost += pfm.cost || 1;
                        break;
                    }
                }
            }
        }
        return cost;
    },

    confirmSelection: function () {
        if (this.selectedWords.length === 0) {
            this.tip("你还没有选词条。");
            return;
        }
        if (this.data && this.data.is_force && this.selectedWords[0] !== 506) {
            this.tip("内功部位的第一个词条须为「内力上限」。");
            return;
        }
        if (!this._bookId || !this._position) {
            this.tip("推演部位已失效，请重新选择部位。");
            return;
        }

        var wordStr = this.selectedWords.join(",");
        var pfmParts = [];
        for (var i = 0; i < this.selectedPfms.length; i++) {
            pfmParts.push(this.selectedPfms[i].skill_id + "." + this.selectedPfms[i].pfm_key);
        }
        var pfmStr = pfmParts.join(",");

        var cmd = "zc confirm " + this._bookId + " " + wordStr;
        if (pfmStr) cmd += "|" + pfmStr;

        SendCommand(cmd);
    },

    confirmLevelset: function () {
        var input = Dialog.contentElement.find(".zc-level-input");
        var target = parseInt(input.val());
        if (isNaN(target) || target < 0) {
            this.tip("你要升到几级？");
            return;
        }
        var skill_id = this._lvlSkillId || "";
        var book_id = this._lvlBookId || "";
        var word_index = this._lvlWordIndex || 0;
        Dialog.close();
        SendCommand("zc lvlask " + target + " " + skill_id + " " + book_id + " " + word_index);
    },

    // === 辅助 ===
    stateLabel: function (state) {
        var map = {
            blank: "空白",
            named: "已命名",
            deducing: "推演中",
            completed: "已完成",
        };
        return map[state] || state;
    },

    hide: function () {
        return true;
    },

    close: function () {
        this.isShow = false;
        this.step = "view";
        this.data = null;
        this.selectedWords = [];
        this.selectedPfms = [];
        this._bookId = null;
        this._position = null;
        this._availablePfms = null;
        this._lvlBookId = null;
        this._lvlSkillId = null;
        this._lvlWordIndex = null;
    },

    footerChanged: function () {},
};
