/* global createDbBefore */
/* global locations */
var assert = require('chai').assert;
var Promise = require('bluebird');
var httpMock = require(locations.mock + '/http');
var User = require(locations.models + '/user');
var Role = require(locations.models + '/role');
var controller = require(locations.controllers + '/authentication/authController.v1');
var createdResponse = require(locations.responses + '/created'),
    notActiveUserResponse = require(locations.responses + '/notActiveUser'),
    okResponse = require(locations.responses + '/ok'),
    badRequestResponse = require(locations.responses + '/badRequest'),
    notFoundResponse = require(locations.responses + '/notFound');
var fixtures = require(locations.fixtures + '/index');


describe("controllers:AuthController", createDbBefore(function () {
    var access_token = '';

    it("should register new users", function (done) {
        Promise.map(fixtures.users, function (user) {
            return new Promise(function (resolve, reject) {
                var req = httpMock.createRequest({
                    body: user
                });
                var res = httpMock.createResponse();
                res.on('end', function () {
                    return resolve(res);
                }).on('error', function (err) {
                    return reject(err);
                });
                controller.sign_up(req, res);
            }).then(function (res) {
                assert.equal(createdResponse.status, res.statusCode);
                assert.isTrue(res._isJSON());
            });
        }).then(function () { done(); }).catch(done);
    });

    it("should reject login with just created users, but not active", function (done) {
        Promise.map(fixtures.users, function (user) {
            return new Promise(function (resolve, reject) {
                var req = httpMock.createRequest({
                    body: user
                });
                var res = httpMock.createResponse();
                res.on('end', function () {
                    return resolve(res);
                }).on('error', function (err) {
                    return reject(err);
                });
                controller.sign_in(req, res);
            }).then(function (res) {
                assert.equal(notActiveUserResponse.status, res.statusCode);
                assert.isTrue(res._isJSON());

                var result = JSON.parse(res._getData());
                assert.propertyVal(result, 'code', notActiveUserResponse.code, "not notActiveUser response");
                assert.notProperty(result.data, 'user', "user in response when fail");

                return result;
            });
        }).then(function (answers) { done(); }).catch(done);
    });

    it("should reject activation with faulty token", function (done) {
        new Promise(function (resolve, reject) {
            var req = httpMock.createRequest({
                body: {
                    token: "some dumb token"
                }
            });
            var res = httpMock.createResponse();
            res.on('end', function () {
                return resolve(res);
            }).on('error', function (err) {
                return reject(err);
            });
            controller.activate_account(req, res);
        }).then(function (res) {
            assert.equal(notFoundResponse.status, res.statusCode);
            assert.isTrue(res._isJSON());

            done();
        }).catch(done);
    });

    it("should activate just created users", function (done) {
        User.find().exec(function (err, users) {
            Promise.map(users, function (user) {
                return new Promise(function (resolve, reject) {
                    var req = httpMock.createRequest({
                        body: {
                            token: user.account.activationToken
                        }
                    });
                    var res = httpMock.createResponse();
                    res.on('end', function () {
                        return resolve(res);
                    }).on('error', function (err) {
                        return reject(err);
                    });
                    controller.activate_account(req, res);
                }).then(function (res) {
                    assert.equal(okResponse.status, res.statusCode);
                    assert.isTrue(res._isJSON());
                });
            }).then(function (answers) { done(); }).catch(done);
        });
    });

    it("should login with just created users", function (done) {
        Promise.map(fixtures.users, function (user) {
            return new Promise(function (resolve, reject) {
                var req = httpMock.createRequest({
                    body: user
                });
                var res = httpMock.createResponse();
                res.on('end', function () {
                    return resolve(res);
                }).on('error', function (err) {
                    return reject(err);
                });
                controller.sign_in(req, res);
            }).then(function (res) {
                assert.equal(okResponse.status, res.statusCode);
                assert.isTrue(res._isJSON());

                var result = JSON.parse(res._getData());
                assert.property(result.data, 'access_token', "no access token in response");
                assert.property(result.data, 'user', "no user in response");
                assert.equal(result.data.user.role, Role.ROLES.Researcher, "default role is not " + Role.ROLES.Researcher);

                return result;
            });
        }).then(function (answers) {
            access_token = answers[0].data.access_token;

            done();
        }).catch(done);
    });

    it("should be rejected after trying to signup with faulty users", function (done) {
        Promise.map(fixtures.faultyUsers, function (user) {
            return new Promise(function (resolve, reject) {
                var req = httpMock.createRequest({
                    body: user
                });
                var res = httpMock.createResponse();
                res.on('end', function () {
                    return resolve(res);
                }).on('error', function (err) {
                    return reject(err);
                });
                controller.sign_up(req, res);
            }).then(function (res) {
                assert.equal(badRequestResponse.status, res.statusCode);
                assert.isTrue(res._isJSON());

                var result = JSON.parse(res._getData());
                assert.notProperty(result.data, 'access_token');
                assert.notProperty(result.data, 'user');
            });
        }).then(function () { done(); }).catch(done);
    });

    it("should return error bad request for bad login", function (done) {
        new Promise(function (resolve, reject) {
            var req = httpMock.createRequest({
                body: {
                    email: 'my404email@gmail.com',
                    password: 'yeah'
                }
            });
            var res = httpMock.createResponse();
            res.on('end', function () {
                return resolve(res);
            }).on('error', function (err) {
                return reject(err);
            });
            controller.sign_in(req, res);
        }).then(function (res) {
            assert.equal(badRequestResponse.status, res.statusCode);
            assert.isTrue(res._isJSON());

            var result = JSON.parse(res._getData());
            assert.notProperty(result.data, 'access_token');
            assert.notProperty(result.data, 'user');
        }).then(function () { done(); }).catch(done);
    });

    it("should refresh token", function (done) {
        // we should wait a little bit to get a new token
        setTimeout(function () {

            new Promise(function (resolve, reject) {

                var req = httpMock.createRequest({
                    body: {
                        access_token: access_token
                    }
                });
                var res = httpMock.createResponse();
                res.on('end', function () {
                    return resolve(res);
                }).on('error', function (err) {
                    return reject(err);
                });
                controller.refresh_token(req, res);
            }).then(function (res) {
                assert.equal(okResponse.status, res.statusCode);
                assert.isTrue(res._isJSON());

                var result = JSON.parse(res._getData());
                assert.property(result.data, 'access_token', "no access token in response");
                assert.notEqual(result.data.access_token, access_token, "returned same access_token");
            }).then(function () { done(); }).catch(done);
        }, 1000);
    });
}));