
const authToken = require('./auth-token');
module.exports = {
    max_idcount: 10,
    max_ipcount: 12,
    login_error: function (user, msg, close = true) {
        user.send(`{type:'loginerror',msg:'${msg}'}`);
        if (close)
            user.socket?.end();
        return false;
    },
    encryptUser: function (key, session) {
        return authToken.verify(session);
    }
};
