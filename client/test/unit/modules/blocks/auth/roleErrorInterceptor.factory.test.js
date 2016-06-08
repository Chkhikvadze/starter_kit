/* jshint -W117, -W030 */
describe('blocks.auth', function () {

    beforeEach(function () {
        module('blocks.auth', bard.fakeToastr, 'app.core');
        bard.inject(this, '$state', '$http', '$httpBackend');
    });

    it('should navigate to 403 when server responds 403 - forbidden', function () {
        var config = serverResponses.forbidden();
        $httpBackend
            .when(config.method, config.url)
            .respond(config.status, config.data);

        $http(config);
        $httpBackend.flush();

        expect($state.is('403')).to.be.true;
    });
});
