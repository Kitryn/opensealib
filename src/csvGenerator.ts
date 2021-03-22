const winston = require('winston')
const parentLogger = winston.loggers.get('default')
const logger = parentLogger.child({module: 'csvGenerator'})

import { NFTContractAddress, CollectionSlug, Asset } from './types'
import { OpenSeaLib } from './opensealib'
import PQueue from 'p-queue'
import jsonexport from 'jsonexport'

export async function generateHashmaskCsv() {
    
}

export async function generateChubbiesCsv() {
    const opensealib = new OpenSeaLib(NFTContractAddress.chubbies, CollectionSlug.chubbies)
    const batch_size = 400
    const queue = new PQueue({concurrency: batch_size})

    let lastMinted = await opensealib.fetchLatestMinted()
    if (lastMinted == null) throw new Error('Unable to fetch lastMinted')
    const lastTokenId = lastMinted.tokenId
    const output: Asset[] = []

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
        let out: any = {...elem}
        if (elem.traits) {
            for (let trait of elem.traits) {
                out[trait.traitType] = trait.value
            }
        }
        delete out.traits
        return out
    })

    return await jsonexport(parsedOutput)
}