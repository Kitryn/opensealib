const fetch = require('node-fetch')
const winston = require('winston')
const logger = winston.loggers.get('default')
const { NUMERIC_TRAITS } = require('./lib/constants')
const { ASSET_STRUCT, ITEM_QUERY, SEARCH_QUERY } = require('./lib/structs')

// HASHMASKS
const NFT_CONTRACT_ADDRESS = '0xc2c747e0f7004f9e8817db2ca4997657a7746928'

// Waifu add 
// const NFT_CONTRACT_ADDRESS = '0x2216d47494E516d8206B70FCa8585820eD3C4946'

async function fetch_from_range(start = 0, end = 16383) {
    function query_builder(a, b) {
        let output = new SEARCH_QUERY()
        output.variables.numericTraits = JSON.parse(JSON.stringify(NUMERIC_TRAITS))
        
        output.variables.numericTraits[0].ranges[0].min = a;
        output.variables.numericTraits[0].ranges[0].max = b;

        return output
    }
    
    end = Math.min(end, 16383)  // INCLUSIVE
    let BATCH_SIZE = 400
    let fetch_promises = []
    
    for (let i = start; i < end+1; i += BATCH_SIZE) {
        let max_id = Math.min(i + BATCH_SIZE - 1, end)
        let temp_query = query_builder(i, max_id)
        fetch_promises.push(fetch_all_from_query(temp_query))
    }

    let output = await Promise.allSettled(fetch_promises).then(results => {
        return results.flat()
    })

    output = output.map((elem) => {
        if (elem.status != 'fulfilled') {
            console.error(elem)
            throw 'Error in request!'
        }

        return elem.value
    }).flat()

    return output
}

async function fetch_all_from_query(json) {
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
                'Content-Type': 'application/json'
            }
        })
        .then(res => res.json())
        .then(res_json => {
            if (!res_json.data.query.search) {
                console.error(res_json)
            }
            edges = res_json.data.query.search.edges
            endCursor = res_json.data.query.search.pageInfo.endCursor
            totalCount = res_json.data.query.search.totalCount
            hasNextPage = res_json.data.query.search.pageInfo.hasNextPage
        }).catch(err => {
            console.error(err)
            console.error("Current Cursor: " + currentCursor)
            breakLoop = true
        })

        if (breakLoop) break

        edgeCount += edges.length
        console.log(edgeCount + '/' + totalCount)

        output = output.concat(edges)
        if (!hasNextPage || !endCursor) break

        currentCursor = endCursor
    }

    return parse_range_query_response(output)
}

function parse_range_query_response(json) {
    if (!json) {
        console.error("Invalid response!")
        console.error(json)
        return []
    }

    // logger.debug({origin: 'parse_search_response', message: json})

    let output = json.map((elem) => {
        let new_elem = new ASSET_STRUCT()
        new_elem.tokenId = elem.node.asset.tokenId
        new_elem.name = elem.node.asset.name
        
        if (elem.node.asset.assetEventData.lastSale) {
            new_elem.lastSale.symbol = elem.node.asset.assetEventData.lastSale.unitPriceQuantity.asset.symbol
            new_elem.lastSale.quantity = elem.node.asset.assetEventData.lastSale.unitPriceQuantity.quantity
        }

        if (elem.node.asset.orderData.bestBid) {
            new_elem.bestBid.orderType = elem.node.asset.orderData.bestBid.orderType
            new_elem.bestBid.symbol = elem.node.asset.orderData.bestBid.paymentAssetQuantity.asset.symbol
            new_elem.bestBid.quantity = elem.node.asset.orderData.bestBid.paymentAssetQuantity.quantity
        }

        if (elem.node.asset.orderData.bestAsk) {
            new_elem.bestAsk.orderType = elem.node.asset.orderData.bestAsk.orderType
            new_elem.bestAsk.symbol = elem.node.asset.orderData.bestAsk.paymentAssetQuantity.asset.symbol
            new_elem.bestAsk.quantity = elem.node.asset.orderData.bestAsk.paymentAssetQuantity.quantity
        }

        return new_elem
    })

    return output
}

