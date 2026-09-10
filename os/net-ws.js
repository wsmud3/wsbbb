"use strict";
var crypto = require('crypto');
var fs = require("fs");
var TextDecoder = require('util').TextDecoder;
function wsServer(options) {
    var evt = ["Close", "Error", "SocketIn", "Connect", "Receive",
        "ClientError", "ClientClose", "ClientTimeout"];
    for (var i = 0; i < evt.length; i++) {
        this["on" + evt[i]] = function () {
        }
    }
    this.options = options.SSL ? {
        key: fs.readFileSync(options.KEY),
        cert: fs.readFileSync(options.CERT),
        requestCert: true,
        rejectUnauthorized: true,
        passphrase: options.PASSWORD,
        ca: [fs.readFileSync(options.CERT)]
    } : null;
    this.ssl = options.SSL;
}
wsServer.prototype.listen = function (port, func) {

    var net = require(this.ssl ? 'tls' : 'net');
    var tcpserver = net.createServer(this.options, onClientConnect.bind(this));
    tcpserver.listen(port, func);
    tcpserver.on('close', this.onClose.bind(this));
    tcpserver.on('error', this.onError.bind(this));
    this.tcpServer = tcpserver;
}
wsServer.prototype.send = function (msg, socket) {
    socket.send(msg);
}
wsServer.prototype.close = function () {
    return new Promise((resolve) => {
        this.tcpServer.close(resolve);
    });
}

