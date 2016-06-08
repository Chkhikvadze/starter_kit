var TrialModel = require('../../models/trial');
var TrialController = require('./trialController.v1');
var modelErrors = require('../../models/errors/index');


module.exports = {
    read: read,
    create: create,
    remove: remove,
    dosage: dosage
};

function read(req, res) {
    var fieldsToSelect = 'patients';
    var fieldsToPopulate = 'patients.user';

    TrialModel.findById(req.params.trial_id)
        .select(fieldsToSelect)
        .populate(fieldsToPopulate)
        .then(function (trial) {
            if (!trial) return res.notFound();

            res.ok(trial);
        })
        .catch(res.badRequest);
};

function create(req, res) {
    TrialController.find_or_four0four(req, res, function (trial) {
        // try to add patient
        trial.add_patient(req.params.patient_id)
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
        // try to remove patient
        trial.remove_patient(req.params.patient_id)
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

function dosage(req, res) {
    TrialController.find_or_four0four(req, res, function (trial) {
        trial.set_dosage(null, req.params.patient_id, req.body)
            .then(res.ok)
            .catch(res.badRequest);
    });
}