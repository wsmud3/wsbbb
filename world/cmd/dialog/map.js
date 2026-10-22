this.inherits(COMMAND);
this.command = "map";
this.allow_busy = true;
this.allow_state = true;
this.allow_die = true;
this.map_json;
this.buffer = {};
var world_map = null;
this.enter = function (me, area) {
    //if (!area) {
    //    if (!this.map_json) this.map_json = getAllMaps(me);

    //    return me.send(this.map_json);
    //}
    if (!area || area == "here") {
        if (!me.environment) return;
        var str = me.environment.path;
        area = str.substr(0, str.lastIndexOf("/"));
    }
    var path = area + "/"
    if (this.buffer[area]) return me.send(this.buffer[area]);
    var area_obj = null;
    for (var i = 0; i < WORLD.AREAS.length; i++) {
        if (path == WORLD.AREAS[i].room_path) {
            area_obj = WORLD.AREAS[i];
            break;
        }
    }
    if (!area_obj) return;
    if (area_obj.render_map) return area_obj.render_map(me);
    this.buffer[area] = this.createMapJson(area_obj, area);
    me.send(this.buffer[area]);
}
this.clearCache = function () {
    this.buffer = {};
}
this.update_map = function (id, rm, pos) {
    this.buffer[id] = null;
    if (!rm) {
        var area_obj;
        for (var i = 0; i < WORLD.AREAS.length; i++) {
            if (path == WORLD.AREAS[i].room_path) {
                area_obj = WORLD.AREAS[i];
                break;
            }
        }
        return;
    }

    var str = "{type:'updatemap',map:'" + id + "',id:'" + rm.path + "',n:'" + rm.name + "'";
    if (pos) str += ",pos:[" + pos.join() + "]}";
    else str += "}";
    for (var i = 0; i < rm.items.length; i++) {
        if (rm.items[i].is_player)
            rm.items[i].send(str);
    }
}
this.createMapJson = function (area_obj, area) {
    if (!area_obj) return '{type:"map",maps:[]}';
    var obj = {};
    obj.type = "map";
    obj.path = area;
    obj.map = filterMap(area_obj.map);
    return JSON.stringify(obj);
}
/**
 * 只把「真实存在、且坐标合法」的房间下发给客户端。
 *
 * 副本 this.map 是美术数据，历史上被重建脚本改过多次，难免残留
 * 已被删除 / 改名的房间条目；照原样下发，小地图上就会画出根本走不进去的房间。
 * 数据层由 tools/check_map_layout.js 负责校验修干净，这里做运行期兜底：
 * 客户端拿到的每个矩形，一定对应一个能 ROOM.Get 到的房间。
 */
function filterMap(map) {
    if (!map || !map.length) return [];
    var out = [];
    for (var i = 0; i < map.length; i++) {
        var e = map[i];
        if (!e || typeof e.id !== "string" || !e.id) continue;
        if (!Array.isArray(e.p) || e.p.length < 2) continue;
        if (!isFinite(e.p[0]) || !isFinite(e.p[1])) continue;
        if (!ROOM.Get(e.id)) continue;
        var room = {};
        room.n = e.n;
        room.id = e.id;
        room.p = [Math.round(e.p[0]), Math.round(e.p[1])];
        room.exits = Array.isArray(e.exits) ? e.exits : [];
        out.push(room);
    }
    return out;
}
function getAreaByPath(areas, path) {
    if (!areas) return;
    for (var i = 0; i < areas.length; i++) {
        if (areas[i].path == path) return areas[i];
    }
}
