'use strict';

var Nodespeed = require('@whogloo/nodespeed');

var app = module.exports = Nodespeed();

app.boot(__dirname,(err) => {

    if (err) {
        throw (err);
    }

    if (require.main === module) {
        app.start();
    }
}).catch((e) => {});