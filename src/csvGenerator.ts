const winston = require('winston')
const parentLogger = winston.loggers.get('default')
const logger = parentLogger.child({module: 'csvGenerator'})

import { ContractAddress, CollectionSlug, Asset } from './types'
import { OpenSeaLib } from './opensealib'
import PQueue from 'p-queue'
import jsonexport from 'jsonexport'

const CONCURRENCY = 400

function flattenTraits(asset: Asset): any {
    let output: any = {...asset}
    if (asset.traits) {
        for (let trait of asset.traits) {
            output[trait.traitType] = trait.value
        }
    }
    delete output.traits
    return output
}

export async function generateCsv(address: ContractAddress, collection: CollectionSlug) {
    const opensealib = new OpenSeaLib(address, collection)
    const queue = new PQueue({concurrency: CONCURRENCY})

    let lastMinted = await opensealib.fetchLatestMinted()
    if (lastMinted == null) throw new Error(`Unable to fetch last minted in ${collection}`)
    const lastTokenId = lastMinted.tokenId  // inclusive
    const output = new Array<Asset>()
    
    let count = 0
    queue.on('active', () => {
        count += 1
        if (count % 100 === 0) logger.info(`Item ${count}. Size ${queue.size} Pending ${queue.pending}`)
    })

    for (let i = 0; i <= lastTokenId; i++) {
        (async () => {
            let asset = await queue.add(() => opensealib.fetchSingleAsset(i))
            if (asset) output.push(asset)
        })()
    }

    await queue.onIdle()  // all work is done
    logger.info(`${output.length} / ${lastMinted.tokenId + 1} fetched`)

    let parsedOutput: Array<Object> = []
    parsedOutput = output.map((elem: Asset) => {
        let out: any = flattenTraits(elem)
        return out
    })

    return await jsonexport(parsedOutput)
}
