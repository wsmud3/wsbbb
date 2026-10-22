
import MAP from '../map.js';

export default {
    onData: function (data) {
        Dialog.title(data.title || "地图");
    },
    init: function () {

    },
    show: function () {
        Dialog.init();
        var rm = (MAP.Room && MAP.Room.name) || "地图";
        var index = rm.indexOf('-');
        if (index > -1) {
            rm = rm.substr(0, index);
        }
        Dialog.title(rm);
        Dialog.footer("点房间即可前往");
        this.element = $(".map");
        if (!this.element.length) {
            // 地图数据还没下发（刚进副本 / 第一次打开地图）：先请求一次。
            // 收到 map 消息后 MAP.ShowMap 会调 attach() 把新图搬进来，
            // 不再出现「对话框空白、但小地图上明明有房间」的情况。
            if (MAP.Room && MAP.Room.path) {
                SendCommand("map " + MAP.Room.path.substr(0, MAP.Room.path.lastIndexOf("/")));
            }
            Dialog.contentElement.empty().append("<div class='map-loading'>地图加载中…</div>");
        } else {
            Dialog.contentElement.empty().append(this.element);
        }
        this.bindClick();
        Dialog.icon("map-marker");
        Dialog.iconElement.attr("class", "dialog-icon glyphicon glyphicon-map-marker");

    },
    /** 地图数据刷新后，把新画好的 svg 搬进对话框（供 MAP.ShowMap 调用）。 */
    attach: function () {
        var svg = $(".map-panel .map");
        if (!svg.length) svg = $(".map");
        if (!svg.length) return;
        this.element = svg;
        Dialog.contentElement.empty().append(this.element);
        this.bindClick();
    },
    /**
     * 可交互地图的点击逻辑。
     *
     * 小地图上的每个房间矩形都是 MAP.ShowMap 按副本 this.map 的条目画出来的
     * （rect.map-room rm="<房间 id>"），所以「一个 map 条目 = 一个按钮」。
     * 以前这里没有任何 click 绑定，点房间自然毫无反应；现在点一下就走过去：
     * MAP.NavigateTo 会用同一份 this.map 的 p/exits 做 BFS，逐条 go 到目标房间。
     */
    bindClick: function () {
        var content = Dialog.contentElement;
        if (!content || !content.length) return;
        content.off("click.map-dialog").on("click.map-dialog", "rect.map-room", function (e) {
            e.preventDefault();
            e.stopPropagation();
            var id = $(this).attr("rm");
            if (!id) return false;
            Dialog.hide();
            MAP.NavigateTo(id);
            return false;
        });
    },
    hide: function () {
        if (Dialog.contentElement) Dialog.contentElement.off("click.map-dialog");
        if (this.element && this.element.length) {
            this.element.remove();
            if ($(".map-panel").children().length == 0)
                this.element.appendTo(".map-panel");
        }
        $(".map-loading").remove();

    },
    close: function () {
        this.hide();
    }
};
