import fetch from 'node-fetch'
import { Response } from 'node-fetch'
import * as winston from 'winston'
const parentLogger = winston.loggers.get('default')
const moduleLogger = parentLogger.child({module: 'opensealib'})

import { CollectionSlug, AssetSearchQuery, ItemQuery, EventHistoryPollQuery, SymbolPriceQuery, LastSale, Order, Asset } from './types'

const GRAPHQL_URL = 'https://api.opensea.io/graphql/'

export class OpenSeaLib {
    nftContractAddress: string
    collection: CollectionSlug
    xApiKey: string
    private logger: winston.Logger
    private lastBidPollTimestamp?: string
    private _defaultHeaders: {}

    constructor(nftContractAddress: string, collection: CollectionSlug, xApiKey: string = '0106d29713754b448f4513d7a66d0875') {
        this.nftContractAddress = nftContractAddress
        this.collection = collection        
        this.xApiKey = xApiKey
        this.logger = moduleLogger.child({collection: this.collection})
        this._defaultHeaders = {
            'Content-Type': 'application/json',
            'X-API-KEY': this.xApiKey,
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:86.0) Gecko/20100101 Firefox/86.0',
        }
    }

    private _parseRangeQueryResponse(json: Array<any>): Asset[] {
        let output = new Array<Asset>()
        for (let elem of json) {
            try {
                // Try to parse elem and push to output
                const data = elem.node.asset

                let asset: Asset = {
                    assetContractAddress: data.assetContract.account.address,
                    tokenId: parseInt(data.tokenId),
                    name: data.name
                }

                const assetOwner = data.assetOwners.edges
                if (assetOwner.length !== 0) {
                    asset.owner = assetOwner[0].node.owner.user ? assetOwner[0].node.owner.user.username : undefined
                    asset.ownerContractAddress = assetOwner[0].node.owner.address
                }

                const lastSaleData = data.assetEventData.lastSale
                if (lastSaleData) {
                    let lastSale: LastSale = {
                        symbol: lastSaleData.unitPriceQuantity.asset.symbol,
                        quantity: parseInt(lastSaleData.unitPriceQuantity.quantity) / (10 ** lastSaleData.unitPriceQuantity.asset.decimals),
                        usdSpotPrice: lastSaleData.unitPriceQuantity.asset.usdSpotPrice
                    }
                    asset.lastSale = lastSale
                }

                // Range query cannot obtain bestBid and bestAsk bidder names!

                const bestBidData = data.orderData.bestBid
                if (bestBidData) {
                    let bestBid: Order = {
                        orderType: bestBidData.orderType,
                        symbol: bestBidData.paymentAssetQuantity.asset.symbol,
                        quantity: parseInt(bestBidData.paymentAssetQuantity.quantity) / (10 ** bestBidData.paymentAssetQuantity.asset.decimals),
                        usdSpotPrice: bestBidData.paymentAssetQuantity.asset.usdSpotPrice,
                    }
                    asset.bestBid = bestBid
                }

                const bestAskData = data.orderData.bestAsk
                if (bestAskData) {
                    let bestAsk: Order = {
                        orderType: bestAskData.orderType,
                        symbol: bestAskData.paymentAssetQuantity.asset.symbol,
                        quantity: parseInt(bestAskData.paymentAssetQuantity.quantity) / (10 ** bestAskData.paymentAssetQuantity.asset.decimals),
                        usdSpotPrice: bestAskData.paymentAssetQuantity.asset.usdSpotPrice
                    }
                    asset.bestAsk = bestAsk
                }

                output.push(asset)
            } catch (err) {
                // parsing of elem failed
                this.logger.error(`Error parsing element in range query response`, {elem: elem})
                this.logger.error(err)
                continue
            }
        }
        
        return output
    }

    async fetchLatestMinted(): Promise<Asset | null> {
        let query = new AssetSearchQuery(this.collection)
        query.variables.count = 1

        let res = await fetch(GRAPHQL_URL, {
            method: 'post',
            body: JSON.stringify(query),
            headers: this._defaultHeaders
        })
        .then((res: Response) => res.json())
        .catch((err: any) => {
            this.logger.error(`Error fetching recently minted`)
            this.logger.error(err)
            return undefined  // TODO: ERROR HANDLING! what kind of error was it?
        })

        if (res == null) return null
        let edges: []

        try {
            edges = res.data.query.search.edges
        } catch (err) {
            this.logger.error(`Malformed response in fetchLatestMinted`, {response: res})
            return null
        }

        let output: Asset = this._parseRangeQueryResponse(edges)[0]

        if (output != null) return output
        return null
    }
}
