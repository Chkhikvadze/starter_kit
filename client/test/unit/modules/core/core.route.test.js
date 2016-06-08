/* jshint -W117, -W030 */
describe('core', function () {
    describe('state', function () {
        var views = {
            four0four: 'app/modules/core/404.html',
            four0three: 'app/modules/core/403.html'
        };

        beforeEach(function () {
            module('app.core', bard.fakeToastr);
            bard.inject(this, '$location', '$rootScope', '$state', '$templateCache');
            $templateCache.put(views.core, '');
        });

        it('should map /404 route to 404 View template', function () {
            expect($state.get('404').templateUrl).to.equal(views.four0four);
        });

        it('work with $state.go to 404', function () {
            $state.go('404');
            $rootScope.$apply();
            expect($state.is('404')).to.be.true;
        });

        it('should route /invalid to the otherwise (404) route', function () {
            $location.path('/invalid');
            $rootScope.$apply();
            expect($state.current.templateUrl).to.equal(views.four0four);
        });

        it('should map /403 route to 403 View template', function () {
            expect($state.get('403').templateUrl).to.equal(views.four0three);
        });

        it('work with $state.go to 403', function () {
            $state.go('403');
            $rootScope.$apply();
            expect($state.is('403')).to.be.true;
        });
    });
});
