this.inherits(ROOM);
this.name = "以彼之道殿";
this.desc = "琅嬛福地中最特殊的殿堂。殿中有一面巨大的铜镜——镜中出现的不是你，而是一个与你一模一样的人影，使用你所有的技能。「以彼之道，还施彼身」——逍遥派的至高武学哲学。击败镜中的自己，方能通过。";
this.exits = { "south": "lhfd/piaomiaolang", "north": "lhfd/huanshibishen" };
this.on_create = function() { this.set_npc("lhfd/jingzhong_wo", 1); };
