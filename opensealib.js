const fetch = require('node-fetch')
const search_query = require('./asset_search_query.json')
const winston = require('winston')
const logger = winston.loggers.get('default')
const { NUMERIC_TRAITS, ASSET_STRUCT } = require('./constants')

const NFT_CONTRACT_ADDRESS = '0xc2c747e0f7004f9e8817db2ca4997657a7746928'


async function fetch_from_range(start = 0, end = 16383) {
    function query_builder(a, b) {
        let output = JSON.parse(JSON.stringify(search_query))
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

async function fetch_single_asset(id) {
    let res = await fetch(`https://api.opensea.io/api/v1/asset/${NFT_CONTRACT_ADDRESS}/${id}/`)
        .then(res => res.json())
    
    return parse_single_query_response(res)
}

function parse_range_query_response(json) {
    if (!json) {
        console.error("Invalid response!")
        console.error(json)
        return []
    }

    // logger.debug({origin: 'parse_search_response', message: json})

    let output = json.map((elem) => {
        let new_elem = JSON.parse(JSON.stringify(ASSET_STRUCT))
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

function parse_single_query_response(json) {
    if (!json) {
        console.error("Invalid response!")
        console.error(json)
        return []
    }
    
    // logger.debug({origin: 'parse_single_order', message: json})

    let output = JSON.parse(JSON.stringify(ASSET_STRUCT))

    output.tokenId = json.token_id
    output.name = json.name
    
    let tmp = null
    if (!json.owner.user || !json.owner.user.username) {
        tmp = json.owner.address.slice(2,8).toUpperCase()
    } else {
        tmp = json.owner.user.username
    }
    
    output.owner = tmp

    if (json.last_sale) {
        output.lastSale.symbol = json.last_sale.payment_token.symbol
        output.lastSale.quantity = json.last_sale.total_price
    }

    if (!json.orders) return output

    // side 0 is offer/bid
    // side 1 is list/ask

    let sale_kind = ['BASIC', 'DUTCH', 'ENGLISH']

    for (order of json.orders) {
        let side = null
        if (order.side == 0) {
            side = output.bestBid
        } else if (order.side == 1) {
            side = output.bestAsk
        } else {
            logger.warn(`Invalid order side for mask ${json.id}! Got ${order.side}`)
            continue
        }

        let test_quantity = order.current_price
        let swap = false

        switch(parseInt(order.side)) {
            case 0:
                // offer/bid, swap if the bid is the highest
                if (parseInt(test_quantity) >= parseInt(side.quantity)) swap = true
                break
            case 1:
                // list/ask, swap if bid is lowest?! will there even be more than one?
                if (parseInt(test_quantity) <= parseInt(side.quantity)) swap = true
                break
            default:
                logger.error('No side? Should not have reached this!')
        }

        if (swap || !side.quantity) {
            side.username = order.maker.user ? order.maker.user.username : null
            side.symbol = order.payment_token_contract.symbol
            side.quantity = parseInt(order.current_price).toString()
            side.orderType = sale_kind[parseInt(order.sale_kind)]  // DOES NOT DETECT ENGLISH AUCTION SALES, LISTS THEM AS BASIC!!
        }
    }

    return output
}

module.exports = {
    fetch_from_range, fetch_single_asset
}
