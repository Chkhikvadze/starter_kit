
var User = require('../../models/user');
var Roles = require('../../models/role')
var jwtService = require('../../services/jwtService');

module.exports = {
    sign_in: sign_in,
    sign_up: sign_up,
    refresh_token: refresh_token,
    activate_account: activate_account,
    request_reset_password: request_reset_password,
    reset_password: reset_password,
    change_password: change_password
};

var ACTIVATION_URL = 'http://localhost:8001/activate';
var PASSWORD_RESET_URL = 'http://localhost:8001/reset_password';

function sign_in(req, res) {
    var username = req.body.username;
    var password = req.body.password;
    if (!username || !password) return res.badRequest();

    User.findOneByAnyEmailOrUsername(username)
        .then(function (user) {
            if (!user) return res.notFound();
            // check password
            if (!user.validatePassword(password)) return res.badRequest();
            // check if active
            if (!user.account.active) return res.notActiveUser();

            res.ok({
                access_token: jwtService(req.app.settings.configuration.jwt).sign({ id: user.id }),
                user: user.toJSON()
            });
        }).catch(res.badRequest);
};

function sign_up(req, res) {
    var username = req.body.username;
    var email = req.body.email;
    var password = req.body.password;
    if (!username || !password || !email) return res.badRequest();

    var appConfig = req.app.settings.configuration;

    User.findOne()
        .or([{ username: username }, { email: email }])
        .then(function (user) {
            if (user) return res.badRequest(null, null, 'User already exists!');

            var newUser = new User();
            newUser.email = email;
            newUser.username = username;
            newUser.password = newUser.generateHash(password);
            newUser.account.activationToken = newUser.generateRandomHash();
            newUser.account.activationExpires = Date.now() + appConfig.auth.activationTokenExpiresIn;
            newUser.profile.firstName = (req.body.profile || {}).firstName;
            newUser.profile.lastName = (req.body.profile || {}).lastName;
            newUser.profile.avatar = (req.body.profile || {}).avatar;
            newUser.role = Roles.ROLES.Researcher;
            return newUser.save().then(function (user) {
                // activation email
                return appConfig.mailService.sendMail('test@gmail.com', user.email,
                    'Account activation', ACTIVATION_URL + '?token=' + user.account.activationToken);
            }).then(res.created);
        }).catch(res.badRequest);
};

function activate_account(req, res) {
    var token = req.query.token || req.body.token;
    if (!token) return res.badRequest();

    User.findOne()
        .where('account.activationToken').equals(token)
        .where('account.activationExpires').gte(Date.now())
        .then(function (user) {
            if (!user) return res.notFound();

            user.account.active = true;
            user.account.activationToken = undefined;
            user.account.activationExpires = undefined;
            return user.save().then(res.ok);
        }).catch(res.badRequest);
};

function request_reset_password(req, res) {
    var username = req.body.username;
    if (!username) return res.badRequest();

    var appConfig = req.app.settings.configuration;

    User.findOneByAnyEmailOrUsername(username)
        .then(function (user) {
            if (!user) return res.notFound();

            user.account.resetPasswordToken = user.generateRandomHash();
            user.account.resetPasswordExpires = Date.now() + appConfig.auth.resetPasswordTokenExpiresIn;
            return user.save().then(function (user) {
                // send mail
                return appConfig.mailService.sendMail(appConfig.systemEmail, user.email,
                    'Account activation', PASSWORD_RESET_URL + '?token=' + user.account.resetPasswordToken);
            }).then(res.ok);
        })
        .catch(res.badRequest);
};

function reset_password(req, res) {
    var token = req.query.token || req.body.token;
    var password = req.body.password;
    if (!token || !password) return res.badRequest();

    User.findOne()
        .where('account.resetPasswordToken').equals(token)
        .where('account.resetPasswordExpires').gte(Date.now())
        .then(function (user) {
            if (!user) return res.notFound();

            user.password = user.generateHash(password);
            user.account.resetPasswordToken = undefined;
            user.account.resetPasswordExpires = undefined;
            return user.save().then(res.ok);
        }).catch(res.badRequest);
};

function change_password(req, res) {
    var oldPassword = req.body.oldPassword;
    var password = req.body.password;
    var user = req.user;
    if (!password || !user.validatePassword(oldPassword)) return res.badRequest();

    user.password = user.generateHash(password);
    user.save()
        .then(res.ok)
        .catch(res.badRequest);
};

function refresh_token(req, res) {
    var appConfig = req.app.settings.configuration;

    var oldDecoded = jwtService(appConfig.jwt)
        .decode(req.body.access_token);

    res.ok({
        access_token: jwtService(appConfig.jwt)
            .sign({ id: oldDecoded.id })
    });
};