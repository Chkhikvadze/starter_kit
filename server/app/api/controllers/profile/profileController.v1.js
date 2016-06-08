var User = require('../../models/user');
var _ = require('lodash');

module.exports = {
    me: me,
    save: save
};



function me(req, res) {
    res.ok(req.user.toJSON());
};

function save(req, res) {
    _.assign(req.user.profile, req.body);
    req.user.save()
        .then(function (user) {
            res.ok(user.toJSON());
        }).catch(function (error) {
            res.badRequest();
        });
}