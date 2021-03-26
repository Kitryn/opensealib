import fetch from 'node-fetch'
import { Response } from 'node-fetch'
import winston from 'winston'
const parentLogger = winston.loggers.get('default')
const moduleLogger = parentLogger.child({module: 'opensealib'})

import { CollectionSlug, AssetSearchQuery, Query, ItemQuery, EventHistoryPollQuery, SymbolPriceQuery, LastSale, Order, Asset, Trait, ApiError, ValidateResponseError } from './types'

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

    private async _postApi(query: Query): Promise<any> {
        let res = await fetch(GRAPHQL_URL, {
            method: 'post',
            body: JSON.stringify(query),
            headers: this._defaultHeaders
        })
        .catch((err: any) => {
            throw new ApiError('POST Api error', err, query, undefined)
        })
        
        if (res.ok) {
            let json = await res.json().catch((err: any) => {
                throw new ValidateResponseError('Error parsing response into json', res, err)
            })
            if (json.errors) {
                // graphql error, not http error
                throw new ApiError('GraphQL Api Error', json.errors, query)
            }
            return json
        }
        
        throw new ApiError('POST Api Response not ok', res, query, res.status)
    }

    private _parseRangeQueryResponse(edges: Array<any>): Asset[] {
        let output = new Array<Asset>()
        // if input is [], returns []
        for (let elem of edges) {
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
                this.logger.warn(`Error parsing element in range query response`, {elem: elem})
                this.logger.warn(err)
                continue
            }
        }
        
        return output
    }

    private _parseSingleAssetResponse(data: any): Asset {
        let asset: Asset
        try {
            asset = {
                assetContractAddress: data.archetype.asset.assetContract.account.address,
                tokenId: parseInt(data.archetype.asset.tokenId),
                name: data.archetype.asset.name
            }
            

            let traitListData: Array<any> = data?.archetype?.asset?.traits?.edges ?? []
            let traitList = new Array<Trait>()
            for (let trait of traitListData) {
                const node = trait.node
                const value = node.value || node.intValue || node.floatValue || node.dateValue
                traitList.push({
                    traitType: node.traitType,
                    value: value
                })
            }
            if (traitList.length > 0) asset.traits = traitList

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
                    let closedAt = `${bestAskData.closedAt}+00:00`
                    let openedAt = `${bestAskData.openedAt}+00:00`

                    let auctionDuration = Date.parse(closedAt) - Date.parse(openedAt)
                    let remainingDuration = Date.parse(closedAt) - Date.now()
                    let quantity = parseInt(bestAskData.takerAssetBundle.assetQuantities.edges[0].node.quantity)
                    let difference = quantity - parseInt(bestAskData.dutchAuctionFinalPrice)
                    let currentPrice = parseInt(bestAskData.dutchAuctionFinalPrice) + (difference * (remainingDuration / auctionDuration))
                    bestAsk.quantity = currentPrice / (10 ** bestAskData.takerAssetBundle.assetQuantities.edges[0].node.asset.decimals)
                }

                asset.bestAsk = bestAsk
            }

            return asset
        } catch (err) {
            throw new ValidateResponseError('Error parsing singleAssetResponse from json', data, err)
        }
    }

    private _parseRecentBidsResponse(edges: Array<any>): Asset[] {
        let output: Asset[] = new Array<Asset>()
        for (let edge of edges) {
            try {
                const node = edge.node
                let asset: Asset = {
                    assetContractAddress: node.assetQuantity.asset.assetContract.account.address,
                    tokenId: parseInt(node.assetQuantity.asset.tokenId),
                    name: node.assetQuantity.asset.name
                }  // unable to get owner and ownercontractaddress right now...

                let bestBid: Order = {
                    orderType: 'BASIC',
                    symbol: node.price.asset.symbol,
                    usdSpotPrice: node.price.asset.usdSpotPrice,
                    quantity: parseInt(node.price.quantity) / (10 ** node.price.asset.decimals),
                    username: node.fromAccount.user ? node.fromAccount.user.username : undefined,
                    userContractAddress: node.fromAccount.address
                }

                asset.bestBid = bestBid
                output.push(asset)
            } catch (err) {
                this.logger.warn(`Error parsing recent bid edge!`, {data: edge})
            }
        }
        if (edges.length !== output.length) {
            this.logger.warn(`_parseRecentBids: num parsed != num returned by api!`, {response: edges})
        }
        return output
    }

    async fetchLatestMinted(): Promise<Asset> {
        let query = new AssetSearchQuery(this.collection)
        query.variables.count = 1

        let res = await this._postApi(query)  // can throw ValidateResponseError or ApiError
        let edges: [] = res?.data?.query?.search?.edges ?? []
        let output: Asset = this._parseRangeQueryResponse(edges)[0]  // this shouldn't throw any errors but logger.warns any parse errors

        return output
    }

    async fetchSymbolUsdPrice(symbol: string): Promise<number> {
        let query = new SymbolPriceQuery(symbol)
        let res = await this._postApi(query)  // can throw ValidateResponseError or ApiError
        
        let usdSpotPrice = res?.data?.paymentAsset?.asset?.usdSpotPrice ?? null
        if (usdSpotPrice) return usdSpotPrice

        // if null then something went wrong
        this.logger.warn(`Error in fetchSymbolUsdPrice for ${symbol}`, {response: res})
        throw new ValidateResponseError(`Error fetching usdSpotSprice for ${symbol}`, res, query)
    }

    async fetchSingleAsset(id: number): Promise<Asset> {
        let query = new ItemQuery(this.nftContractAddress, id)
        let res = await this._postApi(query)  // can throw ValidateResponseError or ApiError
        let data: Object = res?.data ?? undefined

        if (data == null) {
            throw new ValidateResponseError(`Malformed response in fetchSingleAsset id ${id}`, res, query)
        }

        const parsed = this._parseSingleAssetResponse(data)  // can throw a ValidateResponseError
        return parsed
    }

    async fetchRecentBids(): Promise<Asset[]> {
        let query = new EventHistoryPollQuery(this.collection, this.lastBidPollTimestamp ? this.lastBidPollTimestamp : undefined)
        let res = await this._postApi(query)  // can throw ValidateResponseError or ApiError

        let edges: Array<any> = res?.data?.assetEvents?.edges ?? undefined
        if (edges == null) {
            throw new ValidateResponseError(`Malformed response in fetchRecentBids`, res, query)
        }
        if (edges.length >= 1) {
            this.lastBidPollTimestamp = edges[0]?.node?.eventTimestamp ?? (() => {
                throw new ValidateResponseError(`Malformed timestamp in response`, res, query)
            })()
        } else {
            if (this.lastBidPollTimestamp == null) this.lastBidPollTimestamp = (new Date(Date.now() - 11 * 1000)).toISOString()
        }

        return this._parseRecentBidsResponse(edges)  // this shouldn't throw any errors but logger.warns any parse errors
    }
}
