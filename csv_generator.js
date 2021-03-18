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
// bgan add and slug

// mooncat add
const MOONCAT_ADDRESS = '0x7c40c393dc0f283f318791d746d894ddd3693572'
// slug wrapped-mooncatsrescue
const TOTAL_CATS = 8054 // will need updating regularly -- this is lastindex+1

// bastard gan punk v2 add
// bastard-gan-punks-v2
const GAN_V2_ADDRESS = '0x31385d3520bced94f77aae104b406994d8f2168c'
const TOTAL_GANS = 8611  // will need updating regularly https://etherscan.io/address/0x31385d3520bced94f77aae104b406994d8f2168c#readContract

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

async function generate_gan_v2_csv() {
    const opensealib = new OpenSeaLib(GAN_V2_ADDRESS, 'bastard-gan-punks-v2')
    const batch_size = 400

    let count = 0
    let output = []
    for (let i = 0; i < TOTAL_GANS; i += batch_size) {
        let promises = []
        let end_id = Math.min(TOTAL_GANS, i + batch_size)
        for (let k = i; k < end_id; k++) {
            promises.push(opensealib.fetch_single_asset(k))           
            count += 1
        }
        let res = await Promise.all(promises)

        for (let asset of res) {
            asset.traits = asset.traits.map(elem => {
                let out = {
                    traitType: elem.node.traitType,
                    value: elem.node.value
                }
                return out
            })

            for (let trait of asset.traits) {
                let traitKey = trait.traitType
                asset[traitKey] = trait.value
            }

            delete asset.traits
            delete asset.assetContractAddress

            let out = { ...asset }
            output.push(out)
        }
        logger.info(`${output.length} / ${TOTAL_GANS}`)
    }
    return await jsonexport(output)
}

async function generate_mooncat_csv() {
    const opensealib = new OpenSeaLib(MOONCAT_ADDRESS, 'wrapped-mooncatsrescue')
    const batch_size = 400

    let count = 0
    let output = []
    for (let i = 0; i < TOTAL_CATS; i += batch_size) {
        let promises = []
        let end_id = Math.min(TOTAL_CATS, i + batch_size)
        for (let k = i; k < end_id; k++) {
            promises.push(opensealib.fetch_single_asset(k))
            count += 1
        }
        let res = await Promise.all(promises)

        for (let elem of res) {
            if (!elem) continue
            delete elem.assetContractAddress
            output.push(elem)
        }

        logger.info(`${output.length} / ${TOTAL_CATS}`)
    }
    return await jsonexport(output)
}


module.exports = {
    generate_hashmask_csv, generate_gan_v2_csv, generate_mooncat_csv
}