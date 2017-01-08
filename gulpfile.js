var gulp = require('gulp'),
    //html压缩
    htmlmin = require('gulp-htmlmin'),
    //图片压缩
    imagemin = require('gulp-imagemin'),
    //压缩css
    minifycss = require('gulp-clean-css'),
    // js压缩
    uglify = require('gulp-uglify'),
    //提示信息
    notify = require('gulp-notify'),
    //文件更名
    rename = require('gulp-rename'),
    //copy文件
    copy = require('gulp-file-copy'),
    //清除文件
    clean = require('gulp-clean'),
    //多文件合并
    concat = require('gulp-concat'),
    //错误处理
    plumber = require('gulp-plumber'),
    //js检查
    jshint = require('gulp-jshint'),
    //    es6转es5
    babel = require("gulp-babel"),
    runTask = require('gulp-run-sequence'),
    through = require('through2'),
    htmlreplace = require('gulp-html-replace'),
    httpserver = require('gulp-connect'),
    del = require('del');

var config = require('./config/config.js').data;


var bowerPath = 'bower_components',
    buildJsPath = 'dist/buildJs/'.
libPath = 'app/lib',
    distLib = 'dist/lib';



var names = config.buildJs.names.join(',');
gulp.task('jsBulid', function() {
    if (config.buildJs.names.length > 0) {
        if (!config.devp && config.buildJs.debug) {
            // console.log(1);
            return gulp.src('bower_components/**/*{' + names + '}')
                .pipe(gulp.dest('dist/build/'));
        } else {
            return gulp.src('bower_components/**/{' + names + '}')
                .pipe(concat('build.js'))
                .pipe(uglify())
                .pipe(rename({
                    suffix: '.min'
                }))
                .pipe(gulp.dest('dist/build/'));
        }
    }
});

gulp.task('cssBulid', function() {
    if (config.buildCss.names.length > 0) {
        var css = config.buildCss.names.join(',');

        return gulp.src('bower_components/**/{' + css + '}')
            .pipe(concat('build.css'))
            .pipe(minifycss())
            .pipe(rename({
                suffix: '.min'
            }))
            .pipe(gulp.dest('dist/build/'));

    }
});


gulp.task('libJs', function() {
    if (config.debug) {
        return gulp.src('app/**/*.js')
            .pipe(gulp.dest('dist/'));
    } else if (!config.debug && config.devp) {
        return gulp.src('app/**/*.js')
            .pipe(concat('all.js'))
            .pipe(uglify())
            .pipe(rename({
                suffix: '.min'
            }))
            .pipe(gulp.dest('dist/lib/js'));
    }
});

gulp.task('libCss', function() {
    if (config.devp) {
        gulp.src('app/**/*.css')
            .pipe(concat('style.css'))
            .pipe(minifycss())
            .pipe(rename({
                suffix: '.min'
            }))
            .pipe(gulp.dest('dist/lib/css'));
    } else {
        gulp.src('app/**/*.css')
            .pipe(minifycss())
            .pipe(gulp.dest('dist/'));
    }
});

gulp.task('html', function() {
    return gulp.src(['app/**/*.html', '!app/index.html'])
        .pipe(htmlmin(config.htmlOptions))
        .pipe(gulp.dest('dist/'));
});

gulp.task('imgmin', function() {
    gulp.src('app/lib/img/**/*.{png,jpg}')
        .pipe(imagemin())
        .pipe(gulp.dest('dist/lib/img/'));
});

var buildJsPath = [],
    libJsPath = [],
    jsPath = [],
    cssPath = [];
