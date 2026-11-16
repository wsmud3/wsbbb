
import Setting from '../setting.js';
import { ReceiveMessage } from '../client.js';

export default {
    isShow: false,
    skills: [],
    config: {},

    init: function () {
        if (!this.created)
            Dialog.injectStyle(auto_pfm_css);
        this.created = true;
    },
    init_element: function () {
        if (!this.element) {
            this.element = $('<div class="dialog-auto-pfm"></div>');
            this.bindEvents();
        }
    },
    bindEvents: function () {
        var self = this;
        this.element.on("click", ".apfm-mode-btn", function () {
            self.element.find(".apfm-mode-btn").removeClass("active");
            $(this).addClass("active");
        });
        this.element.on("change", ".apfm-row input[type=\"checkbox\"]", function () {
            $(this).closest(".apfm-row").toggleClass("disabled", !this.checked);
        });
        this.element.on("click", ".apfm-move-up", function () {
            self.moveRow(this, "up");
        });
        this.element.on("click", ".apfm-move-down", function () {
            self.moveRow(this, "down");
        });
        this.element.on("click", ".apfm-save", function () {
            self.doSave();
        });
        this.element.on("click", ".apfm-reset", function () {
            self.doReset();
        });
    },
    show: function (data) {
        this.isShow = true;
        this.init_element();
        this.element.empty();
        this.element.appendTo(Dialog.contentElement);
        Dialog.title("自动出招");
        Dialog.icon("cog");
        Dialog.footer("");
        this.render(data);
    },
    onData: function (data) {
        if (!this.isShow) {
            this.show(data);
            return;
        }
        this.render(data);
    },
    render: function (data) {
        if (!data || !data.skills) return;
        this.skills = data.skills || [];
        this.rawSkills = data.skills || [];
        this.config = data.config || {};

        // Parse current config
        var savedOrder = (this.config.auto_pfm || "").split(",");
        var savedCfg = {};
        try {
            if (this.config.auto_pfm_config) savedCfg = JSON.parse(this.config.auto_pfm_config);
        } catch (e) { }
        var savedCD = savedCfg.cooldowns || {};
        var mode = savedCfg.mode || "sequence";

        // Build ordered skill list: saved order first, then new skills
        var orderedSkills = [];
        var seen = {};
        for (var i = 0; i < savedOrder.length; i++) {
            var sid = savedOrder[i].trim();
            if (sid) {
                // Find matching skill
                for (var j = 0; j < this.skills.length; j++) {
                    if (this.skills[j].id === sid && !seen[sid]) {
                        seen[sid] = true;
                        orderedSkills.push({
                            id: sid,
                            name: this.skills[j].name || sid,
                            enabled: true,
                            cd: savedCD[sid] || ""
                        });
                        break;
                    }
                }
                // Skill no longer available (e.g. force unequipped) - skip it
            }
        }
        // Add remaining skills (not in saved order = disabled)
        for (var j = 0; j < this.skills.length; j++) {
            var sid = this.skills[j].id;
            if (!seen[sid]) {
                seen[sid] = true;
                orderedSkills.push({
                    id: sid,
                    name: this.skills[j].name || sid,
                    enabled: false,
                    cd: savedCD[sid] || ""
                });
            }
        }

        this.skills = orderedSkills;

        var html = '';
        html += '<div class="apfm-hint">勾选的绝招才会自动施展；用 ▲▼ 调整先后；冷却填两次施展的间隔（毫秒），不填则按绝招本身的冷却。</div>';

        // 出招模式
        html += '<div class="apfm-mode item-commands">';
        html += '<span class="apfm-label">出招：</span>';
        html += '<span class="apfm-mode-btn' + (mode === "sequence" ? ' active' : '') + '" data-mode="sequence">依次施展</span>';
        html += '<span class="apfm-mode-btn' + (mode === "random" ? ' active' : '') + '" data-mode="random">随机施展</span>';
        html += '</div>';

        // 绝招列表
        html += '<div class="apfm-table">';
        if (!this.skills.length) {
            html += '<div class="empty">你还没有可用的绝招。</div>';
        } else {
            for (var i = 0; i < this.skills.length; i++) {
                var s = this.skills[i];
                html += '<div class="apfm-row' + (s.enabled ? '' : ' disabled') + '" data-id="' + s.id + '" data-idx="' + i + '">';
                html += '<input type="checkbox" ' + (s.enabled ? 'checked' : '') + '>';
                html += '<span class="apfm-name">' + s.name + '</span>';
                html += '<input class="apfm-cd" type="number" min="0" placeholder="冷却" value="' + (s.cd || '') + '">';
                html += '<span class="item-commands"><span class="apfm-move-up" title="上移">▲</span><span class="apfm-move-down" title="下移">▼</span></span>';
                html += '</div>';
            }
        }
        html += '</div>';

        // 操作
        html += '<div class="item-commands apfm-actions">';
        html += '<span class="apfm-save">保存</span>';
        html += '<span class="apfm-reset">还原</span>';
        html += '</div>';
        html += '<div id="apfm_msg"></div>';

        this.element.html(html);
    },

    moveRow: function (btn, dir) {
        var row = $(btn).closest(".apfm-row");
        var rows = this.element.find(".apfm-row");
        var idx = rows.index(row);
        var newIdx = dir === 'up' ? idx - 1 : idx + 1;
        if (newIdx < 0 || newIdx >= rows.length) return;
        if (dir === 'up') {
            row.insertBefore(rows.eq(newIdx));
        } else {
            row.insertAfter(rows.eq(newIdx));
        }
    },

    doSave: function () {
        var self = this;
        var rows = self.element.find(".apfm-row");
        var order = [], cooldowns = {};
        var currentIds = {};
        rows.each(function () {
            var row = $(this);
            var id = row.data("id");
            currentIds[id] = true;
            var enabled = row.find("input[type=\"checkbox\"]").is(":checked");
            if (enabled) order.push(id);
            var cd = parseInt(row.find(".apfm-cd").val());
            if (cd > 0) cooldowns[id] = cd;
        });

        // 清理已卸载技能的残留冷却配置
        var oldCfg = {};
        try { if (self.config.auto_pfm_config) oldCfg = JSON.parse(self.config.auto_pfm_config); } catch (e) { }
        var oldCD = oldCfg.cooldowns || {};
        for (var key in oldCD) {
            if (!currentIds[key]) delete oldCD[key];
        }
        for (var key in cooldowns) {
            oldCD[key] = cooldowns[key];
        }

        var mode = self.element.find(".apfm-mode-btn.active").data("mode") || "sequence";
        var configObj = { mode: mode, cooldowns: oldCD };
        var configStr = JSON.stringify(configObj);

        Setting.save("auto_pfm", order.join(","));
        Setting.save("auto_pfm_config", configStr);

        ReceiveMessage("<hic>你记下了这套出招的路数。</hic>");
        $("#apfm_msg").html('<hig>已保存。</hig>');
    },

    doReset: function () {
        // Re-render with original data from server, discarding unsaved changes
        this.render({ skills: this.rawSkills, config: this.config });
        ReceiveMessage("已还原为上次保存的出招路数。");
    },

    hide: function () {
        // allow close
    },
    close: function () {
        this.element.detach();
        this.isShow = false;
    }
};

