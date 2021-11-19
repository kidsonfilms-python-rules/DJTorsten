const path = require('path');
const fs = require('fs')
const Console = require('Console')
const chalk = require('chalk')
const filesize = require('filesize')
const UglifyJS = require("uglify-js");
const minify = require('minify');
var exec = require('child_process').execSync, child;

exports.default = async context => {
  const APP_NAME = context.packager.appInfo.productFilename;
  const APP_OUT_DIR = context.appOutDir;
  const PLATFORM = context.packager.platform.name;

  var uncompProSize = 0
  var walk = function (dir, done) {
    var results = [];
    fs.readdir(dir, function (err, list) {
      if (err) return done(err);
      var i = 0;
      (function next() {
        var file = list[i++];
        if (!file) return done(null, results);
        file = path.resolve(dir, file);
        fs.stat(file, function (err, stat) {
          if (stat && stat.isDirectory() && !file.includes('node_modules')) {
            walk(file, function (err, res) {
              results = results.concat(res);
              next();
            });
          } else {
            uncompProSize += stat.size
            results.push(file);
            next();
          }
        });
      })();
    });
  };

  async function compressFiles(files) {
    return new Promise(async (resolve, reject) => {
      var compProSize = 0
      for (var i = 0, len = files.length; i < len; i++) {
        const file = files[i]
        if (file.includes('.js') && !file.includes('.json')) {

          const options = {
            compress: {
              drop_console: file.includes('main.js') ? true : false,
              toplevel: true
            }
          }

          const beforeFileStats = fs.statSync(file)

          Console.log(`Compressing ${chalk.bold(path.basename(file))}...            Current Size ${chalk.bold(filesize(beforeFileStats.size, { round: 0 }))}`)
          fs.writeFileSync(file, UglifyJS.minify({
            file: fs.readFileSync(file, "utf8"),
          }, options).code, "utf8");
          compProSize += fs.statSync(file).size;
          Console.success(`Compressed ${path.basename(file)}!               Compressed Size ${chalk.bold(filesize(fs.statSync(file).size, { round: 0 }))} ${chalk.bold(chalk.red(`-${filesize((beforeFileStats.size - fs.statSync(file).size), { round: 0 })} -${Math.floor(((beforeFileStats.size - fs.statSync(file).size) / beforeFileStats.size) * 100)}%`))}`)
        } else if (file.includes('.html') || file.includes('.css')) {

          const options = {
            html: {
              removeAttributeQuotes: false,
              removeOptionalTags: false,
            },
            img: {
              maxSize: 0,
            },
          }
          // const minidata = await minify(file, options)
          const beforeFileStats = fs.statSync(file)

          // minify(file, options).then((minidata) => {
            Console.log(`Compressing ${chalk.bold(path.basename(file))}...            Current Size ${chalk.bold(filesize(beforeFileStats.size, { round: 0 }))}`)
            fs.writeFileSync(file, await minify(file, options), "utf8");
            compProSize += fs.statSync(file).size;
            Console.success(`Compressed ${path.basename(file)}!               Compressed Size ${chalk.bold(filesize(fs.statSync(file).size, { round: 0 }))} ${chalk.bold(chalk.red(`-${filesize((beforeFileStats.size - fs.statSync(file).size), { round: 0 })} -${Math.floor(((beforeFileStats.size - fs.statSync(file).size) / beforeFileStats.size) * 100)}%`))}`)
          // })
        } else if (file.includes('.json')) {
          const beforeFileStats = fs.statSync(file)
          Console.log(`Compressing ${chalk.bold(path.basename(file))}...            Current Size ${chalk.bold(filesize(beforeFileStats.size, { round: 0 }))}`)
          var jsonFileData = fs.readFileSync(file, 'utf-8')
          const minifiedJsonFile = jsonFileData.replace(/\s+(?=([^"]*"[^"]*")*[^"]*$)/g,"")
          fs.writeFileSync(file, minifiedJsonFile)
          compProSize += fs.statSync(file).size;
          Console.success(`Compressed ${path.basename(file)}!               Compressed Size ${chalk.bold(filesize(fs.statSync(file).size, { round: 0 }))} ${chalk.bold(chalk.red(`-${filesize((beforeFileStats.size - fs.statSync(file).size), { round: 0 })} -${Math.floor(((beforeFileStats.size - fs.statSync(file).size) / beforeFileStats.size) * 100)}%`))}`)
        } else {
          compProSize += fs.statSync(file).size;
        }
      }
      resolve(compProSize)
    })
  }

  if (PLATFORM == 'mac') {
    exec('cd dist/mac/DJFlame.app/Contents/Resources/ && npx asar extract app.asar app',
    function (error, stdout, stderr) {
        console.log('stdout: ' + stdout);
        console.log('stderr: ' + stderr);
        if (error !== null) {
             console.log('exec error: ' + error);
        }
    });
    const cwd = path.join(`${APP_OUT_DIR}`, `${APP_NAME}.app/Contents/Resources/app`);
    walk(cwd, async (err, files) => {
      Console.log(chalk.bold(`Uncompressed Project Size (No Node Modules): ${chalk.greenBright(filesize(uncompProSize))}`))
      var compProSize = await compressFiles(files)
      Console.success(`Finished Compressing!`)
      Console.log(chalk.bold(`Compressed Project Size (No Node Modules): ${chalk.greenBright(`${filesize(compProSize)} ${chalk.red(`-${filesize((uncompProSize - compProSize), { round: 0 })} -${Math.floor(((uncompProSize - compProSize) / uncompProSize) * 100)}%`)}`)}`))
    //   exec('cd dist/mac/DJFlame.app/Contents/Resources/ && npx asar pack app app.asar && rm -rf app/',
    // function (error, stdout, stderr) {
    //     console.log('stdout: ' + stdout);
    //     console.log('stderr: ' + stderr);
    //     if (error !== null) {
    //          console.log('exec error: ' + error);
    //     }
    // });
    })
  }
};