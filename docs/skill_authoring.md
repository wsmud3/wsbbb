# 技能 / 绝招编写规范

新增或修改技能前请先读这一页。下面每条规则都踩过坑。

## 1. 绝招效果必须写在绝招自身（自包含）

自创武学融合绝招时，只会拷贝 `pfm` 对象，见 `world/cmd/skill/zc.js` 的 `create_or_update_skill`。原技能的技能级钩子不会跟着过去，比如 `this.on_attack_over`、`this.on_force_parry`、`this.on_damage`、`this.on_parry_over`、`this.do_force_attack`。

所以，凡是绝招说明里写的效果，必须写在下面两处之一：

- `pfm.use` 里；
- 或者 `pfm.use` 挂上的**状态对象**的回调里。

引擎会在对应的技能钩子之后调用这些状态回调，第一个参数是状态的主人：

| 状态回调 | 时机 | 返回值 |
|---|---|---|
| `on_before_attack(me, target, par)` | 发起攻击前 | — |
| `on_attack_over(me, target, par, sh)` / `on_force_over(...)` | 攻击结算后（追加攻击 `no_append` 时不触发） | — |
| `do_force_attack(me, target, par)` | 内力附加攻击 | 附加的伤害 |
| `on_force_parry(me, from, sh, par)` | 内力卸力 | 化解的伤害量 |
| `on_damage(me, from, sh, ctx)` | 受到伤害时 | 调整后的伤害 |
| `on_be_hit(me, attacker, par, sh)` | 被命中且受伤后 | — |
| `on_parry_success(me, attacker, par, parried)` | 招架成功后 | — |
| `on_dodge_success(me, attacker, par)` | 闪避成功后 | — |

实现见 `world/extends/char/combat.js` 里的 `status_hooks` 和 `fire_status_hook`。

**不要这样写：**

- 绝招只打一个 temp 或状态标记，再由技能级钩子读取这个标记来实现效果；
- 在绝招或它的回调里用 `me.query_skill("本技能id")` 取等级。融合后这个等级是 0，或者是另一个技能的等级。数值一律用 `use` 传入的 `lv`，回调里用闭包捕获；
- 在绝招里检查「本技能是否装备在某部位」。融合后它装在自创技能上，检查永远不通过。

**什么才是被动：** 只有写在技能面板（`query_enable_prop` 的 `desc`）里的效果。被动写在技能级钩子里是正确的，它本来就不随绝招走。

## 2. 玩家可见的说明只写当前数值

技能说明、绝招说明只显示按当前等级算出的实际数值，不写「每 100 级 +1%」「上限 X」这类公式。公式写在代码注释里。

## 3. 战斗提示不写属性数值

战斗中的招式描写、状态开始和结束提示，不写属性加成、层数、回血回内的数值，比如「伤害+24%」「叠加至3层」「回复X点气血」，也不写「清除所有负面状态」这类系统术语。这些信息放在状态的 `desc` 里。

伤害数字与普通攻击的「造成 X 点伤害」一致，可以保留。

## 4. 批量移除状态后要重算控制标志

自己写批量移除状态的逻辑时，删完后调用 `_recalc_ctrl_flags()`。否则忙乱、昏迷等标志会残留到战斗结束。
