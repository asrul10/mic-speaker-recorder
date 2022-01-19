"use strict";

const { src } = require("gulp");
const gulp = require("gulp");
const babel = require("gulp-babel");
const rename = require("gulp-rename");
const webpack = require("webpack-stream");

exports.default = () =>
  src("./MicSpeakerRecorder.js")
    .pipe(
      webpack({
        mode: "production",
        optimization: {
          minimize: false,
        },
        output: {
          library: "MicSpeakerRecorder",
          libraryTarget: "umd",
          umdNamedDefine: true,
          libraryExport: "default",
        },
      })
    )
    .pipe(
      babel({
        presets: ["@babel/preset-env", "minify"],
        comments: false,
      })
    )
    .pipe(rename("MicSpeakerRecorder.bundle.min.js"))
    .pipe(gulp.dest("."));
