var debug = require('debug')('api');

module.exports = function (app) {

    // register responses
    require('./responses').forEach(function (response) {
        app.use(response);
    });


    var controllers = [
        'authentication',
        'status',
        'profile',
		'trial'
    ];  
    // loop through all folders in api/controllers
    var controllers_root = '../api/controllers/';
    controllers.forEach(function (ctrl) {
        app.map(require(controllers_root + ctrl));
    });


    // catch 404
    app.use(function (req, res) {
        res.notFound();
    });

    // catch 5xx
    app.use(function (err, req, res, next) {
        debug(err);
        res.serverError();
    });

    // configure & connect to db  
    var mongoose = require('mongoose');
    mongoose.Promise = global.Promise; // set native promise
    mongoose.connect(app.get('configuration').database.connection);
};
