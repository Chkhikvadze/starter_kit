process.env.NODE_ENV = process.env.NODE_ENV || 'development';

var express = require('express');
var path = require('path');
var logger = require('morgan');
var bodyParser = require('body-parser');
var cors = require('cors');
var helmet = require('helmet');


var app = express();
app.use(cors());
app.use(helmet());
app.use(logger('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(express.static(path.join(__dirname, 'public')));

// load config
app.set('configuration', require('./config'));

// extend app for route object mapping
app.map = function (a, route) {
    route = route || '';
    for (var key in a) {
        if (Array.isArray(a[key])) {
            // get: [function(){ ... }]
            app[key](route, a[key]);
        } else if (typeof a[key] === 'object') {
            // { '/path': { ... }}
            app.map(a[key], route + key);
        } else if (typeof a[key] === 'function') { 
            // get: function(){ ... }
            app[key](route, a[key]);
        }
    }
};

// bootstrap api
require('./api')(app);

/*
// list all routes
app._router.stack.forEach(function (r) {
    if (r.route && r.route.path) {
        console.log(r.route.path)
    }
});
*/

module.exports = app;
