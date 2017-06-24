"use strict";
// Copyright whogloo, inc. 2017. All Rights Reserved.
// Node module: @whogloo/nodespeed
// This file is licensed under the MIT License.
// License text available at https://opensource.org/licenses/MIT
Object.defineProperty(exports, "__esModule", { value: true });
const config_1 = require("./config");
const schema_1 = require("../schema");
const path = require('path');
const fs = require('fs');
const moduleAlias = require('module-alias');
let setAlias = (module) => {
    let modPath = path.join(__dirname, `../node_modules/${module}`);
    if (fs.existsSync(modPath)) {
        moduleAlias.addAlias(module, modPath);
    }
};
setAlias('loopback-boot');
const debug = require('debug')('nodespeed.server');
const loopback = require('loopback');
setAlias('loopback/lib');
moduleAlias.addAlias('loopback', path.join(__dirname, '../'));
const callsite = require('callsite');
const finder = require('find-package-json');
const _ = require('lodash');
const lbBoot = require('loopback-boot');
const loadJsonFile = require('load-json-file');
/**
 * Nodespeed class constructor
 */
class Nodespeed {
    /**
     * Nodespeed class constructor
     */
    constructor(options) {
        this.name = 'foobar';
        this.originalApp = Symbol();
        this._loopback = Symbol();
        this.boot = (...args) => {
            let app = this.app;
            if (typeof args[0] === 'function') {
                args.shift();
            }
            let callback = ((typeof args[args.length - 1]) === 'function') ? args.pop() : null;
            if (!args || args.length === 0) {
                throw new Error("either a directory or object must be passed into the boot function");
            }
            let options = args[0] || {};
            if (typeof options === 'string') {
                options = { appRootDir: options };
            }
            try {
                options.models = loadJsonFile.sync(path.join(options.appRootDir, '/model-config.json'));
            }
            catch (e) {
                options.models = {};
            }
            options.models._meta = options.models._meta || {};
            options.models._meta.sources = options.models._meta.sources || [];
            options.models._meta.sources.push(path.join(__dirname, 'models'));
            options.models.Nodespeed = { "dataSource": "Nodespeed", "public": true };
            this.config.options = JSON.parse(JSON.stringify(options));
            this.config.defaultModelDirectory = path.join(this.config.options.appRootDir, '/models');
            this.app.set('defaultModelDirectory', this.config.defaultModelDirectory);
            return new Promise((resolve, reject) => {
                try {
                    lbBoot._nodespeedBoot(app, options, function (err) {
                        if (err) {
                            return reject(err.message);
                        }
                        app.emit('booted');
                        return callback ? callback(err) : err ? reject(err) : resolve();
                    });
                }
                catch (e) {
                    console.log("err", e, callback);
                    return callback ? callback(e) : reject(e.message);
                }
            });
        };
        this.start = (...args) => {
            let app = this.app;
            return new Promise((resolve, reject) => {
                app.once('started', () => {
                    return resolve(this.server);
                });
                this.server = app.listen(() => {
                    let baseUrl = app.get('url').replace(/\/$/, '');
                    console.log('Web server listening at: %s', baseUrl);
                    if (app.get('loopback-component-explorer')) {
                        let explorerPath = app.get('loopback-component-explorer').mountPath;
                        console.log('Browse your REST API at %s%s', baseUrl, explorerPath);
                    }
                    app.emit('started');
                });
                let io = require('socket.io')(this.server, { path: '/nodespeed.io' });
                io.on('connection', function (socket) {
                    debug('user connected');
                    socket.on('joinChannel', function (data) {
                        debug('joining channel: ' + data);
                        socket.join(data.channel);
                    });
                    socket.on('leaveChannel', function (data) {
                        debug('leaving channel: ' + data);
                        socket.leave(data.channel);
                    });
                    socket.on('disconnect', function () {
                        debug('user disconnected');
                    });
                });
                app.use(app.get('restApiRoot'), this.loopback.rest());
                app.use(this.loopback.static(path.resolve(this.config.directory.dist)));
            });
        };
        this.info = (callback) => {
            let result = {
                version: lbHandler.version,
                dataSources: Object.keys(this.app.dataSources).map((k) => this.app.dataSources[k].settings),
                authentication: {
                    domain: '',
                    id: '',
                    source: ''
                }
            };
            return callback ? callback(null, result) : result;
        };
        this.dictionary = (callback) => {
            let result = this.schema.dictionary;
            return callback ? callback(null, result) : result;
        };
        this[this.originalApp] = loopback({ localRegistry: true, loadBuiltinModels: true });
        this[this._loopback] = loopback;
        this.app = new Proxy(this[this.originalApp], this);
        this.config = new config_1.Config(options);
        this.loopback = lbProxy;
        this.schema = new schema_1.Schema(this.app);
        this.app.dataSource("Nodespeed", {
            connector: lbProxy.Memory,
            name: 'Nodespeed'
        });
        this.app.dataSource("Mem", {
            connector: lbProxy.Memory,
            name: 'Mem'
        });
        this.app.dataSource("db", {
            connector: lbProxy.Memory,
            name: 'db'
        });
        debug("instantiating Nodespeed class");
        return this.app;
    }
    _get(...args) {
        return this[this.originalApp].get(...args);
    }
    // loopback has a "get" method to retrieve properties - this conflicts with the "get" proxy trap, so we have to get a little inventive ..
    get(target, name, receiver) {
        return name === "get" ? this._get : Nodespeed[name] ? Nodespeed[name]
            : this[name] ? this[name]
                : Reflect.get(target, name, receiver);
    }
}
let lbHandler = (options) => {
    return new Nodespeed(options);
};
lbHandler.version = require('loopback/package').version;
lbHandler.createModel = (...args) => {
    return loopback.createModel(...args);
};
lbHandler.findModel = (...args) => {
    return loopback.findModel(...args);
};
lbHandler.get = (target, name, receiver) => {
    return lbHandler[name] ? lbHandler[name] : Reflect.get(target, name, receiver);
};
lbHandler.apply = function (target, thisArg, argumentsList) {
    let options = argumentsList[0] || {};
    if (typeof options === "string") {
        options = { directory: options };
    }
    if (!options.directory) {
        let requester = callsite()[1].getFileName();
        options.directory = path.dirname(finder(requester).next().value.__path);
    }
    return lbHandler(options);
};
lbHandler.construct = (target, argumentsList, newTarget) => {
    return lbHandler(argumentsList[0]);
};
let lbProxy = new Proxy(loopback, lbHandler);
module.exports = lbProxy;
