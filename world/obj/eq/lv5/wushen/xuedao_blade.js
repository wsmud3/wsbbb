this.inherits(EQUIPMENT);
this.set({
				grade: 5,
				name: "血刀",
				desc: "血刀老祖的武器，刀身暗红，犹有血迹！\n特效：命中后触发「血祭」，10秒内命中+10%",
				unit: "把",
				eq_type: EQUIP_TYPE.BLADE,
				hole_count: 4,
				prop: {
								gj: 430,
								str: 65,
								mz: 400,
								add_sh_per: 5,
				},
});

this.do_attack = function (me, target, par) {
				me.add_status({
								id: "xuedao_xueji",
								name: "血祭",
								duration: 10000,
								override: 2,
								prop: { mz_per: 10 },
								start_msg: "<hir>$N的鲜血溅上血刀，刀身暗红光芒大盛，一股血煞之力涌入体内！</hir>",
								finish_msg: "$N身上的血祭之力渐渐消退。",
				});
				return 0;
};
