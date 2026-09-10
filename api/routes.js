// Explicit endpoint inventory; helpers and future methods are closed by default.
const METHODS = {
    "user": [
        "login",
        "regist",
        "validimage",
        "getphone",
        "bindphone",
        "resetpwd",
        "changepassword",
        "GetPhone2"
    ],
    "game": [
        "servers",
        "search_role"
    ],
    "admin": [
        "login",
        "check",
        "online",
        "player",
        "status",
        "skills",
        "skill",
        "skill_save",
        "skill_create",
        "skill_delete",
        "broadcast",
        "broadcast_clear",
        "give_item",
        "reclaim_item",
        "users_list",
        "set_admin",
        "shutdown",
        "create_map",
        "repair_check",
        "repair_fix",
        "room_list",
        "map_list",
        "map_detail",
        "map_delete",
        "create_dungeon",
        "items_search",
        "npcs",
        "npc_detail",
        "npc_editdata",
        "npc_delete",
        "npc_create",
        "equipments",
        "equipment_detail",
        "equipment_save",
        "equipment_delete",
        "eval",
        "backup_list",
        "backup_rollback",
        "safe_shutdown",
        "file_list",
        "file_read",
        "file_save",
        "file_delete",
        "send_mail",
        "player_update",
        "player_kick",
        "player_delete",
        "stats",
        "players_all",
        "hot_reload"
    ]
};
const READ = new Set(["user.validimage","user.getphone","game.servers","game.search_role","admin.check","admin.online","admin.player","admin.status","admin.skills","admin.skill","admin.items_search","admin.file_list","admin.file_read","admin.equipment_detail"]);
function exposed(group, method) {
    return Object.hasOwn(METHODS, group) && METHODS[group].includes(method);
}
function allowed(group, method, verb) {
    return exposed(group, method) && (verb === 'POST' || (verb === 'GET' && READ.has(group + '.' + method)));
}
module.exports = { exposed, allowed, READ };
