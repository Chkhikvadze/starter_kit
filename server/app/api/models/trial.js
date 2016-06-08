var mongoose = require('mongoose');
var baseModelPlugin = require('./plugins/baseModelPlugin');
var errors = require('./errors/index');


var dosageSchema = new mongoose.Schema({
    quantity: { type: Number, required: true },
    regularity: { type: String, required: true }
});

var groupSchema = new mongoose.Schema({
    label: String,
    patients: {
        type: [{
            user: {
                type: mongoose.Schema.Types.ObjectId, ref: 'User'
            }
        }],
        default: []
    }
});

// define the schema for our user model
var trialSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true
    },
    startDate: Date,
    endDate: Date,
    medication: {
        name: String,
        dosage: dosageSchema // default dosage
    },
    administrators: {
        type: [{
            user: {
                type: mongoose.Schema.Types.ObjectId, ref: 'User'
            }
        }],
        default: []
    },
    patients: {
        type: [{
            user: {
                type: mongoose.Schema.Types.ObjectId, ref: 'User'
            },
            dosage: dosageSchema // for custom dosage
        }],
        default: []
    },
    groups: {
        type: [groupSchema],
        default: []
    }

}, { timestamps: true });

trialSchema.plugin(baseModelPlugin);


/**
 * @param {administrator|ObjectId} administrator user id
 * @return Promise 
 */
trialSchema.methods.get_administrator = function (administrator) {
    var trial = this;
    return new Promise(function (resolve, reject) {
        // search for admin        
        var index = trial.administrators.map(function (item) {
            return (item.user._id || item.user).toString();
        }).indexOf(administrator.toString());

        if (index !== -1)
            resolve(trial.administrators[index], index);
        else
            reject(new errors.TrialAdministratorNotFoundError());
    });
};

/**
 * @param {administrator|ObjectId} administrator user id
 * @return Promise 
 */
trialSchema.methods.add_administrator = function (administrator) {
    var trial = this;
    return new Promise(function (resolve, reject) {
        if (!administrator) return reject("required params is missing");

        trial.get_administrator(administrator)
            .then(function (admin) {
                reject(new errors.DuplicateFoundError());
            }).catch(function (err) {
                trial.administrators.push({
                    user: administrator
                });
                resolve(trial);
            });
    });
};

/**
 * @param {administrator|ObjectId} administrator user id
 * @return Promise
 */
trialSchema.methods.remove_administrator = function (administrator) {
    var trial = this;
    return new Promise(function (resolve, reject) {
        trial.get_administrator(administrator)
            .then(function (admin, index) {
                trial.administrators.splice(index, 1);
                resolve(trial);
            }).catch(reject);
    });
};

/**
 * @param {patient|ObjectId} patient user id
 * @return Promise 
 */
trialSchema.methods.get_patient = function (patient) {
    var trial = this;
    return new Promise(function (resolve, reject) {
        // search for pacient        
        var index = trial.patients.map(function (item) {
            return (item.user._id || item.user).toString();
        }).indexOf(patient.toString());

        if (index !== -1)
            resolve(trial.patients[index], index);
        else
            reject(new errors.TrialPatientNotFoundError());
    });
};

/**
 * @param {patient|ObjectId} patient user id
 * @return Promise 
 */
trialSchema.methods.add_patient = function (patient) {
    var trial = this;
    return new Promise(function (resolve, reject) {
        if (!patient) return reject("required params is missing");

        trial.get_patient(patient)
            .then(function (trial_pacient) {
                reject(new errors.DuplicateFoundError());
            }).catch(function (err) {
                trial.patients.push({
                    user: patient
                });
                resolve(trial);
            });
    });
};

/**
 * @param {patient|ObjectId} patient user id
 * @return Promise
 */
trialSchema.methods.remove_patient = function (patient) {
    var trial = this;
    return new Promise(function (resolve, reject) {
        trial.get_patient(patient)
            .then(function (trial_pacient, index) {
                trial.patients.splice(index, 1);
                resolve(trial);
            }).catch(reject);
    });
};

/**
 * @param {group_label|String} group label
 * @return Promise
 */