gulp.task('buildJsPath', function() {
    buildJsPath = [];
    return gulp.src('dist/build/**/*.js')
        .pipe(through.obj(function(file, enc, cb) {
            buildJsPath.push('build/' + file.relative);
            // console.log(file);
            // console.log(file.path);
            // this.push(file);
            cb();
        }));
});
gulp.task('libJsPath', function() {
    libJsPath = [];
    return gulp.src('dist/lib/**/*.js')
        .pipe(through.obj(function(file, enc, cb) {
            libJsPath.push('lib/' + file.relative);
            // console.log(file);
            // console.log(file.path);
            //  this.push(file);
            cb();
        }));
});
gulp.task('jsPath', function() {
    jsPath = [];
    return gulp.src(['dist/**/*.js', '!dist/lib/**/*.js', '!dist/build/**/*.js'])
        .pipe(through.obj(function(file, enc, cb) {
            jsPath.push(file.relative);
            // console.log(file);
            // console.log(file.path);
            // this.push(file);
            cb();
        }));

});
gulp.task('cssPath', function() {
    cssPath = [];
    return gulp.src('dist/**/*.css')
        .pipe(through.obj(function(file, enc, cb) {
            cssPath.push(file.relative);
            // console.log(file);
            // console.log(file.path);
            // this.push(file);
            cb();
        }));

});

gulp.task('replaceIndex', function() {
    // console.log('path:',buildJsPath);
    return gulp.src('app/index.html')
        .pipe(htmlreplace({
            buildJs: {
                src: buildJsPath,
                tpl: '<script src="%s"></script>'
            },
            libJs: {
                src: libJsPath,
                tpl: '<script src="%s"></script>'
            },
            Js: {
                src: jsPath,
                tpl: '<script src="%s"></script>'
            },
            css: {
                src: cssPath,
                tpl: '<link rel="stylesheet" href="%s">'
            }
        })).pipe(htmlmin(config.htmlOptions)).pipe(gulp.dest('dist/'));
});

gulp.task('cleanDist', function() {
    // gulp.src(['dist/**/*','!dist/build/**/{'+names+'}','!dist/lib/**/*'],{read:false}).pipe(clean());
    del(['dist/**/*', '!dist/lib/img/**']);
    // .then(paths => {
    //   // console.log('Deleted files and folders:\n', paths.join('\n'));
    //
    // });

});
gulp.task('run', function(cb) {
    runTask(['html', 'libCss', 'libJs', 'imgmin'], ['cssBulid', 'jsBulid'], 'buildJsPath', 'libJsPath', 'jsPath', 'cssPath', 'replaceIndex', cb);
});

gulp.task('watchApp', function(cb) {
    gulp.watch('app/**/*.js', function(event) {
        console.log('File ' + event.path + '-----' + event.type);
        runTask('libJs');
        var ns = event.path.split('\\');
        if (event.type === 'deleted') {
            del('dist/**/*' + ns[ns.length - 1]);
        }
    });
    gulp.watch(['app/**/*.html', '!app/index.html'], function(event) {
        console.log('File ' + event.path + '-----' + event.type);
        runTask('html');
        var ns = event.path.split('\\');
        if (event.type === 'deleted') {
            del('dist/**/*' + ns[ns.length - 1]);
        }
    });
    gulp.watch('app/**/*.css', function(event) {
        console.log('File ' + event.path + '-----' + event.type);
        runTask('libCss');
        var ns = event.path.split('\\');
        if (event.type === 'deleted') {
            del('dist/**/*' + ns[ns.length - 1]);
        }
    });
    gulp.watch('app/lib/img/**/*', ['imgmin']);
});

gulp.task('watchDist', function(cb) {

    gulp.watch('dist/**/*.{js,css}', function(event) {

        if (event.type === 'added' || event.type === 'deleted') {
            runTask(['buildJsPath', 'libJsPath', 'jsPath', 'cssPath'], 'replaceIndex');
        }

    });
});

gulp.task('watchIndex', function(cb) {
    gulp.watch('app/index.html', function(event) {
        runTask(['buildJsPath', 'libJsPath', 'jsPath', 'cssPath'], 'replaceIndex');
    });
});

gulp.task('httpserver', function() {
    httpserver.server(config.httpServerOptions);
});
gulp.task('server', function(cb) {
    runTask('httpserver', ['watchApp', 'watchDist', 'watchIndex']);
});
