const fetch = require('node-fetch')
const winston = require('winston')
const logger = winston.loggers.get('default')
const { ASSET_STRUCT, ItemQuery, AssetSearchQuery, EventHistoryPollQuery, EventHistoryQuery, SymbolPriceQuery } = require('./lib/structs')

const X_API_KEY = '0106d29713754b448f4513d7a66d0875'

class OpenSeaLib {
    last_bid_poll_timestamp = null

    constructor(address, collection) {
        this.nft_contract_address = address
        this.collection = collection
    }

    async fetch_latest_minted() {
        let query = new AssetSearchQuery()
        query.init(this.collection, 0,0)
        query.variables.count = 1
        query.variables.numericTraits = null

        let res = await fetch('https://api.opensea.io/graphql/', {
            method: 'post',
            body: JSON.stringify(query),
            headers: {
                'Content-Type': 'application/json',
                'X-API-KEY': X_API_KEY,
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:86.0) Gecko/20100101 Firefox/86.0',
            }
        })
        .then(res => res.json())
        .catch(err => {
            logger.error(`Error fetching recently minted of collection ${this.collection}`)
            logger.error(err)
            return null
        })

        return this._parse_range_query_response(res.data.query.search.edges)
    }

    static async fetch_symbol_usd_price(symbol) {
        let query = new SymbolPriceQuery()
        query.init(symbol)

        let res = await fetch('https://api.opensea.io/graphql/', {
            method: 'post',
            body: JSON.stringify(query),
            headers: {
                'Content-Type': 'application/json',
                'X-API-KEY': X_API_KEY,
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:86.0) Gecko/20100101 Firefox/86.0',
            }
        })
        .then(res => res.json())
        .catch(err => {
            logger.error(err)
            return null
        })

        if (!res || !res.data || !res.data.paymentAsset || !res.data.paymentAsset.asset) {
            logger.error(`Error fetching or parsing ${symbol}`)
            return null
        }
        return res.data.paymentAsset.asset.usdSpotPrice
    }    

    async fetch_single_asset(id) {
        let itemQuery = new ItemQuery()
        itemQuery.init(this.nft_contract_address, id)

        let res = await fetch('https://api.opensea.io/graphql/', {
            method: 'post',
            body: JSON.stringify(itemQuery),
            headers: {
                'Content-Type': 'application/json',
                'X-API-KEY': X_API_KEY,
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:86.0) Gecko/20100101 Firefox/86.0',
            }
        })
        .then(res => res.json())
        .catch(err => {
            logger.error(`Error fetching id ${id}`)
            logger.error(err)
            return null
        })

        return this._parse_item_query(res, id)
    }
    
    async fetch_from_range(start = 0, end = 16383) {
        end = Math.min(end, 16383)  // INCLUSIVE
        let BATCH_SIZE = 400
        let fetch_promises = []
    
        for (let i = start; i < end+1; i += BATCH_SIZE) {
            let max_id = Math.min(i + BATCH_SIZE - 1, end)
            let temp_query = new AssetSearchQuery()
            temp_query.init(this.collection, i, max_id)
            fetch_promises.push(this._fetch_all_from_query(temp_query))
        }

        let output = await Promise.allSettled(fetch_promises).then(results => {
            return results.flat()
        })

        output = output.map((elem) => {
            if (elem.status != 'fulfilled') {
                logger.error(elem)
                throw 'Error in request!'
            }

            return elem.value
        }).flat()

        return output
    }

    async _fetch_all_from_query(json) {
        let edgeCount = 0
        let output = []
        let currentCursor = null;

        while (true) {
            json.variables.cursor = currentCursor
            let edges = []
            let endCursor = ''
            let totalCount = 0
            let hasNextPage = false
            let breakLoop = false

            await fetch('https://api.opensea.io/graphql/', {
                method: 'post',
                body: JSON.stringify(json),
                headers: {
                    'Content-Type': 'application/json',
                    'X-API-KEY': X_API_KEY,
                    'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:86.0) Gecko/20100101 Firefox/86.0',
                }
            })
            .then(res => res.json())
            .then(res_json => {
                if (!res_json.data || !res_json.data.query || !res_json.data.query.search) {
                    logger.error(res_json)
                    throw 'Error in fetch response!'
                }
                edges = res_json.data.query.search.edges
                endCursor = res_json.data.query.search.pageInfo.endCursor
                totalCount = res_json.data.query.search.totalCount
                hasNextPage = res_json.data.query.search.pageInfo.hasNextPage
            }).catch(err => {
                logger.error(err)
                logger.error("Current Cursor: " + currentCursor)
                breakLoop = true
            })

            if (breakLoop) break

            edgeCount += edges.length
            logger.info(edgeCount + '/' + totalCount)

            output = output.concat(edges)
            if (!hasNextPage || !endCursor) break

            currentCursor = endCursor
        }

        return this._parse_range_query_response(output)
    }

    async fetch_recent_bids() {
        let query = new EventHistoryPollQuery()
        query.init(this.collection, this.last_bid_poll_timestamp ? this.last_bid_poll_timestamp : undefined)

        let res = await fetch('https://api.opensea.io/graphql/', {
            method: 'post',
            body: JSON.stringify(query),
            headers: {
                'Content-Type': 'application/json',
                'X-API-KEY': X_API_KEY,
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:86.0) Gecko/20100101 Firefox/86.0',
            }
        })
        .then(res => res.json())
        .catch(err => {
            logger.error(`Error polling bid history for ${this.collection}`)
            logger.error(err)
            return null
        })

        return this._parse_recent_bids(res)
    }

    _parse_recent_bids(json) {
        if (!json || !json.data || !json.data.assetEvents || !json.data.assetEvents.edges) {
            logger.error("Invalid response in _parse_recent_bids!!")
            logger.error(json)
            return []
        }
        
        if (json.data.assetEvents.edges.length >= 1) {
            this.last_bid_poll_timestamp = json.data.assetEvents.edges[0].node.eventTimestamp
        } else {
            if (!this.last_bid_poll_timestamp) {
                this.last_bid_poll_timestamp = (new Date(Date.now() - 11*1000)).toISOString()               
            }
        }

        let output = json.data.assetEvents.edges.flatMap(elem => {
            try {
                let asset = new ASSET_STRUCT()
                let node = elem.node            
    
                asset.assetContractAddress = node.assetQuantity.asset.assetContract.account.address
                asset.tokenId = parseInt(node.assetQuantity.asset.tokenId)
                // asset.owner = NOT IMPLEMENTED YET
                // asset.ownerContractAddress NOT IMPLEMENTED
                asset.name = node.assetQuantity.asset.name
    
                asset.bestBid.orderType = 'BASIC'
                asset.bestBid.symbol = node.price.asset.symbol
                asset.bestBid.usdSpotPrice = node.price.asset.usdSpotPrice
                let quantity = parseInt(node.price.quantity)
                asset.bestBid.quantity = quantity / (10 ** node.price.asset.decimals)
                asset.bestBid.username = node.fromAccount.user ? node.fromAccount.user.username : null
                asset.bestBid.userContractAddress = node.fromAccount.address

                return [asset]
            } catch (error) {
                logger.error('Error parsing elem from response from _parse_recent_bids!')
                logger.error('elem: ')
                logger.error(JSON.stringify(elem))
                logger.error('full json response:')
                logger.error(JSON.stringify(json))
                logger.error(error)
                return []
            }            
        })
        let expected_bid_length = json.data.assetEvents.edges.length
        logger.verbose(`${this.collection}: parsed ${output.length} of expected ${expected_bid_length}`)
        if (expected_bid_length !== output.length) {
            logger.warn(`Num parsed != num returned by api response! API response below:`)
            logger.warn(JSON.stringify(json))
        }
        return output
    }

    _parse_range_query_response(json) {
        if (!json) {
            logger.error("Invalid response in _parse_range_query_response!")
            logger.error(json)
            return []
        }

        // logger.debug({origin: 'parse_search_response', message: json})

        let output = json.map((elem) => {
            let asset = new ASSET_STRUCT()
            let data = elem.node.asset
        
            asset.tokenId = parseInt(data.tokenId)
            asset.name = data.name
            asset.assetContractAddress = data.assetContract.account.address

            let owner = data.assetOwners.edges
            if (owner.length !== 0) {
                asset.owner = owner[0].node.owner.user ? owner[0].node.owner.user.username : null
                asset.ownerContractAddress = owner[0].node.owner.address
            }

            let lastSale = data.assetEventData.lastSale
            if (lastSale) {
                asset.lastSale.symbol = lastSale.unitPriceQuantity.asset.symbol
                let quantity = parseInt(lastSale.unitPriceQuantity.quantity)
                asset.lastSale.quantity = quantity / (10 ** lastSale.unitPriceQuantity.asset.decimals)
                asset.lastSale.usdSpotPrice = lastSale.unitPriceQuantity.asset.usdSpotPrice
            }

            // This query cannot obtain bestBid and bestAsk bidder name!

            let bestBid = data.orderData.bestBid
            if (bestBid) {
                asset.bestBid.orderType = bestBid.orderType
                asset.bestBid.symbol = bestBid.paymentAssetQuantity.asset.symbol
                let quantity = parseInt(bestBid.paymentAssetQuantity.quantity)
                asset.bestBid.quantity = quantity / (10 ** bestBid.paymentAssetQuantity.asset.decimals) 
                asset.bestBid.usdSpotPrice = bestBid.paymentAssetQuantity.asset.usdSpotPrice
            }

            let bestAsk = data.orderData.bestAsk
            if (bestAsk) {
                asset.bestAsk.orderType = bestAsk.orderType
                asset.bestAsk.symbol = bestAsk.paymentAssetQuantity.asset.symbol
                let quantity = parseInt(bestAsk.paymentAssetQuantity.quantity)
                asset.bestAsk.quantity = quantity / (10 ** bestAsk.paymentAssetQuantity.asset.decimals)
                asset.bestAsk.usdSpotPrice = bestAsk.paymentAssetQuantity.asset.usdSpotPrice
            }

            return asset
        })

        return output
    }

    _parse_item_query(json, id) {
        if (!json || !json.data) {
            logger.error(`Invalid response in _parse_item_query! Id: ${id}`)
            logger.error(json)
            return null
        }

        const data = json.data
        let asset = new ASSET_STRUCT()

        try {
            asset.assetContractAddress = data.archetype.asset.assetContract.account.address
            asset.tokenId = parseInt(data.archetype.asset.tokenId)
            asset.name = data.archetype.asset.name        
        } catch (error) {
            logger.warn(`Invalid response, unable to parse asset! Skipping! Id: ${id}`)
            logger.warn(json)
            return null
        }
        
        // TODO: HACKY
            // bastardganpunkv2
        try{
            asset.traits = data.archetype.asset.traits.edges   
        } catch (error) {
            logger.warn(`opensealib:${this.collection}: unable to load asset traits for item ${asset.assetContractAddress}:${asset.tokenId}`)
            logger.debug(json)
        }

        let owner = data.archetype.asset.assetOwners.edges
        if (owner.length !== 0) {
            asset.owner = owner[0].node.owner.user ? owner[0].node.owner.user.username : null
            asset.ownerContractAddress = owner[0].node.owner.address
        }

        let lastSale = data.archetype.asset.assetEventData.lastSale
        if (lastSale) {
            asset.lastSale.symbol = lastSale.unitPriceQuantity.asset.symbol
            asset.lastSale.quantity = parseInt(lastSale.unitPriceQuantity.quantity) / (10 ** lastSale.unitPriceQuantity.asset.decimals)
            asset.lastSale.usdSpotPrice = lastSale.unitPriceQuantity.asset.usdSpotPrice
        }
    
        let bestBid = data.tradeSummary.bestBid
        if (bestBid) {
            asset.bestBid.orderType = bestBid.orderType
            asset.bestBid.symbol = bestBid.makerAssetBundle.assetQuantities.edges[0].node.asset.symbol
            asset.bestBid.quantity = parseInt(bestBid.makerAssetBundle.assetQuantities.edges[0].node.quantity) / (10 ** bestBid.makerAssetBundle.assetQuantities.edges[0].node.asset.decimals)
            asset.bestBid.username = bestBid.maker.user ? bestBid.maker.user.username : null
            asset.bestBid.userContractAddress = bestBid.maker.address
            asset.bestBid.usdSpotPrice = bestBid.makerAssetBundle.assetQuantities.edges[0].node.asset.usdSpotPrice
        }

        let bestAsk = data.tradeSummary.bestAsk
        if (bestAsk) {
            asset.bestAsk.orderType = bestAsk.orderType
            asset.bestAsk.symbol = bestAsk.takerAssetBundle.assetQuantities.edges[0].node.asset.symbol
            asset.bestAsk.username = bestAsk.maker.user ? bestAsk.maker.user.username : null
            asset.bestAsk.userContractAddress = bestAsk.maker.address
            asset.bestAsk.usdSpotPrice = bestAsk.takerAssetBundle.assetQuantities.edges[0].node.asset.usdSpotPrice
        
            let quantity = parseInt(bestAsk.takerAssetBundle.assetQuantities.edges[0].node.quantity)
        
            if (bestAsk.orderType !== 'DUTCH') {
                asset.bestAsk.quantity = quantity / (10 ** bestAsk.takerAssetBundle.assetQuantities.edges[0].node.asset.decimals)
                // WARNING -- ENGLISH AUCTIONS BESTASK IS NOT ACTUALLY BESTASK
                // IF TYPE IS ENGLISH THEN CHECK BESTBID
            } else {
                // WARNING -- DUTCH AUCTIONS ARE ESTIMATED PRICE AT THE MOMENT!
                let auctionDuration = Date.parse(bestAsk.openedAt) - Date.parse(bestAsk.closedAt)
                let remainingDuration = Date.now() - Date.parse(bestAsk.closedAt)
                let difference = quantity - parseInt(bestAsk.dutchAuctionFinalPrice)
                let currentPrice = parseInt(bestAsk.dutchAuctionFinalPrice) + (difference * (remainingDuration / auctionDuration))
                asset.bestAsk.quantity = currentPrice / (10 ** bestAsk.takerAssetBundle.assetQuantities.edges[0].node.asset.decimals)
            }
        }

        return asset
    }
}


module.exports = {
    OpenSeaLib
}