trialSchema.methods.get_subgroup = function (group_label) {
    var trial = this;
    return new Promise(function (resolve, reject) {
        // search for group        
        var index = trial.groups.map(function (item) {
            return item.label;
        }).indexOf(group_label);

        if (index !== -1)
            resolve(trial.groups[index], index);
        else
            reject(new errors.TrialSubGroupNotFoundError());
    });
};

/**
 * @param {group_label|String} group label
 * @return Promise
 */
trialSchema.methods.add_subgroup = function (group_label) {
    var trial = this;

    return new Promise(function (resolve, reject) {
        if (!group_label) return reject("required params is missing");

        trial.get_subgroup(group_label)
            .then(function (group) {
                reject(new errors.DuplicateFoundError());
            }).catch(function (err) {
                trial.groups.push({
                    label: group_label,
                    patients: []
                });
                resolve(trial);
            });
    });
};

/**
 * @param {group_label|String} group label
 * @return Promise
 */
trialSchema.methods.remove_subgroup = function (group_label) {
    var trial = this;
    return new Promise(function (resolve, reject) {
        trial.get_subgroup(group_label)
            .then(function (group, index) {
                trial.groups.splice(index, 1);
                resolve(trial);
            }).catch(reject);
    });
};

/**
 * @param {patient|ObjectId} patient user id
 * @param {group_label|String} group label
 * @return Promise
 */
trialSchema.methods.assign_patient_to_subgroup = function (patient, group_label) {
    var trial = this;
    return new Promise(function (resolve, reject) {
        if (!group_label || !patient) return reject("required params is missing");

        trial.get_patient(patient)
            .then(function () { return trial.get_subgroup(group_label); })
            .then(function (group) {
                // search if already in group
                if (group.patients.filter(function (item) {
                    return (item.user._id || item.user).toString()
                        == patient.toString();
                }).length > 0) {
                    return reject(new errors.DuplicateFoundError());
                }

                group.patients.push({
                    user: patient
                });

                resolve(trial);
            })
            .catch(function (err) {
                reject(err);
            });
    });
};

/**
 * @param {patient|ObjectId} patient user id
 * @param {group_label|String} group label
 * @return Promise
 */
trialSchema.methods.remove_patient_from_subgroup = function (patient, group_label) {
    var trial = this;
    return new Promise(function (resolve, reject) {
        trial.get_subgroup(group_label)
            .then(function (group) {
                var index = group.patients.map(function (item) {
                    return (item.user._id || item.user).toString();
                }).indexOf(patient.toString());

                if (index === -1) {
                    return reject(new errors.TrialPatientNotFoundError());
                } else {
                    group.patients.splice(index, 1);
                    resolve(trial);
                }
            })
            .catch(function (err) {
                reject(new errors.TrialSubGroupNotFoundError());
            });
    });
};

/**
 * @param {group_label|String} group label
 * @param {patient|ObjectId} patient user id
 * @param {dosage|Object} dosage
 * @return Promise
 */
trialSchema.methods.set_dosage = function (group_label, patient, dosage) {
    var trial = this;
    return new Promise(function (resolve, reject) {
        if (group_label && patient) {
            return reject(new Error("either group or patient should be provided, not both"));
        }

        var get_patient = patient ? trial.get_patient(patient) : Promise.resolve(null);
        var get_subgroup = group_label ? trial.get_subgroup(group_label) : Promise.resolve(null);

        Promise.all([get_patient, get_subgroup]).then(function (values) {
            if (!values[0] && !values[1]) {
                return reject(new errors.NotFoundError());
            }
            var trial_patient = values[0];
            var trial_group = values[1];

            if (trial_group) {// assign to all patients in group
                var get_patients = trial_group.patients.map(function (elem) {
                    return trial.get_patient(elem.user);
                });
                Promise.all(get_patients).then(function (patients) {
                    patients.forEach(function (elem) {
                        elem.dosage = dosage;
                    });

                    resolve(trial);
                });
            } else if (trial_patient) {// assign to customer
                trial_patient.dosage = dosage;

                resolve(trial);
            }
        }).catch(reject);
    });
};





// create the model and expose it to our app
module.exports = mongoose.model('Trial', trialSchema);