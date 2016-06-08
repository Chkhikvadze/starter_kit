var path = require('path');
var args = require('yargs').argv;
var gulp = require('gulp');
var del = require('del');
var glob = require('glob');
var _ = require('lodash');
var connect = require('gulp-connect');

var config = require('./gulp.config')();
var $ = require('gulp-load-plugins')({ lazy: true });


/**
 * List the available gulp tasks
 */
gulp.task('help', $.taskListing);
gulp.task('default', ['help']);


/**
 * Compile less to css
 * @return {Stream}
 */
gulp.task('styles', function () {
    log('Compiling Less --> CSS');

    return gulp
        .src(config.less)
        .pipe($.plumber()) // exit gracefully if something fails after this
        .pipe($.less())
        .pipe($.autoprefixer({ browsers: ['last 2 version', '> 5%'] }))
        .pipe(gulp.dest(config.temp));
});

/**
 * serve the dev environment
 */
gulp.task('start', ['inject'], function () {
    serve(true /* isDev */);
});

/**
 * serve the build environment
 */
gulp.task('release', ['build'], function () {
    serve(false /* isDev */);
});

/**
 * Run the test runner
 * @return {Stream}
 */
gulp.task('test', ['build-tests'], function () {
    log('run the test runner');
    serve(true /* isDev */, true /* testRunner */);
});

/**
 * Inject all the test files into the index.html
 * @return {Stream}
 */
gulp.task('build-tests', ['templatecache'], function(done) {
    log('building the test runner');

    var wiredep = require('wiredep').stream;
    var templateCache = config.temp + config.templateCache.file;
    var options = config.getWiredepDefaultOptions();
    var tests = config.tests;

    options.devDependencies = true;
    
    return gulp
        .src(config.testRunner)
        .pipe(wiredep(options))
        .pipe(inject(config.js, '', config.jsOrder))
        .pipe(inject(config.mock, 'mock'))
        .pipe(inject(config.testlibraries, 'testlibraries'))
        .pipe(inject(config.testHelpers, 'testhelpers'))
        .pipe(inject(tests, 'tests', ['**/*']))
        .pipe(inject(templateCache, 'templates'))
        .pipe(gulp.dest(config.test));
});


/**
 * Copy fonts
 * @return {Stream}
 */
gulp.task('fonts', ['clean-fonts'], function () {
    log('Copying fonts');

    return gulp
        .src(config.fonts)
        .pipe(gulp.dest(config.build + 'fonts'));
});

/**
 * Compress images
 * @return {Stream}
 */
gulp.task('images', ['clean-images'], function () {
    log('Compressing and copying images');

    return gulp
        .src(config.images)
        .pipe($.imagemin({ optimizationLevel: 4 }))
        .pipe(gulp.dest(config.build + 'images'));
});

/**
 * Create $templateCache from the html templates
 * @return {Stream}
 */
gulp.task('templatecache', ['clean-code'], function () {
    log('Creating an AngularJS $templateCache');

    return gulp
        .src(config.htmltemplates)
        .pipe($.if(args.verbose, $.bytediff.start()))
        .pipe($.minifyHtml({ empty: true }))
        .pipe($.if(args.verbose, $.bytediff.stop(bytediffFormatter)))
        .pipe($.angularTemplatecache(
            config.templateCache.file,
            config.templateCache.options
            ))
        .pipe(gulp.dest(config.temp));
});

/**
 * Wire-up the bower dependencies
 * @return {Stream}
 */
gulp.task('wiredep', function () {
    log('Wiring the bower dependencies into the html');

    var wiredep = require('wiredep').stream;
    var options = config.getWiredepDefaultOptions();

    // Only include stubs if flag is enabled
    var js = args.stubs ? [].concat(config.js, config.stubsjs) : config.js;

    return gulp
        .src(config.index)
        .pipe(wiredep(options))
        .pipe(inject(js, '', config.jsOrder))
        .pipe(gulp.dest(config.client));
});

gulp.task('inject', ['wiredep', 'styles', 'templatecache'], function () {
    log('Wire up css into the html, after files are ready');

    return gulp
        .src(config.index)
        .pipe(inject(config.css))
        .pipe(gulp.dest(config.client));
});


