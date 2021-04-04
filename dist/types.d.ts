interface TokenIdTrait {
    name: string;
    ranges: Array<{
        min: number;
        max: number;
    }>;
}
interface ArchetypeType {
    assetContractAddress: string;
    tokenId: number;
}
interface ItemQueryVariables {
    archetype: ArchetypeType;
}
interface SymbolVariables {
    symbol: string;
}
export declare enum CollectionSlug {
    hashmasks = "hashmasks",
    mooncats = "wrapped-mooncatsrescue",
    gan_v2 = "bastard-gan-punks-v2",
    waifusion = "waifusion",
    chubbies = "chubbies",
    crypteriors = "crypteriors",
    foxpunkjrs = "foxpunk-jrs"
}
export declare enum ContractAddress {
    hashmasks = "0xc2c747e0f7004f9e8817db2ca4997657a7746928",
    mooncats = "0x7c40c393dc0f283f318791d746d894ddd3693572",
    gan_v2 = "0x31385d3520bced94f77aae104b406994d8f2168c",
    waifusion = "0x2216d47494E516d8206B70FCa8585820eD3C4946",
    chubbies = "0x1db61fc42a843bad4d91a2d788789ea4055b8613",
    maskSushi = "0xfd38565ef22299d491055f0c508f62dd9a669f0f",
    weth = "0xc02aaa39b223fe8d0a0e5c4f27ead9083c756cc2",
    crypteriors = "0x417cf58dC18edd17025689D13AF2b85F403E130C",
    foxpunkjrs = "0x9efa7962ccb25884587526c0ce8bffab2622976b"
}
export declare class Query {
    query: string;
    variables: {};
    constructor(query: string);
}
export declare class AssetSearchQuery extends Query {
    id: string;
    variables: {
        collections: CollectionSlug[];
        count: number;
        resultModel: string;
        cursor: null;
        sortBy: string;
        numericTraits: TokenIdTrait[];
    };
    constructor(collection: CollectionSlug, start?: number, end?: number);
}
export declare class ItemQuery extends Query {
    id: string;
    variables: ItemQueryVariables;
    constructor(address: string, id: number);
}
export declare class EventHistoryQuery extends Query {
    id: string;
    variables: {
        archetype: null;
        bundle: null;
        collections: CollectionSlug[];
        categories: null;
        eventTypes: string[];
        cursor: null;
        count: number;
        showAll: boolean;
        identity: null;
    };
    constructor(collection: CollectionSlug);
}
export declare class EventHistoryPollQuery extends Query {
    id: string;
    variables: {
        archetype: null;
        categories: null;
        collections: CollectionSlug[];
        count: number;
        cursor: null;
        eventTimestamp_Gt: string;
        eventTypes: string[];
        identity: null;
        showAll: boolean;
    };
    constructor(collection: CollectionSlug, timestamp?: string);
}
export declare class SymbolPriceQuery extends Query {
    id: string;
    variables: SymbolVariables;
    constructor(symbol: string);
}
export interface LastSale {
    symbol: string;
    quantity: number;
    usdSpotPrice: number;
}
export interface Order {
    orderType: string;
    symbol: string;
    quantity: number;
    usdSpotPrice: number;
    username?: string;
    userContractAddress?: string;
}
export interface Asset {
    assetContractAddress: string;
    tokenId: number;
    name: string;
    owner?: string;
    ownerContractAddress?: string;
    lastSale?: LastSale;
    bestBid?: Order;
    bestAsk?: Order;
    traits?: Trait[];
}
export interface Trait {
    traitType: string;
    value: string;
}
export declare class ApiError extends Error {
    statusCode: number | undefined;
    query: Query;
    data: any;
    constructor(message: string, data: any, query: Query, statusCode?: number, ...params: any);
}
export declare class GqlApiError extends Error {
    data: any;
    query: Query;
    constructor(message: string, data: any, query: Query, ...params: any);
}
export declare class ValidateResponseError extends Error {
    data: any;
    res: any;
    constructor(message: string, res: any, data: any, ...params: any);
}
export {};
