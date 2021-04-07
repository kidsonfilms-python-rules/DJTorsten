const $console = require('Console');
const readlineSync = require('readline-sync');
const fetch = require('node-fetch');
const package = require('./package.json');
const fs = require('fs')
const path = require('path')
const spawn = require('child_process').spawn
const { Octokit } = require("@octokit/core");
const http = require('http')


const octokit = new Octokit({ auth: process.env.GITHUB_TOKEN });
const gitHubPath = 'kidsonfilms-python-rules/DJFlame-Releases';  // example repo
const releaseAPIUrl = 'https://api.github.com/repos/' + gitHubPath + '/tags';
function versionCompare(v1, v2, options) {
    var lexicographical = options && options.lexicographical,
        zeroExtend = options && options.zeroExtend,
        v1parts = v1.replace('v', '').split('-')[0].split('.'),
        v2parts = v2.replace('v', '').split('-')[0].split('.');

    function isValidPart(x) {
        return (lexicographical ? /^\d+[A-Za-z]*$/ : /^\d+$/).test(x);
    }

    if (!v1parts.every(isValidPart) || !v2parts.every(isValidPart)) {
        return NaN;
    }

    if (zeroExtend) {
        while (v1parts.length < v2parts.length) v1parts.push("0");
        while (v2parts.length < v1parts.length) v2parts.push("0");
    }
    if (!lexicographical) {
        v1parts = v1parts.map(Number);
        v2parts = v2parts.map(Number);
    }
    for (var i = 0; i < v1parts.length; ++i) {
        if (v2parts.length == i) {
            return 1;
        }
        if (v1parts[i] == v2parts[i]) {
            continue;
        }
        else if (v1parts[i] > v2parts[i]) {
            return 1;
        }
        else {
            return -1;
        }
    }
    if (v1parts.length != v2parts.length) {
        return -1;
    }
    return 0;
}

function uploadAssetToGitHubReleases(uploadURL, filePath, assetName, log) {
    var
        request = require('request'),
        fs = require('fs');

    var stats = fs.statSync(filePath);

    var options = {
        url: uploadURL.replace('{?name}', ''),
        port: 443,
        auth: {
            pass: 'x-oauth-basic',
            user: process.env.GITHUB_TOKEN
        },
        json: true,
        headers: {
            'User-Agent': 'Release-Agent',
            'Accept': 'application/vnd.github.v3+json',
            'Content-Type': 'multipart/form-data',
            'Content-Length': stats.size
        },
        qs: {
            name: assetName
        }
    };

    // Better as a stream
    fs.createReadStream(filePath).pipe(request.post(options, function (err, res) {
        if (log) {
            console.log(res)
            console.log(err)
        }
    }));
}

