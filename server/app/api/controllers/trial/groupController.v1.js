var TrialModel = require('../../models/trial');
var TrialController = require('./trialController.v1');
var modelErrors = require('../../models/errors/index');


module.exports = {
    get: get,
    read: read,
    create: create,
    remove: remove,
    add_patient: add_patient,
    remove_patient: remove_patient,
    dosage: dosage
};

function get(req, res) {
    var fieldsToPopulate = 'groups.user';

    TrialModel.findOne()
        .where('_id').equals(req.params.trial_id)
        .where('groups.label').equals(req.params.group_label)
        .populate(fieldsToPopulate)
        .then(function (trial) {
            if (!trial || trial.groups.length === 0) return res.notFound();

            return res.ok(trial.groups[0]);
        }).catch(res.badRequest);
}

function read(req, res) {
    var fieldsToSelect = 'groups.label';

    TrialModel.findById(req.params.trial_id)
        .select(fieldsToSelect)
        .then(res.ok)
        .catch(res.badRequest);
};

function create(req, res) {
    TrialController.find_or_four0four(req, res, function (trial) {
        // try to add sub group
        trial.add_subgroup(req.params.group_label)
            .then(function (trial) {
                // save
                return trial.save();
            })
            .then(res.created)
            .catch(function (err) {
                // return conflict status if duplicate error
                if (err instanceof modelErrors.DuplicateFoundError)
                    return res.conflict();
                else
                    return res.badRequest(err);
            });
    });
};

function remove(req, res) {
    TrialController.find_or_four0four(req, res, function (trial) {
        // try to remove sub group
        trial.remove_subgroup(req.params.group_label)
            .then(function (trial) {                    
                // save
                return trial.save();
            })
            .then(res.ok)
            .catch(function (err) {
                // ignore if not found error
                if (err instanceof modelErrors.TrialPatientNotFoundError)
                    return res.ok();
                else
                    return res.badRequest(err);
            });
    });
};

function add_patient(req, res) {
    TrialController.find_or_four0four(req, res, function (trial) {
        // try to add patient to sub group
        trial.assign_patient_to_subgroup(req.params.patient_id, req.params.group_label)
            .then(function (trial) {                    
                // save
                return trial.save();
            })
            .then(res.ok)
            .catch(function (err) {
                if (err instanceof modelErrors.DuplicateFoundError)
                    return res.conflict();
                else if (err instanceof modelErrors.TrialPatientNotFoundError)
                    return res.notFound();
                else
                    return res.badRequest(err);
            });
    });
}

function remove_patient(req, res) {
    TrialController.find_or_four0four(req, res, function (trial) {
        // try to remove patient to sub group
        trial.remove_patient_from_subgroup(req.params.patient_id, req.params.group_label)
            .then(function (trial) {                    
                // save
                return trial.save();
            })
            .then(res.ok)
            .catch(function (err) {
                // ignore if not found patient
                if (err instanceof modelErrors.TrialPatientNotFoundError)
                    return res.ok();
                else
                    return res.badRequest(err);
            });
    });
}

function dosage(req, res) {
    TrialController.find_or_four0four(req, res, function (trial) {
        trial.set_dosage(req.params.group_label, null, req.body)
            .then(res.ok)
            .catch(res.badRequest);
    });
}