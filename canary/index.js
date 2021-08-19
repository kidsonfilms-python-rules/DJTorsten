const { ipcMain } = require('electron')
const Soundplayer = require('play-sound')(opts = {})
const { getAudioDurationInSeconds } = require('get-audio-duration');
const Config = require('electron-store');


exports.default = class Canary {
    constructor(ipc, discordRPC, eventEmitter, mainWindow) {
        this.ipc = ipc
        this.discordRPC = discordRPC
        this.queue = []
        this.eventEmitter = eventEmitter
        this.mainWindow = mainWindow
        this.config = new Config()

        // DATA CLASSES
        class Song {
            constructor(url, probarDiv, docName, title, author, requester, explicit) {
                this.url = url
                this.progressDiv = probarDiv
                this.docName = docName
                this.title = title
                this.author = author
                this.requester = requester
                this.explicit = explicit
            }
        }

        // DISCORD RPC
        const config = require('./json/idle-rpc.json')

        this.discordRPC.login({ clientId: "852431558241026058" }).catch(console.error);

        this.discordRPC.on('ready', () => {
            console.log('[CANARY] Discord RPC Ready...')
            this.discordRPC.request('SET_ACTIVITY', {
                pid: process.pid,
                activity: {
                    details: config.Details,
                    state: config.State,
                    assets: {
                        large_image: config.LargeImage,
                        large_text: config.LargeImageText,
                        small_image: config.SmallImage,
                        small_text: config.SmallImageText,
                    },
                    buttons: [
                        {
                            label: config.Button1, url: config.Url1
                        }
                    ]
                }
            })
        })
    }

    add(song) {
        this.queue.push(song)
    }

    remove(songIndex) {
        this.queue.splice(songIndex, 1)
    }

    getId(url) {
        const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|&v=)([^#&?]*).*/;
        const match = url.match(regExp);

        return (match && match[2].length === 11)
            ? match[2]
            : null;
    }

    play(song, songLen, index) {
        return new Promise((resolve, reject) => {
            console.log(`[CANARY] Playing Song... SONG: ${song.url}`)
            // console.log({ id: this.getId(song.url), time: songLen*1000 })
            this.ipc.send('canaryPlay', { id: this.getId(song.url), time: songLen * 1000, index: index })


            this.discordRPC.request('SET_ACTIVITY', {
                pid: process.pid,
                activity: {
                    details: `Playing ${song.title}`,
                    state: `Song ${parseInt(index) + 1}/${this.queue.length}`,
                    assets: {
                        large_image: 'test',
                        large_text: 'Guest Picks',
                        small_image: 'djflame_logo',
                        small_text: 'DJFlame',
                    },
                    buttons: [
                        {
                            label: 'Join Party', url: 'https://djflame.tech'
                        }
                    ]
                }
            })

            this.eventEmitter.on('stop', () => {
                this.ipc.send('canaryStop')
            })

            this.eventEmitter.on('skip', () => {
                this.ipc.send('canaryStop')
            })

            var stopListener = () => {
                console.log('[CANARY] Song Stopped...')
                resolve()
                ipcMain.removeListener('canaryStopped', stopListener)
            }
            ipcMain.on('canaryStopped', stopListener)

        })
    }

    playLocal(song, songLen, index) {
        return new Promise(async (resolve, reject) => {
            console.log(`[CANARY] Playing Song... SONG: ${song.url}`)
            // console.log({ id: this.getId(song.url), time: songLen*1000 })
            // this.ipc.send('canaryPlay', { id: this.getId(song.url), time: songLen*1000, index: index })

            var songInstance = Soundplayer.play(song.url, function (err) {
                if (err) console.error(err);
                console.log('[CANARY] Song Stopped...')
                clearInterval(playTimeInterval)
                resolve()
            });

            var startDate = new Date()

            this.discordRPC.request('SET_ACTIVITY', {
                pid: process.pid,
                activity: {
                    details: `Playing ${song.title}`,
                    state: `Song ${parseInt(index) + 1}/${this.queue.length}`,
                    assets: {
                        large_image: 'test',
                        large_text: 'Guest Picks',
                        small_image: 'djflame_logo',
                        small_text: 'DJFlame',
                    },
                    buttons: [
                        {
                            label: 'Join Party', url: 'https://djflame.tech'
                        }
                    ]
                }
            })

            const mainWindow = this.mainWindow
            var playTimeInterval = null
            var videoDur = await getAudioDurationInSeconds(song.url)
            const config = this.config
            playTimeInterval = setInterval(function () {
                // const percentage = ((songInstance.getCurrentTime() / videoDur) * 100)
                var favSongs = config.get('heartSongs')
                var isFav = false;
                if (favSongs.includes(song.url)) isFav = true
                mainWindow.send('canaryTimeChange', { percentage: (((new Date() - startDate)/1000)/videoDur)*100, seconds: (new Date() - startDate)/1000, duration: videoDur, index: index, fav: isFav })
            }, 1000);

            this.eventEmitter.on('stop', () => {
                songInstance.kill()
                clearInterval(playTimeInterval)
                resolve()
            })

            this.eventEmitter.on('skip', () => {
                songInstance.kill()
                clearInterval(playTimeInterval)
                resolve()
            })

            setTimeout(function () {
                songInstance.kill()
            }, songLen * 1000);

        })
    }
}