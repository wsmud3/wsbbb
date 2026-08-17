this.inherits(ROOM);
this.name = "大厅";
this.desc = `恒山派大厅宽敞明亮，正中悬挂着一幅达摩祖师的画像。画像两侧是一副对联："一花一世界，一叶一菩提"。厅中蒲团整齐排列，供弟子们打坐参禅。阳光透过窗棂洒在地面上，形成斑驳的光影。整座大厅弥漫着宁静祥和的氛围，让人心神安宁。北面是前厅，南面通向后殿。`;
this.exits = { "north": "hs/qianting", "south": "hs/houdian" };
this.set_npc(["hs/dingjing", 1], ["hs/dingxian", 1], ["hs/dingyi", 1]);
