	this.inherits(COMMAND);
	this.command = "wushenfu_sel";
	this.regex = /^(\w+)$/;
	this.enter = function (me, choice) {
		var names = {
			zhurong: "祝融",
			shilin: "石廪",
			furong: "芙蓉",
			hexiang: "鹤翔",
			tianzhu: "天柱",
		};
		var stats = {
			zhurong: "攻击",
			shilin: "防御",
			furong: "命中",
			hexiang: "躲闪",
			tianzhu: "招架",
		};
		if (!names[choice]) {
			return me.notify("无效的选择。可选：zhurong, shilin, furong, hexiang, tianzhu");
		}
		me.set_temp("wushenfu_choice", choice);
		me.notify("你选择了" + names[choice] + "峰神力——五神赋将增益你的" + stats[choice] + "！");
	}
