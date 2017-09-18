const gulp = require('gulp');
const args = require('yargs').argv;

const $ = require('gulp-load-plugins')({lazy: true});
const config = require('./gulp-config')();
const {resolve} = require('path');


// Running basic eslint tasks
gulp.task ('lint', () => {
  log('Analyzing contents from source using eslint');
  return gulp.src(config.src)
  .pipe($.eslint({
    configFile: config.lint.config
  }))
  .pipe($.eslint.format())
  .pipe($.eslint.failAfterError());
});

gulp.task('lint-watch', () => {
	log('Watching contents');
	const lintAndPrint = $.eslint({
    configFile: config.lint.config
  });
	lintAndPrint.pipe($.eslint.formatEach());

	return gulp.watch(config.src, event => {
		if (event.type !== 'deleted') {
			gulp.src(event.path)
				.pipe(lintAndPrint, {end: false});
		}
	});
});

gulp.task('cached-lint', () => {
  log('Caching lint to ensure all contents are examined');
  return gulp.src(config.src)
		.pipe($.cached('eslint'))
		// Only uncached and changed files past this point
		.pipe($.eslint({
      configFile: config.lint.config
    }))
		.pipe($.eslint.format())
		.pipe($.eslint.result(result => {
			if (result.warningCount > 0 || result.errorCount > 0) {
				// If a file has errors/warnings remove uncache it
				delete $.cached.caches.eslint[resolve(result.filePath)];
			}
		}));
});

// Run the "cached-lint" task initially...
gulp.task('cached-lint-watch', ['cached-lint'], () => {
  log('Performing watch on cached-lint');
  return gulp.src(config.src, ['cached-lint'], event => {
		if (event.type === 'deleted' && $.cached.caches.eslint) {
			delete $.cached.caches.eslint[event.path];
		}
	});
});


// function: logging content to console with gulp-util
const log = (msg) => {
  if (typeof(msg) === 'object'){
    for (let item in msg){
      if (msg.hasOwnProperty(item)) {
        $.util.log($.util.colors.blue(msg[item]))
      }
    }
  } else {
    $.util.log($.util.colors.blue(msg))
  }
}

gulp.task('default', ['lint']);
