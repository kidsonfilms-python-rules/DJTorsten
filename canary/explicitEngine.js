const explicitWords = require('./json/explicitWords.json')
const exclude = ['clean']
const solenolyrics = require("solenolyrics")
exports.default = async function isExplicitSong(song) {
    return new Promise(async (resolve, reject) => {
        // TITLE BASED SEARCHING
        if (explicitWords.filter((word) => {
            const wordExp = new RegExp(`\\b${word.replace(/(\W)/g, '\\$1')}\\b`, 'gi')
            return !exclude.includes(word.toLowerCase()) && wordExp.test(song.title.toLowerCase())
        }).length > 0 || song.title.toLowerCase().includes('explicit')) {
            resolve(true)
            return true
        }
    
        // LYRICS BASED SEARCHING
        const lyrics = await solenolyrics.requestLyricsFor(song.title.toLowerCase());
        if (lyrics != undefined && !song.title.toLowerCase().includes('clean')) {
            if (explicitWords.filter((word) => {
                const wordExp = new RegExp(`\\b${word.replace(/(\W)/g, '\\$1')}\\b`, 'gi')
                return !exclude.includes(word.toLowerCase()) && wordExp.test(lyrics)
            }).length > 0) {
                resolve(true)
                return true
            }
        }
        resolve(false)
        return false
    })
}