module.exports = wsServer;
function onClientConnect(socket) {

    socket.send = function (msg) {
        if (msg)
            this.protocol.sendData(msg, socket);
    }
    socket.on('close', this.onClientClose.bind(this, socket));
    socket.on('error', this.onClientError.bind(this, socket));
    var $this = this;
    // TCP does not preserve WebSocket frame or HTTP header boundaries.  Keep
    // the handshake bytes on the socket until the complete header arrives.
    socket._handshakeBuffer = Buffer.alloc(0);
    socket.setTimeout(30000);
    socket.on('timeout', this.onClientTimeout.bind(this, socket));
    $this.onSocketIn(socket);
    socket.on('data', function (data) {
        if (socket.protocol) {
            socket.protocol.readData(data, socket, $this);
        } else {
            socket._handshakeBuffer = Buffer.concat([socket._handshakeBuffer, data]);
            if (socket._handshakeBuffer.length > 64 * 1024) {
                socket.destroy();
                return;
            }
            // Existing automation/cross-server clients use a length-prefixed
            // TCP protocol and do not send an HTTP upgrade.  Classify those
            // bytes as soon as the prefix cannot be an HTTP GET, while still
            // waiting for fragmented WebSocket headers.
            if (socket._handshakeBuffer.length >= 4 &&
                socket._handshakeBuffer.toString('ascii', 0, 4) !== 'GET ') {
                socket.protocol = protocols.tcp;
                var tcpData = socket._handshakeBuffer;
                socket._handshakeBuffer = null;
                socket.protocol.readData(tcpData, socket, $this);
                return;
            }
            var headerEnd = socket._handshakeBuffer.indexOf(Buffer.from("\r\n\r\n"));
            if (headerEnd < 0) return;
            var handshake = socket._handshakeBuffer;
            var requestLine = handshake.slice(0, handshake.indexOf(Buffer.from("\r\n"))).toString('ascii');
            if (!/^GET\s+\S+\s+HTTP\/1\.[01]$/i.test(requestLine)) {
                socket.destroy();
                return;
            }
            var frameData = handshake.slice(headerEnd + 4);
            var header = readHeader(handshake.slice(0, headerEnd + 4));
            socket._handshakeBuffer = null;
            socket.requestHeader = header;
            if (header["Sec-WebSocket-Key"]) {
                socket.protocol = protocols.var1;
            } else if (header["Sec-WebSocket-Key1"]) {
                socket.protocol = protocols.var2;
            } else { socket.destroy(); return; }
            socket.protocol.handShake(header, socket, handshake);
            $this.onConnect(socket);
            // A client is allowed to send the first frame in the same TCP
            // packet as the HTTP upgrade.  Do not discard it.
            if (frameData.length) socket.protocol.readData(frameData, socket, $this);
        }
    });
}
var protocols = {
    var1: {
        handShake: function (header, socket) {
            var hasher = crypto.createHash("sha1");
            hasher.update(header["Sec-WebSocket-Key"] + "258EAFA5-E914-47DA-95CA-C5AB0DC85B11");
            var hashmsg = hasher.digest().toString('base64');
            var origin = header.Origin;
            var protocol = header['sec-websocket-protocol'];
            if (protocol)
                protocol.split(/, */);
            var respon = ["HTTP/1.1 101 Switching Protocols",
                "Connection: Upgrade",
                "Upgrade: WebSocket",
                `Sec-WebSocket-Accept:${hashmsg}`,
                `Sec-WebSocket-Origin:${origin}`];
            if (protocol) respon.push(`Sec-WebSocket-Protocol: ${protocol}`);
            respon.push("\r\n");
            socket.write(respon.join("\r\n"));
        },
        readData: function (data, socket, server) {
            // Buffer complete frames; a TCP data event may contain half a
            // header, a header plus part of a payload, or several frames.
            var buffer = socket._wsReadBuffer;
            socket._wsReadBuffer = buffer ? Buffer.concat([buffer, data]) : Buffer.from(data);
            buffer = socket._wsReadBuffer;
            var start = 0;
            var maxPayload = 2 * 1024 * 1024;
            while (start + 2 <= buffer.length) {
                var first = buffer[start];
                var second = buffer[start + 1];
                var iseof = (first & 0x80) !== 0;
                var frameType = first & 0x0F;
                if (first & 0x70) { socket.destroy(); return; }
                var hasMask = (second & 0x80) !== 0;
                var length = second & 0x7F;
                var headerLength = 2;
                if (length === 126) {
                    if (buffer.length < start + 4) break;
                    length = buffer.readUInt16BE(start + 2);
                    headerLength += 2;
                } else if (length === 127) {
                    // This server only supports lengths representable safely
                    // in JavaScript; reject high 32 bits instead of wrapping.
                    if (buffer.length < start + 10) break;
                    if (buffer.readUInt32BE(start + 2) !== 0) {
                        socket.destroy();
                        return;
                    }
                    length = buffer.readUInt32BE(start + 6);
                    headerLength += 8;
                }
                if (length > maxPayload || !hasMask) {
                    socket.destroy();
                    return;
                }
                var maskLength = 4;
                var frameLength = headerLength + maskLength + length;
                if (buffer.length < start + frameLength) break;
                // Control frames must not be fragmented or oversized.
                if (frameType >= 8 && (!iseof || length > 125)) {
                    socket.destroy();
                    return;
                }
                // While a text message is fragmented, only continuation and
                // control frames are legal.  Silently accepting a binary or
                // a second data frame desynchronizes the parser and can make
                // the next player's command be delivered as part of it.
                if (socket._wsMessageBuffer && frameType !== FrameTypes.Continuation &&
                    frameType !== FrameTypes.Close && frameType !== FrameTypes.Ping && frameType !== FrameTypes.Pong) {
                    socket.destroy();
                    return;
                }
                var markIndex = start + headerLength;
                var payloadIndex = markIndex + 4;
                var payload = Buffer.alloc(length);
                for (var i = 0; i < length; i++)
                    payload[i] = buffer[payloadIndex + i] ^ buffer[markIndex + (i % 4)];
                start += frameLength;
                switch (frameType) {
                    case FrameTypes.Close:
                        socket._wsClosing = true;
                        socket._wsMessageBuffer = null;
                        socket.end();
                        return;
                    case FrameTypes.Binary:
                        break;
                    case FrameTypes.Ping:
                        // Respond with Pong per RFC 6455
                        (function () {
                            var pongPayload = payload;
                            var pongFrame;
                            if (length < 126) {
                                pongFrame = Buffer.alloc(2 + length);
                                pongFrame[0] = 0x8A;
                                pongFrame.writeUInt8(length, 1);
                                pongPayload.copy(pongFrame, 2);
                            } else if (length < 65536) {
                                pongFrame = Buffer.alloc(4 + length);
                                pongFrame[0] = 0x8A;
                                pongFrame.writeUInt8(126, 1);
                                pongFrame.writeUInt16BE(length, 2);
                                pongPayload.copy(pongFrame, 4);
                            } else {
                                pongFrame = Buffer.alloc(10 + length);
                                pongFrame[0] = 0x8A;
                                pongFrame[1] = 127;
                                pongFrame.writeUInt32BE(0, 2);
                                pongFrame.writeUInt32BE(length, 6);
                                pongPayload.copy(pongFrame, 10);
                            }
                            socket.write(pongFrame);
                        })();
                        break;
                    case FrameTypes.Pong:
                        break;
                    case FrameTypes.Text:
                        if (socket._wsMessageBuffer) { socket.destroy(); return; }
                        if (iseof) {
                            var msg;
                            try { msg = new TextDecoder('utf-8', { fatal: true }).decode(payload); }
                            catch (_) { socket.destroy(); return; }
                            server.onReceive(msg, socket);
                        } else {
                            socket._wsMessageBuffer = socket._wsMessageBuffer ?
                                Buffer.concat([socket._wsMessageBuffer, payload]) : payload;
                            if (socket._wsMessageBuffer.length > 8 * 1024 * 1024) {
                                socket.destroy();
                                return;
                            }
                        }
                        break;
                    case FrameTypes.Continuation:
                        if (!socket._wsMessageBuffer) { socket.destroy(); return; }
                        socket._wsMessageBuffer = Buffer.concat([socket._wsMessageBuffer, payload]);
                        if (socket._wsMessageBuffer.length > 8 * 1024 * 1024) {
                            socket.destroy();
                            return;
                        }
                        if (iseof) {
                            var complete;
                            try { complete = new TextDecoder('utf-8', { fatal: true }).decode(socket._wsMessageBuffer); }
                            catch (_) { socket.destroy(); return; }
                            server.onReceive(complete, socket);
                            socket._wsMessageBuffer = null;
                        }
                        break;
                    default:
                        socket.destroy();
                        return;
                }
            }
            socket._wsReadBuffer = start < buffer.length ? buffer.slice(start) : Buffer.alloc(0);
        },
        sendData: function (text, socket) {
            var textBuffer = Buffer.from(text);
            var length = textBuffer.length;
            var data;
            if (length < 126) {
                data = Buffer.alloc(length + 2);
                data[0] = 129;
                data.writeUInt8(length, 1);
                textBuffer.copy(data, 2);
            }
            else if (length >= 126 && length < 65536) {
                data = Buffer.alloc(length + 4);
                data[0] = 129;
                data.writeUInt8(126, 1);
                data.writeUInt16BE(length, 2);
                textBuffer.copy(data, 4);
            } else {
                data = Buffer.alloc(length + 10);
                data[0] = 0x81;
                data[1] = 127;
                data.writeUInt32BE(0, 2);
                data.writeUInt32BE(length, 6);
                textBuffer.copy(data, 10);
            }
            socket.write(data);
        }
    },
    var2: {
        handShake: function (header, socket, buffer) {
            var key1 = header["Sec-WebSocket-Key1"];
            var key2 = header["Sec-WebSocket-Key2"];

            var origin = header["Origin"];

            var n1 = getNumber(key1);
            n1 = parseInt(n1);
            n1 = n1 / getSpace(key1);

            var n2 = getNumber(key2);
            n2 = parseInt(n2);
            n2 = n2 / getSpace(key2);

            var buf = Buffer.alloc(16);

            buf.writeIntBE(n1, 0, 4, true);

            buf.writeIntBE(n2, 4, 4, true);

            buffer.copy(buf, 8, buffer.length - 8, buffer.length);

            var hasherbs = crypto.createHash("md5");
            hasherbs = hasherbs.update(buf);
            hasherbs = hasherbs.digest();

            var host = "ws://" + header["Host"] + "/";
            var headers = [
                "HTTP/1.1 101 WebSocket Protocol Handshake",
                "Upgrade: WebSocket",
                "Connection: Upgrade",
                "Sec-WebSocket-Origin:" + origin,
                "Sec-WebSocket-Location:" + host
                , "\r\n"
            ];
            socket.write(headers.join("\r\n"));
            socket.write(hasherbs);
        },
        buffer: null
        ,
        readData: function (data, socket, server) {
            var start = 0;
            while (start < data.length) {
                if (data[start] != 0) {
                    break;//error
                }
                var end = start + 1;
                while (data[end] != 255 && end < data.length) {
                    end++;
                }
                var msg = data.toString("utf8", start + 1, end);
                server.onReceive(msg, socket);
                start = end + 1;
            }
        },
        sendData: function (text, socket) {
            var textBuffer = Buffer.from(text, "utf-8");
            var length = textBuffer.length;

            var wrappedBytes = Buffer.alloc(length + 2);
            wrappedBytes[0] = 0;
            textBuffer.copy(wrappedBytes, 1);
            wrappedBytes[wrappedBytes.length - 1] = 255;
            socket.write(wrappedBytes);
        }
    },
    tcp: {

        readData: function (data, socket, server) {

            var start = 0;
            if (socket.unread_data) {
                data = Buffer.concat([socket.unread_data, data], socket.unread_data.length + data.length);
                socket.unread_data = null;
            }
            let isread = false;
            while (start < data.length) {
                let length = data.readUInt8(start);
                let index = start + 1;
                if (length === 254) {
                    //不够读长度咋办
                    length = data.readUInt16BE(index);
                    index += 2;
                } else if (length === 255) {
                    length = data.readUInt32BE(index);
                    index += 4;
                }
                if (data.length < index + length) {
                    socket.unread_data = isread ? data.slice(start) : data;
                    return;
                }
                let msg = data.toString("utf8", index, index + length);

                isread = true;

                server.onTcpReceive(msg, socket);

                start = index + length;

            }
        },
        sendData: function (text, socket) {
            var textBuffer = Buffer.from(text);
            var length = textBuffer.length;
            var data;
            if (length < 254) {
                data = Buffer.alloc(length + 1);
                data.writeUInt8(length);
                textBuffer.copy(data, 1);
            }
            else if (length >= 254 && length < 65536) {
                data = Buffer.alloc(length + 3);
                data.writeUInt8(254);
                data.writeUInt16BE(length, 1);
                textBuffer.copy(data, 3);
            } else {
                data = Buffer.alloc(length + 5);
                data.writeUInt8(255);
                data.writeUInt32BE(length, 1);
                textBuffer.copy(data, 5);
            }
            socket.write(data);
        }
    }
};

function getNumber(str) {
    return str.replace(/\D/g, "");

}
function getSpace(str) {
    return str.replace(/\S/g, "").length;
}
function readHeader(data) {
    var header = {}, key, flag = 0;
    for (var i = 0; i < data.length; i++) {
        switch (data[i]) {
            case 0x0D://\r
                key && (header[key] = data.toString("utf8", flag, i));
                break;
            case 0x0A://

                key = null;
                flag = i + 1;
                break;
            case 0x3A://:
                if (!key) {
                    key = data.toString("utf8", flag, i);
                    data[i + 1] == 0x20 ? flag = i + 2 : flag = i + 1;
                }
                break;
        }
    }
    if (flag < data.length) {
        header.CONTENT = data.toString("utf8", flag);

    }
    return header;
}
var FrameTypes =
{
    Continuation: 0,
    Text: 1,
    Binary: 2,
    Close: 8,
    Ping: 9,
    Pong: 10,
};

//%x0 代表一个继续帧
//%x1 代表一个文本帧
//%x2 代表一个二进制帧
//%x3-7 保留用于未来的非控制帧
//%x8 代表连接关闭
//%x9 代表ping
//%xA 代表pong
//%xB-F 保留用于未来的控制帧
