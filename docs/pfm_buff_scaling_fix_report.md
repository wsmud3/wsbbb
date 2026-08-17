# PFM Buff/Debuff 等级成长修复报告

## 修复标准

| 类型 | 时长公式 | 百分比公式 |
|---|---|---|
| **增益** (绿buff, `downside: false`) | `base + lv * 10` ms (100级+1秒) | `base + parseInt(lv / 100)` % (100级+1%) |
| **减益** (红buff, `downside: true`) | `base + lv * 5` ms (100级+0.5秒) | `base + parseInt(lv / 100)` % (100级+1%) |

> base = 原硬编码值 - lv=1000时的成长量  
> 硬编码值以1000级为目标设计值

## 修复统计

- **修复文件数**: 77
- **修复buff/debuff块数**: 95
- **修复的属性值**: ~150处百分比属性
- **修复的时长**: ~90处duration

---

## 详细修改列表

### dodge/ (轻功)

| 文件 | 技能 | buff/debuff | 修改内容 |
|---|---|---|---|
| [hengshenshenfa.js](../world/skill/dodge/hengshenshenfa.js) | 恒山身法 | 灵虚 (增益) | duration: 11000→1000+lv×10, ds_per: 20→10+lv/100, fy_per: 20→10+lv/100 |
| [shenxingbaibian.js](../world/skill/dodge/shenxingbaibian.js) | 神形百变 | 神行 (增益) | duration: 6000→lv×10, ds_per: 100→90+lv/100 |
| [tagexing.js](../world/skill/dodge/tagexing.js) | 踏歌行 | 踏歌行 (增益) | duration: 20000→10000+lv×10 |
| [xuanxubu.js](../world/skill/dodge/xuanxubu.js) | 玄虚步 | 幻影 (增益) | ds_per: 15→5+lv/100, diff_sh_per: 15→5+lv/100 |

### emei/ (峨眉)

| 文件 | 技能 | buff/debuff | 修改内容 |
|---|---|---|---|
| [huifengjian.js](../world/skill/emei/huifengjian.js) | 回风拂柳剑 | 灭剑 (减益) | duration: 10000→5000+lv×5 |
| [jiuyinbaiguzhao.js](../world/skill/emei/jiuyinbaiguzhao.js) | 九阴白骨爪 | 夺命 (减益) | duration: 8000→3000+lv×5, ds_per: -100→-(90+lv/100) |
| [jiuyinbaiguzhao2.js](../world/skill/emei/jiuyinbaiguzhao2.js) | 九阴白骨爪 | 夺魄 (减益) | duration: 8000→3000+lv×5 |
| [linjizhuang.js](../world/skill/emei/linjizhuang.js) | 临济十二庄 | 鹤翔庄 (增益) | duration: 2000→lv×10 |
| [linjizhuang2.js](../world/skill/emei/linjizhuang2.js) | 临济十二庄 | 鹤翔庄 (增益) | duration: 2000→lv×10 |
| [yitianjianfa.js](../world/skill/emei/yitianjianfa.js) | 倚天剑法 | 减益 | duration: 5000→lv×5, fy_per: -1→-lv×1/1000 |

### force/ (内功)

