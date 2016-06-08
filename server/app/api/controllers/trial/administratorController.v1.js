var TrialModel = require('../../models/trial');
var TrialController = require('./trialController.v1');
var modelErrors = require('../../models/errors/index');


module.exports = {
    read: read,
    create: create,
    remove: remove
};

function read(req, res) {
    var fieldsToSelect = 'administrators';
    var fieldsToPopulate = 'administrators.user';

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
        // try to add admin
        trial.add_administrator(req.params.admin_id)
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
                    return res.badRequest();
            });
    });
};

function remove(req, res) {
    TrialController.find_or_four0four(req, res, function (trial) {
        // try to remove admin
        trial.remove_administrator(req.params.admin_id)
            .then(function (trial) {                    
                // save
                return trial.save();
            })
            .then(res.ok)
            .catch(function (err) {
                // ignore if not found error
                if (err instanceof modelErrors.TrialAdministratorNotFoundError)
                    return res.ok();
                else
                    return res.badRequest();
            });
    });
};