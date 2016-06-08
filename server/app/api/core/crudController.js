var debug = require('debug')('api-crudController');

module.exports = function (Model) {
	return {
		list: function (req, res) {
			// TODO use qury params like filter, skip, limit, etc.
			var query = Model.find();

			if (req.params.skip && !isNaN(req.params.skip)) {
				query.skip(req.params.skip);
			}

			if (req.params.limit && !isNaN(req.params.limit)) {
				query.limit(req.params.limit);
			}

			query.exec(function (err, items) {
				if (err) {
					debug(err);
					return res.serverError()
				}

				return res.ok(items);
			});
		},

		create: function (req, res) {
			var item = new Model(req.body);
			// TODO assign files
			item.save(function (err, item) {
				if (err) {
					debug(err);
					// TODO strip unnecassary fields
					return res.badRequest(err.errors);
				}

				return res.ok(item);
			});
		},

		read: function (req, res) {
			Model.findById(req.params.id, function (err, item) {
				if (err) {
					debug(err);
					return res.serverError();
				}

				if (!item) {
					return res.notFound();
				}

				return res.ok(item);
			});
		},

		update: function (req, res) {
			Model.findById(req.params.id, function (err, item) {
				if (err) {
					debug(err);
					return res.serverError();
				}

				if (!item) {
					return res.notFound();
				}

				item.set(req.body);

				// TODO assign files
				item.save(function (err, item) {
					if (err) {
						debug(err);
						// TODO strip unnecassary fields from error
						return res.badRequest(err.errors);
					}

					return res.ok(item);
				});
			});
		},

		delete: function (req, res) {
			Model.findById(req.params.id, function (err, item) {
				if (err) {
					debug(err);
					return res.serverError();
				}

				if (!item) {
					return res.notFound();
				}

				item.remove(function (err) {
					if (err) {
						debug(err);
						// TODO strip unnecassary fields
						return res.badRequest(err.errors);
					}

					return res.ok();
				});
			});
		}
	};
};