
module.exports = requireRole;

/**
 * Middleware for role checking.
 * Note: isAuthenticated middleware should be called prior to this
 * @param {string} role - Name of role we require
 */
function requireRole(role) {

    return function (req, res, next) {
        if (req.user.role != role)
            res.forbidden();
        else
            next();
    };

};