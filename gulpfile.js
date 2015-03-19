var gulp = require('gulp');
var jshint = require('gulp-jshint');

gulp.task('default', function() {
    // place code for your default task here
});

gulp.task('lint', function() {
    return gulp.src(['*.js', 'scrapers/*.js', 'routes/*.js'])
        .pipe(jshint())
        .pipe(jshint.reporter('default'));
});
