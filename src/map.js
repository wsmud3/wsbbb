

export default {
    DIRS: ["w", "n", "s", "e", "nw", "sw", "ne", "se",
        "west", "north", "south", "east", "northwest", "southwest", "northeast", "southeast",
        "d", "u", "down", "up",
        "wd", "nd", "sd", "ed", "wu", "nu", "su", "eu",
        "westdown", "northdown", "southdown", "eastdown", "westup", "northup", "southup", "eastup",
        "enter", "out", "s1d", "n1d", "e1d", "w1d"],
    DIR_REG: /^([a-z]{1,2}?)(\d*)([dl]?)$/,
    // Map long direction names to short for internal parsing
    LONG_TO_SHORT: { west:"w", east:"e", north:"n", south:"s", northwest:"nw", northeast:"ne", southwest:"sw", southeast:"se",
        up:"u", down:"d", westdown:"wd", eastdown:"ed", northdown:"nd", southdown:"sd",
        westup:"wu", eastup:"eu", northup:"nu", southup:"su", enter:"enter", out:"out" },
    REG: /<(\w+)>(.+)<\/\w+>/,
    // Helper: extract base direction from a short direction code, handling "enter"/"out" specially
    parseDir: function (shortDir) {
        if (shortDir === "enter") return { base: "enter", steps: 1, mod: "" };
        if (shortDir === "out") return { base: "out", steps: 1, mod: "" };
        this.DIR_REG.test(shortDir);
        var base = RegExp.$1;
        if (!base) return null;
        // Map composite directions (nu, nd, su, sd, eu, ed, wu, wd) to their base cardinal
        if (base.length === 2 && !["nw", "ne", "sw", "se"].includes(base)) {
            base = base[0]; // use first char: n, s, e, w
        }
        return {
            base: base,
            steps: RegExp.$2 ? parseInt(RegExp.$2) : 1,
            mod: RegExp.$3 || ""
        };
    },
    CreateExitsMap: function (exits, w, roomName) {
        var str = roomName.split("-");
        if (str.length > 1) roomName = str[str.length - 1];
        roomName = roomName.replace(/\(.*?\)/, "");
        var unitY = 30, unitX = 70, unitW = 60, unitH = 20;
        var height = unitY + 50;
        var l = (w - unitW) / 2, t = 30;
        var hasN = false, hasS = false, hasUp = false, hasDown = false;
        var hasNE = false, hasSE = false, hasSW = false, hasEnter = false, hasOut = false;

        for (var dir in exits) {
            var shortDir = this.LONG_TO_SHORT[dir] || dir;
            var parsed = this.parseDir(shortDir);
            if (!parsed) continue;
            var base = parsed.base;
            if (base === "n") hasN = true;
            if (base === "s") hasS = true;
            if (base === "ne") hasNE = true;
            if (base === "se") hasSE = true;
            if (base === "sw") hasSW = true;
            if (shortDir === "u") hasUp = true;
            if (shortDir === "d") hasDown = true;
            if (shortDir === "enter") hasEnter = true;
            if (shortDir === "out") hasOut = true;
        }

        // Count how many exits share each corner slot
        var neSlotCount = (hasNE ? 1 : 0) + (hasEnter ? 1 : 0) + (hasUp ? 1 : 0);
        var seSlotCount = (hasSE ? 1 : 0) + (hasDown ? 1 : 0);
        var swSlotCount = (hasSW ? 1 : 0) + (hasOut ? 1 : 0);

        var hasNorthish = hasN || hasNE || hasUp || hasEnter;
        var hasSouthish = hasS || hasSE || hasSW || hasDown || hasOut;

        if (hasNorthish) { height += unitY; t += unitY; }
        if (neSlotCount > 1) { height += unitY; t += unitY; }
        if (hasSouthish) height += unitY;
        if (seSlotCount > 1) height += unitY;
        if (swSlotCount > 1) height += unitY;

        var html = [];
        html.push('<svg style="margin-left:-2em" height="' + height + '" width="' + w + '">');
        // Center room (current room)
        html.push('<rect x="' + l + '" y="' + t + '" fill="dimgrey" stroke-width="1" stroke="gray" ');
        html.push('width="' + unitW + '" height="' + unitH + '"></rect>');
        html.push(' <text x="' + (l + 30) + '" y="' + (t + 14) + '" text-anchor="middle" style="font-size:12px;" ');
        this.pushName(html, roomName, true);

        // Render each exit direction
        var neIdx = 0, seIdx = 0, swIdx = 0;
        for (var dir in exits) {
            // Normalize long names (east→e, west→w, etc.) for regex parsing
            var shortDir = this.LONG_TO_SHORT[dir] || dir;
            var parsed = this.parseDir(shortDir);
            if (!parsed) continue;
            var baseDir = parsed.base;
            var steps = parsed.steps;
            var modifier = parsed.mod;

            var pos1, pos2, pos;
            switch (baseDir) {
                case "w":
                    pos1 = [l - (unitX - unitW) - unitX * (steps - 1), t + unitH / 2];
                    pos2 = [l, t + unitH / 2];
                    pos = [l - unitX - unitX * (steps - 1), t];
                    break;
                case "e":
                    pos1 = [l + unitW, t + unitH / 2];
                    pos2 = [l + unitX + unitX * (steps - 1), t + unitH / 2];
                    pos = [l + unitX + unitX * (steps - 1), t];
                    break;
                case "s":
                    pos1 = [l + unitW / 2, t + unitH];
                    pos2 = [l + unitW / 2, t + unitY + unitY * (steps - 1)];
                    pos = [l, t + unitY + unitY * (steps - 1)];
                    break;
                case "d":
                    pos1 = [l + unitW, t + unitH];
                    pos2 = [l + steps * unitX, t + steps * unitY + seIdx * unitY];
                    pos = [l + steps * unitX, t + (steps + seIdx) * unitY];
                    seIdx++;
                    break;
                case "n":
                    pos1 = [l + unitW / 2, t];
                    pos2 = [l + unitW / 2, t - (unitY - unitH) - unitY * (steps - 1)];
                    pos = [l, t - unitY - unitY * (steps - 1)];
                    break;
                case "u":
                    pos1 = [l + unitW, t];
                    pos2 = [l + steps * unitX, t - (unitY - unitH) - unitY * (steps - 1) - neIdx * unitY];
                    pos = [l + steps * unitX, t - (steps + neIdx) * unitY];
                    neIdx++;
                    break;
                case "nw":
                    pos1 = [l - steps * unitX + unitW, t - steps * unitY + unitH];
                    pos2 = [l, t];
                    pos = [l - steps * unitX, t - steps * unitY];
                    break;
                case "ne":
                    pos1 = [l + unitW, t];
                    pos2 = [l + steps * unitX, t - (unitY - unitH) - unitY * (steps - 1) - neIdx * unitY];
                    pos = [l + steps * unitX, t - (steps + neIdx) * unitY];
                    neIdx++;
                    break;
                case "enter":
                    pos1 = [l + unitW, t];
                    pos2 = [l + steps * unitX, t - (unitY - unitH) - unitY * (steps - 1) - neIdx * unitY];
                    pos = [l + steps * unitX, t - (steps + neIdx) * unitY];
                    neIdx++;
                    break;
                case "se":
                    pos1 = [l + unitW, t + unitH];
                    pos2 = [l + steps * unitX, t + steps * unitY + seIdx * unitY];
                    pos = [l + steps * unitX, t + (steps + seIdx) * unitY];
                    seIdx++;
                    break;
                case "sw":
                    pos1 = [l, t + unitH];
                    pos2 = [l - (unitX - unitW) - unitX * (steps - 1), t + steps * unitY + swIdx * unitY];
                    pos = [l - steps * unitX, t + (steps + swIdx) * unitY];
                    swIdx++;
                    break;
                case "out":
                    pos1 = [l, t + unitH];
                    pos2 = [l - (unitX - unitW) - unitX * (steps - 1), t + steps * unitY + swIdx * unitY];
                    pos = [l - steps * unitX, t + (steps + swIdx) * unitY];
                    swIdx++;
                    break;
            }

            var rm_name = exits[dir];
            html.push('<rect x="' + pos[0] + '" y="' + pos[1] + '" dir="' + dir + '" fill="#232323" stroke-width="1" stroke="gray" ');
            html.push('width="' + unitW + '" height="' + unitH + '"></rect>');
            html.push(' <text x="' + (pos[0] + 30) + '" y="' + (pos[1] + 14) + '" dir="' + dir + '" text-anchor="middle" style="font-size:12px;"');
            this.pushName(html, rm_name, false);

            if (pos1) {
                html.push('<line stroke="gray" ');
                html.push(" x1='" + pos1[0] + "' y1='" + pos1[1] + "' x2='" + pos2[0] + "' y2='" + pos2[1] + "'");
                if (modifier === "d" || modifier === "l") {
                    html.push(" stroke-dasharray='5,5' stroke-width='10'");
                } else {
                    html.push(" stroke-width='1'");
                }
                html.push("></line>");
            }
        }
        html.push("</svg>");
        return html.join("");
    }, colors: {
        "hig": "#00FF00", "hir": "#FF0000", "him": "#FF00FF",
        "hic": "#00FFFF", "hiy": "#FFFF00", "red": "#800000",
        "wht": "#C0C0C0", "mag": "#800080", "red": "#800000"
        , "hiw": "#FFFFFF", "gre": "#008000", "blu": "#000080", "hib": "#0000FF"
    }, GetColor: function (name, issel) {
        return this.colors[name.toLowerCase()] || "dimgrey";
    },
    // ────────────────────────────────────────────────────────────────
    // 小地图渲染兜底
    // this.map 是「美术数据」：坐标是手写/脚本推出来的，实际数据里经常出现
    //   · 两个房间共用同一个 p          → 图标叠在一起，只能看见一个
    //   · 某条出口朝某个方向，但那个格子上没有房间 → 线画进虚空 / 穿过别的房间
    //   · 个别条目缺 p、或 id 重复
    // 直接照着数据摆点，看上去就是「小地图很乱」。所以渲染前统一规整一遍：
    //   1. 坏条目丢掉、缺 p 的补一个空位、p 重复的后来者错位到最近空位；
    //   2. 画线前查格子，目标格上真有房间才画整条连线，
    //      否则只画一小截「出口」短线（既不画进虚空，也不会横穿整张图）。
    // 这一层只影响显示，不改任何玩法数据。
    MAP_DELTA: {
        n: [0, -1], s: [0, 1], e: [1, 0], w: [-1, 0],
        ne: [1, -1], nw: [-1, -1], se: [1, 1], sw: [-1, 1]
    },
    /** 从 (x,y) 起按切比雪夫半径由内向外找第一个没被占的格子（顺序稳定，可复现）。 */
    FindFree: function (x, y, used) {
        if (!used[x + "," + y]) return [x, y];
        for (var r = 1; r <= 64; r++) {
            var best = null, bestAng = 1e9;
            for (var dx = -r; dx <= r; dx++) {
                for (var dy = -r; dy <= r; dy++) {
                    if (Math.max(Math.abs(dx), Math.abs(dy)) !== r) continue;
                    if (used[(x + dx) + "," + (y + dy)]) continue;
                    var ang = Math.atan2(dy, dx) + Math.PI;
                    if (ang < bestAng) {
                        bestAng = ang;
                        best = [x + dx, y + dy];
                    }
                }
            }
            if (best) return best;
        }
        return [x, y + 128];
    },
    /**
     * 把服务端下发的 map 规整成「总能安全画」的房间列表。
     * 返回 { rooms:[{id,n,x,y,exits}], moved:n, filled:n }
     *   moved  —— 因为坐标撞车被挪开的房间数
     *   filled —— 因为缺/坏 p 被补了坐标的房间数
     */
    NormRooms: function (map) {
        var rooms = [], used = {}, moved = 0, filled = 0, anchor = [0, 0];
        if (!map || !map.length) return { rooms: rooms, moved: 0, filled: 0 };
        for (var i = 0; i < map.length; i++) {
            var e = map[i];
            if (!e || typeof e !== "object") continue;
            if (typeof e.id !== "string" || !e.id) continue;
            var x = null, y = null;
            if (e.p && e.p.length >= 2 && isFinite(e.p[0]) && isFinite(e.p[1])) {
                x = Math.round(e.p[0]);
                y = Math.round(e.p[1]);
            }
            var cell;
            if (x === null) {
                filled++;
                cell = this.FindFree(anchor[0], anchor[1], used);
            } else if (used[x + "," + y]) {
                moved++;
                cell = this.FindFree(x, y, used);
            } else {
                cell = [x, y];
            }
            used[cell[0] + "," + cell[1]] = true;
            anchor = cell;
            rooms.push({
                id: e.id,
                n: (typeof e.n === "string" && e.n) ? e.n : e.id,
                x: cell[0], y: cell[1],
                exits: Array.isArray(e.exits) ? e.exits : []
            });
        }
        return { rooms: rooms, moved: moved, filled: filled };
    },
    ShowMap: function (map, id) {
        if (!map) return;
        this.CurMapID = id;
        var norm = this.NormRooms(map);
        // 数据被兜底修正过就记一笔，方便以后从控制台排查是不是数据又坏了
        this.LastFix = { moved: norm.moved, filled: norm.filled, total: map.length, shown: norm.rooms.length };
        if (!norm.rooms.length) return;
        var rooms = norm.rooms;
        // 缓存规整后的房间表：点击地图「前往」时的 BFS 就用这一份，
        // 保证按钮 / 连线 / 寻路三者看的是同一份数据。
        this.NavRooms = rooms;
        var occ = {};
        for (var q = 0; q < rooms.length; q++) occ[rooms[q].x + "," + rooms[q].y] = true;

        var html = [];
        var pos = this.getMinPos(rooms);
        var offX = 0 - pos.minX;
        var offY = 0 - pos.minY;
        var unitY = 50;
        var unitX = 100;
        var unitW = 60;
        var unitH = 20;
        var content = $(".map-panel");
        this.MapWidth = (pos.maxX + offX + 1) * unitX;
        var off_x = 0;
        var content_width = content.width();
        if (this.MapWidth < content_width) {
            off_x = (content_width - this.MapWidth) / 2;
            this.MapWidth = content_width;
        }
        this.MapHeight = (pos.maxY + offY + 1) * unitY;
        if (!(this.MapWidth > 0) || !(this.MapHeight > 0)) return;
        html.push('<svg class="map" height="' + this.MapHeight + '" width="' + this.MapWidth + '">');

        for (var i = 0; i < rooms.length; i++) {
            var room = rooms[i];
            var l = (room.x + offX) * unitX + off_x + 20;
            var t = (room.y + offY) * unitY + 20;
            html.push("<rect class='map-room' rm='" + room.id + "' ");
            html.push("x='" + l + "' y='" + t + "'");
            html.push(' fill="dimgrey" stroke-width="1" stroke="gray" ');
            html.push('width="' + unitW + '" height="' + unitH + '"></rect>');

            var drawn = {};
            for (var j = 0; j < room.exits.length; j++) {
                var exitCode = room.exits[j];
                if (typeof exitCode !== "string") continue;
                var parsed = this.parseDir(exitCode);
                if (!parsed) continue;
                var baseDir = parsed.base;
                var length = parsed.steps || 1;
                var mod = parsed.mod;
                var delta = this.MAP_DELTA[baseDir];
                if (!delta) continue;                       // u/d/enter/out 本来就画不出来
                if (drawn[baseDir]) continue;               // 同一方向重复写了，只画一条
                drawn[baseDir] = true;

                // 这条出线真正指向的格子；上面有房间才算「连通」
                var linked = !!occ[(room.x + delta[0] * length) + "," + (room.y + delta[1] * length)];

                var near = null, far = null;
                switch (baseDir) {
                    case "w":
                        near = [l, t + unitH / 2];
                        far = [l - unitX * length + unitW, t + unitH / 2];
                        break;
                    case "e":
                        near = [l + unitW, t + unitH / 2];
                        far = [l + unitX * length, t + unitH / 2];
                        break;
                    case "s":
                        near = [l + unitW / 2, t + unitH];
                        far = [l + unitW / 2, t + unitY * length];
                        break;
                    case "n":
                        near = [l + unitW / 2, t];
                        far = [l + unitW / 2, t - unitY * length + unitH];
                        break;
                    case "nw":
                        near = [l, t];
                        far = [l - unitX * length + unitW, t - unitY * length + unitH];
                        break;
                    case "ne":
                        near = [l + unitW, t];
                        far = [l + unitX * length, t - unitY * length + unitH];
                        break;
                    case "se":
                        near = [l + unitW, t + unitH];
                        far = [l + unitX * length, t + unitY * length];
                        break;
                    case "sw":
                        near = [l, t + unitH];
                        far = [l - unitX * length + unitW, t + unitY * length];
                        break;
                }
                if (!near) continue;
                var endX = far[0], endY = far[1];
                if (!linked) {
                    // 目标格上没有房间：只画 45% 的一小截，表示「这里有条路通出去」
                    endX = near[0] + (far[0] - near[0]) * 0.45;
                    endY = near[1] + (far[1] - near[1]) * 0.45;
                }
                html.push('<line  stroke="gray" ');
                html.push(" x1='" + near[0] + "' y1='" + near[1] + "' x2='" + endX + "' y2='" + endY + "'");
                if (mod) html.push(" stroke-dasharray='5,5'");
                if (mod == "l") html.push(" stroke-width='10'");
                else html.push(" stroke-width='1'");
                html.push("></line >");
            }

            html.push(' <text x="' + (l + 30) + '" y="' + (t + 14) + '" text-anchor="middle" style="font-size:12px;" ');
            this.pushName(html, room.n, true);
        }
        html.push("</svg>");
        content.html(html.join(""));
        // 可交互地图（对话框里的那张）开着的时候，把新画出来的 svg 搬进去，
        // 否则对话框里还停在旧图、甚至一片空白——「小地图有房间、可交互地图
        // 没有对应按钮」就是这么来的。
        if (typeof Dialog !== "undefined" && Dialog.isShow &&
            Dialog.curItem === "map" && Dialog.map && Dialog.map.attach) {
            Dialog.map.attach();
        }
        this.MapContent = $("svg");
        if (!this.IsShow) {
            this.IsShow = true;
            $(".map-panel").slideDown("fast");
        }
        this.SetRoom(this.Room);
    },
    pushName: function (html, rm_name, issel) {
        var mathch = this.REG.exec(rm_name);
        if (mathch) {
            html.push('  fill="' + this.GetColor(mathch[1]) + '"');
            html.push('>' + mathch[2] + '</text>');
        } else {
            html.push(' fill="');
            html.push(issel ? "#232323" : "dimgrey");
            html.push('">' + rm_name + '</text>');
        }
    },
    getMinPos: function (rooms) {
        var pos = { minX: 0, minY: 0, maxX: 0, maxY: 0 };
        if (!rooms || !rooms.length) return pos;
        pos.minX = pos.maxX = rooms[0].x;
        pos.minY = pos.maxY = rooms[0].y;
        for (var i = 1; i < rooms.length; i++) {
            var x = rooms[i].x, y = rooms[i].y;
            if (x < pos.minX) pos.minX = x;
            if (x > pos.maxX) pos.maxX = x;
            if (y < pos.minY) pos.minY = y;
            if (y > pos.maxY) pos.maxY = y;
        }
        return pos;
    },
    // ────────────────────────────────────────────────────────────────
    // 点击地图房间「前往」
    //
    // 小地图上的每个 rect 就是该副本 this.map 的一个条目（一件可点的「按钮」）。
    // p:[x,y] 与 exits 的方向是一一对应的（坐标由 tools/fix_map_layout.js 按
    // 房间文件真实出口重排），所以「格子上有邻居 + exits 里有这个方向」就是
    // 一条真实可走的路；据此在客户端做 BFS，得到方向序列后逐条 go 过去。
    // 一旦中途房间对不上（被 NPC 挡住、踩了机关传送、进入战斗），立即停下，
    // 绝不盲目继续发命令。
    NAV_DIRS: {
        n: "north", s: "south", e: "east", w: "west",
        ne: "northeast", nw: "northwest", se: "southeast", sw: "southwest"
    },
    NAV_SHOULD: ["n", "s", "e", "w", "ne", "nw", "se", "sw"],
    BuildNav: function (rooms) {
        var at = {}, adj = {};
        for (var i = 0; i < rooms.length; i++) at[rooms[i].x + "," + rooms[i].y] = rooms[i];
        for (var j = 0; j < rooms.length; j++) {
            var room = rooms[j], out = {};
            for (var k = 0; k < room.exits.length; k++) {
                var code = room.exits[k];
                if (typeof code !== "string") continue;
                var parsed = this.parseDir(code);
                if (!parsed) continue;
                var delta = this.MAP_DELTA[parsed.base];
                if (!delta) continue;                  // u/d/enter/out 画不出格子，寻路也不走
                var steps = parsed.steps || 1;
                var to = at[(room.x + delta[0] * steps) + "," + (room.y + delta[1] * steps)];
                if (!to || to.id === room.id) continue;
                if (!out[parsed.base]) out[parsed.base] = to.id;
            }
            adj[room.id] = out;
        }
        return { at: at, adj: adj };
    },
    /** 返回 [{dir, to}] ；走不到返回 null。 */
    FindPath: function (fromId, toId, nav) {
        if (fromId === toId) return [];
        var prev = {}, seen = {}, queue = [fromId];
        seen[fromId] = true;
        while (queue.length) {
            var cur = queue.shift();
            var outs = nav.adj[cur] || {};
            for (var i = 0; i < this.NAV_SHOULD.length; i++) {
                var d = this.NAV_SHOULD[i];
                var next = outs[d];
                if (!next || seen[next]) continue;
                seen[next] = true;
                prev[next] = { from: cur, dir: d };
                if (next === toId) {
                    var plan = [], node = toId;
                    while (node !== fromId) {
                        plan.unshift({ dir: prev[node].dir, to: node });
                        node = prev[node].from;
                    }
                    return plan;
                }
                queue.push(next);
            }
        }
        return null;
    },
    /** 地图上点一个房间：算出路线就开始走，每进一间房核对一次。 */
    NavigateTo: function (id) {
        var cur = this.Room && this.Room.path;
        if (!cur) return;
        if (!this.NavRooms || !this.NavRooms.length) {
            return ReceiveMessage("<yel>地图还没加载好，稍等一下再点。</yel>");
        }
        if (id === cur) return ReceiveMessage("<yel>你已经在这里了。</yel>");
        var nav = this.BuildNav(this.NavRooms);
        if (!nav.at) return;
        var plan = this.FindPath(cur, id, nav);
        if (!plan || !plan.length) {
            return ReceiveMessage("<yel>小地图上没有从「" + (this.Room.name || cur) +
                "」走过去的完整路线（可能中间是机关 / 上下坡出口）。</yel>");
        }
        if (plan.length > 40) {
            return ReceiveMessage("<yel>目标太远（" + plan.length + " 步），地图寻路暂不支持。</yel>");
        }
        this.Walk = { plan: plan, index: 0, expect: plan[0].to, path: id };
        ReceiveMessage("<hig>开始前往" + (this.RoomName(id) || id) + "（" + plan.length + " 步）。</hig>");
        this.WalkStep();
    },
    RoomName: function (id) {
        var rooms = this.NavRooms || [];
        for (var i = 0; i < rooms.length; i++) if (rooms[i].id === id) return rooms[i].n;
        return "";
    },
    WalkStep: function () {
        if (!this.Walk) return;
        var w = this.Walk;
        if (w.index >= w.plan.length) { this.Walk = null; return; }
        var step = w.plan[w.index];
        w.expect = step.to;
        w.index++;
        w.time = Date.now();
        SendCommand("go " + (this.NAV_DIRS[step.dir] || step.dir));
    },
    /** 由 SetRoom 在「真的换了房间」时调用，核对路线。 */
    WalkArrived: function (path) {
        if (!this.Walk) return;
        var w = this.Walk;
        if (w.time && Date.now() - w.time > 5000) {
            this.Walk = null;
            ReceiveMessage("<yel>自动寻路超时，已停止。</yel>");
            return;
        }
        if (path !== w.expect) {
            this.Walk = null;
            ReceiveMessage("<yel>自动寻路中断了（路上有阻挡或机关）。</yel>");
            return;
        }
        if (w.index >= w.plan.length) {
            this.Walk = null;
            ReceiveMessage("<hig>你到了。</hig>");
            return;
        }
        this.WalkStep();
    },
    State: 0,
    ZoomState: 100,
    Buffer: {},
    HideItem: function () {
        if (this.State == 0) {
            this.State = 1;
            $(".room_desc").slideUp("fast");
        }
    },
    ShowItem: function () {
        if (this.State == 1) {
            this.State = 0;
            $(".room_desc").slideDown("fast");
        }
    }, ZoomIn: function (pars) {
        if (pars.zoom) return;
        this.ZoomState = this.ZoomState / pars.zoom;
        if (this.ZoomState > 200) this.ZoomState = 200;
        if (this.ZoomState < 80) this.ZoomState = 80;
        var pw = this.MapWidth * this.ZoomState / 100;
        var ph = this.MapHeight * this.ZoomState / 100;
        this.MapContent.attr("viewBox", "0,0," + pw + "," + ph);
    }, SetRoom: function (rm) {
        var changed = !this.Room || this.Room.path !== rm.path;
        this.Room = rm;
        // 自动寻路：只有真的换了房间才核对，避免 ShowMap 里的自调用误判
        if (changed) this.WalkArrived(rm.path);
        if (!this.IsShow) return;

        if (this.CurRoomItem) {
            this.CurRoomItem.attr("fill", "dimgrey");
            this.CurRoomItem.attr("stroke", "gray");
        }
        this.CurRoomItem = null;
        var item = this.MapContent.find("rect[rm='" + rm.path + "']");
        if (item.length) {
            this.CurRoomItem = item;
            this.CurRoomItem.attr("fill", "#bebebe");
            this.CurRoomItem.attr("stroke", "gray");
            var pos = [item.attr("x"), item.attr("y"), item.attr("width"), item.attr("height")];
            var elem = document.querySelector(".map-panel");
            var height = elem.offsetHeight;
            var width = elem.offsetWidth;
            elem.scrollTop = pos[1] - (height - pos[3]) / 2;
            elem.scrollLeft = pos[0] - (width - pos[2]) / 2;
        }
        var map_path = rm.path.substr(0, rm.path.lastIndexOf("/"));
        if (map_path != this.CurMapID) {
            if (this.Buffer[map_path]) {
                return this.ShowMap(this.Buffer[map_path], map_path);
            }
            SendCommand("map " + map_path);
        }
    },
    LoadMap: function () {
        if (this.IsShow) {
            this.IsShow = false;
            return $(".map-panel").slideUp("fast");
        }
        var rm = this.Room;
        if (!rm) return;
        var name = rm.path.substr(0, rm.path.lastIndexOf("/"));
        if (name == this.CurMapID) {
            $(".map-panel").slideDown("fast");
            this.IsShow = true;
            return;
        }
        if (this.Buffer[name]) {
            return this.ShowMap(this.Buffer[name], name);
        }
        SendCommand("map " + name);
    }, SetMapBuffer: function (maps, id) {
        this.Buffer[id] = maps;
    }, UpdateMap: function (mapid, data) {
        var map = this.Buffer[mapid];
        if (!map) return;
        if (!data.id) {
            this.Buffer[mapid] = null;
            if (this.CurMapID == mapid) this.CurMapID = null;
            return;
        }
        for (var i = 0; i < map.length; i++) {
            if (map[i].id == data.id) {
                map[i].n = data.n || map[i].n;
                map[i].p = data.p || map[i].p;
                map[i].exits = data.exits || map[i].exits;
                break;
            }
        }
        if (mapid == this.CurMapID) {
            this.ShowMap(map, mapid);
        }
    }
}
