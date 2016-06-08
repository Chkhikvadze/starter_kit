describe('ActivateController', function () {
    var controller;

    beforeEach(function () {
        module('app.user');
        bard.inject('$controller', '$httpBackend', '$rootScope', '$state', 'Users', 'API_ENDPOINT');

        var config = serverResponses.activate_success(API_ENDPOINT);
        $httpBackend
            .when(config.method, config.url)
            .respond(config.status, config.data);
    });

    beforeEach(function () {
        controller = $controller('ActivateController');
        $rootScope.$apply();
    });

    bard.verifyNoOutstandingHttpRequests();

    it('should be created successfully', function () {
        expect(controller).to.be.defined;
        $httpBackend.flush();
    });

    it('should navigate to login', function () {
        $httpBackend.flush();
        $rootScope.$apply();
        
        expect($state.is('login')).to.be.true;
    });
});