/**
 * Remove all files from the build, temp, and reports folders
 * @param  {Function} done - callback when complete
 */
gulp.task('clean', function (done) {
    var delconfig = [].concat(config.build, config.temp);
    log('Cleaning: ' + $.util.colors.blue(delconfig));
    del(delconfig).then(function (paths) { done(); });
});

/**
 * Remove all fonts from the build folder
 * @param  {Function} done - callback when complete
 */
gulp.task('clean-fonts', function (done) {
    clean(config.build + 'fonts/**/*.*', done);
});

/**
 * Remove all images from the build folder
 * @param  {Function} done - callback when complete
 */
gulp.task('clean-images', function (done) {
    clean(config.build + 'images/**/*.*', done);
});

/**
 * Remove all styles from the build and temp folders
 * @param  {Function} done - callback when complete
 */
gulp.task('clean-styles', function (done) {
    var files = [].concat(
        config.temp + '**/*.css',
        config.build + 'styles/**/*.css'
        );
    clean(files, done);
});

/**
 * Remove all js and html from the build and temp folders
 * @param  {Function} done - callback when complete
 */
gulp.task('clean-code', function (done) {
    var files = [].concat(
        config.temp + '**/*.js',
        config.build + 'js/**/*.js',
        config.build + '**/*.html'
        );
    clean(files, done);
});

/**
 * Build everything
 * This is separate so we can run tests on
 * optimize before handling image or fonts
 */
gulp.task('build', ['optimize', 'images', 'fonts'], function () {
    log('Building everything');

    var msg = {
        title: 'gulp build',
        subtitle: 'Deployed to the build folder',
        message: 'Running `gulp serve-build`'
    };
    del(config.temp);
    log(msg);
    notify(msg);
});

/**
 * Optimize all files, move to a build folder,
 * and inject them into the new index.html
 * @return {Stream}
 */
gulp.task('optimize', ['inject'], function () {
    log('Optimizing the js, css, and html');

    var assets = $.useref.assets({ searchPath: './' });
    // Filters are named for the gulp-useref path
    var cssFilter = $.filter('**/*.css', { restore: true });
    var jsAppFilter = $.filter('**/' + config.optimized.app, { restore: true });
    var jslibFilter = $.filter('**/' + config.optimized.lib, { restore: true });

    var templateCache = config.temp + config.templateCache.file;

    return gulp
        .src(config.index)
        .pipe($.plumber())
        .pipe(inject(templateCache, 'templates'))
        .pipe(assets) // Gather all assets from the html with useref
    // Get the css
        .pipe(cssFilter)
        .pipe($.minifyCss())
        .pipe(cssFilter.restore)
    // Get the custom javascript
        .pipe(jsAppFilter)
        .pipe($.ngAnnotate({ add: true }))
        .pipe($.uglify())
        .pipe(jsAppFilter.restore)
    // Get the vendor javascript
        .pipe(jslibFilter)
        .pipe($.uglify()) // another option is to override wiredep to use min files
        .pipe(jslibFilter.restore)
    // Take inventory of the file names for future rev numbers
        .pipe($.rev())
    // Apply the concat and file replacement with useref
        .pipe(assets.restore())
        .pipe($.useref())
    // Replace the file names in the html with rev numbers
        .pipe($.revReplace())
        .pipe(gulp.dest(config.build));
});

gulp.task('buildReload', ['optimize'], function () {
    return gulp
        .src(config.build + '/index.html')
        .pipe(connect.reload());
});

gulp.task('devReload', ['inject'], function () {
    return gulp
        .src(config.index)
        .pipe(connect.reload());
});

gulp.task('testReload', ['inject'], function () {
    return gulp
        .src(config.testRunner)
        .pipe(connect.reload());
});


//////////////////////////////

