this.inherits(COMMAND);
this.command = "fenjie";
this.regex = /^(\w+)(?:\s(\w+))?$/;
this.enter = function (player, objid, isok) {
    var obj = player.find_obj(objid);
    if (!obj) {
        return player.notify("你要分解什么装备？");
    }
    if (obj.is_locked) {
        return player.notify(obj.color_name + "处于锁定状态，无法丢弃，贩卖，分解。");
        //  player.send_commands('lockobj ' + obj.id, '解除锁定');
    }
    if (!obj.is_equipment || obj.no_fenjie)
        return player.notify("这个东西分解不了。");
    if (!obj.grade) return player.notify(obj.color_name + "蕴含的力量太弱了，分解不出来什么东西。");
    if (obj.grade >= 5) {
        return this.fenjie2(player, obj, isok);
    }

    let count = Math.floor(obj.value / 1000);
    if (obj.level > 0) {
        count += (Math.pow(2, obj.level + 1) - 2) * obj.grade;
    }
    if (!isok && obj.st_prop && obj.st_prop.length > 0) {
        return player.notify(obj.color_name + "已经镶嵌宝石，清理宝石后才可以分解。");
    }
    obj = player.remove_obj(obj);
    if (!obj) return player.notify("你要分解什么装备?");
    let attach = player.query_prop('fenjie');
    let sum_count = count + attach;
    var item = player.add_obj("st/xuanjing", sum_count);
    if (!item) return player.notify("分解失败。");

    player.send("你将" + obj.color_name + "分解为" + item.unit_name(sum_count) + "。");


    WORLD.add_recover_obj(player, obj, 2, sum_count);

}
const default_prop = ["gj", 'fy', 'fy', 'fy', 'fy', null, null, null,
    'fy', 'fy', 'gj'];

this.fenjie2 = function (player, obj, isok) {

    // if (obj.path.startsWith('eq/cp')
    //     || obj.path.startsWith('eq/zb'))
    //     return player.notify('自制装备暂时不能分解。');
    let count;
    if (obj.grade >= 6) {
        count = 100;  // grade 6+ 固定100元晶
    } else {
        count = [1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 2, 3, 6][obj.level];
    }
    let props = obj.prop || {};
    let sts = [];
    let st_names = [];
    var duanzao = WORLD.COMMANDS.duanzao;
    if (duanzao && (obj.path.startsWith('eq/cp') || obj.path.startsWith('eq/zb'))) {
        for (var key in obj.temp) {
            let level = obj.temp[key];
            if (!level) continue;
            let prop = duanzao.PROPS[key];
            if (!prop) continue;
            let st = OBJ.CREATE('st/p#' + key, duanzao.sum_needs(prop, level));
            sts.push(st);
            st_names.push(st.unit_name());
        }
        // Return word stones on dismantle
        if (obj.words && obj.words.length > 0) {
            for (var k = 0; k < obj.words.length; k++) {
                let w = obj.words[k];
                let prop = duanzao.PROPS[w.key];
                if (!prop) continue;
                let st = OBJ.CREATE('st/p#' + w.key, 1);
                if (st) {
                    sts.push(st);
                    st_names.push(st.unit_name());
                }
            }
        }
        count += 8;
        count += obj.query_temp('sc', 0);
    } else if (duanzao && obj.grade < 6) {
        let active_props = duanzao.PROPS;
        const def_prop = duanzao.DEFAULT_PROPS[obj.eq_type];
        for (let prop in props) {
            if (!active_props[prop]) continue;
            if (def_prop && def_prop === prop) continue;
            let st = OBJ.CREATE('st/p#' + prop, obj.query_temp(prop, 1));
            sts.push(st);
            st_names.push(st.unit_name());
        }
    }


    if (!isok) {
        var msg = "是否确认分解" + obj.color_name + "？";
        if (obj.grade >= 6) {
            msg += "分解后可以获得：" + count + "个<hio>元晶</hio>";
        } else {
            msg += "精炼等级越高分解的元晶数量越多，当前等级分解后可以获得：" + count + "个<hio>元晶</hio>";
            if (st_names.length > 0) msg += "、" + st_names.join("、");
        }
        player.notify(msg);
        return player.send_commands("fenjie " + obj.id + " ok", "确认分解")
    }
    if (obj.st_prop && obj.st_prop.length > 0) {
        return player.notify(obj.color_name + "已经镶嵌宝石，清理宝石后才可以分解。");
    }
    obj = player.remove_obj(obj);
    if (!obj) return player.notify("你要分解什么装备?");

    let item = player.add_obj("st/yuanjing", count);
    if (!item) return player.notify("分解失败。");


    player.send("你将" + obj.color_name + "分解为" + item.unit_name(count) + "。");

    let rec_items = ['st/yuanjing', count];
    for (let st of sts) {
        player.add_obj(st);
        player.send("你获得" + st.unit_name() + "。");
        rec_items.push(st.path);
    }

    return WORLD.add_recover_obj(player, obj, 2, rec_items);
}

