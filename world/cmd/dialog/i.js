this.inherits(COMMAND);
this.command = "pack";
this.allow_busy = true;
this.allow_state = true;
this.allow_die = true;
this.allow_faint = true;
this.PAGE_SIZE = 50;
this.enter = function (me, arg) {
    // ZC backpack diagnostic
    var _zcItems = me.items || [];
    for (var _zci = 0; _zci < _zcItems.length; _zci++) {
        var _zcit = _zcItems[_zci];
        if (_zcit && _zcit.path && _zcit.path.indexOf("zc/blank_book") >= 0) {
            console.log("[PACK DEBUG] item[" + _zci + "]: name=" + _zcit.name + ", color_name=" + _zcit.color_name + ", id=" + _zcit.id + ", grade=" + _zcit.grade + ", zc_state=" + _zcit.zc_state + ", count=" + _zcit.count);
        }
    }
    var target = me;
    var page = 0;
    var paginate = false;
    if (arg) {
        if (arg == "none") return me.notify('{"type":"dialog","dialog":"pack","money":' + me.money + "}");

        // Check if arg is a page number
        var pageNum = parseInt(arg);
        if (!isNaN(pageNum) && pageNum >= 0) {
            page = pageNum;
            paginate = true;
            arg = null;
        }
    }
    if (arg) {
        target = me.find_obj(arg, me.environment);
        if (!target && me.user_level > 1) {
            target = WORLD.getUser(arg);
        }
        if (!target) {
            return me.notify("这里没有这个人。");
        }
        if (me.user_level < 4 && target.master != me.id)
            return me.notify("你只能查看自己的背包。");
    }
    var str = ['{"type":"dialog","dialog":"'];\n\nif (target != me) {\nstr.push('pack2",id:"');\nstr.push(target.id);\nstr.push('",name:"');\nstr.push(target.name);\nstr.push('",');
    } else {
        str.push('pack",');\n}\nstr.push('"items":[');\nvar allItems = target.items || [];\nvar totalItems = allItems.length;\nvar start = paginate ? page * this.PAGE_SIZE : 0;\nvar end = paginate ? Math.min(start + this.PAGE_SIZE, totalItems) : totalItems;\n\nvar idx = 0;\nif (allItems) {\nfor (var i = start; i < end; i++) {\nvar item = allItems[i];\nif (!item) continue;\nif (idx > 0) str.push(",");\nstr.push(item.format_to_pack());\nidx++;\n}\n}\nstr.push('],"money":');\nstr.push(target.money || 0);\nvar eqs = target.equipment;\nif (eqs) {\nstr.push(',eqs:[');\nfor (var i = 0; i < eqs.length; i++) {\nvar item = eqs[i];\nif (i > 0) str.push(",");\nif (item) {\nvar _ic2 = item.is_custom || (item.words && item.words.length > 0) || (item.path === "eq/cp");\nstr.push(`["${item.color_name}","${item.id}",${item.grade},${item.on_use ? 1 : 0},${item.is_locked ? 1 : 0},${_ic2 ? 1 : 0}]`);\n} else {\nstr.push("null");\n}\n}\nstr.push(']');\n}\nstr.push(",max_item_count:");\nstr.push(target.max_item_count);\nif (target === me) {\nstr.push(",eq_group:");\nstr.push(target.eq_group);\n}\n// Pagination metadata\nif (paginate && totalItems > this.PAGE_SIZE) {\nstr.push(',"page":');\nstr.push(page);\nstr.push(',"page_size":');\nstr.push(this.PAGE_SIZE);\nstr.push(',"total":');\nstr.push(totalItems);\nstr.push(',"total_pages":');\nstr.push(Math.ceil(totalItems / this.PAGE_SIZE));\n}\nstr.push('}');\nme.send(str.join(""));\n}\n