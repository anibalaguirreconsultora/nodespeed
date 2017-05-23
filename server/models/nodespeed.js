'use strict';
const debug = require('debug')('nodespeed.model.nodespeed');

module.exports = function(Nodespeed) {

    /**
     * Returns information about the nodespeed instance
     * @param {Function(Error, object)} callback
     */
    Nodespeed.info = function(callback) {

      return Nodespeed.app.info(callback);
    };

    Nodespeed.dataDictionary = function(callback) {
      let models = Nodespeed.app.dictionary().models.filter((item) => { return !item.options.isSystemModel});

      return callback ? callback(null,models) : models;
    };

    Nodespeed.saveDataDictionary = function(data,callback) {

      if (!data || typeof data === 'function') {
        let err = new Error("invalid data");
        return callback ? callback(err) : Promise.reject(err);
      }

      if (!Array.isArray(data)) {
        let err = new Error("data must be a model array");
        return callback ? callback(err) : Promise.reject(err);
      }

      let promises = [];

      return new Promise((resolve,reject) => {

        data.forEach((model) => {
          promises.push(Nodespeed.app.dictionary().save.model(model));
        });

        Promise.all(promises).then(() => {
          return callback ? callback(null,{success:true}) : resolve();
        })

        .catch((e) => {
          return callback ? callback(e) : reject(e);
        });

      });

    };
};
