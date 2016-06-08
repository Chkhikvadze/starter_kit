describe('ForgetController', function () {
    var controller;

    beforeEach(function () {
        bard.appModule('app.user');
        bard.inject('$controller', '$httpBackend', '$rootScope', '$state', 'Users', 'API_ENDPOINT');
    });

    beforeEach(function () {
        controller = $controller('ForgetController');
        $rootScope.$apply();
    });

    bard.verifyNoOutstandingHttpRequests();

    it('should be created successfully', function () {
        expect(controller).to.be.defined;
    });

    describe('when successfuly requested password reset', function () {

        beforeEach(function () {
            var config = serverResponses.forget_success(API_ENDPOINT);
            $httpBackend.when(config.method, config.url).respond(config.status, config.data);
            
            controller.forget();
            $httpBackend.flush();
            $rootScope.$apply();
        });

        it('should clear error message', function () {
            expect(controller.error).empty
        });
        
        it('should show success message', function () {
            expect(controller.requestSent).to.be.true
        });
    });

    describe('when forget request caused error', function () {

        beforeEach(function () {
            var config = serverResponses.forget_error(API_ENDPOINT);
            $httpBackend.when(config.method, config.url).respond(config.status, config.data);
            
            controller.forget();
            $httpBackend.flush();
            $rootScope.$apply();
        });

        it('should display error message', function () {
            expect(controller.error).not.empty
        });
        
        it('should hide success message', function () {
            expect(controller.requestSent).to.be.false
        });
    });
});
