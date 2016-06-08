describe('LoginController', function () {
    var controller;

    beforeEach(function () {
        module('app.user', bard.fakeToastr,
            'app.dashboard' /* because home page is set to dashboard */);
        bard.inject('$controller', '$httpBackend', '$rootScope', '$state', 'Users', 'API_ENDPOINT');
    });

    beforeEach(function () {
        controller = $controller('LoginController');
        $rootScope.$apply();

        controller.user = {
            username: 'test',
            password: 'test'
        }
    });

    bard.verifyNoOutstandingHttpRequests();

    it('should be created successfully', function () {
        expect(controller).to.be.defined;
    });

    describe('when successfuly logged in', function () {

        beforeEach(function () {
            var config = serverResponses.login_success(API_ENDPOINT);
            $httpBackend.when(config.method, config.url).respond(config.status, config.data);

            controller.login();
            $httpBackend.flush();
            $rootScope.$apply();
        });

        it('should clear error message', function () {
            expect(controller.error).empty
        });

        it('should redirect to home page', function () {
            expect($state.current.url).to.equal('/');
        });
    });

    describe('when error on login', function () {

        it('should display invalid username/password error message', function () {
            var config = serverResponses.login_error(API_ENDPOINT);
            $httpBackend.when(config.method, config.url).respond(config.status, config.data);
            controller.login();
            $httpBackend.flush();

            expect(controller.error).to.match(/is not correct/);
        });

        it('should display not activated error message', function () {
            var config = serverResponses.login_activation_error(API_ENDPOINT);
            $httpBackend.when(config.method, config.url).respond(config.status, config.data);
            controller.login();
            $httpBackend.flush();

            expect(controller.error).to.match(/activated/);
        });
    });
});
