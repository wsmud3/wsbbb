
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
        this.element.on("click", ".apfm-close", function () {
            self.doClose();
        });
    },
    show: function (data) {
        this.isShow = true;
        this.init_element();
        this.element.empty();
        this.element.appendTo(Dialog.contentElement);
        Dialog.title("自动出招配置");
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
        html += '<div class="apfm-header">';
        html += '<span style="color:#0f9;font-size:1rem">⚔ 自动出招配置</span>';
        html += '<span style="color:#888;font-size:0.75rem;margin-left:8px">勾选=允许自动释放 | ▲▼排序 | 冷却=间隔毫秒</span>';
        html += '</div>';

        // Mode toggle
        html += '<div class="apfm-mode">';
        html += '<span>出招模式：</span>';
        html += '<button class="apfm-mode-btn' + (mode === "sequence" ? ' active' : '') + '" data-mode="sequence">📋 顺序释放</button>';
        html += '<button class="apfm-mode-btn' + (mode === "random" ? ' active' : '') + '" data-mode="random">🎲 随机释放</button>';
        html += '</div>';

        // Skill table
        html += '<div class="apfm-table">';
        if (!this.skills.length) {
            html += '<div style="color:#888;padding:12px;text-align:center">没有可用的绝招</div>';
        } else {
            for (var i = 0; i < this.skills.length; i++) {
                var s = this.skills[i];
                html += '<div class="apfm-row' + (s.enabled ? '' : ' disabled') + '" data-id="' + s.id + '" data-idx="' + i + '">';
                html += '<input type="checkbox" ' + (s.enabled ? 'checked' : '') + '>';
                html += '<span class="apfm-name" title="' + s.id + '">' + s.name + '</span>';
                html += '<span class="apfm-id">' + s.id + '</span>';
                html += '<input class="apfm-cd" placeholder="冷却ms" value="' + (s.cd || '') + '">';
                html += '<button class="apfm-btn apfm-move-up" title="上移">▲</button>';
                html += '<button class="apfm-btn apfm-move-down" title="下移">▼</button>';
                html += '</div>';
            }
        }
        html += '</div>';

        // Actions
        html += '<div class="apfm-actions">';
        html += '<button class="apfm-save">💾 保存配置</button>';
        html += '<button class="apfm-reset">🔄 重置</button>';
        html += '<button class="apfm-close">❌ 关闭</button>';
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

        ReceiveMessage("<hic>自动出招配置已保存！</hic>");
        $("#apfm_msg").html('<div style="color:#0f9;font-size:0.8rem;padding:4px">✅ 配置已保存</div>');
    },

    doReset: function () {
        // Re-render with original data from server, discarding unsaved changes
        this.render({ skills: this.rawSkills, config: this.config });
        ReceiveMessage("已重置为上次保存的配置。");
    },

    doClose: function () {
        Dialog.hide();
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
    padding: 8px 12px;
    height: 100%;
    overflow-y: auto;
    color: #ccc;
    font-size: 0.85rem;
}
.apfm-header {
    margin-bottom: 8px;
    padding-bottom: 6px;
    border-bottom: 1px solid #333;
}
.apfm-mode {
    display: flex;
    align-items: center;
    gap: 8px;
    margin-bottom: 10px;
}
.apfm-mode-btn {
    padding: 5px 14px;
    border: 1px solid #555;
    border-radius: 4px;
    cursor: pointer;
    font-size: 0.82rem;
    background: #222;
    color: #ccc;
}
.apfm-mode-btn.active {
    background: #e94560;
    color: #fff;
    border-color: #e94560;
}
.apfm-mode-btn:hover {
    border-color: #e94560;
}
.apfm-table {
    border: 1px solid #333;
    border-radius: 4px;
    max-height: 320px;
    overflow-y: auto;
    margin-bottom: 10px;
}
.apfm-row {
    display: flex;
    align-items: center;
    gap: 6px;
    padding: 5px 8px;
    border-bottom: 1px solid #1a1a1a;
    font-size: 0.8rem;
}
.apfm-row:hover { background: #1a1a2e; }
.apfm-row.disabled .apfm-name { color: #555; text-decoration: line-through; }
.apfm-row.disabled .apfm-id { color: #444; }
.apfm-row input[type="checkbox"] { width: 15px; height: 15px; cursor: pointer; accent-color: #e94560; }
.apfm-name { flex: 0 0 auto; min-width: 80px; font-weight: bold; }
.apfm-id { flex: 1; color: #888; font-size: 0.72rem; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
.apfm-cd { width: 72px; padding: 3px 5px; font-size: 0.72rem; background: #111; border: 1px solid #444; color: #ccc; border-radius: 3px; }
.apfm-cd::placeholder { color: #444; }
.apfm-btn { padding: 2px 7px; font-size: 0.7rem; background: #333; color: #ccc; border: 1px solid #555; border-radius: 3px; cursor: pointer; }
.apfm-btn:hover { background: #e94560; color: #fff; }
.apfm-actions { display: flex; gap: 8px; margin-top: 10px; }
.apfm-save { padding: 7px 20px; background: #e94560; color: #fff; border: none; border-radius: 4px; cursor: pointer; font-size: 0.85rem; }
.apfm-save:hover { opacity: 0.85; }
.apfm-reset { padding: 7px 14px; background: #333; color: #ccc; border: 1px solid #555; border-radius: 4px; cursor: pointer; font-size: 0.8rem; }
.apfm-reset:hover { border-color: #e94560; }
.apfm-close { padding: 7px 14px; background: transparent; color: #888; border: 1px solid #444; border-radius: 4px; cursor: pointer; font-size: 0.8rem; }
.apfm-close:hover { color: #fff; border-color: #888; }
`;
