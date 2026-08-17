export default {
    isShow: false,
    step: "view",
    data: null,

    // 当前选择
    selectedWords: [],
    selectedPfms: [],

    init: function () {
        Dialog.injectStyle(`
            .zc-dialog {padding:10px;max-height:60vh;overflow-y:auto;line-height:1.6em;}
            .zc-dialog h3 {margin:8px 0 4px;color:#FFFF00;}
            .zc-positions {display:flex;flex-wrap:wrap;gap:6px;margin:6px 0;}
            .zc-pos-item {padding:0.25em 1em;border:solid 1px gray;border-radius:0.25em;cursor:pointer;background:black;color:gray;display:inline-block;text-align:center;}
            .zc-pos-item:hover {border-color:#FFFF00;color:#FFFF00;}
            .zc-pos-item.already {opacity:0.4;pointer-events:none;}
            .zc-word-list {margin:6px 0;}
            .zc-word-item {padding:0.25em 0.5em;margin:2px 0;background:#111;border-left:2px solid gray;border-radius:4px;cursor:pointer;display:flex;justify-content:space-between;align-items:center;line-height:2em;}
            .zc-word-item:hover {border-left-color:#FFFF00;}
            .zc-word-item.selected {border-left-color:#00FF00;}
            .zc-word-item .word-info {flex:1;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;}
            .zc-word-item .word-cost {color:#808080;font-size:12px;min-width:40px;text-align:right;}
            .zc-pfm-list {margin:6px 0;}
            .zc-pfm-item {padding:0.25em 0.5em;margin:2px 0;background:#111;border-left:2px solid gray;border-radius:4px;cursor:pointer;display:flex;justify-content:space-between;align-items:center;line-height:2em;}
            .zc-pfm-item:hover {border-left-color:#FFFF00;}
            .zc-pfm-item.selected {border-left-color:#00FF00;}
            .zc-pfm-item .pfm-info {flex:1;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;}
            .zc-pfm-item .pfm-cost {color:#808080;font-size:12px;min-width:60px;text-align:right;}
            .zc-btn {padding:0.25em 1em;margin:6px 4px;border:solid 1px gray;border-radius:0.25em;background:black;color:gray;cursor:pointer;display:inline-block;}
            .zc-btn:hover {background:#333;color:#FFFF00;border-color:#FFFF00;}
            .zc-btn.danger {border-color:#FF0000;color:#FF0000;}
            .zc-btn.danger:hover {background:#333;}
            .zc-summary {margin:8px 0;padding:6px 8px;background:#111;border-radius:4px;border-left:2px solid #00FFFF;}
            .zc-summary span {margin-right:12px;}
            .zc-cat-tag {font-size:10px;padding:1px 4px;border-radius:2px;color:#fff;margin-right:4px;}
            .zc-cat-0 {background:#808000;}
            .zc-cat-1 {background:#008080;}
            .zc-cat-2 {background:#800080;}
            .zc-cat-3 {background:#d26900;}
            .zc-cat-4 {background:#800000;}
            .zc-cat-passive {background:#912CEE;}
            .zc-pos-tabs {display:flex;flex-wrap:wrap;gap:4px;margin:6px 0;}
            .zc-pos-tab {padding:0.2em 0.8em;border:solid 1px gray;border-radius:0.25em;cursor:pointer;background:black;color:gray;font-size:13px;}
            .zc-pos-tab:hover {border-color:#FFFF00;color:#FFFF00;}
            .zc-pos-tab.active {border-color:#00FF00;color:#00FF00;}
            .zc-level-input {width:80px;padding:0.25em 0.5em;background:black;color:#FFFF00;border:solid 1px gray;border-radius:0.25em;text-align:center;font-size:14px;outline:none;}
            .zc-level-input:focus {border-color:#FFFF00;}
            @media (max-width: 480px) {
                .zc-dialog {padding:8px;line-height:1.8em;}
                .zc-dialog h3 {margin:10px 0 6px;font-size:1.1em;}
                .zc-dialog h4 {margin:10px 0 4px;font-size:1em;}
                .zc-positions {gap:8px;margin:8px 0;}
                .zc-pos-item {padding:0.5em 1.2em;font-size:0.95em;}
                .zc-word-item {padding:0.5em 0.6em;margin:4px 0;line-height:2.4em;}
                .zc-pfm-item {padding:0.5em 0.6em;margin:4px 0;line-height:2.4em;}
                .zc-word-item .word-cost {font-size:13px;min-width:36px;}
                .zc-pfm-item .pfm-cost {font-size:13px;min-width:50px;}
                .zc-cat-tag {font-size:12px;padding:1px 5px;}
                .zc-btn {padding:0.5em 1.4em;margin:8px 4px;font-size:0.95em;}
                .zc-summary {margin:10px 0;padding:8px 10px;}
                .zc-summary span {display:inline-block;margin-bottom:2px;}
                .zc-pos-tabs {gap:6px;margin:8px 0;}
                .zc-pos-tab {padding:0.4em 1em;font-size:14px;}
                .zc-level-input {width:100px;padding:0.5em 0.6em;font-size:16px;}
            }
        `);
    },

    init_element: function () {
        if (!this._eventsBound) {
            // 绑定事件到dialog-content，因为渲染直接写入contentElement
            var self = this;
            Dialog.contentElement.on("click", ".zc-word-item", function () {
                var index = parseInt($(this).attr("data-word"));
                if (!isNaN(index)) self.toggleWord(index);
            });
            Dialog.contentElement.on("click", ".zc-pfm-item", function () {
                var pfmId = $(this).attr("data-pfm");
                if (pfmId) self.togglePfm(pfmId);
            });
            Dialog.contentElement.on("click", ".zc-confirm-btn", function () {
                self.confirmSelection();
            });
            Dialog.contentElement.on("click", ".zc-lvl-confirm", function () {
                self.confirmLevelset();
            });
            Dialog.contentElement.on("keydown", ".zc-level-input", function (e) {
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
        this.data = data;
        this.step = data.step || "view";

        switch (this.step) {
            case "view":
                this.render_view(data);
                break;
            case "select_position":
                this.render_positions(data);
                break;
            case "select_words":
                this.selectedWords = data.selected_words ? data.selected_words.slice() : [];
                this.selectedPfms = data.selected_pfms ? data.selected_pfms.slice() : [];
                this.render_word_selection(data);
                break;
            case "levelset":
                this.render_levelset(data);
                break;
        }
    },

    // === 渲染: 查看 ===
    render_view: function (data) {
        var html = [];
        html.push('<h3>' + (data.book_name || '秘籍') + '</h3>');
        html.push('<p>状态: ' + this.stateLabel(data.zc_state) + '</p>');
        html.push('<p>品质: grade ' + (data.grade || 0) + ' | 词条数: ' + (data.total_words || 0) + ' | PFM数: ' + (data.total_pfms || 0) + '</p>');

        if (data.zc_name) html.push('<p>武功名: ' + data.zc_name + '</p>');
        if (data.zc_skill_id) html.push('<p>技能ID: ' + data.zc_skill_id + '</p>');

        // 显示已推演部位
        if (data.zc_positions && data.zc_positions.length > 0) {
            html.push('<p>已推演部位:</p><ul>');
            for (var i = 0; i < data.zc_positions.length; i++) {
                html.push('<li>' + data.zc_positions[i] + '</li>');
            }
            html.push('</ul>');
        }

        // 操作按钮
        html.push('<div style="margin-top:12px;">');
        if (data.zc_state === "blank") {
            html.push('<button class="zc-btn" cmd="zc name ' + data.book_id + '">命名</button>');
        }
        if (data.zc_state === "named" || data.zc_state === "completed") {
            html.push('<button class="zc-btn" cmd="zc deduce ' + data.book_id + '">推演</button>');
        }
        if (data.zc_state === "deducing" && data.book_id) {
            html.push('<button class="zc-btn danger" cmd="zc abandon ' + data.book_id + '">放弃推演</button>');
        }
        if (data.zc_state === "completed" && data.zc_skill_id) {
            html.push('<button class="zc-btn" cmd="zc study ' + data.book_id + '">学习</button>');
        }
        html.push('<button class="zc-btn danger" cmd="_closed">关闭</button>');
        html.push('</div>');

        Dialog.contentElement.html(html.join(""));
        Dialog.title(data.book_name || "自创秘籍");
    },

    // === 渲染: 选部位 ===
    render_positions: function (data) {
        var html = [];
        html.push('<h3>选择推演部位 - ' + (data.book_name || '') + '</h3>');
        html.push('<div class="zc-positions">');

        for (var i = 0; i < data.positions.length; i++) {
            var pos = data.positions[i];
            var cls = pos.already ? 'zc-pos-item already' : 'zc-pos-item';
            var cmd = pos.already ? '' : ('cmd="zc select ' + data.book_id + ' ' + pos.key + '"');
            html.push('<div class="' + cls + '" ' + cmd + '>' + pos.label + (pos.already ? ' (已推演)' : '') + '</div>');
        }

        html.push('</div>');
        html.push('<button class="zc-btn danger" cmd="zc abandon ' + data.book_id + '">放弃推演</button>');
        html.push('<button class="zc-btn" cmd="_closed">关闭</button>');

        Dialog.contentElement.html(html.join(""));
        Dialog.title("选择部位");
    },

    // === 渲染: 选词条 + PFM ===
    render_word_selection: function (data) {
        var self = this;
        var html = [];
        html.push('<h3>' + data.position_label + ' - 选择词条与PFM</h3>');
        html.push('<p>武道书: ' + (data.wudao_count || 0) + '本 | 最多' + (data.max_words || 6) + '个词条 | 最多3个PFM</p>');

        if (data.is_force) {
            html.push('<p style="color:#ff8c00;">内功部位: 第一个词条必须为"内力上限"，可选额外高级词条(冷却/释放时间)</p>');
        }

        // 词条列表
        html.push('<h4>词条 (每词条消耗1本武道书)</h4>');
        html.push('<div class="zc-word-list">');
        for (var i = 0; i < data.available_words.length; i++) {
            var word = data.available_words[i];
            var isSelected = self.isWordSelected(word.index);
            var cls = isSelected ? 'zc-word-item selected' : 'zc-word-item';
            var catCls = 'zc-cat-tag zc-cat-' + (typeof word.category === 'number' ? word.category : 'passive');
            var catName = typeof word.category === 'number' ? ['基础','后天','高级','稀有','特殊'][word.category] : '被动';
            html.push('<div class="' + cls + '" data-word="' + word.index + '">');
            html.push('<span class="word-info"><span class="' + catCls + '">' + catName + '</span> ' + word.name + ' [' + word.index + ']</span>');
            html.push('<span class="word-cost">1本</span>');
            html.push('</div>');
        }
        html.push('</div>');

        // PFM列表
        html.push('<h4>可选PFM</h4>');
        html.push('<div class="zc-pfm-list">');
        for (var i = 0; i < data.available_pfms.length; i++) {
            var pfm = data.available_pfms[i];
            var pfmId = pfm.skill_id + '.' + pfm.pfm_key;
            var isPfmSelected = self.isPfmSelected(pfmId);
            var cls2 = isPfmSelected ? 'zc-pfm-item selected' : 'zc-pfm-item';
            html.push('<div class="' + cls2 + '" data-pfm="' + pfmId + '">');
            html.push('<span class="pfm-info">' + pfm.pfm_name + ' <span style="color:#888;">(' + pfm.skill_name + ' Lv.3000+)</span></span>');
            html.push('<span class="pfm-cost">' + pfm.cost + '本</span>');
            html.push('</div>');
        }
        html.push('</div>');

        // 汇总
        var wordCost = self.selectedWords.length;
        var pfmCost = self.getPfmCost();
        var totalCost = wordCost + pfmCost;
        html.push('<div class="zc-summary">');
        html.push('<span>词条: ' + self.selectedWords.length + '/' + (data.max_words || 6) + ' (消耗' + wordCost + '本)</span>');
        html.push('<span>PFM: ' + self.selectedPfms.length + '/3 (消耗' + pfmCost + '本)</span>');
        html.push('<span>总消耗: <b style="color:#ffd700;">' + totalCost + '本武道书</b></span>');
        html.push('</div>');

        // 按钮
        html.push('<button class="zc-btn zc-confirm-btn">确认推演</button>');
        html.push('<button class="zc-btn danger" cmd="zc abandon ' + data.book_id + '">放弃推演</button>');
        html.push('<button class="zc-btn" cmd="_closed">关闭</button>');

        Dialog.contentElement.html(html.join(""));
        Dialog.title("推演 - " + data.position_label);

        // 存储当前数据供后续使用
        this._bookId = data.book_id;
        this._position = data.position;
        this._availablePfms = data.available_pfms;
    },

    // === 渲染: 输入目标等级 ===
    render_levelset: function (data) {
        var html = [];
        html.push('<h3>' + (data.word_name || '词条') + ' 升级</h3>');
        html.push('<p>当前等级: <b style="color:#00FF00;">(Lv.' + (data.cur_level || 0) + ')</b></p>');
        html.push('<div style="margin:12px 0;">');
        html.push('<span style="color:gray;">目标等级: </span>');
        html.push('<input type="number" class="zc-level-input" value="' + (data.cur_level || 0) + '" min="0">');
        html.push('</div>');
        html.push('<div style="margin-top:12px;">');
        html.push('<button class="zc-btn zc-lvl-confirm">确认</button>');
        html.push('<button class="zc-btn danger" cmd="_closed">取消</button>');
        html.push('</div>');

        Dialog.contentElement.html(html.join(""));
        Dialog.title("升级 - " + (data.word_name || '词条'));

        // 存储数据供确认使用
        this._lvlBookId = data.book_id;
        this._lvlSkillId = data.skill_id;
        this._lvlWordIndex = data.word_index;
    },

    // === 选择逻辑 ===
    isWordSelected: function (index) {
        return this.selectedWords.indexOf(index) >= 0;
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
        if (!words) return null;
        for (var i = 0; i < words.length; i++) {
            if (words[i].index === index) return words[i];
        }
        return null;
    },

    toggleWord: function (index) {
        var idx = this.selectedWords.indexOf(index);
        if (idx >= 0) {
            this.selectedWords.splice(idx, 1);
        } else {
            if (this.selectedWords.length >= 6) {
                alert("最多选择6个词条");
                return;
            }
            // 内功部位: 如果是第一个词条，强制为内力上限(506)
            if (this.data && this.data.is_force && this.selectedWords.length === 0 && index !== 506) {
                alert("内功部位第一个词条必须选择'内力上限'(index 506)");
                return;
            }
            // 特殊属性限制: 每个部位只能有一个category 4词条
            var newWord = this.findWordByIndex(index);
            if (newWord && newWord.category === 4) {
                for (var si = 0; si < this.selectedWords.length; si++) {
                    var sw = this.findWordByIndex(this.selectedWords[si]);
                    if (sw && sw.category === 4) {
                        alert("每个部位只能拥有一个特殊属性。");
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
                alert("每部位最多选择3个PFM");
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
            if (this._availablePfms) {
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
            alert("请至少选择一个词条");
            return;
        }
        if (!this._bookId || !this._position) {
            alert("数据异常，请重新选择部位");
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
            alert("请输入有效的目标等级");
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
