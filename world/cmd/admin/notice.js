this.inherits(COMMAND);
this.command = "notice";
this.allow_busy = true;
this.allow_state = true;
this.allow_die = true;
this.allow_level = 1;
const MESSAGE = WORLD.MESSAGE;
this.enter = function (me, arg) {
    var nt = {
        content: arg,
        time: Date.now()
    };
    MESSAGE.NOTICES.push(nt);
    // Use type:"msg" instead of type:"dialog" to avoid blank popup freeze
    WORLD.sendAll(JSON.stringify({ type: "msg", ch: "sys", content: arg }));
}

this.updatelast = function (me) {
    MESSAGE.NOTICES[MESSAGE.NOTICES.length - 1].content = `
   古大陆妖族营地在每周快速完成后，仍可以继续手动击杀，直到每周上限。
   降低营地1刷新速度10秒，其他营地暂时关闭
    `;
    me.send(MESSAGE.NOTICES[MESSAGE.NOTICES.length - 1].content);
} 