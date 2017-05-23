// Copyright whogloo, inc. 2017. All Rights Reserved.
// Node module: @whogloo/nodespeed
// This file is licensed under the MIT License.
// License text available at https://opensource.org/licenses/MIT

const debug = require('debug')("nodespeed.config");
const changeCase = require('change-case');
const _ = require('lodash');
const _env = Symbol();
const path = require("path");
const version = require('../package.json').version;

/**
 * gracefully merge arrays
 *
 * @method customizer
 * @memberOf Config#
 * @access private
 *
 * @param {any} objValue target object to merge into
 * @param {any} srcValue source object to merge from
 */

let customizer = (objValue, srcValue) => {
    if (_.isArray(objValue)) {
        return objValue.concat(srcValue);
    }
};

/**
 * get all matching patterns from the environment and merge into config
 *
 * @method getEnvironment
 * @memberOf Config#
 * @access private
 *
 * @param {any} options the options to apply to the env
 * @return {any} data object containing the matching data
 */

let getEnvironment = ((options) => {
    let data = {};

    Object.keys(process.env).filter((key) => {

        if (options.whitelist.length) {
            return key.match(options.pattern) || options.whitelist.indexOf(key) !== -1;
        } else {
            return key.match(options.pattern);
        }
    }).sort().forEach((name) => {
        let key = changeCase[options.mode](name);
        let path = key.split(options.separator);

        if (options.shift) {
            path.shift();
        }

        _.setWith(data,path.join('.'),process.env[name],Object);
    });

    return data;
});

/**
 * try to load config.json from supplied folder
 *
 * @method loadConfigFile
 * @memberOf Config#
 * @access private
 *
 * @param {string} configDir the directory to load config.json from
 */

let loadConfigFile = ((configDir:string) => {
    debug("loading config.json from",configDir);

    try {
        let fileData =  require(path.join(configDir,'config.json'));
        return fileData.nodespeed ? fileData.nodespeed : fileData;
    }

    catch (e) {
        if (e.code === 'MODULE_NOT_FOUND') {
            debug("WARNING: unable to find config.json in %s",configDir);
        } else {
            debug("ERROR: unable to process config.json in %s",configDir,e);
        }

        return {};
    }
});

/**
 * Config Resource for nodespeed
 *
 * @constructor Config
 * @property {IConnector} connector the jira connector instance
 */

export class Config implements IConfig {

    directory:IDirectories;
    version:string;
    options:any;
    defaultModelDirectory:string

    constructor(suppliedOptions) {
        debug("instantiating Config class");

        let options = _.merge({},suppliedOptions);

        let env = options.env || {};

        this[_env] = {
            separator: env.separator || "_",
            pattern: env.pattern || "nodespeed",
            defaults: env.defaults || {},
            mode: env.mode || 'lowerCase',
            whitelist: env.whitelist || [],
            shift: ('shift' in env) ? env.shift : true
        };

        options.directory = {
            root: options.directory,
            dist: path.join(options.directory,'dist'),
            server: path.join(options.directory,'server'),
            models: path.join(options.directory,'server/models'),
            mixins: path.join(options.directory,'server/mixins'),
            forms: path.join(options.directory,'server/forms'),
            src: path.join(options.directory,'src')
        };

        delete options.env;

        this.version = version;

        _.merge(this,getEnvironment(this[_env]));

        // model: = this.directory.model || path.join(data.directory.server, './models');
        // application = data.directory.application || path.resolve(`${data.directory.server}/../src/${data.angularModule}`);
        // form = data.directory.form || path.join(data.directory.server, './forms');
        // dist = data.directory.dist || path.resolve(`${data.appRootDir}/dist`);
        // tmp = data.directory.tmp || path.resolve(`${data.appRootDir}/tmp`);
        // assets = data.directory.assets || data.directory.dist;
        // root = data.directory.root || data.appRootDir;

        let fileData = loadConfigFile(options.directory.server);

        _.merge(this,fileData);
        _.merge(this,options);
    }

    /**
     * reads a key from the config. The key may, or may not exist
     *
     * @method read
     * @memberOf Config#
     *
     * @param {string} key the key path to read
     * @return {any} value of the key
     */

    read (key:string):any {
        return _.get(this,key);
    }

    /**
     * writes a key to the config. The key path will be created if required
     *
     * @method write
     * @memberOf Config#
     *
     * @param {string} key the key path to write
     * @param {any} value the value to write to the key path
     */

    write (key:string, value:any):void {
        return _.set(this,key,value);
    }

    /**
     * loads a set of default keys, based on data passed in
     *
     * @method load
     * @memberOf Config#
     *
     * @param {any} data a set of data to store initially
     * @param {string} [configDir] the default server root directory
     */

    private load (data:any,configDir:string = null):void {

        data.appRootDir = data.appRootDir || configDir;

        let env = _.merge({},this[_env]);
        let envData = {};

        if (data.pattern) {
            env.pattern = data.pattern;
            delete data.pattern;
            envData = getEnvironment(env);
        }

        data.angularModule = data.angularModule || data.name;

        data.directory = data.directory || {};

        if (typeof data.directory === 'string') {
            let tmpDir = data.directory;
            data.directory = {
                server: tmpDir
            };
        }

        data.directory.server = data.directory.server || path.join(data.appRootDir, './server');

        data.directory.model = data.directory.model || path.join(data.directory.server, './models');
        data.directory.application = data.directory.application || path.resolve(`${data.directory.server}/../src/${data.angularModule}`);
        data.directory.form = data.directory.form || path.join(data.directory.server, './forms');
        data.directory.dist = data.directory.dist || path.resolve(`${data.appRootDir}/dist`);
        data.directory.tmp = data.directory.tmp || path.resolve(`${data.appRootDir}/tmp`);
        data.directory.assets = data.directory.assets || data.directory.dist;
        data.directory.mixins = data.directory.mixins || path.join(data.directory.server, './mixins');
        data.directory.root = data.directory.root || data.appRootDir;

        _.mergeWith(this,envData,data,customizer);

    }
}

