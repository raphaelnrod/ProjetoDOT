var gulp = require("gulp");
var concat = require("gulp-concat");
var cssmin = require("gulp-cssmin");
var imagemin = require("gulp-imagemin");
var htmlReplace = require("gulp-html-replace");
var clean = require("gulp-clean");
var zip = require("gulp-zip");
var runSequence = require("run-sequence");
var browserSync = require("browser-sync").create();
var reload = browserSync.reload;
var produce = false;

//live reloading server
gulp.task("server", () => {
  browserSync.init({
    server: {
      baseDir: "./src",
    },
  });
  !produce &&
    gulp.watch(["./src/*.html", "./src/css/*.css"]).on("change", reload);
});

//copia a pasta webapp e raliza as otimizações
gulp.task("init", () => {
  produce = true;
  runSequence(
    "clean-webapp",
    "copy-folder-webapp",
    "copy-css", 
    "build-html", 
    "otimizar-img",
    "zip",
    "clean-dist"
  );
});

//copia a pasta webapp para o projeto gulp
gulp.task("copy-folder-webapp", () => {
  return gulp.src(["./src/**/*"]).pipe(gulp.dest("./target/webapp"));
});

//remove pasta dist
gulp.task("clean-dist", () => {
  gulp.src("./target/dist/").pipe(clean({ force: true }));
});

//remove pasta webapp do projeto
gulp.task("clean-webapp", () => {
  gulp.src("./target/webapp/").pipe(clean({ force: true }));
});

//comprime a pasta webapp gerando o package.nw
gulp.task("zip", () => {
  return gulp
    .src("./target/webapp/**/*")
    .pipe(zip("package.zip"))
    .pipe(gulp.dest("./target/"));
});

//aponta para os arquivos minificados no index.html
gulp.task('default', function() {
  gulp.src('index.html')
    .pipe(htmlreplace({
        'css': 'styles.min.css',
        'js': 'js/bundle.min.js'
    }))
    .pipe(gulp.dest('build/'));
});

gulp.task("build-html", () => {
  return gulp
    .src("./target/webapp/index.html")
    .pipe(
      htmlReplace({
        style: "./target/webapp/css/styles.min.css",
      })
    )
    .pipe(gulp.dest("./target/webapp/"));
});

//otimiza as imagens
gulp.task("otimizar-img", () => {
  return gulp
    .src("./target/webapp/img/**/*")
    .pipe(imagemin())
    .pipe(gulp.dest("./target/webapp/img"));
});

//################################################
// #######   Concatenação e Minificacao  #######
// ################################################

//concatena e minifica os css
gulp.task("concat-css", () => {
  return gulp
    .src("./target/webapp/css/*.css")
    .pipe(concat("styles.min.css"))
    .pipe(cssmin())
    .pipe(gulp.dest("./target/dist/css/"));
});

//copia os css concatenado para a pasta css dentro de webapp
gulp.task("copy-css", ["concat-css"], () => {
  gulp.src("./target/webapp/css/*.css").pipe(clean({ force: true }));
  gulp
    .src("./target/dist/css/styles.min.css")
    .pipe(gulp.dest("./target/webapp/css/"));
});