const auto_pfm_css = `
.dialog-auto-pfm {
    padding: 0.5em;
    height: 100%;
    overflow-y: auto;
}

.dialog-auto-pfm>.apfm-hint {
    color: #808080;
    font-size: 0.85em;
    line-height: 1.5em;
    margin-bottom: 0.5em;
}

.dialog-auto-pfm>.apfm-mode>.apfm-label {
    border: none;
    background-color: transparent;
    min-width: 0;
    padding: 0.25em 0;
    margin-right: 0.25em;
    cursor: default;
}

.dialog-auto-pfm>.apfm-mode>.apfm-mode-btn.active {
    border-color: #00ff00;
    color: #00ff00;
}

.dialog-auto-pfm>.apfm-table {
    max-height: 20em;
    overflow-y: auto;
    margin: 0.5em 0;
}

.dialog-auto-pfm .apfm-row {
    display: flex;
    align-items: center;
    line-height: 2em;
    padding-left: 0.5em;
    margin-bottom: 0.5em;
    background-color: #111;
    border-left: 2px solid #00ff00;
    border-radius: 4px;
}

.dialog-auto-pfm .apfm-row.disabled {
    border-left-color: gray;
}

.dialog-auto-pfm .apfm-row.disabled>.apfm-name {
    color: #505050;
}

.dialog-auto-pfm .apfm-row>input[type="checkbox"] {
    width: 1em;
    height: 1em;
    margin: 0 0.5em 0 0;
    cursor: pointer;
}

.dialog-auto-pfm .apfm-row>.apfm-name {
    flex: 1;
    font-weight: bold;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
}

.dialog-auto-pfm .apfm-row>.apfm-cd {
    width: 5em;
    height: 1.8em;
    background-color: transparent;
    border: 1px solid #666666;
    border-radius: 0.25em;
    color: inherit;
    text-align: center;
    outline: none;
}

.dialog-auto-pfm .apfm-row>.item-commands {
    padding-bottom: 0;
    margin-left: 0.5em;
}

.dialog-auto-pfm .apfm-row>.item-commands>span {
    min-width: 0;
    padding: 0 0.6em;
    margin: 0 0.25em 0 0;
}
`;
