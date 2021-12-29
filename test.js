// const { default:Canary } = require("./canary/Canary");

// const rpc = require("discord-rpc");
// const rpcClient = new rpc.Client({ transport: 'ipc' });

// class Song {
//     constructor(url, probarDiv, docName, title, author, requester, explicit) {
//         this.url = url
//         this.progressDiv = probarDiv
//         this.docName = docName
//         this.title = title
//         this.author = author
//         this.requester = requester
//         this.explicit = explicit
//     }
// }

// function sleep(ms) {
//     return new Promise(resolve => setTimeout(resolve, ms));
// }

// const player = new Canary('', rpcClient)
// async function main() {
//     await sleep(1000)
//     player.play(new Song('https://www.youtube.com/watch?v=tnw0iu9hMP8', '', '2', 'Bendable Rocks Are Weird', 'Action Labs Shorte', 'DJ'))
// }
// main()

const KeyC = Symbol("summer")
const KeyF = Symbol("autumn")
const KeyBF = Symbol("winter")
const KeyEF = Symbol("spring")
const KeyAF = Symbol("spring")
const KeyDF = Symbol("spring")
const KeyGF = Symbol("spring")
const KeyCF = Symbol("spring")
const KeyG = Symbol("spring")
const KeyD = Symbol("spring")
const KeyA = Symbol("spring")
const KeyE = Symbol("spring")
const KeyB = Symbol("spring")
// const KeyF = Symbol("spring")
// const KeyC = Symbol("spring")

class CLLSong {
    constructor(path, name) {
        this.path = path
        this.name = name
        this.tempo = 180
        this.beats = []
        this.key = KeyBF
    }
}

const song1 = new CLLSong()
const song2 = new CLLSong()

var compatibility = ((song1.key == song2.key ? 50 : 0) + (song1.tempo == song2.tempo ? 50 : 0))/100

console.log(compatibility)