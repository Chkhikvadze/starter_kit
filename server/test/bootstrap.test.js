var path = require('path');
var fixtures = require('./fixtures/index');

// Global before hook
before(function (done) {
    // configure mongoose
    var mongoose = require('mongoose');
    mongoose.Promise = global.Promise; // set native promise
    
    done();
});

// Global after hook
after(function (done) {
    done();
});


// define global variables/methods
global.locations = {
    controllers: path.join(__dirname, '../app/api/controllers'),
    models:path.join(__dirname, '../app/api/models'),
    policies: path.join(__dirname, '../app/api/policies'),
    responses: path.join(__dirname, '../app/api/responses'),
    services: path.join(__dirname, '../app/api/services'),
    config: path.join(__dirname, '../app/config'),
    fixtures:path.join(__dirname, 'fixtures'),
    mock: path.join(__dirname, 'mock'),
};

global.createDbBefore = function (test) {
    return function () {
        before(fixtures.initDB);
        test();
        after(fixtures.removeDB);
    };
};