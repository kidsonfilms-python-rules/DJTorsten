const { default:Canary } = require("./canary/Canary");

const rpc = require("discord-rpc");
const rpcClient = new rpc.Client({ transport: 'ipc' });

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

function sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

const player = new Canary('', rpcClient)
async function main() {
    await sleep(1000)
    player.play(new Song('https://www.youtube.com/watch?v=tnw0iu9hMP8', '', '2', 'Bendable Rocks Are Weird', 'Action Labs Shorte', 'DJ'))
}
main()