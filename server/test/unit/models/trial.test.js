/* global locations */
/* global createDbBefore */
var assert = require('chai').assert;
var Promise = require('bluebird');
var User = require(locations.models + '/user');
var Trial = require(locations.models + '/trial');
var errors = require(locations.models + '/errors/index');
var fixtures = require(locations.fixtures + '/index');


describe("models:Trial", createDbBefore(function () {
    var adminUser;
    var patientUser;
    var testTrial;
    var testGroupLabel = 'Test Group';
    var testPatientDosage = { quantity: 100, regularity: "every hour" };
    var testGroupDosage = { quantity: 300, regularity: "every day" };

    before(function (done) {
        Promise.map(fixtures.users, function (user) {
            return new Promise(function (resolve, reject) {
                new User(user).save().then(resolve).catch(reject);
            });
        }).then(function (savedUsers) {
            adminUser = savedUsers[0];
            patientUser = savedUsers[1];

            done();
        }).catch(done);
    });

    it("should create trials", function (done) {
        Promise.map(fixtures.trials, function (trial) {
            return new Promise(function (resolve, reject) {
                (new Trial(trial)).save()
                    .then(function (savedTrial) {
                        assert.isNotNull(savedTrial, "created trial is null");
                        assert.equal(savedTrial.name, trial.name, "name not saved as it was passed");
                        assert.isNotNull(savedTrial.medication, "medication not saved");
                        assert.equal(savedTrial.medication.name, trial.medication.name, "medication name not saved as it was passed");
                        assert.isNotNull(savedTrial.medication.dosage, "medication default dosage not saved");
                        assert.equal(savedTrial.medication.dosage.quantity, trial.medication.dosage.quantity, "dosage quantity not saved as it was passed");
                        assert.equal(savedTrial.medication.dosage.regularity, trial.medication.dosage.regularity, "dosage regularity not saved as it was passed");

                        resolve(savedTrial);
                    }).catch(reject);
            });
        }).then(function (res) {
            testTrial = res[0];

            done();
        }).catch(done);
    });

    it("should not create faulty trials", function (done) {
        Promise.map(fixtures.faultytrials, function (trial) {
            return new Promise(function (resolve, reject) {
                (new Trial(trial)).save(function (err, res) {

                    assert.isUndefined(res, "trial should not be created");
                    assert.equal(err.name, "ValidationError", "throws not a validation error");

                    resolve();
                });
            });
        }).then(function () { done(); }).catch(done);
    });

    it("should modify trial (set name & medication name & dosage)", function (done) {
        var newName = "modified trial name";
        var newMedicationName = "modified med name";
        var newDosageQuantity = 100;
        var newDosageRegularity = "every hour";

        return new Promise(function (resolve, reject) {
            testTrial.name = newName;
            testTrial.medication.name = newMedicationName;
            testTrial.medication.dosage.quantity = newDosageQuantity;
            testTrial.medication.dosage.regularity = newDosageRegularity;

            testTrial.save()
                .then(function (savedTrial) {
                    assert.isNotNull(savedTrial, "error when update trial");
                    assert.equal(savedTrial.name, newName, "name not changed");
                    assert.equal(savedTrial.medication.name, newMedicationName, "medication name not changed");
                    assert.equal(savedTrial.medication.dosage.quantity, newDosageQuantity, "dosage quantity not changed");
                    assert.equal(savedTrial.medication.dosage.regularity, newDosageRegularity, "dosage regulatiry not changed");

                    resolve(savedTrial);
                }).catch(reject);
        }).then(function () { done(); }).catch(done);
    });

    it("should add administrator", function (done) {
        var expected = testTrial.administrators.length + 1;

        testTrial.add_administrator(adminUser.id)
            .then(function (trial) {
                assert.isNotNull(trial, "trial is null");
                assert.lengthOf(trial.administrators, expected, "administrators array not modified");

                trial.save().
                    then(function (savedTrial) {
                        assert.isNotNull(savedTrial, "trial is null after save");
                        assert.lengthOf(savedTrial.administrators, expected, "administrators array not modified after save");

                        done();
                    }).catch(done);
            }).catch(done);
    });

    it("should throw duplicate error, when adding same administrator", function (done) {
        var expected = testTrial.administrators.length;

        testTrial.add_administrator(adminUser.id)
            .then(function (trial) {
                done(new Error("should not call resolve when duplicate error"));
            }).catch(function (err) {
                assert.instanceOf(err, errors.DuplicateFoundError, "not duplicate error");
                assert.lengthOf(testTrial.administrators, expected, "administrators field should not be modified");

                done();
            });
    });

    it("should add patient", function (done) {
        var expected = testTrial.patients.length + 1;

        testTrial.add_patient(patientUser.id)
            .then(function (trial) {
                assert.isNotNull(trial, "trial is null");
                assert.lengthOf(trial.patients, expected, "patients array not modified");

                trial.save().
                    then(function (savedTrial) {
                        assert.isNotNull(savedTrial, "trial is null after save");
                        assert.lengthOf(savedTrial.patients, expected, "patients array not modified after save");

                        done();
                    }).catch(done);
            }).catch(done);
    });

    it("should throw duplicate error, when adding same patient", function (done) {
        var expected = testTrial.patients.length;

        testTrial.add_patient(patientUser.id)
            .then(function (trial) {
                done(new Error("should not call resolve when duplicate error"));
            }).catch(function (err) {
                assert.instanceOf(err, errors.DuplicateFoundError, "not duplicate error");
                assert.lengthOf(testTrial.patients, expected, "patients field should not be modified");
                done();
            });
    });

    it("should add subgroup", function (done) {
        var expected = testTrial.groups.length + 1;

        testTrial.add_subgroup(testGroupLabel)
            .then(function (trial) {
                assert.isNotNull(trial, "trial is null");
                assert.lengthOf(trial.groups, expected, "groups array not modified");

                trial.save().
                    then(function (savedTrial) {
                        assert.isNotNull(savedTrial, "trial is null after save");
                        assert.lengthOf(savedTrial.groups, expected, "groups array not modified after save");

                        done();
                    }).catch(done);
            }).catch(done);
    });

    it("should throw duplicate error, when adding same subgroup", function (done) {
        var expected = testTrial.groups.length;

        testTrial.add_subgroup(testGroupLabel)
            .then(function (trial) {
                done(new Error("should not call resolve when duplicate error"));
            }).catch(function (err) {
                assert.instanceOf(err, errors.DuplicateFoundError, "not duplicate error");
                assert.lengthOf(testTrial.groups, expected, "groups field should not be modified");
                done();
            });
    });

    it("should assign pacient to group", function (done) {
        testTrial.get_subgroup(testGroupLabel).then(function (group) {
            var expected = group.patients.length + 1;

            testTrial.assign_patient_to_subgroup(patientUser.id, testGroupLabel)
                .then(function (trial) {
                    assert.isNotNull(trial, "trial is null");
                    assert.lengthOf(group.patients, expected, "group patients array not modified");

                    trial.save().
                        then(function (savedTrial) {
                            savedTrial.get_subgroup(testGroupLabel).then(function (savedGroup) {
                                assert.isNotNull(savedGroup, "group is null after save");
                                assert.lengthOf(savedGroup.patients, expected, "group patients array not modified after save");

                                done();
                            }).catch(done)
                        }).catch(done);
                }).catch(done);
        }).catch(done);
    });

    it("should throw patient not found error", function (done) {
        testTrial.get_subgroup(testGroupLabel).then(function (group) {
            var expected = group.patients.length;

            testTrial.assign_patient_to_subgroup(adminUser.id, testGroupLabel)
                .then(function (trial) {
                    done(new Error("should not call resolve when patient not found"));
                }).catch(function (err) {
                    assert.instanceOf(err, errors.TrialPatientNotFoundError, "different error was thrown");
                    assert.lengthOf(group.patients, expected, "group patients array modified when error");

                    done();
                });
        }).catch(done);
    });

    it("should throw sub group not found error", function (done) {
        testTrial.get_subgroup(testGroupLabel).then(function (group) {
            var expected = group.patients.length;

            testTrial.assign_patient_to_subgroup(patientUser.id, testGroupLabel + 'notexist')
                .then(function (trial) {
                    done(new Error("should not call resolve when sub group not found"));
                }).catch(function (err) {
                    assert.instanceOf(err, errors.TrialSubGroupNotFoundError, "different error was thrown");
                    assert.lengthOf(group.patients, expected, "group patients array modified when error");

                    done();
                });
        }).catch(done);
    });

    it("should throw duplicate patient error", function (done) {
        testTrial.get_subgroup(testGroupLabel).then(function (group) {
            var expected = group.patients.length;

            testTrial.assign_patient_to_subgroup(patientUser.id, testGroupLabel)
                .then(function (trial) {
                    done(new Error("should not call resolve when assigning duplicate patient"));
                }).catch(function (err) {
                    assert.instanceOf(err, errors.DuplicateFoundError, "different error was thrown");
                    assert.lengthOf(group.patients, expected, "group patients array modified when error");

                    done();
                });
        }).catch(done);
    });

    it("should throw not both param error", function (done) {
        testTrial.set_dosage(testGroupLabel, patientUser.id, testGroupDosage)
            .then(function (trial) {
                done(new Error("should no resolve when both group and patient are provided"));
            }).catch(function (err) {
                done();
            });
    });

    it("should throw not found error", function (done) {
        testTrial.set_dosage(null, null, testGroupDosage)
            .then(function (trial) {
                done(new Error("should no resolve when required params not provided"));
            }).catch(function (err) {
                assert.instanceOf(err, errors.NotFoundError, "different error was thrown");

                done();
            });
    });

    it("should assign dosage to patient", function (done) {
        testTrial.set_dosage(null, patientUser.id, testPatientDosage)
            .then(function (trial) {
                assert.isNotNull(trial, "trial is null");

                trial.get_patient(patientUser.id)
                    .then(function (patient) {
                        assert.isNotNull(patient, "patient is null");
                        assert.property(patient, 'dosage', "no dosage");
                        assert.equal(patient.dosage.quantity, testPatientDosage.quantity, "dosage quantity not equal");
                        assert.equal(patient.dosage.regularity, testPatientDosage.regularity, "dosage regularity not equal");

                        // save
                        trial.save().then(function (savedTrial) {
                            return savedTrial.get_patient(patientUser.id);
                        }).then(function (savedPatient) {
                            assert.isNotNull(savedPatient, "patient is null, after save");
                            assert.property(savedPatient, 'dosage', "no dosage, after save");
                            assert.equal(savedPatient.dosage.quantity, testPatientDosage.quantity, "dosage quantity not equal, after save");
                            assert.equal(savedPatient.dosage.regularity, testPatientDosage.regularity, "dosage regularity not equal, after save");

                            done();
                        }).catch(done);
                    }).catch(done);
            }).catch(done);
    });

    it("should assign dosage to group patients", function (done) {
        testTrial.set_dosage(testGroupLabel, null, testGroupDosage)
            .then(function (trial) {
                assert.isNotNull(trial, "trial is null");

                trial.get_subgroup(testGroupLabel)
                    .then(function (group) {
                        var get_patients_promises = group.patients.map(function (elem) {
                            return trial.get_patient(elem.user);
                        });

                        Promise.all(get_patients_promises).then(function (patients) {
                            patients.forEach(function (patient) {
                                assert.isNotNull(patient, "patient is null");
                                assert.property(patient, 'dosage', "no dosage");
                                assert.equal(patient.dosage.quantity, testGroupDosage.quantity, "dosage quantity not equal");
                                assert.equal(patient.dosage.regularity, testGroupDosage.regularity, "dosage regularity not equal");
                            });

                            // save
                            trial.save().then(function (savedTrial) {
                                var get_patients_promises = group.patients.map(function (elem) {
                                    return savedTrial.get_patient(elem.user);
                                });
                                return Promise.all(get_patients_promises);
                            }).then(function (savedPatients) {
                                savedPatients.forEach(function (savedPatient) {
                                    assert.isNotNull(savedPatient, "patient is null, after save");
                                    assert.property(savedPatient, 'dosage', "no dosage, after save");
                                    assert.equal(savedPatient.dosage.quantity, testGroupDosage.quantity, "dosage quantity not equal, after save");
                                    assert.equal(savedPatient.dosage.regularity, testGroupDosage.regularity, "dosage regularity not equal, after save");
                                });
                                // success
                                done();
                            }).catch(done);
                        });
                    }).catch(done);
            });
    });

    it("should throw patient not found error", function (done) {
        testTrial.get_subgroup(testGroupLabel).then(function (group) {
            var expected = group.patients.length;

            testTrial.remove_patient_from_subgroup(adminUser.id, testGroupLabel)
                .then(function (trial) {
                    done(new Error("should not call resolve when patient not found"));
                }).catch(function (err) {
                    assert.instanceOf(err, errors.TrialPatientNotFoundError, "different error was thrown");
                    assert.lengthOf(group.patients, expected, "group patients array modified when error");

                    done();
                });
        }).catch(done);
    });

    it("should throw sub group not found error", function (done) {
        testTrial.get_subgroup(testGroupLabel).then(function (group) {
            var expected = group.patients.length;

            testTrial.remove_patient_from_subgroup(patientUser.id, testGroupLabel + 'notexist')
                .then(function (trial) {
                    done(new Error("should not call resolve when sub group not found"));
                }).catch(function (err) {
                    assert.instanceOf(err, errors.TrialSubGroupNotFoundError, "different error was thrown");
                    assert.lengthOf(group.patients, expected, "group patients array modified when error");

                    done();
                });
        }).catch(done);
    });

    it("should remove patient from subgroup", function (done) {
        testTrial.get_subgroup(testGroupLabel).then(function (group) {
            var expected = group.patients.length - 1;

            testTrial.remove_patient_from_subgroup(patientUser.id, testGroupLabel)
                .then(function (trial) {
                    assert.isNotNull(trial, "trial is null");
                    assert.lengthOf(group.patients, expected, "group patients array not modified");

                    trial.save().
                        then(function (savedTrial) {
                            savedTrial.get_subgroup(testGroupLabel).then(function (savedGroup) {
                                assert.isNotNull(savedGroup, "group is null after save");
                                assert.lengthOf(savedGroup.patients, expected, "group patients array not modified after save");

                                done();
                            }).catch(done)
                        }).catch(done);
                }).catch(done);
        }).catch(done);
    });

    it("should remove administrator", function (done) {
        var expected = testTrial.administrators.length - 1;

        testTrial.remove_administrator(adminUser.id)
            .then(function (trial) {
                assert.isNotNull(trial, "trial is null");
                assert.lengthOf(trial.administrators, expected, "administrators array not modified");

                trial.save().
                    then(function (savedTrial) {
                        assert.isNotNull(savedTrial, "trial is null after save");
                        assert.lengthOf(savedTrial.administrators, expected, "administrators array not modified after save");

                        done();
                    }).catch(done);
            }).catch(done);
    });

    it("should throw not found error, when removing unknown administrator", function (done) {
        var expected = testTrial.administrators.length;

        testTrial.remove_administrator(patientUser.id)
            .then(function (trial) {
                done(new Error("should not call resolve when duplicate error"));
            }).catch(function (err) {
                assert.instanceOf(err, errors.TrialAdministratorNotFoundError, "no notfound error");
                assert.lengthOf(testTrial.administrators, expected, "administrators field should not be modified");

                done();
            });
    });

    it("should remove patient", function (done) {
        var expected = testTrial.patients.length - 1;

        testTrial.remove_patient(patientUser.id)
            .then(function (trial) {
                assert.isNotNull(trial, "trial is null");
                assert.lengthOf(trial.patients, expected, "patients array not modified");

                trial.save().
                    then(function (savedTrial) {
                        assert.isNotNull(savedTrial, "trial is null after save");
                        assert.lengthOf(savedTrial.patients, expected, "patients array not modified after save");

                        done();
                    }).catch(done);
            }).catch(done);
    });

    it("should throw not found error, when removing unknown patient", function (done) {
        var expected = testTrial.patients.length;

        testTrial.remove_patient(adminUser.id)
            .then(function (trial) {
                done(new Error("should not call resolve when duplicate error"));
            }).catch(function (err) {
                assert.instanceOf(err, errors.TrialPatientNotFoundError, "no notfound error");
                assert.lengthOf(testTrial.patients, expected, "patients field should not be modified");

                done();
            });
    });

    it("should remove subgroup", function (done) {
        var expected = testTrial.groups.length - 1;

        testTrial.remove_subgroup(testGroupLabel)
            .then(function (trial) {
                assert.isNotNull(trial, "trial is null");
                assert.lengthOf(trial.groups, expected, "groups array not modified");

                trial.save().
                    then(function (savedTrial) {
                        assert.isNotNull(savedTrial, "trial is null after save");
                        assert.lengthOf(savedTrial.groups, expected, "groups array not modified after save");

                        done();
                    }).catch(done);
            }).catch(done);
    });

    it("should throw not found error, when removing unknown subgroup", function (done) {
        var expected = testTrial.groups.length;

        testTrial.remove_subgroup(testGroupLabel)
            .then(function (trial) {
                done(new Error("should not call resolve when duplicate error"));
            }).catch(function (err) {
                assert.instanceOf(err, errors.TrialSubGroupNotFoundError, "no notfound error");
                assert.lengthOf(testTrial.groups, expected, "groups field should not be modified");

                done();
            });
    });

    it("should remove all trials", function (done) {
        Trial.find().then(function (trials) {

            Promise.map(trials, function (trial) {
                return new Promise(function (resolve, reject) {
                    trial.remove(function (err, res) {
                        assert.isNull(err, "error when removing trial");
                        resolve();
                    });
                });
            }).then(function () {
                Trial.count(function (err, quantity) {
                    assert.equal(quantity, 0, "some trials still exists in db");

                    done();
                });
            }).catch(done);

        }).catch(function (err) {
            done(err);
        });
    });
}));