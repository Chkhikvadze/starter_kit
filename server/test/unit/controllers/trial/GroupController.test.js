/* global createDbBefore */
/* global locations */
var assert = require('chai').assert;
var Promise = require('bluebird');
var httpMock = require(locations.mock + '/http');
var User = require(locations.models + '/user');
var Role = require(locations.models + '/role');
var Trial = require(locations.models + '/trial');
var controller = require(locations.controllers + '/trial/groupController.v1');
var createdResponse = require(locations.responses + '/created'),
    notActiveUserResponse = require(locations.responses + '/notActiveUser'),
    okResponse = require(locations.responses + '/ok'),
    badRequestResponse = require(locations.responses + '/badRequest'),
    notFoundResponse = require(locations.responses + '/notFound'),
    conflictResponse = require(locations.responses + '/conflict');
var fixtures = require(locations.fixtures + '/index');

describe("controllers:GroupController", createDbBefore(function () {
    var trial_id;
    var patient_id;
    var group_label = 'test-group';
    var invalid_id = 'asdasdasdasdasdasdasdasd';

    before(function (done) {
        (new Trial(fixtures.trials[0])).save()
            .then(function (trial) {
                trial_id = trial._id;
                return (new User(fixtures.users[0])).save()
                    .then(function (patient) {
                        patient_id = patient._id;

                        return trial.add_patient(patient_id);
                    }).then(function (trial) {
                        return trial.save();
                    })
                    .then(function () {
                        done();
                    }).catch(done);
            });
    });

    it('should create sub group', function (done) {
        return new Promise(function (resolve, reject) {
            var req = httpMock.createRequest({
                params: {
                    trial_id: trial_id,
                    group_label: group_label
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

    it('should return created sub group', function (done) {
        return new Promise(function (resolve, reject) {
            var req = httpMock.createRequest({
                params: {
                    trial_id: trial_id,
                    group_label: group_label
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

            assert.isNotNull(result.data, "no result from response");
            done();
        }).catch(done);
    });

    it('should return trial\'s sub groups', function (done) {
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
            assert.isDefined(result.data.groups, "no groups property in result");
            done();
        }).catch(done);
    });

    it('should add patient to sub group', function (done) {
        return new Promise(function (resolve, reject) {
            var req = httpMock.createRequest({
                params: {
                    trial_id: trial_id,
                    group_label: group_label,
                    patient_id: patient_id
                }
            });
            var res = httpMock.createResponse();
            res.on('end', function () {
                return resolve(res);
            }).on('error', function (err) {
                return reject(err);
            });
            controller.add_patient(req, res);
        }).then(function (res) {
            var result = JSON.parse(res._getData());
            assert.equal(okResponse.status, res.statusCode);
            assert.isTrue(res._isJSON());

            assert.isNotNull(result.data, "no result from response");
            done();
        }).catch(done);
    });

    it('should return conflict when adding same patient to sub group', function (done) {
        return new Promise(function (resolve, reject) {
            var req = httpMock.createRequest({
                params: {
                    trial_id: trial_id,
                    group_label: group_label,
                    patient_id: patient_id
                }
            });
            var res = httpMock.createResponse();
            res.on('end', function () {
                return resolve(res);
            }).on('error', function (err) {
                return reject(err);
            });
            controller.add_patient(req, res);
        }).then(function (res) {
            assert.equal(conflictResponse.status, res.statusCode);
            assert.isTrue(res._isJSON());

            done();
        }).catch(done);
    });

    it('should return not found when adding unknown patient to sub group', function (done) {
        return new Promise(function (resolve, reject) {
            var req = httpMock.createRequest({
                params: {
                    trial_id: trial_id,
                    group_label: group_label,
                    patient_id: invalid_id
                }
            });
            var res = httpMock.createResponse();
            res.on('end', function () {
                return resolve(res);
            }).on('error', function (err) {
                return reject(err);
            });
            controller.add_patient(req, res);
        }).then(function (res) {
            assert.equal(notFoundResponse.status, res.statusCode);
            assert.isTrue(res._isJSON());

            done();
        }).catch(done);
    });

    it('should assign dosage to sub group\'s patients', function (done) {
        return new Promise(function (resolve, reject) {
            var req = httpMock.createRequest({
                params: {
                    trial_id: trial_id,
                    group_label: group_label
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

    it('should remove patient from sub group', function (done) {
        return new Promise(function (resolve, reject) {
            var req = httpMock.createRequest({
                params: {
                    trial_id: trial_id,
                    group_label: group_label,
                    patient_id: patient_id
                }
            });
            var res = httpMock.createResponse();
            res.on('end', function () {
                return resolve(res);
            }).on('error', function (err) {
                return reject(err);
            });
            controller.remove_patient(req, res);
        }).then(function (res) {
            var result = JSON.parse(res._getData());
            assert.equal(okResponse.status, res.statusCode);
            assert.isTrue(res._isJSON());

            assert.isNotNull(result.data, "no result from response");
            done();
        }).catch(done);
    });

    it('should remove sub group', function (done) {
        return new Promise(function (resolve, reject) {
            var req = httpMock.createRequest({
                params: {
                    trial_id: trial_id,
                    group_label: group_label
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