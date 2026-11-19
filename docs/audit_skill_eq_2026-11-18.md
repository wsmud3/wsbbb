# 技能 / 装备「效果与说明不符、效果无效」审计（2026-11-18）

范围：world/skill/**（243 个技能文件）、world/obj/eq/**（410 个装备文件）、world/obj/drug/**；另统计没有获得途径的技能。
方法：静态审读。凡写「没人读取」都 grep 全仓确认过，凡写「引擎不调用」都对照过引擎代码。标 ★ 的已人工复核代码；未标注的为审计结论，修之前仍需逐条再看一遍。全部**未修改**。

## 判断依据（引擎事实）

- skill 文件以非严格模式加载（os/base.js:317）：读未定义变量抛 ReferenceError，给未声明变量赋值会变成全局变量。
- 技能钩子按技能位调用：
  - on_damage / on_force_over / on_force_parry 只在内功位调用；
  - on_parry_over / on_parry / on_parry_pfm 只在招架位调用；
  - on_dodge / on_dodge_over 只在轻功位调用；而且 on_dodge 只在**没闪开**时调用（world/extends/char/combat.js:130-133）。
  - on_end_fight 引擎从不调用。
- 装备钩子：
  - do_attack 只在武器槽调用，且在暴击判定之前；
  - on_defense 只在衣服槽（equipment[1]）调用；
  - 空手类武器的 do_attack 只在绝招带 no_weapon 时触发，普攻不触发。
- query_status(id) 返回层数，是数字，不是状态对象。
- 带 on_interval 的状态：duration 是每跳的间隔，count 依次为 1、2、3…（不是总跳数）。
- 符号约定：distime_per 正值表示**缩短**冷却；expend_mp_per 正值表示**减少**内力消耗；gjsd_per 正值表示更快。
- NPC 的 gj/fy/mz/ds/zj 大于 0 后不再重算，所以 gj_per / fy_per 这类减益对 NPC 无效。
- 状态（status）不存档，temp 会存档。用不带过期时间的 temp 去镜像 buff，下线后就会留下永久残留。
- use.js 只有 on_use 返回 false 才不扣冷却，`return me.notify(...)` 返回 undefined，照样扣冷却。

---

## P0：崩服 / 刷资源 / 永久数值膨胀（建议立即修）

| 位置 | 名称 | 问题 |
|---|---|---|
| ★ world/obj/eq/lv5/wushen/yitian_sword.js:21 | 倚天剑 | `me.query("gj")`：角色没有 query 方法。每次命中有 5% 概率抛 TypeError；auto_attack 只有 try/finally，异常从定时器逃出，触发 uncaughtException，**整个服务器退出** |
| ★ world/obj/eq/lv5/wushen/xiedisheli.js:19-21 | 邪帝舍利 | 先发 50~80 万经验、30~50 万潜能，再调用不存在的 `this.remove_obj`，抛错前奖励已经发出；物品不消耗、也没有冷却，可以**无限刷** |
| world/obj/eq/lv2~lv5/xiaoyao/*、自制装备的 max_mp 词条 | 逍遥套等 | add_prop("max_mp") 直接改 this.max_mp，max_mp 原样存档，登录时 init 又把装备加一遍。结果是**每登录一次最大内力永久 +N**（高度疑似，未实测） |
| world/obj/eq/lv6/modao.js:47 | 魔刀 | 入邪期间下线，不带过期时间的 temp 留了下来，「每次攻击回 2% 内力」变成永久效果 |
| world/obj/eq/lv6/wushen/taiji_cloth.js:27 | 先天太极图 | temp 靠 setTimeout 清除，8 秒内下线后永远提示「已在庇护之下」，**永久无法使用** |

## P1：效果整体失效或写反

### 技能

| 位置 | 名称 | 问题 |
|---|---|---|
| ★ unarmed/yihuajiemu.js:35-43 | 移花接木 | on_parry_pfm 在没有 yihua_block 时返回 undefined，引擎走 else 分支，不执行 pfm.use。结果是招架装移花接木的人**对所有绝招永久免疫** |
| ★ force/changshengjue.js:79,82 | 长生诀·不灭 | on_damage 里用了未定义的 lv：先设好 10 分钟 CD、回 50% 血，然后抛错，不灭状态挂不上，damage 流程中断 |
| ★ force/cihangjiandian.js:64 | 慈航剑典·灵动 | 未定义的 lv，每次进入战斗都抛错，后面的 on_beginfight 也跟着不执行 |
| ★ unarmed/canhezhi.js:47 | 参合指 | 未定义的 lv，每次命中都抛错，层数永远为 0，参合之殇失效 |
| ★ emei/yitianjianfa.js:50,52 | 倚天剑法·伏魔 | 未定义的 lv，伏魔永远叠不上，「号令天下」也只按 1 层算 |
| ★ dodge/shaolinshenfa2.js:41 | 少林身法(高阶) | on_dodge_over 里用了未定义的 lv，每次被打中都抛错，打断攻击方后续的钩子 |
| ★ sunv/zidianjin.js:84-91、zidianjin2.js:121-128 | 麻痹 | 给敌人加的是正值 gjsd_per / distime_per / releasetime_per，**让敌人变快**，写反了 |
| sword/xiaowuxianggong2.js:116,184；xiaoyao/xiaowuxiang.js:124,191 | 小无相功 | 改写的是所有玩家共用的 pfm 对象的冷却，任何一人使用都会影响全服 |
| blade/xiuluodao.js:81,125 | 修罗刀 | `status.count` 是在数字上取属性，层数恒为 1 |
| shashou/tushendafa.js:53 | 屠神大法·七杀 | 在 par 上设了 add_bjsh_per，覆盖掉角色自身的暴伤加成 |
| unarmed/rulaishenzhang.js:83-93 | 如来神掌·灭魔 | 说明写「昏迷」，代码只加了 busy:999999 属性，结果是目标给别人上的忙乱 +999 秒 |
| dodge/xuanxubu.js:34-50 | 玄虚步 | 每次被打中都无冷却反击；双方都装时可能互相递归（待实测） |
| sword/tangshijianfa.js:39、dodge/sixiangbu.js:36 | 进阶槽 | slot 缺 query_needs，lingwu 时抛 TypeError |
| force/jiuyangshengong.js:14、yinyangjiuzhuan.js:27 | 九阳 / 九烛反震 | 没有防递归保护，双方互相反震时可能递归（待确认） |
| ★ unarmed/qianzhuwandushou.js:97 | 万蛊噬天 | reflect_sh 没有任何地方读取 |
| ★ force/shenzhaojing.js:69,75 | 神照经·拳经 | absorb_sh 没人读；「冷却减少」没写代码 |
| ★ force/hanbingzhenqi.js:36,41 | 寒冰真气·寒冰 | add_sh 战斗中没人读，减速没写代码，**整招无效** |
| ★ sunv/shenxiaojiumie.js:96、*2.js:106 | 神霄九灭·阳雷 | 写在 on_force_over 里，但技能只能装在杖法位，永远不调用 |
| ★ unarmed/douzhuanxingyi.js:40-48 | 斗转星移·星移 | 写在 on_parry_over 里，但技能只能装在拳脚位，永远不调用 |
| ★ sword/songfengjianfa.js:51 | 松月无影 | sk_songfeng 从来没被设置过，层数恒为 0 |
| ★ force/wunianchangong.js:70 | 无念 | wunian_active 没人读，附加伤害无效 |
| force/tianmoce.js:176-198 | 天魔策·拳罡 | 写在 par.on_attack，引擎从不读这个字段 |
| force/nixianmojue.js:182-198 | 逆仙魔诀·镇压 | seal_all_pfm 引擎不消费 |
| force/huagongdafa.js:35、xuehaimogong.js:38,54 | 化毒、血祭 | 说明里的效果没写代码 |
| ★ wudang/taijijian.js:61,88 | 太极剑法 | 被动忙乱没实现；绕字诀把 is_busy 放进了 prop，无效 |
| blade/ranmudao2.js:57 | 护体真焰 | 设置的 temp 只有 ranmudao（一阶）会读 |
| parry/qiankundanuoyi.js:50 | 乾坤大挪移 | qkdny_stacks 没人读；说明写「成功积 2 层、持续 5 秒」，代码实际不符 |
| ★ baguaquan.js:56-70、qiufengfuchen.js:71-85 | 八卦拳 / 秋风拂尘进阶 | 进阶槽属性没人读 |
| ★ knowage/lianyao.js | 炼药术 | lianyao1 / ly_wd / ly_ks 没人读 |
| dapintianxianjue.js:100、shandianwulianbian.js:175 | 战斗结束清理 | on_end_fight 引擎从不调用 |

### 装备 / 丹药

| 位置 | 名称 | 问题 |
|---|---|---|
| ★ lv6/wushen/xuanji_necklace.js | 璇玑 | **本次已修**：改为致命一击时自动触发 |
| ★ lv6/wushen/yinghuo_blade.js:35,47 | 荧惑 | 和璇玑同一种笔误：temp 名是 `"\nwushen_yinghuo"`，读不到，特效从不触发；冷却 60 秒照扣 |
| lv6/wushen/dihou_axe.js:22 | 地候 | 读的是 par.is_cirt，引擎用的是 iscirt，而且 do_attack 在暴击判定之前调用 |
| lv6/wushen/changgeng_glove.js:21 | 长庚 | 拳套的普攻不触发 do_attack |
| lv6/wushen/chiyouzhixue.js:12、zhanshenjia.js:13 | 蚩尤之血、战神甲 | 写成了 `hp`，应该是 max_hp，完全无效 |
| lv6/wushen/shennong_jewels.js、lv5/wushen/yaowang_jewels.js | 神农百草经、药王神篇 | caiyao1 不影响掉落 |
| lv6/wushen/yishan_pick.js:13 | 移山镐 | kuang1 不影响掉落；说明里的「自家后院」也受观山诀限制 |
| lv4/shenmuwangding.js:11 | 神木王鼎 | lianyao 命令是空函数 |
| lv5/wushen/ 下 7 件 | 冰玉簪、练功服等 | practice_per / meditate_per 没人读（有效的 key 是 lianxi_per / dazuo_per） |
| lv3~5/sunv/head.js | 素女头冠 | lim_mp_per 没人读 |
| lv5/emei/wrist.js:10 | 曙光护腕 | bj_per2 没人读 |
| world/cmd/obj/duanzao.js:34,37,42 | 锻造词条 | ignore_busy_per / bj_resist_per / debuff_resist_per 没人读（有效的是 diff_busy_per / diff_bj_per / diff_downside_per） |
| lv2/lm_*.js | 龙纹套 | group_prop 用 `==` 判断，4 件、6 件都拿不到加成 |
| lv6/wushen/pangu_axe.js:35、taiyin_throw.js:35 | 盘古斧、太阴 | distime_per 正负号写反，**缩短**了敌人冷却 |

## P2：与说明不符（数值或机制）

### 技能

- **数值或公式不对**：
  - 长生诀·震慑：说明降伤害，代码降攻击，而且会被驱散。
  - 明玉功、五毒钩法、千蛛万毒手、毒蛇：DoT 伤害按 count 逐跳递增，间隔也不对。
  - 九阴神功：被动在 1000 级以下为 0。
  - 六阳掌、生死符：系数和持续时间与说明不符。
  - 破玉拳：破玉、劈石的数值与说明不符。
  - 回马枪：命中加成系数不对。
  - 惊雷爆五岳、天打五雷轰：不判断是否命中。
  - 罗汉伏魔：最多叠 10 层，不是说明的 5 层。
  - 吼仙法：伤害随层数平方增长。
  - 剑气、绵里藏针、云龙三现、万岳朝宗、震字诀：倍率与说明不符。
  - 罗汉伏虎：说明显示的倍率偏高。
  - 乱拳：150 被当成百分比，等于完全无视防御和免伤。
  - 六脉纵横：溅射算了两次。
  - 玄冥神掌：内力消耗与说明不符。
  - 掌中之国：被动的层数和持续时间与说明不符。
  - 游龙庄：后面的人回血越来越少。
  - 参合之殇：「重置层数」只去掉 1 层。
- **效果没写代码**：
  - 狂风二十一式的攻速；
  - 九阴白骨爪·夺命的昏迷；
  - 金蛇狂舞、寸劲、七伤；
  - 三阴毒爪、追魂爪；
  - 斗转、左右互搏（使用对方或自己的绝招）；
  - 重剑无锋、呆若木鸡的降攻速（用错了属性）；
  - 十步杀一人；
  - 夺命连环（高阶版的续发）；
  - 万佛朝宗（基本不触发）；
  - 容貌比较只看基础容貌。
- **写「命中后」但不判断命中**：九阳真焰、定影、刺目、残缺、无中生有；燃木刀被招架时伤害反而翻倍。
- **说明写死秒数，实际随等级变化**：不死印法、大品天仙诀、云龙心法、阴阳九转·镇天地、无念禅功·闭口禅（还会封禁全部绝招），以及修罗刀、六脉神剑、掌中之国、真言手印、金蛇游身掌、金蛇游身步、五毒烟萝步、素女心经、九阴白骨爪(高阶)。
- **其他**：
  - 不死印法：「闪避成功反击」实际是被打中时反击。
  - 不老长春功：被动对玩家为 0；release_time 是没人读的 key。
  - 枯木神功、葵花神功：「清除负面状态」只去 1 层。

### 装备

- 朱雀骨环：要求目标剩余血量 ≤82% 才能放，永远不会斩杀。
- 魔刀：额外带了 30 分钟免控，冷却 5 分钟，说明里没写。
- 鹰刀：不是概率触发，冷却一好下一次命中必定昏迷。
- 轩辕剑、长庚：叠满后不刷新持续时间，整层一起消失。
- 女娲石：可以复活任何死亡玩家，没有副本和擂台的限制，没有可复活目标时也扣冷却。
- 峨眉 lv4 套（hp_per 50）、少林 lv5 套（max_hp 100）：数值疑似笔误。
- 门派套装（约 148 个文件）：
  - 穿满 5 件时三件档的属性丢失，说明里却两档都高亮。
  - 6 个门派的 lv4、lv5 套共用一个 group_name，混搭不同门派也能凑件数。
- 钓鱼竿、钓棍：不能钓鱼。
- 锦斓袈裟：说明里的 77000 是 +12 精炼后的值。
- 周年庆微章：下线或死亡就会消失。
- 神力丸、飞燕丹：共用同一个 status id，「风行丹」被覆盖掉了。
- 聚气丹、熊胆：可以超过内力上限。
- 多件 lv6 神器：失败分支照样扣冷却。
- 覆雨剑：伤害不走暴击。

## 待实测的风险

- 一星混元、玄虚步：双方都装时互相反击，可能无限递归。
- 天地棋盘：直接 `hp=0; die()`，会绕过免死，比试里可能真把人杀死。
- 北冥神功：直接改 max_mp，可能留下永久残留。
- 摧心掌(高阶)：被驱散时也会让目标立刻昏迷。
- 大品天仙诀：天仙之力在战斗结束后还会保留约 86 秒。
- 擒龙手·锁龙：公式笔误。
- 绿柳剑法、降龙掌：手写的控制标记绕过了免控和减免。

---

## 没有获得途径的技能

获得途径包括：拜师学习、带 on_teach 的公共 NPC、追随者、秘籍 / 残页、副本掉落、绿柳令、襄阳任务、净念禅宗剧情、门派进阶（xxx2，链条完整），以及全局随机残页池（武道塔每日奖励、守护者、唐楠商品，会包含所有无门派战斗技能）。

| 技能 | 分类 |
|---|---|
| ★ tushendafa 屠神大法（杀手楼 6 品） | **只能 GM 发放**：除了自己的文件，没有任何引用 |
| bite 基本咬技、bite2 野兽扑咬、dushegongji 毒蛇攻击 | 只有 NPC 使用 |

**需要确认**：
- 只能靠随机残页池获得的 6 品技能：阴阳九转、战神图录、疾风剑法、掌中之国。
- 同样只在池子里的低品技能：唐诗剑法、火龙拳、金蛇游身掌、无常杖、《论语》。
- NPC 专用技能漏进了随机池：xuanmingshenzhang_m、lvliu_*。
- 衡山身法的门派写成了不存在的 HENGSHAN。
- 祝伴仙的福利正式服也能领（全套武神装备 + 100 万黄金 + 10 本 6 品秘籍）。
- 武馆教习能教 7 门 6 品技能，与它的说明不符。
