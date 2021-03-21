import fetch from 'node-fetch'
import { Response } from 'node-fetch'
import * as winston from 'winston'
const parentLogger = winston.loggers.get('default')
const moduleLogger = parentLogger.child({module: 'opensealib'})

import { CollectionSlug, AssetSearchQuery, Query, ItemQuery, EventHistoryPollQuery, SymbolPriceQuery, LastSale, Order, Asset } from './types'

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

    private async _postApi(query: Query): Promise<any | null> {
        let res = await fetch(GRAPHQL_URL, {
            method: 'post',
            body: JSON.stringify(query),
            headers: this._defaultHeaders
        })
        .then((res: Response) => res.json())
        .catch((err: any) => {
            this.logger.error('POST Api error', {error: err, query: query})
            return undefined
        })

        if (res) return res
        return null  // future error handling goes here
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
                this.logger.error(`Error parsing element in range query response`, {elem: elem, error: err})
                continue
            }
        }
        
        return output
    }

    private _parseSingleAssetResponse(data: any): Asset | null {
        let asset: Asset
        try {
            asset = {
                assetContractAddress: data.archetype.asset.assetContract.account.address,
                tokenId: parseInt(data.archetype.asset.tokenId),
                name: data.archetype.asset.name
            }
            
            // TODO: hacky
            try {
                asset.traits = data.archetype.asset.traits.edges
            } catch (err) {
                this.logger.warn(`Unable to load trait data`, {data: data})
            }

            const owner = data.archetype.asset.assetOwners.edges
            if (owner.length !== 0) {
                asset.owner = owner[0].node.owner.user ? owner[0].node.owner.user.username : undefined
                asset.ownerContractAddress = owner[0].node.owner.address
            }

            const lastSaleData = data.archetype.asset.assetEventData.lastSale
            if (lastSaleData) {
                const lastSale: LastSale = {
                    symbol: lastSaleData.unitPriceQuantity.asset.symbol,
                    quantity: parseInt(lastSaleData.unitPriceQuantity.quantity) / (10 ** lastSaleData.unitPriceQuantity.asset.decimals),
                    usdSpotPrice: lastSaleData.unitPriceQuantity.asset.usdSpotPrice
                }
                asset.lastSale = lastSale
            }

            const bestBidData = data.tradeSummary.bestBid
            if (bestBidData) {
                const bestBid: Order = {
                    orderType: bestBidData.orderType,
                    symbol: bestBidData.makerAssetBundle.assetQuantities.edges[0].node.asset.symbol,
                    quantity: parseInt(bestBidData.makerAssetBundle.assetQuantities.edges[0].node.quantity) / (10 ** bestBidData.makerAssetBundle.assetQuantities.edges[0].node.asset.decimals),
                    usdSpotPrice: bestBidData.makerAssetBundle.assetQuantities.edges[0].node.asset.usdSpotPrice,
                    username: bestBidData.maker.user ? bestBidData.maker.user.username : undefined,
                    userContractAddress: bestBidData.maker.address
                }
                asset.bestBid = bestBid
            }

            const bestAskData = data.tradeSummary.bestAsk
            if (bestAskData) {
                let bestAsk: Order = {
                    orderType: bestAskData.orderType,
                    symbol: bestAskData.takerAssetBundle.assetQuantities.edges[0].node.asset.symbol,
                    usdSpotPrice: bestAskData.takerAssetBundle.assetQuantities.edges[0].node.asset.usdSpotPrice,
                    username: bestAskData.maker.user ? bestAskData.maker.user.username : undefined,
                    userContractAddress: bestAskData.maker.address,
                    quantity: parseInt(bestAskData.takerAssetBundle.assetQuantities.edges[0].node.quantity) / (10 ** bestAskData.takerAssetBundle.assetQuantities.edges[0].node.asset.decimals)
                }
                // WARNING: ENGLISH AUCTIONS SOMETIMES SAY BASIC INSTEAD OF ENGLISH
                // ALSO IF ITS ENGLISH -- BEST ASK IS NOT ACTUALLY BEST ASK, CHECK BEST BID

                if (bestAskData.orderType === 'DUTCH') {
                    // WARNING -- DUTCH AUCTION PRICES ARE ESTIMATED!!
                    let auctionDuration = Date.parse(bestAskData.openedAt) - Date.parse(bestAskData.closedAt)
                    let remainingDuration = Date.now() - Date.parse(bestAskData.closedAt)
                    let quantity = parseInt(bestAskData.takerAssetBundle.assetQuantities.edges[0].node.quantity)
                    let difference = quantity - parseInt(bestAskData.dutchAuctionFinalPrice)
                    let currentPrice = parseInt(bestAskData.dutchAuctionFinalPrice) + (difference * (remainingDuration / auctionDuration))
                    bestAsk.quantity = currentPrice / (10 ** bestAskData.takerAssetBundle.assetQuantities.edges[0].asset.decimals)
                }

                asset.bestAsk = bestAsk
            }

            return asset
        } catch (err) {
            this.logger.error(`Error parsing singleAssetResponse!`, {error: err, data: data})
            return null
        }
    }

    async fetchLatestMinted(): Promise<Asset | null> {
        let query = new AssetSearchQuery(this.collection)
        query.variables.count = 1

        let res = await this._postApi(query)

        if (res == null) return null
        let edges: []

        try {
            edges = res.data.query.search.edges
            if (edges == null) throw new Error('edge array not present in response')
        } catch (err) {
            this.logger.error(`Malformed response in fetchLatestMinted`, {response: res, error: err})
            return null
        }

        let output: Asset = this._parseRangeQueryResponse(edges)[0]

        if (output != null) return output
        return null
    }

    async fetchSymbolUsdPrice(symbol: string): Promise<number | null> {
        let query = new SymbolPriceQuery(symbol)

        let res = await this._postApi(query)
        if (res == null) return null  // probably needs better error management
        
        try {
            return res.data.paymentAsset.asset.usdSpotPrice
        } catch (err) {
            this.logger.error(`Error fetching or parsing ${symbol}`, {error: err, response: res})
        }
        return null
    }

    async fetchSingleAsset(id: number): Promise<Asset | null> {
        let query = new ItemQuery(this.nftContractAddress, id)

        let res = await this._postApi(query)
        if (res == null) return null  // probably needs better error management

        let data: Object
        try {
            data = res.data
            if (data == null) throw new Error('data not present in response')
        } catch (err) {
            this.logger.error(`Malformed response in fetchSingleAsset id ${id}`, {response: res, error: err})
            return null
        }

        const parsed = this._parseSingleAssetResponse(data)
        if (parsed == null) {
            this.logger.error(`Error parsing data in fetchSingleAsset id ${id}`, {data: data})
            return null
        }
        return parsed
    }
}
