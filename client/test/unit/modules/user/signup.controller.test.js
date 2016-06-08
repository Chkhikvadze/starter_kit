describe('SignupController', function () {
    var controller;

    before(function () {
        // clear cache if runs in browser
        if (window && window.localStorage) window.localStorage.clear();
    });

    beforeEach(function () {
        module('app.user', bard.fakeToastr);
        bard.inject('$controller', '$httpBackend', '$rootScope', '$state', 'Users', 'API_ENDPOINT');
    });

    beforeEach(function () {
        controller = $controller('SignupController');
        controller.user = {
            username: 'test',
            password: 'test',
            email: 'test@mail.com'
        };
        $rootScope.$apply();
    });

    bard.verifyNoOutstandingHttpRequests();

    it('should be created successfully', function () {
        expect(controller).to.be.defined;
    });

    describe('when successfuly signed up', function () {

        beforeEach(function () {
            var config = serverResponses.signup_success(API_ENDPOINT);
            $httpBackend.when(config.method, config.url).respond(config.status, config.data);

            controller.signup();
            $httpBackend.flush();
            $rootScope.$apply();
        });

        it('should clear error message', function () {
            expect(controller.error).empty
        });

        it('should redirect to success page', function () {
            expect($state.is('signup_success')).to.be.true;
        });
    });

    describe('when sign up caused error', function () {

        beforeEach(function () {
            var config = serverResponses.signup_error(API_ENDPOINT);
            $httpBackend.when(config.method, config.url).respond(config.status, config.data);

            controller.signup();
            $httpBackend.flush();
            $rootScope.$apply();
        });

        it('should display error message', function () {
            expect(controller.error).not.empty
        });
    });
});