| 文件 | 技能 | buff/debuff | 修改内容 |
|---|---|---|---|
| [baiyunxinfa.js](../world/skill/force/baiyunxinfa.js) | 白云心法 | 白云 (增益) | duration: 30000→20000+lv×10, gj_per: 20→10+lv/100, fy_per: 20→10+lv/100 |
| [bulaochangchungong.js](../world/skill/force/bulaochangchungong.js) | 不老长春功 | 唯我独尊 (减益) | duration: 17000→12000+lv×5 |
| [busiyinfa.js](../world/skill/force/busiyinfa.js) | 不死印法 | 生死逆转 (增益) | duration: 8000→lv×10, gj_per: -40→-(30+lv/100) |
| [busiyinfa.js](../world/skill/force/busiyinfa.js) | 不死印法 | 幻魔身法 (增益) | duration: 10000→lv×10 |
| [changshengjue.js](../world/skill/force/changshengjue.js) | 长生诀 | 增益×2 | duration: 5000→lv×10 / 13000→3000+lv×10, diff_sh_per: 10000→9990+lv/100 |
| [cihangjiandian.js](../world/skill/force/cihangjiandian.js) | 慈航剑典 | 灵动/心有灵犀/剑心通明 (增益) | gjsd_per: 90→80+lv/100, releasetime_per: 100→90+lv/100, distime_per: 99→89+lv/100, duration均改为lv×10 |
| [dapintianxianjue.js](../world/skill/force/dapintianxianjue.js) | 大品天仙诀 | 天仙附体/金身不坏 (增益) | duration: 30000→20000+lv×10 ×2 |
| [hamagong.js](../world/skill/force/hamagong.js) | 蛤蟆功 | 蛤蟆吸气 (增益) | diff_sh_per: 25→15+lv/100 |
| [hanbingzhenqi.js](../world/skill/force/hanbingzhenqi.js) | 寒冰真气 | 寒冰 (增益) | duration: 20000→10000+lv×10 |
| [huagongdafa.js](../world/skill/force/huagongdafa.js) | 化功大法 | 化毒 (增益) / 化功 (减益) | duration: 6000→lv×10 / 15000→10000+lv×5, gj_per/mz_per: -20→-(10+lv/100) |
| [huntianqigong2.js](../world/skill/force/huntianqigong2.js) | 混元天罡 | 天罡 (增益) | duration: 35000→25000+lv×10, fy_per/gj_per: 20→10+lv/100 |
| [jiuyangshengong.js](../world/skill/force/jiuyangshengong.js) | 九阳神功 | 九阳护体 (增益) / 九阳真焰 (减益) | duration: 10000→lv×10 / 12000→7000+lv×5 |
| [jiuyinshengong.js](../world/skill/force/jiuyinshengong.js) | 九阴神功 | 劲气debuff×3 + 追魂 + 逆转九阴×5 | 全部duration和百分比按标准修改 |
| [kuihuashengong.js](../world/skill/force/kuihuashengong.js) | 葵花神功 | 鬼魅 (增益) | duration: 13000→3000+lv×10 |
| [kumushengong.js](../world/skill/force/kumushengong.js) | 枯木神功 | 枯木逢春 (增益) | duration: 30000→20000+lv×10 |
| [mingyugong.js](../world/skill/force/mingyugong.js) | 明玉功 | 明玉×5属性 + 太上忘情 | gj_per/fy_per/mz_per/ds_per/zj_per: 20→10+lv/100, duration: 30000→20000+lv×10 |
| [panshishengong.js](../world/skill/force/panshishengong.js) | 磐石神功 | 磐石决 (增益) | duration: 15000→5000+lv×10, fy_per: 100→90+lv/100 |
| [shenghuoshengong.js](../world/skill/force/shenghuoshengong.js) | 圣火神功 | 圣火护体 (增益) | duration: 20000→10000+lv×10, gj_per/fy_per: 20→10+lv/100 |
| [shenlongxinfa.js](../world/skill/force/shenlongxinfa.js) | 神龙心法 | 不死神龙 (增益) | duration: 20000→10000+lv×10 |
| [shenzhaojing.js](../world/skill/force/shenzhaojing.js) | 神照经 | 神照/拳经 (增益) | duration: 30000→20000+lv×10 / 15000→5000+lv×10 |
| [taijishengong2.js](../world/skill/force/taijishengong2.js) | 先天太极 | 真武除邪 (增益) | duration: 30000→20000+lv×10, zj_per: 32→22+lv/100 |
| [taixuangong.js](../world/skill/force/taixuangong.js) | 太玄功 | 白首太玄 (增益) | duration: 13000→3000+lv×10, add_sh_per: 8→lv×8/1000 |
| [tianmoce.js](../world/skill/force/tianmoce.js) | 天魔策 | 鬼影/拳罡 (增益) | duration: 7000→lv×10 / 10000→lv×10, add_sh_per: 8→lv×8/1000, diff_fy_per: 5→lv×5/1000 |
| [wunianchangong.js](../world/skill/force/wunianchangong.js) | 无念禅功 | 无念 (增益) / 闭口禅 (减益) | duration: 10000→lv×10 / 12000→7000+lv×5, diff_sh_per: 33→23+lv/100 |
| [xuehaimogong.js](../world/skill/force/xuehaimogong.js) | 血海魔功 | 血祭增益×5 + 血祭减益×5 | 全部5属性20→10+lv/100, 5属性-40→-(30+lv/100), duration调整 |
| [yijinjing2.js](../world/skill/force/yijinjing2.js) | 金刚不坏体 | 金刚罩 (增益) | duration: 10000→lv×10 |
| [yinyangjiuzhuan.js](../world/skill/force/yinyangjiuzhuan.js) | 阴阳九转 | 镇天地 (增益) | duration: 5000→lv×10 |
| [yunlongxinfa.js](../world/skill/force/yunlongxinfa.js) | 云龙心法 | 云龙决 (增益) | duration: 20000→10000+lv×10 |
| [yunvxinjing.js](../world/skill/force/yunvxinjing.js) | 玉女心经 | 玉女疗伤 (增益) | duration: 15000→5000+lv×10, fy_per: 20→10+lv/100, ds_per: 15→5+lv/100 |
| [zhanshentulu.js](../world/skill/force/zhanshentulu.js) | 战神图录 | 破碎九重天 (减益) | duration: 7000→2000+lv×5 |

