exports.default =  class Canary {
    constructor(window, discordRPC) {
        this.window = window
        this.discordRPC = discordRPC
        this.queue = []

        // DATA CLASSES
        class Song {
            constructor(url, probarDiv, docName, title, author, requester) {
                this.url = url
                this.progressDiv = probarDiv
                this.docName = docName
                this.title = title
                this.author = author
                this.requester = requester
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

    play(song) {
        console.log(`[CANARY] Playing Song... SONG: ${song.url}`)
        const ytEmbed = `<iframe width="560" height="315" src="https://www.youtube-nocookie.com/embed/${this.getId(song.url)}?controls=0" title="YouTube video player" frameborder="0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" allowfullscreen></iframe>`
        console.log(ytEmbed)


        this.discordRPC.request('SET_ACTIVITY', {
            pid: process.pid,
            activity: {
                details: `Playing ${song.title}`,
                state: `Song #${song.docName}`,
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
    }
}