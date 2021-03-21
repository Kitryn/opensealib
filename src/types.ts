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
        sortBy: 'BIRTH_DATE',
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
}