/* global locations */
/* global createDbBefore */
var assert = require('chai').assert;
var Promise = require('bluebird');
var User = require(locations.models + '/user');
var fixtures = require(locations.fixtures + '/index');


describe("models:User", createDbBefore(function () {
    var dbUser;

    it("should create users", function (done) {
        Promise.map(fixtures.users, function (user) {
            return new Promise(function (resolve, reject) {
                (new User(user)).save()
                    .then(function(savedUser){
                        assert.isNotNull(savedUser, "created user is null");
                        assert.equal(savedUser.username, user.username, "username not saved as it was passed");
                        assert.equal(savedUser.email, user.email, "email not saved as it was passed");
                        assert.equal(savedUser.profile.firstName, user.profile.firstName, "firstName not saved as it was passed");
                        assert.equal(savedUser.profile.lastName, user.profile.lastName, "lastName not saved as it was passed");
                        assert.equal(savedUser.profile.avatar, user.profile.avatar, "avatar not saved as it was passed");
                        
                        resolve(savedUser);
                    }).catch(reject);
            });
        }).then(function (res) {
            dbUser = res[0];
            done();
        }).catch(done);
    });

    it("should not create users", function (done) {
        Promise.map(fixtures.faultyUsers, function (user) {
            return new Promise(function (resolve, reject) {
                (new User(user)).save(function (err, res) {

                    assert.isUndefined(res, "user should not be created");
                    assert.equal(err.name, "ValidationError", "throws not a validation error");

                    resolve();
                });
            });
        }).then(function () { done(); }).catch(done);
    });

    it("should modify user (set active and change firstname and lastname)", function (done) {
        var firstNameSuffix = '-first-suffix';
        var lastNameSuffix = '-last-suffix';
        User.find().then(function (users) {

            Promise.map(users, function (user) {
                return new Promise(function (resolve, reject) {
                    user.profile.firstName += firstNameSuffix;
                    user.profile.lastName += lastNameSuffix;
                    user.account.active = true;
                    user.save(function (err, res) {
                        assert.isNull(err, "error when update user");
                        assert.include(res.profile.firstName, firstNameSuffix, "user's firstName not changed");
                        assert.include(res.profile.lastName, lastNameSuffix, "user's lastName not changed");
                        assert.isTrue(res.account.active, "user not activated");

                        resolve();
                    });
                });
            }).then(function () { done(); }).catch(done);

        }).catch(function (err) {
            done(err);
        });
    });

    it("tojson() should not include sensitive data", function (done) {
        var data = dbUser.toJSON();

        assert.notProperty(data, 'password', 'includes password property');
        assert.notProperty(data, '_id', 'includes _id property');
        assert.notProperty(data, 'account', 'includes account property');

        done();
    });

    it("validate unique username", function (done) {
        var newUser = new User({
            username: dbUser.username,
            email: 'someother@mail.com',
            password: 'pwd'
        });

        newUser.save(function (err) {
            assert.isNotNull(err, "no validation error returned");
            assert.include(err.message, 'duplicate', 'not duplicate validation failed');
            assert.include(err.message, 'username', 'not username validation failed');
            done();
        });
    });

    it("validate required username", function (done) {
        var newUser = new User({
            email: 'someother@mail.com',
            password: 'pwd'
        });
        newUser.save(function (err) {

            assert.isNotNull(err, "no validation error returned");
            assert.isNotNull(err.errors.username, "not username validation failed");
            assert.equal(err.errors.username.kind, 'required', "not required constraint failed");
            done();
        });
    });

    it("validate unique email", function (done) {
        var newUser = new User({
            username: 'someotherusername',
            email: dbUser.email,
            password: 'pwd'
        });
        newUser.save(function (err) {

            assert.isNotNull(err, "no validation error returned");
            assert.include(err.message, 'duplicate', 'not duplicate validation failed');
            assert.include(err.message, 'email', 'not username validation failed');
            done();
        });
    });

    it("validate required email", function (done) {
        var newUser = new User({
            username: 'someotherusername',
            password: 'pwd'
        });
        newUser.save(function (err) {

            assert.isNotNull(err, "no validation error returned");
            assert.isNotNull(err.errors.email, "not email validation failed");
            assert.equal(err.errors.email.kind, 'required', "not required constraint failed");
            done();
        });
    });

    it("validate email format", function (done) {
        var newUser = new User({
            username: 'someotherusername',
            email: 'someothermailcom',
            password: 'pwd'
        });
        newUser.save(function (err) {

            assert.isNotNull(err, "no validation error returned");
            assert.isNotNull(err.errors.email, "not email validation failed");
            assert.equal(err.errors.email.kind, 'regexp', "not email constraint failed");
            done();
        });
    });

    it("should remove all users", function (done) {
        User.find().then(function (users) {

            Promise.map(users, function (user) {
                return new Promise(function (resolve, reject) {
                    user.remove(function (err, res) {
                        assert.isNull(err, "error when removing user");
                        resolve();
                    });
                });
            }).then(function () {
                User.count(function (err, quantity) {
                    assert.equal(quantity, 0, "some users still exists in db");

                    done();
                });
            }).catch(done);

        }).catch(function (err) {
            done(err);
        });
    });
}));