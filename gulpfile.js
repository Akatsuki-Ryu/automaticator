var gulp = require('gulp');
var bower = require('gulp-bower');

gulp.task('default', function() {
  return bower()
    .pipe(gulp.dest('public/bower_components'));
});
