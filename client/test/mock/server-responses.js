/* jshint -W079 */
var serverResponses = (function () {

    return {
        forbidden: function () {
            return {
                method: 'GET',
                url: '/secured',
                status: 403,
                data: { code: 'E_FORBIDDEN' }
            }
        },
        activate_success: function (API_ENDPOINT) {
            return {
                method: 'POST',
                url: API_ENDPOINT + '/v1/auth/activate',
                status: 200,
                data: {}
            }
        },
        forget_success: function (API_ENDPOINT) {
            return {
                method: 'POST',
                url: API_ENDPOINT + '/v1/auth/request_reset',
                status: 200,
                data: {}
            }
        },
        forget_error: function (API_ENDPOINT) {
            return {
                method: 'POST',
                url: API_ENDPOINT + '/v1/auth/request_reset',
                status: 404,
                data: {}
            }
        },
        login_success: function (API_ENDPOINT) {
            return {
                method: 'POST',
                url: API_ENDPOINT + '/v1/auth/sign_in',
                status: 200,
                data: {
                    "code": "OK",
                    "message": "Operation is successfully executed",
                    "data": {
                        "access_token": "eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJpZCI6IjU2NWVmYTlmMTk1N2JiY2YyNjYxMTI4ZSIsImlhdCI6MTQ0OTU4OTA3MCwiZXhwIjozMTU3MjA5NTg5MDcwLCJhdWQiOiJtZWR0cmFja3IiLCJpc3MiOiJtZWR0cmFja3IifQ.diITEjNGnsfZRQ9_9-LVvju3-bTPraJeFJ23-RBVkto",
                        "user": {
                            "updatedAt": "2015-12-08T13:42:40.397Z",
                            "createdAt": "2015-12-02T14:05:19.000Z",
                            "role": "researcher",
                            "username": "nika.interisti",
                            "email": "nika.interisti@gmail.com",
                            "profile": {
                                "firstName": "ნიკა",
                                "lastName": "ნიქაბაძე"
                            }
                        }
                    }
                }
            }
        },
        login_error: function (API_ENDPOINT) {
            return {
                method: 'POST',
                url: API_ENDPOINT + '/v1/auth/sign_in',
                status: 404,
                data: {}
            }
        },
        login_activation_error: function (API_ENDPOINT) {
            return {
                method: 'POST',
                url: API_ENDPOINT + '/v1/auth/sign_in',
                status: 403,
                data: {}
            }
        },
        signup_success: function (API_ENDPOINT) {
            return {
                method: 'POST',
                url: API_ENDPOINT + '/v1/auth/sign_up',
                status: 200,
                data: {}
            }
        },
        signup_error: function (API_ENDPOINT) {
            return {
                method: 'POST',
                url: API_ENDPOINT + '/v1/auth/sign_up',
                status: 400,
                data: {}
            }
        }
    };
})();