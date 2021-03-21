import * as fs from 'fs'
import * as path from 'path'

const _assetSearchQueryString: string = fs.readFileSync(path.resolve(__dirname, './gql/CustomAssetSearch.gql'), 'utf8')
const _itemQueryString: string = fs.readFileSync(path.resolve(__dirname, './gql/CustomItemQuery.gql'), 'utf8')
const _eventHistoryQueryString: string = fs.readFileSync(path.resolve(__dirname, './gql/CustomEventHistoryQuery.gql'), 'utf8')
const _eventHistoryPollQueryString: string = fs.readFileSync(path.resolve(__dirname, './gql/CustomEventHistoryPollQuery.gql'), 'utf8')
const _symbolPriceQuery: string = fs.readFileSync(path.resolve(__dirname, './gql/CustomPriceQuery.gql'), 'utf8')

interface tokenIdTrait {
    name: string
    ranges: Array<{
        min: number,
        max: number
    }>
}

interface archetypeType {
    assetContractAddress: string
    tokenId: number
}

interface itemQueryVariables {
    archetype: archetypeType
}

interface symbolVariables {
    symbol: string
}

export enum CollectionSlug {
    hashmasks = 'hashmasks',
    mooncats = 'wrapped-mooncatsrescue',
    gan_v2 = 'bastard-gan-punks-v2',
    waifusion = 'waifusion',
    chubbies = 'chubbies'
}

class Query {
    query: string
    variables = {}

    constructor(query: string) {
        this.query = query
    }
}

export class AssetSearchQuery extends Query {
    id = 'AssetSearchQuery'
    variables = {
        collections: new Array<CollectionSlug>(),
        count: 100,
        resultModel: 'ASSETS',
        cursor: null,
        sortBy: 'BIRTH_DATE',
        numericTraits: new Array<tokenIdTrait>()
    }

    constructor(collection: CollectionSlug, start?: number, end?: number) {
        super(_assetSearchQueryString)
        
        this.variables.collections.push(collection)
        if (start != null && end != null) {
            let numericTrait: tokenIdTrait = {
                name: 'Token ID',
                ranges: [
                    {
                        max: end,
                        min: end
                    }
                ]
            }

            this.variables.numericTraits.push(numericTrait)
        }
    }
}

export class ItemQuery extends Query {
    id = 'itemQuery'
    variables: itemQueryVariables

    constructor(address: string, id: number) {
        super(_itemQueryString)
        const archetype: archetypeType = {
            assetContractAddress: address,
            tokenId: id
        }
        this.variables = { archetype }
    }
}

export class EventHistoryQuery extends Query {
    id = 'EventHistoryQuery'
    variables = {
        archetype: null,
        bundle: null,
        collections: new Array<CollectionSlug>(),
        categories: null,
        eventTypes: ['OFFER_ENTERED'],
        cursor: null,
        count: 10,
        showAll: true,
        identity: null
    }

    constructor(collection: CollectionSlug) {
        super(_eventHistoryQueryString)
        this.variables.collections.push(collection)
    }
}

export class EventHistoryPollQuery extends Query {
    id = 'EventHistoryPollQuery'
    variables = {
        archetype: null,
        categories: null,
        collections: new Array<CollectionSlug>(),
        count: 100,
        cursor: null,
        eventTimestamp_Gt: '',
        eventTypes: ['OFFER_ENTERED'],
        identity: null,
        showAll: true
    }

    constructor(collection: CollectionSlug, timestamp: string = (new Date(Date.now() - 11*1000)).toISOString()) {
        super(_eventHistoryPollQueryString)
        this.variables.collections.push(collection)
        this.variables.eventTimestamp_Gt = timestamp
    }
}

export class SymbolPriceQuery extends Query {
    id = 'priceQuery'
    variables: symbolVariables

    constructor(symbol:string) {
        super(_symbolPriceQuery)
        this.variables = {
            symbol: symbol
        }
    }
}

// --------------

export interface LastSale {
    symbol: string | null
    quantity: string | null
    usdSpotPrice: number | null
}

export interface Order {
    orderType: string | null
    symbol: string | null
    quantity: number | null
    username: string | null
    userContractAddress: string | null
    usdSpotPrice: number | null
}

export interface Asset {
    assetContractAddress: string
    tokenId: number
    owner: string | null
    ownerContractAddress: string | null
    name: string | null
    lastSale: LastSale
    bestBid: Order
    bestAsk: Order
}