function serve(isDev, testRunner) {
    connect.server({
        host: config.webServer.host,
        port: config.webServer.port,
        livereload: config.webServer.livereload,
        root: testRunner ? [config.test, config.root, config.client] : (isDev ? [config.root, config.client] : [config.build]),
        fallback: testRunner ? 'test/index.html' : (isDev ? 'app/index.html' : 'build/index.html'),
        middleware: function (connect, opt) {
            return [require('connect-history-api-fallback')(), accessLog];
        }
    });
    
    // start watchers
    if(testRunner) {
        // start compiler watch
        gulp.watch([config.styles + '/*'], ['styles'])
            .on('change', changeEvent);

        gulp.watch(_.union([config.css], [config.htmltemplates], config.js, [config.tests]),
            ['testReload']).on('change', changeEvent);
    } else if (isDev) {
        // start compiler watch
        gulp.watch([config.styles + '/*'], ['styles'])
            .on('change', changeEvent);

        gulp.watch(_.union([config.css], [config.htmltemplates], config.js),
            ['devReload']).on('change', changeEvent);
    } else {
        // start compiler watcher
        gulp.watch(_.union([config.less], [config.htmltemplates], config.js), 
            ['buildReload']).on('change', changeEvent);
    }
}

function accessLog(req, res, next) {
    log(req.method + ' ' + req.url + ' ' +
        'HTTP/' + req.httpVersion + ' ' + res.statusCode);
    next();
}

/**
 * When files change, log it
 * @param  {Object} event - event that fired
 */
function changeEvent(event) {
    var srcPattern = new RegExp('/.*(?=/' + config.source + ')/');
    log('File ' + event.path.replace(srcPattern, '') + ' ' + event.type);
}

/**
 * Delete all files in a given path
 * @param  {Array}   path - array of paths to delete
 * @param  {Function} done - callback when complete
 */
function clean(path, done) {
    log('Cleaning: ' + $.util.colors.blue(path));
    del(path).then(function (paths) { done(); });
}

/**
 * Inject files in a sorted sequence at a specified inject label
 * @param   {Array} src   glob pattern for source files
 * @param   {String} label   The label name
 * @param   {Array} order   glob pattern for sort order of the files
 * @returns {Stream}   The stream
 */
function inject(src, label, order) {
    var options = { read: false };
    if (label) {
        options.name = 'inject:' + label;
    }

    return $.inject(orderSrc(src, order), options);
}
/**
 * Order a stream
 * @param   {Stream} src   The gulp.src stream
 * @param   {Array} order Glob array pattern
 * @returns {Stream} The ordered stream
 */
function orderSrc(src, order) {
    //order = order || ['**/*'];
    return gulp
        .src(src)
        .pipe($.if(order, $.order(order)));
}
/**
 * Formatter for bytediff to display the size changes after processing
 * @param  {Object} data - byte data
 * @return {String}      Difference in bytes, formatted
 */
function bytediffFormatter(data) {
    var difference = (data.savings > 0) ? ' smaller.' : ' larger.';
    return data.fileName + ' went from ' +
        (data.startSize / 1000).toFixed(2) + ' kB to ' +
        (data.endSize / 1000).toFixed(2) + ' kB and is ' +
        formatPercent(1 - data.percent, 2) + '%' + difference;
}

/**
 * Format a number as a percentage
 * @param  {Number} num       Number to format as a percent
 * @param  {Number} precision Precision of the decimal
 * @return {String}           Formatted perentage
 */
function formatPercent(num, precision) {
    return (num * 100).toFixed(precision);
}

/**
 * Log a message or series of messages using chalk's blue color.
 * Can pass in a string, object or array.
 */
function log(msg) {
    if (typeof (msg) === 'object') {
        for (var item in msg) {
            if (msg.hasOwnProperty(item)) {
                $.util.log($.util.colors.blue(msg[item]));
            }
        }
    } else {
        $.util.log($.util.colors.blue(msg));
    }
}

/**
 * Show OS level notification using node-notifier
 */
function notify(options) {
    var notifier = require('node-notifier');
    var notifyOptions = {
        sound: 'Bottle',
        contentImage: path.join(__dirname, 'gulp.png'),
        icon: path.join(__dirname, 'gulp.png')
    };
    _.assign(notifyOptions, options);
    notifier.notify(notifyOptions);
}


module.exports = gulp;