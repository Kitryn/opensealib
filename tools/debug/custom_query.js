const fetch = require('node-fetch')
const fs = require('fs/promises')
const { winston } = require('../../lib/logger')
const logger = winston.loggers.get('default')
const {OpenSeaLib} = require('../opensealib')

class query {
    id = "AssetSearchQuery"
    query = ""
    variables = {
        symbol: 'WETH'
    }
}

const opensealib = new OpenSeaLib('0x2216d47494E516d8206B70FCa8585820eD3C4946', 'waifusion')

async function main() {
    let test_query = new query()
    test_query.query = await fs.readFile('../constants/CustomPriceQuery.gql', 'utf8')
    // test_query.query = await fs.readFile('./CustomAssetSearch2.gql', 'utf8')
    // body: JSON.stringify({"id":"EventHistoryPollQuery","query":"query EventHistoryPollQuery(\n  $archetype: ArchetypeInputType\n  $categories: [CollectionSlug!]\n  $collections: [CollectionSlug!]\n  $count: Int = 10\n  $cursor: String\n  $eventTimestamp_Gt: DateTime\n  $eventTypes: [EventType!]\n  $identity: IdentityInputType\n  $showAll: Boolean = false\n) {\n  assetEvents(after: $cursor, archetype: $archetype, categories: $categories, collections: $collections, eventTimestamp_Gt: $eventTimestamp_Gt, eventTypes: $eventTypes, first: $count, identity: $identity) {\n    edges {\n      node {\n        assetBundle @include(if: $showAll) {\n          ...AssetCell_assetBundle\n          id\n        }\n        assetQuantity {\n          asset @include(if: $showAll) {\n            ...AssetCell_asset\n            id\n          }\n          ...quantity_data\n          id\n        }\n        relayId\n        eventTimestamp\n        eventType\n        customEventName\n        devFee {\n          quantity\n          ...AssetQuantity_data\n          id\n        }\n        devFeePaymentEvent {\n          ...EventTimestamp_data\n          id\n        }\n        fromAccount {\n          address\n          ...AccountLink_data\n          id\n        }\n        price {\n          quantity\n          ...AssetQuantity_data\n          id\n        }\n        endingPrice {\n          quantity\n          ...AssetQuantity_data\n          id\n        }\n        seller {\n          ...AccountLink_data\n          id\n        }\n        toAccount {\n          ...AccountLink_data\n          id\n        }\n        winnerAccount {\n          ...AccountLink_data\n          id\n        }\n        ...EventTimestamp_data\n        id\n      }\n    }\n  }\n}\n\nfragment AccountLink_data on AccountType {\n  address\n  chain {\n    identifier\n    id\n  }\n  user {\n    username\n    id\n  }\n  ...ProfileImage_data\n  ...wallet_accountKey\n}\n\nfragment AssetCell_asset on AssetType {\n  collection {\n    name\n    id\n  }\n  name\n  ...AssetMedia_asset\n  ...asset_url\n}\n\nfragment AssetCell_assetBundle on AssetBundleType {\n  assetQuantities(first: 2) {\n    edges {\n      node {\n        asset {\n          collection {\n            name\n            id\n          }\n          name\n          ...AssetMedia_asset\n          ...asset_url\n          id\n        }\n        relayId\n        id\n      }\n    }\n  }\n  name\n  slug\n}\n\nfragment AssetMedia_asset on AssetType {\n  animationUrl\n  backgroundColor\n  collection {\n    description\n    displayData {\n      cardDisplayStyle\n    }\n    imageUrl\n    hidden\n    name\n    slug\n    id\n  }\n  description\n  name\n  tokenId\n  imageUrl\n}\n\nfragment AssetQuantity_data on AssetQuantityType {\n  asset {\n    ...Price_data\n    id\n  }\n  quantity\n}\n\nfragment EventTimestamp_data on AssetEventType {\n  eventTimestamp\n  transaction {\n    blockExplorerLink\n    id\n  }\n}\n\nfragment Price_data on AssetType {\n  decimals\n  imageUrl\n  symbol\n  usdSpotPrice\n  assetContract {\n    blockExplorerLink\n    id\n  }\n}\n\nfragment ProfileImage_data on AccountType {\n  imageUrl\n  address\n  chain {\n    identifier\n    id\n  }\n}\n\nfragment asset_url on AssetType {\n  assetContract {\n    account {\n      address\n      chain {\n        identifier\n        id\n      }\n      id\n    }\n    id\n  }\n  tokenId\n}\n\nfragment quantity_data on AssetQuantityType {\n  asset {\n    decimals\n    id\n  }\n  quantity\n}\n\nfragment wallet_accountKey on AccountType {\n  address\n  chain {\n    identifier\n    id\n  }\n}\n","variables":{"archetype":null,"categories":null,"collections":["hashmasks"],"count":100,"cursor":null,"eventTimestamp_Gt":"2021-03-10T10:46:45.550969","eventTypes":["OFFER_ENTERED"],"identity":null,"showAll":true}}),
    let res = await fetch('https://api.opensea.io/graphql/', {
        method: 'post',
        body: JSON.stringify(test_query),
        headers: {
            'Content-Type': 'application/json',
            'X-API-KEY': '0106d29713754b448f4513d7a66d0875'
        }
    })
    .then(res => res.json())
    .catch(err => console.error(err))

    // let res = await opensealib._fetch_all_from_query(test_query)
    logger.info(res)
}

main()