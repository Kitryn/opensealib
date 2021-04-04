const winston = require('winston')
const parentLogger = winston.loggers.get('default')
const logger = parentLogger.child({module: 'csvGenerator'})

import { ContractAddress, CollectionSlug, Asset, ApiError, GqlApiError, ValidateResponseError } from './types'
import { OpenSeaLib } from './opensealib'
import PQueue from 'p-queue'
import fetch from 'node-fetch'
import jsonexport from 'jsonexport'
import {Web3Interface} from './web3interface'

const CONCURRENCY = 400
let web3interface: Web3Interface

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

    let lastMinted = await opensealib.fetchLatestMinted()  // can throw ValidateResponseError or ApiError -- not handled to let rethrow
    const lastTokenId = lastMinted.tokenId  // inclusive
    const output = new Array<Asset>()
    
    let count = 0
    queue.on('active', () => {
        count += 1
        if (count % 100 === 0) logger.info(`Item ${count}. Size ${queue.size} Pending ${queue.pending}`)
    })

    for (let i = 0; i <= lastTokenId; i++) {
        (async () => {
            try {
                let asset = await queue.add(() => opensealib.fetchSingleAsset(i))
                if (asset) output.push(asset)
            } catch (err: any) {
                if (err instanceof ApiError) {
                    // should be safe to retry  TODO
                    logger.error(err)
                } else if (err instanceof GqlApiError) {
                    // Not safe to retry
                    logger.error(err)
                } else if (err instanceof ValidateResponseError) {
                    // May or may not be safe to retry
                    logger.error(err)
                } else {
                    throw err
                }
            }
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

async function generateCsvFromUri(keys: any[]) {
    if (web3interface == null) {
        web3interface = new Web3Interface(keys)  // lazy loading
    }

    const queue = new PQueue({concurrency: CONCURRENCY})

    const totalSupply = await web3interface.crypteriorsInstance.methods.totalSupply().call()
    let count = 0
    queue.on('active', () => {
        count += 1
        if (count % 100 === 0) logger.info(`Item ${count}. Size ${queue.size} Pending ${queue.pending}`)
    })

    let output: any[] = []
    for (let i = 0; i < totalSupply; i++) {
        (async () => {
            const uri = `https://gateway.pinata.cloud/ipfs/QmdcoQDb6sNgkkChUT6HJ6voS7XnDot2u6ZQwZTSBM3uAy/${i}`
            
            let json = await queue.add(() => {
                return fetch(uri, {
                    method: 'GET'
                }).then(res => res.json()).catch(err => {
                    console.error(err)
                })
            })

            if (json) output.push(json)
        })()
    }

    await queue.onIdle()  // all work is done
    output = output.sort((a, b) => {
        const an = parseInt(a.name.split('#')[1])
        const bn = parseInt(b.name.split('#')[1])
        return an - bn
    }).map((elem) => {
        let output: any = {
            tokenId: parseInt(elem.name.split('#')[1])
        }
        for (let trait of elem.attributes) {
            output[trait.trait_type] = trait.value
        }
        return output
    })
    logger.info(`${output.length} / ${totalSupply} fetched`)
    return await jsonexport(output)
}