$console.stress('Welcome to DJFlame Version Publisher CLI Tool! \n')
$console.warn('Are you sure you want to proceed with a PUBLIC RELEASE?')
if (readlineSync.keyInYNStrict()) {
    $console.log('Got It, Proceeding with the Code Tests...\n')

    $console.log('Checking for new Version in package.json...')
    //Checking if new release is defined...
    console.log('   Got API URL: ', releaseAPIUrl)
    fetch(releaseAPIUrl).then(response => response.json()).then(data => {
        $console.success('   Got Latest Published DJFlame Version! Version:', data[0].name)
        const versions = data.sort((v1, v2) => versionCompare(v1.name, v2.name));
        if (versions[0].name.replace('v', '').split('-')[0] != package.version) {
            $console.success('   Verified Current Project is a different version than the last published version!')
        } else {
            $console.error('ERROR: Current Project and Last Public Release are Tagged the Same! Change the Versioning in package.json before proceeding!')
            process.exit(1)
        }
    }).catch(err => {
        $console.error('ERROR: Could not access Github Releases API!')
        $console.error('Make sure the following is the right API URL: ', releaseAPIUrl)
        $console.error('\nFull Error:\n', err)
        process.exit(1)
    }).then(() => {
        $console.log('\nChecking if caches are clear...')
        var cacheFiles = fs.readdirSync(`${__dirname}/music/`);
        const fi = cacheFiles.indexOf('Rick Astley - Never Gonna Give You Up (Video).mp3');
        if (fi > -1) {
            cacheFiles.splice(fi, 1);
        }
        if (cacheFiles.length == 0) {
            $console.success('  Caches are Clear!')
        } else {
            $console.log(`  ${cacheFiles.length} files found! Clearing cache...`)
            var directory = 'music'
            for (const file of cacheFiles) {
                fs.unlink(path.join(directory, file), err => {
                    if (err) throw err;
                });
                $console.log(`  Deleted ${file}`)
            }
            $console.success('    Caches are Clear!')
        }
    }).then(() => {
        console.log('\nChecking if package.json build config is filled out properly...')
        var macCategory = false
        var appIDBool = false
        var asar = false
        if (package.build.asar == false) {
            $console.warn('     asar is set to false, this requires approval.')
            var adminPassword = readlineSync.question('     Enter Authorized Admin Password. Type cancel to exit.\n>>>    ', {
                hideEchoBack: true,
                caseSensitive: true,
                confirmMessage: true,
                mask: '*',
                cancel: true
            })
            if (adminPassword.toLowerCase() == 'cancel') {
                $console.stress('Cancelling...')
                process.exit()
            } else if (adminPassword == 'djflamesecurepasswordneil123$') {
                $console.success('     Approved by Siddharth Ray...')
            } else {
                $console.error('     Password Wrong, Exiting...')
                process.kill(0)
            }
        } else asar = true
        if (package.build.appId === null) {
            $console.error('     App ID must not be null, fill it in. Located in package.json')
            process.kill(0)
        } else appIDBool = true
        if (package.build.mac.category === null) {
            $console.warn('     macOS Category is null, it is highly recomended that it is filled in.')
        } else macCategory = true
        if (package.build.files.length != 0) {
            console.log('     Make sure that these are the only files you want to include in the fiinal build:\n', package.build.files)
            if (!readlineSync.keyInYNStrict('I confirmed that these are the only files to be included in the distribution files')) {
                $console.stress('Exiting...')
                process.kill(0)
            }
        }
        return {
            macCategory: macCategory,
            asar: asar,
            appID: appIDBool
        }
    }).then((data) => {
        $console.log('\nThe following are the list of warnings or errors given during the check:')
        if (data.asar) {
            $console.success('✓    Asar Encryption')
        } else {
            $console.warn('✘    Asar Encryption')
        }
        if (data.appID) {
            $console.success('✓    App ID')
        } else {
            $console.warn('✘    App ID')
        }
        if (data.macCategory) {
            $console.success('✓    macOS Category')
        } else {
            $console.warn('✘    macOS Category')
        }
        $console.success('✓    Confirmed Included Files')
        readlineSync.keyInYNStrict('I have read these warnings and errors and are willing to ignore them.')
    }).then(() => {
        $console.log('\nGenerating Distribution Files...')
        var distGeneration = spawn('npm', ['run', 'dist'])
        distGeneration.stdout.on('data', (data) => $console.log(data.toString()))
        distGeneration.stderr.on('data', (data) => $console.error(data.toString()))
        distGeneration.on('exit', function (code) {
        $console.success('child process exited with code ' + code.toString());
        console.log(' ')
        var versionTag = ''
        versionTag = readlineSync.question('Any tags? e.g. \'beta\' or \'alpha\'. Hit enter to skip:    ', {
            confirmMessage: true
        })
        if (versionTag) {
            versionTag = '-' + versionTag
        }
        // octokit.request('POST /repos/{owner}/{repo}/releases', {
        //     owner: 'kidsonfilms-python-rules',
        //     repo: 'DJFlame-Releases',
        //     tag_name: 'v' + package.version + versionTag,
        //     draft: true
        // }).then((data) => {
        //     // console.log(data.data.upload_url)
        //     // console.log(data.data.upload_url.split('/')[7])
        //     // uploadAssetToGitHubReleases(data.data.upload_url, path.join(__dirname, 'dist/DJFlame-3.0.1-mac.zip'), 'DJFlame-3.0.1-mac.zip', true)
        //     $console.success('Successfully created ')

        // })
          });
    })

} else {
    $console.success('Got it! Exiting the CLI Tool...')
}