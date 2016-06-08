var mongoose = require('mongoose');
var Promise = require('bluebird');
var config = require('../../app/config');

module.exports = {
    initDB: initDB,
    removeDB: removeDB,
    users: require('./Users.json'),
    faultyUsers: require('./FaultyUsers.json'),
    trials: require('./Trials.json'),
    faultytrials: require('./FaultyTrials.json')
}


// Global beforeEach hook
function initDB(done) {
    mongoose.connect(config.database.connection, function (err) {
        // hack to create indexes for each open/close
        Promise.map(mongoose.modelNames(), function (name) {
            return new Promise(function (resolve, reject) {
                mongoose.model(name).ensureIndexes(function (err) {
                    if (err) reject(err); else resolve();
                });
            });
        }).then(function () { done(); }).catch(done);
    });
};

function removeDB(done) {
    // remove database
    mongoose.connection.db.dropDatabase(function (err) {
        mongoose.disconnect(done);
    });
};
