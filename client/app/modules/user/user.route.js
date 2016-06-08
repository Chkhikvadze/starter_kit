(function () {
    'use strict';

    angular
        .module('app.user')
        .run(appRun);

    appRun.$inject = ['routerHelper', 'authHelper'];
    /* @ngInject */
    function appRun(routerHelper, authHelper) {
        routerHelper.configureStates(getStates(authHelper));
    }

    function getStates(authHelper) {
        return [
            {
                state: 'login',
                config: {
                    url: '/login',
                    templateUrl: 'app/modules/user/login.html',
                    parent: 'shell',
                    controller: 'LoginController',
                    controllerAs: 'vm',
                    title: 'Login',
                    data: {
                        bodyClass: 'login_body_color'
                    },
                    skipIfLoggedIn: true
                }
            }, {
                state: 'logout',
                config: {
                    url: '/logout',
                    controller: 'LogoutController',
                    controllerAs: 'vm',
                    parent: 'shell',
                }
            }, {
                state: 'signup',
                config: {
                    url: '/register',
                    templateUrl: 'app/modules/user/signup.html',
                    parent: 'shell',
                    controller: 'SignupController',
                    controllerAs: 'vm',
                    title: 'Register',
                    data: {
                        bodyClass: 'login_body_color'
                    },
                    skipIfLoggedIn: true
                }
            }, {
                state: 'signup_success',
                config: {
                    url: '/register/success',
                    templateUrl: 'app/modules/user/signup.success.html',
                    parent: 'shell',
                    title: 'Registration success',
                    data: {
                        bodyClass: 'login_body_color'
                    },
                    skipIfLoggedIn: true
                }
            }, {
                state: 'activate',
                config: {
                    url: '/activate?token',
                    parent: 'shell',
                    controller: 'ActivateController',
                    controllerAs: 'vm',
                    title: 'Activation'
                }
            }, {
                state: 'forget',
                config: {
                    url: '/forget_password',
                    templateUrl: 'app/modules/user/forget.html',
                    parent: 'shell',
                    controller: 'ForgetController',
                    controllerAs: 'vm',
                    title: 'Forget password',
                    data: {
                        bodyClass: 'login_body_color'
                    },
                    skipIfLoggedIn: true
                }
            }, {
                state: 'reset',
                config: {
                    url: '/reset_password?token',
                    templateUrl: 'app/modules/user/reset.html',
                    parent: 'shell',
                    controller: 'ResetController',
                    controllerAs: 'vm',
                    title: 'Reset password',
                    data: {
                        bodyClass: 'login_body_color'
                    },
                    skipIfLoggedIn: true
                }
            }, {
                state: 'profile',
                config: {
                    url: '/profile',
                    templateUrl: 'app/modules/user/profile.html',
                    parent: 'master',
                    controller: 'ProfileController',
                    controllerAs: 'vm',
                    title: 'Profile',
                    data: {
                        bodyClass: 'login_body_color'
                    },
                    loginRequired: true,
                }
            }
        ];
    }
})();
