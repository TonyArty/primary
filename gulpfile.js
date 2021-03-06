var gulp       = require('gulp'), // Подключаем Gulp
	sass         = require('gulp-sass'), //Подключаем Sass пакет,
	browserSync  = require('browser-sync'), // Подключаем Browser Sync
	concat       = require('gulp-concat'),
	concatCss    = require('gulp-concat-css'), // Подключаем gulp-concat (для конкатенации файлов)
	uglify       = require('gulp-uglify'), // Подключаем gulp-uglifyjs (для сжатия JS)
	cssnano      = require('gulp-cssnano'), // Подключаем пакет для минификации CSS
	rename       = require('gulp-rename'), // Подключаем библиотеку для переименования файлов
	del          = require('del'), // Подключаем библиотеку для удаления файлов и папок
	imagemin     = require('gulp-imagemin'), // Подключаем библиотеку для работы с изображениями
	pngquant     = require('imagemin-pngquant'), // Подключаем библиотеку для работы с png
	cache        = require('gulp-cache'), // Подключаем библиотеку кеширования
	autoprefixer = require('gulp-autoprefixer'),
	pug			     = require('gulp-pug'),
	pugPhp		   = require('gulp-jade-php'),
	babel		     = require('gulp-babel'),
	plumber		   = require('gulp-plumber'),
	svgSprite    = require("gulp-svg-sprites"),
	removeHtml   = require('gulp-remove-html')


gulp.task('pug', function() {
	return gulp.src('src/pug/*.pug')
		.pipe(plumber())
		.pipe(pug({
			pretty: true
		}))
		.pipe(gulp.dest('src'))
		.pipe(browserSync.reload({stream: true}))
});



gulp.task('babel', function() {
	return gulp.src('src/js/es6/**/*.js')
		.pipe(plumber())
		.pipe(babel({
			presets: ['es2015']
		}))
		.pipe(gulp.dest('src/js'))
		.pipe(browserSync.reload({stream: true}))
});



gulp.task('sass', function(){ // Создаем таск Sass
	return gulp.src('src/sass/*.scss') // Берем источник
		.pipe(sass()) // Преобразуем Sass в CSS посредством gulp-sass
		.pipe(autoprefixer(['last 15 versions', '> 1%', 'ie 8', 'ie 7'], { cascade: true })) // Создаем префиксы
		.pipe(gulp.dest('src/css')) // Выгружаем результата в папку src/css
		.pipe(browserSync.reload({stream: true})) // Обновляем CSS на странице при изменении
});



gulp.task('css-libs', ['sass'], function() {
	return gulp.src('src/css/libs/**/*.css') // Выбираем файл для минификации
		.pipe(concat('libs.min.css'))
		.pipe(cssnano()) // Сжимаем // Добавляем суффикс .min
		.pipe(gulp.dest('src/css')); // Выгружаем в папку src/css
});


gulp.task('scripts', function() {
	return gulp.src('src/libs/**/*.js')
		.pipe(concat('libs.min.js')) // Собираем их в кучу в новом файле libs.min.js
		// .pipe(uglify()) // Сжимаем JS файл
		.pipe(gulp.dest('src/js')); // Выгружаем в папку src/js
});

gulp.task('watchJs', function() {
	browserSync.reload({stream: true})
})






gulp.task('browser-sync', function() { // Создаем таск browser-sync
	browserSync({ // Выполняем browserSync
		server: { // Определяем параметры сервера
			baseDir: 'src' // Директория для сервера - src
		},
		notify: false // Отключаем уведомления
	});
});

gulp.task('watch', ['browser-sync', 'css-libs', 'scripts'], function() {
	gulp.watch('src/sass/**/*.scss', ['sass']); // Наблюдение за sass файлами в папке sass
	gulp.watch('src/pug/**/*.html', ['pug']); // Наблюдение за HTML файлами в корне проекта
	gulp.watch('src/js/**/*.js', browserSync.reload);   // Наблюдение за JS файлами в папке js , ['babel']
});






gulp.task('clean', function() {
	return del.sync('dist'); // Удаляем папку dist перед сборкой
});



gulp.task('img', function() {
	return gulp.src('src/img/**/*') // Берем все изображения из src
		.pipe(cache(imagemin({  // Сжимаем их с наилучшими настройками с учетом кеширования
			interlaced: true,
			progressive: true,
			svgoPlugins: [{removeViewBox: false}],
			use: [pngquant()]
		})))
		.pipe(gulp.dest('dist/img')); // Выгружаем на продакшен
});



gulp.task('svgSprite', function () {
    return gulp.src('src/img/sprite')
        .pipe(svgSprite())
        .pipe(gulp.dest("src/img/sprite/done")); // Write the sprite-sheet + CSS + Preview          // Create a PNG
});


gulp.task('build', ['clean', 'img', 'sass', 'scripts'], function() {

	var buildcss = gulp.src('src/css/*.css')
	.pipe(cssnano())
	.pipe(gulp.dest('dist/css'));

	var buildFonts = gulp.src('src/fonts/**/*') // Переносим шрифты в продакшен
	.pipe(gulp.dest('dist/fonts'));

	var buildPhp = gulp.src('src/php/**/*')
	.pipe(gulp.dest('dist/php'));

	var buildJs = gulp.src('src/js/**/*.js')
	.pipe(babel({
		presets: ['es2015']
	})) // Переносим скрипты в продакшен
	.pipe(uglify())
	// .pipe(plumber())
	.pipe(gulp.dest('dist/js'));

	var buildHtml = gulp.src('src/*.html') // Переносим HTML в продакшен
	.pipe(gulp.dest('dist'));

});



gulp.task('clear', function (callback) {
	return cache.clearAll();
});



gulp.task('default', ['watch']);