### lvliu/ (绿柳山庄)

| 文件 | 技能 | buff/debuff | 修改内容 |
|---|---|---|---|
| [force.js](../world/skill/lvliu/force.js) | 绿柳心法 | 寒劲 (增益) | duration: 12000→2000+lv×10, gj_per: 30→20+lv/100, mz_per: 20→10+lv/100 |

### parry/ (招架)

| 文件 | 技能 | buff/debuff | 修改内容 |
|---|---|---|---|
| [qiankundanuoyi.js](../world/skill/parry/qiankundanuoyi.js) | 乾坤大挪移 | 乾坤之力 (增益) | duration: 5000→lv×10 |

### staff/ (杖法)

| 文件 | 技能 | buff/debuff | 修改内容 |
|---|---|---|---|
| [fumozhang.js](../world/skill/staff/fumozhang.js) | 伏魔杖 | 罗汉伏魔 (增益) | duration: 15000→5000+lv×10 |
| [shedaoqigong.js](../world/skill/staff/shedaoqigong.js) | 蛇岛奇功 | 唱仙法 (增益) | duration: 15000→5000+lv×10 |

### sunv/ (素女)

| 文件 | 技能 | buff/debuff | 修改内容 |
|---|---|---|---|
| [shenxiaojiumie.js](../world/skill/sunv/shenxiaojiumie.js) | 神霄九灭 | 阳雷荡邪秽 (增益) | duration: 15000→5000+lv×10 |
| [shenxiaojiumie2.js](../world/skill/sunv/shenxiaojiumie2.js) | 神霄九灭 | 阳雷荡邪秽 (增益) | duration: 15000→5000+lv×10 |
| [zidianjin.js](../world/skill/sunv/zidianjin.js) | 紫电劲 | 天打雷劈屠真龙 (增益) | duration: 15000→5000+lv×10 |
| [zidianjin2.js](../world/skill/sunv/zidianjin2.js) | 紫电七击 | 天打雷劈屠真龙 (增益) | duration: 15000→5000+lv×10 |

### sword/ (剑法)

| 文件 | 技能 | buff/debuff | 修改内容 |
|---|---|---|---|
| [duanjiajian.js](../world/skill/sword/duanjiajian.js) | 段家剑 | 一阳剑气 (增益) | duration: 10100→100+lv×10, gj_per: 40→30+lv/100 |
| [hengshanwushenjian.js](../world/skill/sword/hengshanwushenjian.js) | 衡山五神剑 | 五神赋 (增益) | duration: 20000→10000+lv×10 |
| [pixiejianfa.js](../world/skill/sword/pixiejianfa.js) | 辟邪剑法 | 刺目 (减益) | duration: 13000→8000+lv×5, mz_per/ds_per: -100→-(90+lv/100) |
| [qixianwuxingjian.js](../world/skill/sword/qixianwuxingjian.js) | 七弦无形剑 | 黄钟大吕 (减益) | duration: 10000→5000+lv×5, mz_per: -30→-(20+lv/100), ds_per: -20→-(10+lv/100) |
| [shenlongjian.js](../world/skill/sword/shenlongjian.js) | 神龙剑 | 神龙天降 (减益) | duration: 4000→lv×5 |
| [taishanjianfa.js](../world/skill/sword/taishanjianfa.js) | 泰山剑法 | 七星落长空 (减益) | duration: 10000→5000+lv×5, ds_per: -5→-lv×5/1000 |
| [xuantiejianfa.js](../world/skill/sword/xuantiejianfa.js) | 玄铁剑法 | 重剑无锋 (减益) | 6个属性全部-20→-(10+lv/100), duration: 10000→5000+lv×5 |

### unarmed/ (拳脚)

