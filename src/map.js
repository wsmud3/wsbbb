

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
    ShowMap: function (map, id) {
        if (!map) return;
        this.CurMapID = id;
        var html = [];
        var pos = this.getMinPos(map);
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
        if (this.MapWidth < 0 || this.MapHeight < 0) return;
        var reg = /^([a-z]{1,2})(\d)?([d|l])?$/;
        html.push('<svg class="map" height="' + this.MapHeight + '" width="' + this.MapWidth + '">');
        for (var i = 0; i < map.length; i++) {
            html.push("<rect class='map-room' rm='" + map[i].id + "' ");

            var l = (map[i].p[0] + offX) * unitX + off_x + 20;
            var t = (map[i].p[1] + offY) * unitY + 20;
            html.push("x='" + l + "' y='" + t + "'");
            html.push(' fill="dimgrey" stroke-width="1" stroke="gray" ');
            html.push('width="' + unitW + '" height="' + unitH + '"></rect>');
            var exits = map[i].exits;
            if (exits) {
                for (var j = 0; j < exits.length; j++) {
                    var exitCode = exits[j];
                    // Use parseDir helper for consistent handling of "enter"/"out"/composite dirs
                    var parsed = this.parseDir(exitCode);
                    if (!parsed) continue;
                    var baseDir = parsed.base;
                    var length = parsed.steps;
                    var mod = parsed.mod;
                    var pos1;
                    var pos2;
                    switch (baseDir) {
                        case "w":
                            pos1 = [l - (unitX - unitW) - unitX * (length - 1), t + unitH / 2];
                            pos2 = [l, t + unitH / 2];
                            break;
                        case "e":
                            pos1 = [l + unitW, t + unitH / 2];
                            pos2 = [l + unitX + unitX * (length - 1), t + unitH / 2];
                            break;
                        case "s":
                            pos1 = [l + unitW / 2, t + unitH];
                            pos2 = [l + unitW / 2, t + unitY + unitY * (length - 1)];
                            break;
                        case "n":
                            pos1 = [l + unitW / 2, t];
                            pos2 = [l + unitW / 2, t - (unitY - unitH) - unitY * (length - 1)];
                            break;
                        case "nw":
                            pos1 = [l - length * unitX + unitW, t - length * unitY + unitH];
                            pos2 = [l, t];
                            break;
                        case "ne":
                            pos1 = [l + unitW, t];
                            pos2 = [l + length * unitX, t - (unitY - unitH)];
                            break;
                        case "se":
                            pos1 = [l + unitW, t + unitH];
                            pos2 = [l + length * unitX, t + length * unitY];
                            break;
                        case "sw":
                            pos1 = [l, t + unitH];
                            pos2 = [l - (unitX - unitW) - unitX * (length - 1), t + length * unitY];
                            break;
                    }
                    if (pos1) {
                        html.push('<line  stroke="gray" ');
                        html.push(" x1='" + pos1[0] + "' y1='" + pos1[1] + "' x2='" + pos2[0] + "' y2='" + pos2[1] + "'");
                        if (mod) {
                            html.push(" stroke-dasharray='5,5'");
                        }
                        if (mod == "l") {
                            html.push(" stroke-width='10'");
                        } else {
                            html.push(" stroke-width='1'");
                        }
                        html.push("></line >");
                    }

                }

            }
            html.push(' <text x="' + (l + 30) + '" y="' + (t + 14) + '" text-anchor="middle" style="font-size:12px;" ');
            this.pushName(html, map[i].n, true);
        }
        html.push("</svg>");
        content.html(html.join(""));
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
    getMinPos: function (map) {
        var pos = {
            minX: 99999,
            minY: 99999,
            maxX: 0,
            maxY: 0
        };
        for (var i = 0; i < map.length; i++) {
            var x = map[i].p[0];
            var y = map[i].p[1];
            if (x < pos.minX) {
                pos.minX = x;
            } if (x > pos.maxX) pos.maxX = x;
            if (y < pos.minY) {
                pos.minY = y;
            } if (y > pos.maxY) pos.maxY = y;
        }
        return pos;
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
        this.Room = rm;
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
