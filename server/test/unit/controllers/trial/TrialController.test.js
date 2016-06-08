/* global createDbBefore */
/* global locations */
var assert = require('chai').assert;
var Promise = require('bluebird');
var httpMock = require(locations.mock + '/http');
var User = require(locations.models + '/user');
var Role = require(locations.models + '/role');
var Trial = require(locations.models + '/trial');
var controller = require(locations.controllers + '/trial/trialController.v1');
var createdResponse = require(locations.responses + '/created'),
    notActiveUserResponse = require(locations.responses + '/notActiveUser'),
    okResponse = require(locations.responses + '/ok'),
    badRequestResponse = require(locations.responses + '/badRequest'),
    notFoundResponse = require(locations.responses + '/notFound');
var fixtures = require(locations.fixtures + '/index');


describe("controllers:TrialController", createDbBefore(function () {
    var trial_id;
    var invalid_id = 'asdasdasdasdasdasdasdasd';

    it("should create trials", function (done) {
        Promise.map(fixtures.trials, function (trial) {
            return new Promise(function (resolve, reject) {
                var req = httpMock.createRequest({
                    body: trial
                });
                var res = httpMock.createResponse();
                res.on('end', function () {
                    return resolve(res);
                }).on('error', function (err) {
                    return reject(err);
                });
                controller.create(req, res);
            }).then(function (res) {
                var result = JSON.parse(res._getData());

                assert.equal(createdResponse.status, res.statusCode);
                assert.isTrue(res._isJSON());
                assert.isNotNull(result, 'no trial object returned');

                trial_id = result.data._id;
            });
        }).then(function () { done(); }).catch(done);
    });

    it("should not create faulty trials", function (done) {
        Promise.map(fixtures.faultytrials, function (trial) {
            return new Promise(function (resolve, reject) {
                var req = httpMock.createRequest({
                    body: trial
                });
                var res = httpMock.createResponse();
                res.on('end', function () {
                    return resolve(res);
                }).on('error', function (err) {
                    return reject(err);
                });
                controller.create(req, res);
            }).then(function (res) {
                assert.equal(badRequestResponse.status, res.statusCode);
                assert.isTrue(res._isJSON());
            });
        }).then(function () { done(); }).catch(done);
    });

    it('should return trial', function (done) {
        return new Promise(function (resolve, reject) {
            var req = httpMock.createRequest({
                params: {
                    trial_id: trial_id
                }
            });
            var res = httpMock.createResponse();
            res.on('end', function () {
                return resolve(res);
            }).on('error', function (err) {
                return reject(err);
            });
            controller.get(req, res);
        }).then(function (res) {
            var result = JSON.parse(res._getData());
            assert.equal(okResponse.status, res.statusCode);
            assert.isTrue(res._isJSON());

            assert.isNotNull(result.data, "error when update trial");
            done();
        }).catch(done);
    });

    it("should modify trial (set name & medication name & dosage)", function (done) {
        var newName = "modified trial name";
        var newMedicationName = "modified med name";
        var newDosageQuantity = 100;
        var newDosageRegularity = "every hour";

        return new Promise(function (resolve, reject) {
            var req = httpMock.createRequest({
                params: {
                    trial_id: trial_id
                },
                body: {
                    name: newName,
                    medication: {
                        name: newMedicationName,
                        dosage: {
                            quantity: newDosageQuantity,
                            regularity: newDosageRegularity
                        }
                    }
                }
            });
            var res = httpMock.createResponse();
            res.on('end', function () {
                return resolve(res);
            }).on('error', function (err) {
                return reject(err);
            });
            controller.update(req, res);
        }).then(function (res) {
            var result = JSON.parse(res._getData());
            assert.equal(okResponse.status, res.statusCode);
            assert.isTrue(res._isJSON());

            assert.isNotNull(result.data, "error when update trial");
            assert.equal(result.data.name, newName, "name not changed");
            assert.equal(result.data.medication.name, newMedicationName, "medication name not changed");
            assert.equal(result.data.medication.dosage.quantity, newDosageQuantity, "dosage quantity not changed");
            assert.equal(result.data.medication.dosage.regularity, newDosageRegularity, "dosage regulatiry not changed");

            done();
        }).catch(done);
    });

    it('should return trial (find_or_four0four)', function (done) {
        return new Promise(function (resolve, reject) {
            var req = httpMock.createRequest({
                params: {
                    trial_id: trial_id
                }
            });
            var res = httpMock.createResponse();
            res.on('end', function () {
                return resolve(res);
            }).on('error', function (err) {
                return reject(err);
            });
            controller.find_or_four0four(req, res, function (trial) {
                assert.isNotNull(trial, "no data returned");

                done();
            });
        }).then(function (res) {
            done(new Error("should not call response"));
        }).catch(done);
    });

    it('should return 404 (find_or_four0four)', function (done) {
        return new Promise(function (resolve, reject) {
            var req = httpMock.createRequest({
                params: {
                    trial_id: invalid_id
                }
            });
            var res = httpMock.createResponse();
            res.on('end', function () {
                return resolve(res);
            }).on('error', function (err) {
                return reject(err);
            });
            controller.find_or_four0four(req, res, function (trial) {
                done(new Error("should not next function"));

            });
        }).then(function (res) {
            assert.equal(notFoundResponse.status, res.statusCode);
            assert.isTrue(res._isJSON());

            done();
        }).catch(done);
    });

    it("should remove trial", function (done) {
        return new Promise(function (resolve, reject) {
            var req = httpMock.createRequest({
                params: {
                    trial_id: trial_id
                }
            });
            var res = httpMock.createResponse();
            res.on('end', function () {
                return resolve(res);
            }).on('error', function (err) {
                return reject(err);
            });
            controller.remove(req, res);
        }).then(function (res) {
            assert.equal(okResponse.status, res.statusCode);
            assert.isTrue(res._isJSON());

            done();
        }).catch(done);
    });
}));