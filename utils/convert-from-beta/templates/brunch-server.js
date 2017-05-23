'user strict';
module.exports = function startServer(port, path, callback) {
    let app = require('./');

    app.once('started',(() => {
       callback(null,app.server);
    }).catch((e) => {
        console.log("error starting nodespeed",e);
        callback(e);
    }));
};
