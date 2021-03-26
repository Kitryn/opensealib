import * as fs from 'fs'
import * as path from 'path'

const _assetSearchQuery: string = fs.readFileSync(path.resolve(__dirname, './gql/CustomAssetSearch.gql'), 'utf8')
const _itemQuery: string = fs.readFileSync(path.resolve(__dirname, './gql/CustomItemQuery.gql'), 'utf8')
const _eventHistoryQuery: string = fs.readFileSync(path.resolve(__dirname, './gql/CustomEventHistoryQuery.gql'), 'utf8')
const _eventHistoryPollQuery: string = fs.readFileSync(path.resolve(__dirname, './gql/CustomEventHistoryPollQuery.gql'), 'utf8')
const _symbolPriceQuery: string = fs.readFileSync(path.resolve(__dirname, './gql/CustomPriceQuery.gql'), 'utf8')

interface TokenIdTrait {
    name: string
    ranges: Array<{
        min: number,
        max: number
    }>
}

interface ArchetypeType {
    assetContractAddress: string
    tokenId: number
}

interface ItemQueryVariables {
    archetype: ArchetypeType
}

interface SymbolVariables {
    symbol: string
}

export enum CollectionSlug {
    hashmasks = 'hashmasks',
    mooncats = 'wrapped-mooncatsrescue',
    gan_v2 = 'bastard-gan-punks-v2',
    waifusion = 'waifusion',
    chubbies = 'chubbies'
}

export enum ContractAddress {
    hashmasks = '0xc2c747e0f7004f9e8817db2ca4997657a7746928',
    mooncats = '0x7c40c393dc0f283f318791d746d894ddd3693572',
    gan_v2 = '0x31385d3520bced94f77aae104b406994d8f2168c',
    waifusion = '0x2216d47494E516d8206B70FCa8585820eD3C4946',
    chubbies = '0x1db61fc42a843bad4d91a2d788789ea4055b8613',
    maskSushi = '0xfd38565ef22299d491055f0c508f62dd9a669f0f',
    weth = '0xc02aaa39b223fe8d0a0e5c4f27ead9083c756cc2'
}

export class Query {
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
        sortBy: 'CREATED_DATE',
        numericTraits: new Array<TokenIdTrait>()
    }

    constructor(collection: CollectionSlug, start?: number, end?: number) {
        super(_assetSearchQuery)
        
        this.variables.collections.push(collection)
        if (start != null && end != null) {
            let numericTrait: TokenIdTrait = {
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
    variables: ItemQueryVariables

    constructor(address: string, id: number) {
        super(_itemQuery)
        const archetype: ArchetypeType = {
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
        super(_eventHistoryQuery)
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
        super(_eventHistoryPollQuery)
        this.variables.collections.push(collection)
        this.variables.eventTimestamp_Gt = timestamp
    }
}

export class SymbolPriceQuery extends Query {
    id = 'priceQuery'
    variables: SymbolVariables

    constructor(symbol:string) {
        super(_symbolPriceQuery)
        this.variables = {
            symbol: symbol
        }
    }
}

// --------------

export interface LastSale {
    symbol: string
    quantity: number
    usdSpotPrice: number
}

export interface Order {
    orderType: string
    symbol: string
    quantity: number
    usdSpotPrice: number
    username?: string
    userContractAddress?: string
}

export interface Asset {
    assetContractAddress: string
    tokenId: number
    name: string
    owner?: string
    ownerContractAddress?: string
    lastSale?: LastSale
    bestBid?: Order
    bestAsk?: Order
    traits?: Trait[]
}

// -----------------

export interface Trait {
    traitType: string
    value: string
}

// -----------------

export class ApiError extends Error {
    statusCode: number | undefined
    query: Query
    data: any

    constructor(message: string, data: any, query: Query, statusCode?: number, ...params: any) {
        super(...params)
        if (Error.captureStackTrace) {
            Error.captureStackTrace(this, ApiError)
        }
        this.name = 'Api Fetch Error'
        this.message = message
        this.statusCode = statusCode
        this.data = data
        this.query = query
    }
}

export class GqlApiError extends Error {
    data: any
    query: Query
    
    constructor(message: string, data: any, query: Query, ...params: any) {
        super(...params)
        if (Error.captureStackTrace) {
            Error.captureStackTrace(this, GqlApiError)
        }
        this.name = 'Gql Api Fetch Error'
        this.message = message
        this.data = data
        this.query = query
    }
}

export class ValidateResponseError extends Error {
    data: any
    res: any
    
    constructor(message: string, res: any, data: any, ...params: any) {
        super(...params)
        if (Error.captureStackTrace) {
            Error.captureStackTrace(this, ValidateResponseError)
        }
        this.name = "Validate Response Error"
        this.message = message
        this.data = data
    }
}