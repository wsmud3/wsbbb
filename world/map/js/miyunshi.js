this.inherits(ROOM);
this.name = "密云室";
this.desc = "第十五间密室——密云不雨。室中气息压抑沉闷。「密云不雨，自我西郊——此掌之意在蓄势待发，引而不发，一发则必中。」";
this.exits = { "south": "js/shichengshi", "north": "js/sunzeshi" };
this.on_create = function() { this.set_npc("js/xianglong_shouwei", 1); };
