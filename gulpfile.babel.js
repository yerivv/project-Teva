import gulp from 'gulp';
import babel from 'gulp-babel';
import debug from 'gulp-debug';
import { deleteAsync } from 'del';
import changed from 'gulp-changed';
import include from 'gulp-file-include';
import { htmlValidator } from 'gulp-w3c-html-validator';
import concat from 'gulp-concat';
import uglify from 'gulp-uglify';
import dartSass from 'sass';
import gulpSass from 'gulp-sass';
import autoprefixer from 'gulp-autoprefixer';
import sourcemaps from 'gulp-sourcemaps';
import gulpimage from 'gulp-image';
import browserSync from 'browser-sync';
import inquirer from 'inquirer';

const sass = gulpSass(dartSass);

browserSync.create();

let TASK = {
	DEV: 'local/',
	BUILD: 'dist/',
	STATE: null,
};

const DIR = {
	SRC: 'src/',
	DEV: 'local/',
	BUILD: 'dist/',
};

const ROUTES = {
	SRC: {
		HTML: DIR.SRC + 'html/**/*.html',
		JS: DIR.SRC + 'assets/js/ui/*.js',
		DEVELOP: DIR.SRC + 'assets/js/develop.js',
		CSS: DIR.SRC + 'assets/scss/**/*.{scss,css}',
		LIB: DIR.SRC + 'assets/lib/**/*.*',
		FONTS: DIR.SRC + 'assets/fonts/*.*',
		IMAGE: DIR.SRC + 'assets/images/**/*.{gif,jpg,png}',
		MEDIA: DIR.SRC + 'assets/media/**/*.*',
	},
	DEV: {
		HTML: DIR.DEV,
		JS: DIR.DEV + 'js/',
		CSS: DIR.DEV + 'css/',
		LIB: DIR.DEV + 'lib/',
		FONTS: DIR.DEV + 'fonts/',
		IMAGE: DIR.DEV + 'images/',
		MEDIA: DIR.DEV + 'media/',
	},
	BUILD: {
		HTML: DIR.BUILD,
		JS: DIR.BUILD + 'js/',
		CSS: DIR.BUILD + 'css/',
		LIB: DIR.BUILD + 'lib/',
		FONTS: DIR.BUILD + 'fonts/',
		IMAGE: DIR.BUILD + 'images/',
		MEDIA: DIR.BUILD + 'media/',
	},
};

//move
const move = {
	lib(src, dest) {
		return gulp
			.src(src)
			.pipe(changed(dest, { hasChanged: changed.compareContents }))
			.pipe(debug({ title: 'MOVE LIB:' }))
			.pipe(gulp.dest(dest))
			.pipe(browserSync.reload({ stream: true }));
	},
	fonts(src, dest) {
		return gulp
			.src(src)
			.pipe(changed(dest, { hasChanged: changed.compareContents }))
			.pipe(debug({ title: 'MOVE FONTS:' }))
			.pipe(gulp.dest(dest))
			.pipe(browserSync.reload({ stream: true }));
	},
	image(src, dest) {
		return gulp
			.src(src)
			.pipe(changed(dest, { hasChanged: changed.compareContents }))
			.pipe(debug({ title: 'MOVE IMAGE:' }))
			.pipe(gulp.dest(dest))
			.pipe(browserSync.reload({ stream: true }));
	},
	media(src, dest) {
		return gulp
			.src(src)
			.pipe(changed(dest, { hasChanged: changed.compareContents }))
			.pipe(debug({ title: 'MOVE MEDIA:' }))
			.pipe(gulp.dest(dest))
			.pipe(browserSync.reload({ stream: true }));
	},
};

//compile
const compile = {
	html(mode) {
		return gulp
			.src(ROUTES.SRC.HTML, {
				since: gulp.lastRun(compile.html),
			})
			.pipe(
				include({
					prefix: '@@',
					basepath: '@file',
				})
			)
			.pipe(debug({ title: 'HTML Compile:' }))
			.pipe(gulp.dest(TASK.STATE))
			.pipe(browserSync.reload({ stream: true }))
			.on('end', () => {
				if(mode == 'build') {
					//deleteAsync([TASK.STATE + 'guide']);
				}
				deleteAsync([TASK.STATE + '_include']);
			});
	},
	js(src, dest, mode) {
		return mode == 'build'
			? gulp
					.src(src)
					.pipe(babel())
					.pipe(concat('ui.js'))
					.pipe(uglify())
					.pipe(debug({ title: 'JS Compile:' }))
					.pipe(gulp.dest(dest))
					.pipe(browserSync.reload({ stream: true }))
			: gulp
					.src(src)
					.pipe(sourcemaps.init())
					.pipe(babel())
					.pipe(concat('ui.js'))
					.pipe(debug({ title: 'JS Compile:' }))
					.pipe(sourcemaps.write())
					.pipe(gulp.dest(dest))
					.pipe(browserSync.reload({ stream: true }));
	},
	develop(src, dest) {
		return gulp
			.src(src)
			.pipe(babel())
			.pipe(debug({ title: 'DEVELOP Compile:' }))
			.pipe(gulp.dest(dest))
			.pipe(browserSync.reload({ stream: true }));
	},
	css(src, dest, mode) {
		return mode == 'build'
			? gulp
					.src(src)
					.pipe(sass({ outputStyle: 'compressed' }))
					.pipe(
						autoprefixer({
							development: [
								'last 2 chrome version',
								'last 2 firefox version',
								'last 2 safari version',
								'last 1 ie version',
							],
						})
					)
					.pipe(debug({ title: 'SCSS Compile:' }))
					.pipe(gulp.dest(dest))
					.pipe(browserSync.reload({ stream: true }))
			: gulp
					.src(src)
					.pipe(sourcemaps.init())
					.pipe(sass({ outputStyle: 'expanded' }))
					.pipe(
						autoprefixer({
							development: [
								'last 2 chrome version',
								'last 2 firefox version',
								'last 2 safari version',
								'last 1 ie version',
							],
						})
					)
					.pipe(debug({ title: 'SCSS Compile:' }))
					.pipe(sourcemaps.write())
					.pipe(gulp.dest(dest))
					.pipe(browserSync.reload({ stream: true }));
	},
};

