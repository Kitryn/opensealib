"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    Object.defineProperty(o, k2, { enumerable: true, get: function() { return m[k]; } });
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.ValidateResponseError = exports.GqlApiError = exports.ApiError = exports.SymbolPriceQuery = exports.EventHistoryPollQuery = exports.EventHistoryQuery = exports.ItemQuery = exports.AssetSearchQuery = exports.Query = exports.ContractAddress = exports.CollectionSlug = void 0;
const fs = __importStar(require("fs"));
const path = __importStar(require("path"));
const _assetSearchQuery = fs.readFileSync(path.resolve(__dirname, './gql/CustomAssetSearch.gql'), 'utf8');
const _itemQuery = fs.readFileSync(path.resolve(__dirname, './gql/CustomItemQuery.gql'), 'utf8');
const _eventHistoryQuery = fs.readFileSync(path.resolve(__dirname, './gql/CustomEventHistoryQuery.gql'), 'utf8');
const _eventHistoryPollQuery = fs.readFileSync(path.resolve(__dirname, './gql/CustomEventHistoryPollQuery.gql'), 'utf8');
const _symbolPriceQuery = fs.readFileSync(path.resolve(__dirname, './gql/CustomPriceQuery.gql'), 'utf8');
var CollectionSlug;
(function (CollectionSlug) {
    CollectionSlug["hashmasks"] = "hashmasks";
    CollectionSlug["mooncats"] = "wrapped-mooncatsrescue";
    CollectionSlug["gan_v2"] = "bastard-gan-punks-v2";
    CollectionSlug["waifusion"] = "waifusion";
    CollectionSlug["chubbies"] = "chubbies";
})(CollectionSlug = exports.CollectionSlug || (exports.CollectionSlug = {}));
var ContractAddress;
(function (ContractAddress) {
    ContractAddress["hashmasks"] = "0xc2c747e0f7004f9e8817db2ca4997657a7746928";
    ContractAddress["mooncats"] = "0x7c40c393dc0f283f318791d746d894ddd3693572";
    ContractAddress["gan_v2"] = "0x31385d3520bced94f77aae104b406994d8f2168c";
    ContractAddress["waifusion"] = "0x2216d47494E516d8206B70FCa8585820eD3C4946";
    ContractAddress["chubbies"] = "0x1db61fc42a843bad4d91a2d788789ea4055b8613";
    ContractAddress["maskSushi"] = "0xfd38565ef22299d491055f0c508f62dd9a669f0f";
    ContractAddress["weth"] = "0xc02aaa39b223fe8d0a0e5c4f27ead9083c756cc2";
})(ContractAddress = exports.ContractAddress || (exports.ContractAddress = {}));
class Query {
    constructor(query) {
        this.variables = {};
        this.query = query;
    }
}
exports.Query = Query;
class AssetSearchQuery extends Query {
    constructor(collection, start, end) {
        super(_assetSearchQuery);
        this.id = 'AssetSearchQuery';
        this.variables = {
            collections: new Array(),
            count: 100,
            resultModel: 'ASSETS',
            cursor: null,
            sortBy: 'CREATED_DATE',
            numericTraits: new Array()
        };
        this.variables.collections.push(collection);
        if (start != null && end != null) {
            let numericTrait = {
                name: 'Token ID',
                ranges: [
                    {
                        max: end,
                        min: end
                    }
                ]
            };
            this.variables.numericTraits.push(numericTrait);
        }
    }
}
exports.AssetSearchQuery = AssetSearchQuery;
class ItemQuery extends Query {
    constructor(address, id) {
        super(_itemQuery);
        this.id = 'itemQuery';
        const archetype = {
            assetContractAddress: address,
            tokenId: id
        };
        this.variables = { archetype };
    }
}
exports.ItemQuery = ItemQuery;
class EventHistoryQuery extends Query {
    constructor(collection) {
        super(_eventHistoryQuery);
        this.id = 'EventHistoryQuery';
        this.variables = {
            archetype: null,
            bundle: null,
            collections: new Array(),
            categories: null,
            eventTypes: ['OFFER_ENTERED'],
            cursor: null,
            count: 10,
            showAll: true,
            identity: null
        };
        this.variables.collections.push(collection);
    }
}
exports.EventHistoryQuery = EventHistoryQuery;
class EventHistoryPollQuery extends Query {
    constructor(collection, timestamp = (new Date(Date.now() - 11 * 1000)).toISOString()) {
        super(_eventHistoryPollQuery);
        this.id = 'EventHistoryPollQuery';
        this.variables = {
            archetype: null,
            categories: null,
            collections: new Array(),
            count: 100,
            cursor: null,
            eventTimestamp_Gt: '',
            eventTypes: ['OFFER_ENTERED'],
            identity: null,
            showAll: true
        };
        this.variables.collections.push(collection);
        this.variables.eventTimestamp_Gt = timestamp;
    }
}
exports.EventHistoryPollQuery = EventHistoryPollQuery;
class SymbolPriceQuery extends Query {
    constructor(symbol) {
        super(_symbolPriceQuery);
        this.id = 'priceQuery';
        this.variables = {
            symbol: symbol
        };
    }
}
exports.SymbolPriceQuery = SymbolPriceQuery;
// -----------------
class ApiError extends Error {
    constructor(message, data, query, statusCode, ...params) {
        super(...params);
        if (Error.captureStackTrace) {
            Error.captureStackTrace(this, ApiError);
        }
        this.name = 'Api Fetch Error';
        this.message = message;
        this.statusCode = statusCode;
        this.data = data;
        this.query = query;
    }
}
exports.ApiError = ApiError;
class GqlApiError extends Error {
    constructor(message, data, query, ...params) {
        super(...params);
        if (Error.captureStackTrace) {
            Error.captureStackTrace(this, GqlApiError);
        }
        this.name = 'Gql Api Fetch Error';
        this.message = message;
        this.data = data;
        this.query = query;
    }
}
exports.GqlApiError = GqlApiError;
class ValidateResponseError extends Error {
    constructor(message, res, data, ...params) {
        super(...params);
        if (Error.captureStackTrace) {
            Error.captureStackTrace(this, ValidateResponseError);
        }
        this.name = "Validate Response Error";
        this.message = message;
        this.data = data;
    }
}
exports.ValidateResponseError = ValidateResponseError;