| 文件 | 技能 | buff/debuff | 修改内容 |
|---|---|---|---|
| [anranxiaohunzhang.js](../world/skill/unarmed/anranxiaohunzhang.js) | 黯然销魂掌 | 呆若木鸡 (减益) | duration: 10000→5000+lv×5, distime_per/releasetime_per: -60→-(50+lv/100) |
| [canhezhi.js](../world/skill/unarmed/canhezhi.js) | 参合指 | 减益×2 | duration: 15000→10000+lv×5 / 5000→lv×5 |
| [cuixinzhang2.js](../world/skill/unarmed/cuixinzhang2.js) | 摧心掌 | 摧心 (减益) | duration: 7000→2000+lv×5 |
| [dasongyangshenzhang.js](../world/skill/unarmed/dasongyangshenzhang.js) | 大嵩阳神掌 | 无影掌 (减益) | duration: 8000→3000+lv×5 |
| [douzhuanxingyi.js](../world/skill/unarmed/douzhuanxingyi.js) | 斗转星移 | 星移 (增益) | duration: 10000→lv×10, zj_per: 40→30+lv/100 |
| [huagumianzhang.js](../world/skill/unarmed/huagumianzhang.js) | 化骨绵掌 | 化骨 (减益) | duration: 20000→15000+lv×5 |
| [jinshezhang.js](../world/skill/unarmed/jinshezhang.js) | 金蛇游身掌 | 金龙升天 (减益) | duration: 8000→3000+lv×5 |
| [jueqingzhang.js](../world/skill/unarmed/jueqingzhang.js) | 绝情掌 | 迷魂 (减益) | duration: 11000→6000+lv×5 |
| [liumaishenjian.js](../world/skill/unarmed/liumaishenjian.js) | 六脉神剑 | 无形剑气/六脉纵横 (减益) | duration: 7000→2000+lv×5 / 10000→5000+lv×5 |
| [liuyunzhang.js](../world/skill/unarmed/liuyunzhang.js) | 流云掌 | 排山倒海 (增益) | duration: 10000→lv×10, gjsd_per: 20→10+lv/100 |
| [qianzhuwandushou.js](../world/skill/unarmed/qianzhuwandushou.js) | 千蛛万毒手 | 千蛛万毒 (减益) / 万蛊噬天 (增益) | duration: 3000→lv×5 / 20000→10000+lv×10 |
| [rulaishenzhang.js](../world/skill/unarmed/rulaishenzhang.js) | 如来神掌 | 灭魔 (减益) | duration: 3000→lv×5 |
| [tanzhishengong.js](../world/skill/unarmed/tanzhishengong.js) | 弹指神通 | 点穴 (减益) | duration: 10000→5000+lv×5 |
| [xuanmingshenzhang.js](../world/skill/unarmed/xuanmingshenzhang.js) | 玄冥神掌 | 寒毒入体 (减益) | duration: 8000→3000+lv×5, mz_per/gjsd_per/gj_per按标准修改 |
| [xuanmingshenzhang_m.js](../world/skill/unarmed/xuanmingshenzhang_m.js) | 玄冥神掌(怪) | 寒毒入体 (减益) | duration: 10000→5000+lv×5, mz_per/gjsd_per/gj_per按标准修改 |
| [yihuajiemu.js](../world/skill/unarmed/yihuajiemu.js) | 移花接木 | 移花 (减益) | duration: 15000→10000+lv×5, ds_per/zj_per: -13→-(3+lv/100) |
| [yiyangzhi.js](../world/skill/unarmed/yiyangzhi.js) | 一阳指 | 点穴 (减益) | duration: 10000→5000+lv×5 |
| [zhangzhongzhiguo.js](../world/skill/unarmed/zhangzhongzhiguo.js) | 掌中之国 | 增益/减益/增益×3 | duration和gj_per/mz_per全部按标准修改 |
| [zhenyanshouyin.js](../world/skill/unarmed/zhenyanshouyin.js) | 真言手印 | 不死法印 (增益) | duration: 8000→lv×10 |

### whip/ (鞭法)

| 文件 | 技能 | buff/debuff | 修改内容 |
|---|---|---|---|
| [qiufengfuchen.js](../world/skill/whip/qiufengfuchen.js) | 秋风拂尘 | 缠字诀 (减益) | duration: 10000→5000+lv×5 |
| [wudugoufa.js](../world/skill/whip/wudugoufa.js) | 五毒钩法 | 减益 | duration: 3000→lv×5 |
| [yunlongbian.js](../world/skill/whip/yunlongbian.js) | 云龙鞭法 | 缠字诀 (减益) | duration: 10000→5000+lv×5 |

---

## 换算公式说明

### 增益 (绿buff)
```
duration: base_ms + parseInt(lv * 10)     // 每100级+1秒
prop:     base_pct + parseInt(lv / 100)    // 每100级+1%
```

### 减益 (红buff)  
```
duration: base_ms + parseInt(lv * 5)      // 每100级+0.5秒
prop:     base_pct + parseInt(lv / 100)    // 每100级+1%
```

### 示例
- 原 `duration: 10000` (增益, 1000级=10s) → `parseInt(lv * 10)` (lv=0→0s, lv=500→5s, lv=1000→10s)
- 原 `gj_per: 40` (增益, 1000级=40%) → `30 + parseInt(lv / 100)` (lv=0→30%, lv=500→35%, lv=1000→40%)
- 原 `duration: 8000` (减益, 1000级=8s) → `3000 + parseInt(lv * 5)` (lv=0→3s, lv=500→5.5s, lv=1000→8s)
- 原 `mz_per: -25` (减益, 1000级=-25%) → `-(15 + parseInt(lv / 100))` (lv=0→-15%, lv=500→-20%, lv=1000→-25%)
