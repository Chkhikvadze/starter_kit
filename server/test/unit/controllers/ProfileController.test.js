/* global createDbBefore */
/* global locations */
var assert = require('chai').assert;
var Promise = require('bluebird');
var httpMock = require(locations.mock + '/http');
var User = require(locations.models + '/user');
var controller = require(locations.controllers + '/profile/profileController.v1');
var createdResponse = require(locations.responses + '/created'),
    notActiveUserResponse = require(locations.responses + '/notActiveUser'),
    okResponse = require(locations.responses + '/ok'),
    badRequestResponse = require(locations.responses + '/badRequest'),
    notFoundResponse = require(locations.responses + '/notFound');
var fixtures = require(locations.fixtures + '/index');


describe("controllers:ProfileController", createDbBefore(function () {
    var dbUser;

    before(function (done) {
        User.create(fixtures.users[0], function (err, user) {
            dbUser = user;

            done(err);
        });
    });


    it("should get user profile", function (done) {
        return new Promise(function (resolve, reject) {
            var req = httpMock.createRequest({
                body: {}
            });
            req.user = dbUser;

            var res = httpMock.createResponse();
            res.on('end', function () {
                return resolve(res);
            }).on('error', function (err) {
                return reject(err);
            });
            controller.me(req, res);
        }).then(function (res) {
            assert.equal(okResponse.status, res.statusCode);
            assert.isTrue(res._isJSON());

            var result = JSON.parse(res._getData());
            assert.property(result.data, 'profile', "no profile in response");
            assert.property(result.data.profile, 'firstName', "no firstName in response");
            assert.property(result.data.profile, 'lastName', "no lastName in response");
            assert.notProperty(result.data, '_id', "user _id in response");
            assert.notProperty(result.data, 'password', "user password in response");

            done();
        }).catch(done);
    });


    it("should update user profile", function (done) {
        return new Promise(function (resolve, reject) {
            var req = httpMock.createRequest({
                body: {
                    firstName: 'test update firstname',
                    lastName: 'test update lastname'
                }
            });
            req.user = dbUser;

            var res = httpMock.createResponse();
            res.on('end', function () {
                return resolve(res);
            }).on('error', function (err) {
                return reject(err);
            });
            controller.save(req, res);
        }).then(function (res) {
            assert.equal(okResponse.status, res.statusCode);
            assert.isTrue(res._isJSON());

            var result = JSON.parse(res._getData());
            assert.property(result.data, 'profile', "no profile in response");
            assert.property(result.data.profile, 'firstName', "no firstName in response");
            assert.property(result.data.profile, 'lastName', "no lastName in response");
            assert.notProperty(result.data, '_id', "user _id in response");
            assert.notProperty(result.data, 'password', "user password in response");

            assert.equal(result.data.profile.firstName, 'test update firstname', "do not update firstName")
            assert.equal(result.data.profile.lastName, 'test update lastname', "do not update lastName")

            done();
        }).catch(done);
    });
}));