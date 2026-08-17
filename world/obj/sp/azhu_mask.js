this.inherits(OBJ);
this.name = "<hiy>易容面具</hiy>";
this.desc = "阿朱以独门手法制作的易容面具，薄如蝉翼，贴在脸上即可化身他人。不过一旦动武或运功，面具便会脱落。";
this.value = 100000;
this.no_store = true;
this.on_use = function(me) {
    if (me.query_temp('disguise_target')) {
        me.notify('你已经戴着一张易容面具了。');
        return false;
    }
    if (!me.environment) return false;
    var targets = [];
    for (var i = 0; i < me.environment.items.length; i++) {
        var item = me.environment.items[i];
        if ((item.is_player || item.is_npc) && item !== me && item.name) {
            targets.push(item);
        }
    }
    if (!targets.length) { me.notify('这里没有可以模仿的对象。'); return false; }
    var target = targets.random();
    me.set_temp('disguise_target', target.id);
    me.set_temp('disguise_name', me.name);
    me.set_temp('disguise_title', me.query_title ? me.query_title() : '');
    me.name = target.name;
    me.notify('<hiy>你戴上了易容面具，现在你看起来就像是' + target.name + '。</hiy>');
    return true;
};
this.on_remove = function(me) {
    var realName = me.query_temp('disguise_name');
    if (realName) {
        me.name = realName;
        me.remove_temp('disguise_target');
        me.remove_temp('disguise_name');
        me.remove_temp('disguise_title');
        me.notify('易容面具脱落，你恢复了原本的容貌。');
    }
};
