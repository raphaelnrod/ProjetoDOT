var gulp = require("gulp");
var concat = require("gulp-concat");
var cssmin = require("gulp-cssmin");
var imagemin = require("gulp-imagemin");
var zip = require("gulp-zip");
var runSequence = require("run-sequence");
var browserSync = require("browser-sync").create();
var reload = browserSync.reload;

//live reloading server
gulp.task("server", function () {
  browserSync.init({
    server: {
      baseDir: "./src",
    },
  });
  gulp.watch(["./src/*.html", "./src/css/*.css"]).on("change", reload);
});

//copia a pasta webapp e raliza as otimizações
gulp.task("build", function () {
  runSequence(
    "copy-folder-webapp",
    ["copy-css", "build-html", "otimizar-img"],
    "zip",
    "clean-dist",
    "clean-webapp"
  );
});

//copia a pasta webapp para o projeto gulp
gulp.task("copy-folder-webapp", function () {
  return gulp
    .src(["**/*", "!node_modules", "!node_modules/**", "!gulpfile.js"])
    .pipe(gulp.dest("../target/webapp"));
});

//remove pasta dist
gulp.task("clean-dist", function () {
  gulp.src("../target/dist/").pipe(clean({ force: true }));
});

//remove pasta webapp do projeto
gulp.task("clean-webapp", function () {
  gulp.src("../target/webapp/").pipe(clean({ force: true }));
});

//comprime a pasta webapp gerando o package.nw
gulp.task("zip", function () {
  return (
    gulp
      .src("../target/webapp/**/*")
      //.pipe(zip('package.nw'))
      .pipe(zip("package.zip"))
      .pipe(gulp.dest("../target/"))
  );
});

//aponta para os arquivos minificados no index.html
gulp.task("build-html", function () {
  return gulp
    .src("../target/webapp/index.html")
    .pipe(
      htmlReplace({
        styles: "resources/css/styles.min.css",
      })
    )
    .pipe(gulp.dest("../target/webapp/"));
});

//otimiza as imagens
gulp.task("otimizar-img", function () {
  return gulp
    .src("../target/webapp/img/**/*")
    .pipe(imagemin())
    .pipe(gulp.dest("../target/webapp/img"));
});

//################################################
// #######   Concatenação e Minificacao  #######
// ################################################

//concatena e minifica os css
gulp.task("concat-css", function () {
  return gulp
    .src("../target/webapp/css/*.css")
    .pipe(concat("styles.min.css"))
    .pipe(cssmin())
    .pipe(gulp.dest("../target/dist/css/"));
});

//copia os css concatenado para a pasta css dentro de webapp
gulp.task("copy-css", ["concat-css"], function () {
  gulp.src("../target/webapp/css/*.css").pipe(clean({ force: true }));
  gulp
    .src("../target/dist/css/styles.min.css")
    .pipe(gulp.dest("../target/webapp/css/"));
});
