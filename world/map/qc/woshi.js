this.inherits(ROOM);
this.name = "卧室";
this.desc = "一间简朴而整洁的道家卧室。一张木床靠在墙边，被褥叠得整整齐齐。窗前一张书案，案上摆放着文房四宝和几卷道家典籍。墙上挂着一幅太极图，黑白分明，阴阳相生。一只小铜炉中焚着静心香，淡淡的香气让人心绪宁静。窗外山色空蒙，云雾缭绕，好一处修行之所。北面是花园。";
this.exits = { "north": "qc/huayuan" };
this.set_npc(["qc/yucanghai", 1]);
