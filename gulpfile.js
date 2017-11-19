var gulp = require('gulp');
var ts = require('gulp-typescript');
var browserSync = require('browser-sync').create();
var browserify = require("browserify");
var tsify = require("tsify");
var source = require('vinyl-source-stream');

// Static server
gulp.task('http', function () {
    browserSync.init({
        server: {
            baseDir: "./public"
        }
    });
});

var tsProject = ts.createProject('tsconfig.json');

gulp.task('typescript', function () {
    return browserify({
        basedir: '.',
        debug: true,
        entries: ['src/app.ts'],
        cache: {},
        packageCache: {}
    })
        .plugin(tsify)
        .bundle()
        .on('error', function (error) {
            console.error(error.toString());
        })
        .pipe(source('bundle.js'))
        .pipe(gulp.dest("public"));
});

gulp.task('watch', ['typescript'], function (done) {
    gulp.src('./index.html')
        .pipe(gulp.dest('public'));
    browserSync.reload();
    done();
});

gulp.task('default', ['typescript'], function () {
    gulp.src('./index.html')
        .pipe(gulp.dest('public'));
    browserSync.init({
        server: {
            baseDir: "./public"
        }
    });
    gulp.watch(["src/*", "index.html"], ['watch']);
});