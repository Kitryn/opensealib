const masknames = require('./constants/hashmask_traits.json')
// const unclaimedNct = require('./nct.json')
const jsonexport = require('jsonexport')
const winston = require('winston')
const logger = winston.loggers.get('default')
const { OpenSeaLib } = require('./opensealib')


// Hashmasks add
const HASHMASK_ADDRESS = '0xc2c747e0f7004f9e8817db2ca4997657a7746928'
// Waifu add 
const WAIFU_ADDRESS = '0x2216d47494E516d8206B70FCa8585820eD3C4946'

async function generate_hashmask_csv() {
    let opensealib = new OpenSeaLib(HASHMASK_ADDRESS, 'hashmasks')
    let maskdata = await opensealib.fetch_from_range()

    let output = []
    
    for (let mask of maskdata) {
        let out = { ...mask }
    
        let maskTraits = masknames.find((elem) => {
            return parseInt(elem.index) === parseInt(out.tokenId)
        })
    
        let eyes = maskTraits.eyesdisplayName.slice(6)
        let item = maskTraits.itemdisplayName.slice(6)
        let maskType = maskTraits.maskdisplayName.slice(6)
        let skin = maskTraits.skindisplayName.slice(12)
        let character = maskTraits['base-characterdisplayName']
    
        out = {
            ...out, eyes, item, maskType, skin, character, // nct
        }
        
        delete out.assetContractAddress

        output.push(out)
    }

    return await jsonexport(output)
}

async function generate_waifu_csv() {
    let opensealib = new OpenSeaLib(WAIFU_ADDRESS, 'waifusion')
    let waifudata = await opensealib.fetch_from_range()

    let output = []

    for (let waifu of waifudata) {
        let out = { ...waifu }
        delete out.assetContractAddress
        output.push(out)
    }

    return await jsonexport(output)
}


module.exports = {
    generate_hashmask_csv, generate_waifu_csv
}