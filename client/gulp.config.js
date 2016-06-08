module.exports = function () {
    var root = './';
    var clientApp = root + 'app/';
    var temp = root + '.tmp/';
    var test = root + 'test/';
    var bower = {
        json: require('./bower.json'),
        directory: './bower_components/',
        ignorePath: '..'
    };
    var testRunnerFile = 'index.html';
    var nodeModules = 'node_modules';


    var config = {
        build: './build/',
        client: clientApp,
        css: temp + 'style.css',
        styles: clientApp + '/styles',
        less: clientApp + 'styles/style.less',
        fonts: bower.directory + 'font-awesome/fonts/**/*.*',
        html: root + '**/*.html',
        htmltemplates: clientApp + 'modules/**/*.html',
        images: clientApp + 'images/**/*.*',
        index: clientApp + 'index.html',
        // app js, with no tests
        js: [
            clientApp + '/**/*.module.js',
            clientApp + '**/*.js',
            '!' + test + '**/*.test.js'
        ],
        jsOrder: [
            '**/app.module.js',
            '**/*.module.js',
            '**/*.js'
        ],
        root: root,
        source: clientApp,
        stubsjs: [
            bower.directory + 'angular-mocks/angular-mocks.js',
            root + 'stubs/**/*.js'
        ],
        temp: temp,

        /**
         * optimized files
         */
        optimized: {
            app: 'app.js',
            lib: 'lib.js'
        },
        /**
         * template cache
         */
        templateCache: {
            file: 'templates.js',
            options: {
                module: 'app.core',
                root: 'app/modules/',
                standalone: false
            }
        },

        /**
         * Bower and NPM files
         */
        bower: bower,
        packages: [
            './package.json',
            './bower.json'
        ],

        /**
         * test index.html, our HTML test runner
         */
        test: test,
        testRunner: test + testRunnerFile,
        testRunnerFile: testRunnerFile,

        /**
         * The sequence of the injections into test index.html:
         *  1 testlibraries
         *      mocha setup
         *  2 bower
         *  3 js
         *  4 testhelpers
         *  5 tests
         *  6 templates
         */
        testlibraries: [
            nodeModules + '/mocha/mocha.js',
            nodeModules + '/chai/chai.js',
            nodeModules + '/sinon-chai/lib/sinon-chai.js'
        ],
        testHelpers: [test + 'helpers/*.js'],
        mock: [test + 'mock/*.js'],
        tests: [test + '**/*.test.js'],

        webServer: {
            port: 8002,
            livereload: true,
            root: root,
            host: 'localhost'
        }
    };    
   
    /**
     * wiredep and bower settings
     */
    config.getWiredepDefaultOptions = function () {
        var options = {
            bowerJson: config.bower.json,
            directory: config.bower.directory,
            ignorePath: config.bower.ignorePath
        };
        return options;
    };


    return config;
};