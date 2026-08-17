this.inherits(ROOM);
this.name = "赌场"
this.desc = "赌桌围着黑压压的赌徒，吆喝声、惊叹声、欢呼声、咒骂声、哄笑声和噼哩啪啦的声响使你的耳朵几乎无法忍受，赌桌旁的墙上贴有一张<cmd cmd='look paper'>纸</cmd>。";
this.exits = { "east": "yz/nandajie1", };
this.set_npc('pub/baodi');
this.no_fight = true;
this.set_item("paper", "说明", "小赌怡情，大赌伤身.....");


this.master = this.items[0];
this.stores = new Map();
this.on_leave = function (me) {
    if (me == this.master) {
        this.master = null;
        me.send_room("由于" + me.name + "离开房间，本局作废。");
        this.stores.clear();
        if (this.rolle_handler) clearTimeout(this.rolle_handler);
        this.rolle_handler = null;
    }
}

this.add_action("roll", "掷骰子", function (me,par) {
 
    if (!par) {
        if (!this.master) {
            me.notify("<red>这里还没庄家，你要试着当庄家吗？</red>");
            return me.send_commands("roll ok", '我要当庄家');
        }
        if (this.master == me) {
            if (this.rolle_handler) return me.notify("你已经掷好了，等大家下注。");
            par = "start";
        } else {
            if (this.rolle_handler) return me.notify("庄家已经掷骰子了，快下注吧。");

            var npc = this.items[0];
            if (npc) {
                npc.do_command('roll','start');
            }
            return;
        }
    }

    if (par == "ok") {
        if (this.master) {
            return me.notify("<red>这里已经有庄家了，等他摇骰子吧。</red>");
        }
        this.master = me;
        me.send_room("<hig>$N现在是这里的庄家。</hig>");
        return me.send_commands("roll start", '掷骰子');
    }
    if (par == "start") {
        if (me != this.master) {
            return me.notify("你还是等庄家先出吧。");
        }
        if (this.rolle_handler) return me.notify("你已经摇好了，等大家下注。");
       
        me.send_room("<mag>$N拿出一个骰盅，双手随意挥舞着，看上去颇有几分气势。</mag>\n<hic>$P“啪”的一声把骰盅扣在桌子上喊道：下注啦！</hic>");
        this.rolle_handler = this.call_out(this.roll_over1, 10000);
       return me.send_message('{type:\"cmds\",items:[{cmd:"roll b",name:"押大"},{cmd:"roll s",name:"押小"}]}');\n} else if (par == "b" || par == "s") {\nif (!this.master) return me.notify("现在没有庄家。");\nif (me == this.master) {\nreturn me.notify("你是庄家压什么注。");\n}\nif (!this.rolle_handler) return me.notify("庄家还没掷骰子，别着急。");\nif (!(me.money > 1)) return me.notify(this.master.name + "瞪了你一眼：穷鬼，一边去。");\nvar val = this.stores.get(me.id);\nif (val) return me.notify(this.master.name+"对你喊道：买定离手……");\nvar name = par == "b" ? "大" : "小";\nme.send_room(["$N沉吟半响，拿出一个铜板沉声说道：我压" + name + "!", "$N拿着一个铜板喊道：都别动，"+me.callme()+"压" + name + "。",\n"$N一声不吭拿出一个铜板放到【" + name + "】上面。"].random());\nthis.stores.set(me.id, par == "b" ? 2 : 1);\n} else if (par == "over") {\nif (this.rolle_handler) me.notify("你需要等这局结束才可以。");\nthis.master.send_room("<hic>$N不当庄家了，你可以点击掷骰子来当庄家。</hic>");\nthis.master = null;\n\n}\n\n});\nthis.roll_over1 = function () {\nthis.master.send_room("$N高声喊道：来吧……赌一赌，闯王变盘古！搏一搏，云龙变成长生决！");\nthis.rolle_handler = this.call_out(this.roll_over, 10000);\n}\nthis.roll_over = function () {\nthis.rolle_handler = null;\nif (!this.master) return;\nif (!this.stores.size) {\nthis.master.notify("没有人下注，要不要再来一局。");\nreturn this.master.send_commands("roll start", '掷骰子');\n}\nvar num1 = this.random(6) + 1;\nvar num2 = this.random(6) + 1;\nvar num3 = this.random(6) + 1;\nvar name = num1 + num2 + num3 > 9 ? "大" : "小";\nvar res = num1 + num2 + num3 > 9 ? 2 : 1;\nthis.master.send_room("<hir>$N一把掀开骰盅喊道：买定离手啦，开……" + num1 + "," + num2 + "," + num3 + "……" + name + "！！！</hir>");\nfor (var i = 0; i < this.items.length; i++) {\nif (this.items[i].hp && this.items[i]!=this.master) {\nvar val = this.stores.get(this.items[i].id);\nif (val) {\nif (val == res) {\nthis.items[i].notify("<hig>恭喜你赢了一个铜板。</hig>");\n} else {\nthis.items[i].notify("<red>这局你输了一个铜板。</red>");\n}\n}\n}\n}\nthis.stores.clear();\nif (this.master.is_player)\nthis.master.send_commands("roll start","再来一局","roll over","不当庄家了");\n\n}\nthis.add_action("say", "", function (me,par) {\nWORLD.COMMANDS['say'].enter(me,par);\n\nif (par === '我要回档') {\nfor (let item of this.items) {\nif (item.query_temp('admin') || item.query_temp('wiz')) {\nitem.send_commands('rbok '+me.id,'同意【' + me.name + '】回档');\n}\n}\n// WORLD.COMMANDS['reback'].enter(me);\n}\n\nreturn true;\n\n});\nthis.add_action("rbok", "", function (me, par) {\nif (!par) return;\nlet item = this.find_obj(par, this);\nif (item) {\nitem.do_command('reback');\nme.send(item.name + "开始回档选项。");\n} else {\nme.send( "房间没这个人。");\n}\nreturn true;\n\n});