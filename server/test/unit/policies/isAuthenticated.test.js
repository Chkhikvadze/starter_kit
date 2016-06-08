/* global createDbBefore */
/* global locations */
var assert = require('chai').assert;
var httpMock = require(locations.mock + '/http');
var isAuthenticated = require(locations.policies + '/isAuthenticated');
var jwtService = require(locations.services + '/jwtService');
var appConfig = require(locations.config);
var User = require(locations.models + '/user');
var fixtures = require(locations.fixtures + '/index');
var notActiveUserResponse = require(locations.responses + '/notActiveUser'),
    okResponse = require(locations.responses + '/ok');



describe("policies:isAuthenticated", createDbBefore(function () {

    var valid_token;
    var invalid_token;
    var dbUser;

    before(function (done) {
        (new User(fixtures.users[0]))
            .save(function (err, user) {
                dbUser = user;
                valid_token = jwtService(appConfig.jwt).sign({ id: dbUser._id });
                invalid_token = valid_token + 'invalid';

                done(err);
            });
    });

    it("should reject next() callback", function (done) {
        var req = httpMock.createRequest({
            body: {
                access_token: valid_token
            }
        });
        var res = httpMock.createResponse();
        res.on('end', function () {

            assert.equal(notActiveUserResponse.status, res.statusCode, 'not calling next middleware');
            assert.notProperty(req, 'user', 'no user attached to req');

            done();
        }).on('error', done);
        isAuthenticated(req, res, function () {
            res.status(200).end();
        });
    });

    it("should call next() callback", function (done) {
        // activate user
        dbUser.account = { active: true };
        dbUser.save(function (err) {
            var req = httpMock.createRequest({
                body: {
                    access_token: valid_token
                }
            });
            var res = httpMock.createResponse();
            res.on('end', function () {

                assert.equal(okResponse.status, res.statusCode, 'not calling next middleware');
                assert.property(req, 'user', 'no user attached to req');

                done();
            }).on('error', done);

            isAuthenticated(req, res, function () {
                res.status(200).end();
            });
        });
    });


    it("should return unauthorized error", function (done) {
        var req = httpMock.createRequest({
            body: {
                access_token: invalid_token
            }
        });
        var res = httpMock.createResponse();
        res.on('end', function () {

            assert.notEqual(okResponse.status, res.statusCode, 'called next middleware, when invalid token');
            assert.notProperty(req, 'user', 'user attached to req, when invalid token');

            done();
        }).on('error', function (err) {
            done(err);
        });

        isAuthenticated(req, res, function () {
            res.status(200).end();
        });
    });
}));