//watch
const live = {
	watch() {
		let watcher = {
			html: gulp.watch(ROUTES.SRC.HTML, compile.html),
			js: gulp.watch(ROUTES.SRC.JS, compileJsToLocal),
			develop: gulp.watch(ROUTES.SRC.DEVELOP, compileDevelopToLocal),
			css: gulp.watch(ROUTES.SRC.CSS, compileCssToLocal),
			lib: gulp.watch(ROUTES.SRC.LIB, moveLibToLocal),
			fonts: gulp.watch(ROUTES.SRC.FONTS, moveFontsToLocal),
			image: gulp.watch(ROUTES.SRC.IMAGE, moveImageToLocal),
			media: gulp.watch(ROUTES.SRC.MEDIA, moveMediaToLocal),
		};
	},
	server() {
		browserSync.init({
			port: 2023,
			startPath: 'index.html',
			server: {
				baseDir: 'local/',
				directory: true,
			},
		});
	},
};

//improve
const improve = {
	image() {
		return gulp.src(ROUTES.SRC.IMAGE).pipe(gulpimage()).pipe(gulp.dest(ROUTES.BUILD.IMAGE));
	},
	validation() {
		return gulp
			.src([ROUTES.BUILD.HTML + '**/*.html', '!dist/_include/**/*.html', '!dist/modal/**/*.html'])
			.pipe(
				htmlValidator.analyzer({
					ignoreLevel: 'warning',
					ignoreMessages: /^Duplicate ID/,
				})
			)
			.pipe(htmlValidator.reporter());
	},
};

//dev
const compileHtmlToLocal = () => compile.html();
const compileJsToLocal = () => compile.js(ROUTES.SRC.JS, ROUTES.DEV.JS);
const compileDevelopToLocal = () => compile.develop(ROUTES.SRC.DEVELOP, ROUTES.DEV.JS);
const compileCssToLocal = () => compile.css(ROUTES.SRC.CSS, ROUTES.DEV.CSS);
const moveLibToLocal = () => move.lib(ROUTES.SRC.LIB, ROUTES.DEV.LIB);
const moveFontsToLocal = () => move.fonts(ROUTES.SRC.FONTS, ROUTES.DEV.FONTS);
const moveImageToLocal = () => move.image(ROUTES.SRC.IMAGE, ROUTES.DEV.IMAGE);
const moveMediaToLocal = () => move.media(ROUTES.SRC.MEDIA, ROUTES.DEV.MEDIA);

const cleanLocal = () => deleteAsync(['local']);
const moveLocal = gulp.parallel(moveLibToLocal, moveFontsToLocal, moveImageToLocal, moveMediaToLocal);
const compileLocal = gulp.parallel(compileHtmlToLocal, compileJsToLocal, compileDevelopToLocal, compileCssToLocal);

const watchDev = gulp.parallel(live.watch, live.server);
const dev = gulp.series([cleanLocal, moveLocal, compileLocal, watchDev]);

//build
const compileHtmlToDist = () => compile.html('build');
const compileJsToDist = () => compile.js(ROUTES.SRC.JS, ROUTES.BUILD.JS, 'build');
const compileDevelopToDist = () => compile.develop(ROUTES.SRC.DEVELOP, ROUTES.BUILD.JS);
const compileCssToDist = () => compile.css(ROUTES.SRC.CSS, ROUTES.BUILD.CSS, 'build');
const moveLibToDist = () => move.lib(ROUTES.SRC.LIB, ROUTES.BUILD.LIB);
const moveFontsToDist = () => move.fonts(ROUTES.SRC.FONTS, ROUTES.BUILD.FONTS);
const moveImageToDist = () => move.image(ROUTES.SRC.IMAGE, ROUTES.BUILD.IMAGE);
const moveMediaToDist = () => move.media(ROUTES.SRC.MEDIA, ROUTES.BUILD.MEDIA);

const cleanDist = () => deleteAsync(['dist']);
const moveDist = gulp.parallel(moveLibToDist, moveFontsToDist, moveImageToDist, moveMediaToDist);
const compileDist = gulp.parallel(compileHtmlToDist, compileJsToDist, compileDevelopToDist, compileCssToDist);

const improveBuild = gulp.series([improve.image, improve.validation]);
const build = gulp.series([cleanDist, moveDist, compileDist, improveBuild]);

//clean
const clean = gulp.parallel(cleanLocal, cleanDist);

export const run = () => {
	return inquirer
		.prompt([
			{
				type: 'list',
				name: 'task',
				message: 'Select Task',
				choices: ['DEV', 'BUILD', 'CLEAN'],
			},
		])
		.then((answers) => {
			if (answers.task == 'DEV') {
				dev();
				TASK.STATE = TASK.DEV;
			} else if (answers.task == 'BUILD') {
				build();
				TASK.STATE = TASK.BUILD;
			} else if (answers.task == 'CLEAN') {
				clean();
			}
		});
};