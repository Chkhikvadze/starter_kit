var _ = require('lodash');
var TrialModel = require('../../models/trial');


module.exports = {
	find_or_four0four: find_or_four0four,
    create: create,
    read: read,
    get: get,
    update: update,
    remove: remove
};

function find_or_four0four(req, res, done) {
	TrialModel.findById(req.params.trial_id)
        .then(function (trial) {
			if (!trial) return res.notFound();

			done(trial);
		}).catch(res.badRequest);
}

// crud

function create(req, res) {
    var trial = new TrialModel(req.body);
    trial.save()
        .then(res.created)
        .catch(res.badRequest);
}

function read(req, res) {
    var fieldsToSelect = 'name startDate endDate medication';

    TrialModel.find()
        .select(fieldsToSelect)
        .sort('createdAt')
        .then(res.ok)
        .catch(res.badRequest);
}

function get(req, res) {
    find_or_four0four(req, res, function (trial) {
		res.ok(trial);
	});
}

function update(req, res) {
    find_or_four0four(req, res, function (trial) {
		_.assign(trial, req.body);
		trial.save()
			.then(res.ok)
			.catch(res.badRequest);
	})
}

function remove(req, res) {
	find_or_four0four(req, res, function (trial) {
		trial.remove()
			.then(res.ok)
			.catch(res.badRequest);
	});
}