/* global createDbBefore */
/* global locations */
var assert = require('chai').assert;
var Promise = require('bluebird');
var httpMock = require(locations.mock + '/http');
var User = require(locations.models + '/user');
var Role = require(locations.models + '/role');
var Trial = require(locations.models + '/trial');
var controller = require(locations.controllers + '/trial/patientController.v1');
var createdResponse = require(locations.responses + '/created'),
    notActiveUserResponse = require(locations.responses + '/notActiveUser'),
    okResponse = require(locations.responses + '/ok'),
    badRequestResponse = require(locations.responses + '/badRequest'),
    notFoundResponse = require(locations.responses + '/notFound');
var fixtures = require(locations.fixtures + '/index');

describe("controllers:PatientController", createDbBefore(function () {
    var trial_id;
    var patient_id;
    var invalid_id = 'asdasdasdasdasdasdasdasd';

    before(function (done) {
        (new Trial(fixtures.trials[0])).save()
            .then(function (trial) {
                trial_id = trial._id;
                return (new User(fixtures.users[0])).save();
            })
            .then(function (patient) {
                patient_id = patient._id;
                done();
            }).catch(done);
    });

    it('should add patient to trial', function (done) {
        return new Promise(function (resolve, reject) {
            var req = httpMock.createRequest({
                params: {
                    trial_id: trial_id,
                    patient_id: patient_id
                }
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

            assert.isNotNull(result.data, "no result from response");
            done();
        }).catch(done);
    });

    it('should return patients for trial', function (done) {
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
            controller.read(req, res);
        }).then(function (res) {
            var result = JSON.parse(res._getData());
            assert.equal(okResponse.status, res.statusCode);
            assert.isTrue(res._isJSON());
            assert.isNotNull(result.data, "no result from response");
            assert.isDefined(result.data.patients, 'no patients returned');
            assert.isArray(result.data.patients, 'patients property should be array');
            assert.isDefined(result.data.patients[0].user.username, 'patients property should be populated with users');

            done();
        }).catch(done);
    });

    it('should return not found, when invalid trial id', function (done) {
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
            controller.read(req, res);
        }).then(function (res) {
            assert.equal(notFoundResponse.status, res.statusCode);
            assert.isTrue(res._isJSON());

            done();
        }).catch(done);
    });

    it('should assign dosage to patient', function (done) {
        return new Promise(function (resolve, reject) {
            var req = httpMock.createRequest({
                params: {
                    trial_id: trial_id,
                    patient_id: patient_id
                },
                body: {
                    dosage: {
                        quantity: 1,
                        regularity: 'every day'
                    }
                }
            });
            var res = httpMock.createResponse();
            res.on('end', function () {
                return resolve(res);
            }).on('error', function (err) {
                return reject(err);
            });
            controller.dosage(req, res);
        }).then(function (res) {
            var result = JSON.parse(res._getData());
            assert.equal(okResponse.status, res.statusCode);
            assert.isTrue(res._isJSON());
            assert.isNotNull(result.data, "no result from response");

            done();
        }).catch(done);
    });

    it('should remove patient from trial', function (done) {
        return new Promise(function (resolve, reject) {
            var req = httpMock.createRequest({
                params: {
                    trial_id: trial_id,
                    patient_id: patient_id
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
            var result = JSON.parse(res._getData());
            assert.equal(okResponse.status, res.statusCode);
            assert.isTrue(res._isJSON());

            assert.isNotNull(result.data, "no result from response");
            done();
        }).catch(done);
    });
}));