async function fetch_single_asset(id) {
    let itemQuery = new ITEM_QUERY()
    itemQuery.variables.archetype.assetContractAddress = NFT_CONTRACT_ADDRESS
    itemQuery.variables.archetype.tokenId = id

    let res = await fetch('https://api.opensea.io/graphql/', {
        method: 'post',
        body: JSON.stringify(itemQuery),
        headers: {
            'Content-Type': 'application/json',
            'X-API-KEY': '0106d29713754b448f4513d7a66d0875'
        }
    })
    .then(res => res.json())
    .catch(err => {
        logger.error(`Error fetching id ${id}`)
        logger.error(err)
        return null
    })

    return parse_item_query(res)
}

function parse_item_query(json) {
    if (!json || !json.data) {
        logger.error("Invalid response!")
        logger.error(json)
        return null
    }

    const data = json.data
    let output = new ASSET_STRUCT()

    output.assetContractAddress = data.archetype.asset.assetContract.account.address
    output.tokenId = data.archetype.asset.tokenId
    output.name = data.archetype.asset.name
    
    let owner = data.archetype.asset.assetOwners.edges
    if (owner.length !== 0) {
        output.owner = owner[0].node.owner.user ? owner[0].node.owner.user.username : null
        output.ownerContractAddress = owner[0].node.owner.address
    }

    let lastSale = data.archetype.asset.assetEventData.lastSale
    if (lastSale) {
        output.lastSale.symbol = lastSale.unitPriceQuantity.asset.symbol
        output.lastSale.quantity = parseInt(lastSale.unitPriceQuantity.quantity) / (10 ** lastSale.unitPriceQuantity.asset.decimals)
    }
    
    let bestBid = data.tradeSummary.bestBid
    if (bestBid) {
        output.bestBid.orderType = bestBid.orderType
        output.bestBid.symbol = bestBid.makerAssetBundle.assetQuantities.edges[0].node.asset.symbol
        output.bestBid.quantity = parseInt(bestBid.makerAssetBundle.assetQuantities.edges[0].node.quantity) / (10 ** bestBid.makerAssetBundle.assetQuantities.edges[0].node.asset.decimals)
        output.bestBid.username = bestBid.maker.user ? bestBid.maker.user.username : null
        output.bestBid.userContractAddress = bestBid.maker.address
    }

    let bestAsk = data.tradeSummary.bestAsk
    if (bestAsk) {
        output.bestAsk.orderType = bestAsk.orderType
        output.bestAsk.symbol = bestAsk.takerAssetBundle.assetQuantities.edges[0].node.asset.symbol
        output.bestAsk.username = bestAsk.maker.user ? bestAsk.maker.user.username : null
        output.bestAsk.userContractAddress = bestAsk.maker.address
        
        let quantity = parseInt(bestAsk.takerAssetBundle.assetQuantities.edges[0].node.quantity)
        
        if (bestAsk.orderType !== 'DUTCH') {
            output.bestAsk.quantity = quantity / (10 ** bestAsk.takerAssetBundle.assetQuantities.edges[0].node.asset.decimals)
            // WARNING -- ENGLISH AUCTIONS BESTASK IS NOT ACTUALLY BESTASK
            // IF TYPE IS ENGLISH THEN CHECK BESTBID
        } else {
            // WARNING -- DUTCH AUCTIONS ARE ESTIMATED PRICE AT THE MOMENT!
            let auctionDuration = Date.parse(bestAsk.openedAt) - Date.parse(bestAsk.closedAt)
            let remainingDuration = Date.now() - Date.parse(bestAsk.closedAt)
            let difference = quantity - parseInt(bestAsk.dutchAuctionFinalPrice)
            let currentPrice = parseInt(bestAsk.dutchAuctionFinalPrice) + (difference * (remainingDuration / auctionDuration))
            output.bestAsk.quantity = currentPrice / (10 ** bestAsk.takerAssetBundle.assetQuantities.edges[0].node.asset.decimals)
        }
    }

    return output
}

module.exports = {
    fetch_from_range, fetch_single_asset
}


