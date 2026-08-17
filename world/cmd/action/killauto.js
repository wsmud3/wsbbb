	this.inherits(COMMAND);
	this.command = "killauto";
	this.allow_busy = true;
	this.allow_state = true;
	this.allow_die = true;
	this.allow_faint = true;

	// 自动攻击开关：开启后战斗中自动释放绝招
	// killauto        — 切换开关
	// killauto config — 打开可视化配置面板
	// killauto off    — 关闭
	this.enter = function (me, arg) {
	    if (!me.is_player) return;

	    if (arg === "config" || arg === "set") {
	        // 打开配置面板：发送技能列表和当前配置
	        var skills = me.query_auto_pfm_skills();
	        var config = {
	            auto_pfm: me.query_setting("auto_pfm") || "",
	            auto_pfm_config: me.query_setting("auto_pfm_config") || "{}"
	        };
	        me.notify('{type:"dialog",dialog:"auto_pfm",skills:' + JSON.stringify(skills) + ',config:' + JSON.stringify(config) + '}');
	        return;
	    }

	    if (arg === "off" || me.auto_pfm) {
	        me.auto_pfm = false;
	        // 清除正在运行的自动攻击循环
	        if (me.attack_handler) {
	            clearTimeout(me.attack_handler);
	            me.attack_handler = null;
	        }
	        me.auto_skills = null;
	        me.notify("自动攻击已关闭。");
	    } else {
	        me.auto_pfm = true;
	        me.notify("<hig>自动攻击已开启，将在战斗中自动释放绝招。</hig>");
	        // 立即触发一次auto_attack循环
	        if (me.is_fighting() && me.reauto_attack) {
	            me.reauto_attack();
	        }
	    }
	};