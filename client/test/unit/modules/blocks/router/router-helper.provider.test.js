/* jshint -W117, -W030 */
describe('blocks.router', function () {

    before(function () {
        // clear cache if runs in browser
        if (window && window.localStorage) window.localStorage.clear();
    });

    beforeEach(function () {
        module('blocks.router', bard.fakeToastr, 'app.user');
        bard.inject(this, '$rootScope', '$state', 'routerHelper');
    });

    it('should navigate to login when server responds 401 - unauthorized', function () {
        
        var securedState = {
            state: 'secured',
            config: {
                url: '/secured',
                parent: 'shell',
                title: 'secured',
                loginRequired: true
            }
        };
        routerHelper.configureStates([securedState]);
        $state.go(securedState.state);
        $rootScope.$apply();
        expect($state.is('login')).to.be.true;
    });
});
