"use strict";
var __extends = (this && this.__extends) || (function () {
    var extendStatics = function (d, b) {
        extendStatics = Object.setPrototypeOf ||
            ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
            function (d, b) { for (var p in b) if (Object.prototype.hasOwnProperty.call(b, p)) d[p] = b[p]; };
        return extendStatics(d, b);
    };
    return function (d, b) {
        if (typeof b !== "function" && b !== null)
            throw new TypeError("Class extends value " + String(b) + " is not a constructor or null");
        extendStatics(d, b);
        function __() { this.constructor = d; }
        d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
    };
})();
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
exports.SymbolPriceQuery = exports.EventHistoryPollQuery = exports.EventHistoryQuery = exports.ItemQuery = exports.AssetSearchQuery = exports.Query = exports.ContractAddress = exports.CollectionSlug = void 0;
var fs = __importStar(require("fs"));
var path = __importStar(require("path"));
var _assetSearchQuery = fs.readFileSync(path.resolve(__dirname, './gql/CustomAssetSearch.gql'), 'utf8');
var _itemQuery = fs.readFileSync(path.resolve(__dirname, './gql/CustomItemQuery.gql'), 'utf8');
var _eventHistoryQuery = fs.readFileSync(path.resolve(__dirname, './gql/CustomEventHistoryQuery.gql'), 'utf8');
var _eventHistoryPollQuery = fs.readFileSync(path.resolve(__dirname, './gql/CustomEventHistoryPollQuery.gql'), 'utf8');
var _symbolPriceQuery = fs.readFileSync(path.resolve(__dirname, './gql/CustomPriceQuery.gql'), 'utf8');
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
var Query = /** @class */ (function () {
    function Query(query) {
        this.variables = {};
        this.query = query;
    }
    return Query;
}());
exports.Query = Query;
var AssetSearchQuery = /** @class */ (function (_super) {
    __extends(AssetSearchQuery, _super);
    function AssetSearchQuery(collection, start, end) {
        var _this = _super.call(this, _assetSearchQuery) || this;
        _this.id = 'AssetSearchQuery';
        _this.variables = {
            collections: new Array(),
            count: 100,
            resultModel: 'ASSETS',
            cursor: null,
            sortBy: 'BIRTH_DATE',
            numericTraits: new Array()
        };
        _this.variables.collections.push(collection);
        if (start != null && end != null) {
            var numericTrait = {
                name: 'Token ID',
                ranges: [
                    {
                        max: end,
                        min: end
                    }
                ]
            };
            _this.variables.numericTraits.push(numericTrait);
        }
        return _this;
    }
    return AssetSearchQuery;
}(Query));
exports.AssetSearchQuery = AssetSearchQuery;
var ItemQuery = /** @class */ (function (_super) {
    __extends(ItemQuery, _super);
    function ItemQuery(address, id) {
        var _this = _super.call(this, _itemQuery) || this;
        _this.id = 'itemQuery';
        var archetype = {
            assetContractAddress: address,
            tokenId: id
        };
        _this.variables = { archetype: archetype };
        return _this;
    }
    return ItemQuery;
}(Query));
exports.ItemQuery = ItemQuery;
var EventHistoryQuery = /** @class */ (function (_super) {
    __extends(EventHistoryQuery, _super);
    function EventHistoryQuery(collection) {
        var _this = _super.call(this, _eventHistoryQuery) || this;
        _this.id = 'EventHistoryQuery';
        _this.variables = {
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
        _this.variables.collections.push(collection);
        return _this;
    }
    return EventHistoryQuery;
}(Query));
exports.EventHistoryQuery = EventHistoryQuery;
var EventHistoryPollQuery = /** @class */ (function (_super) {
    __extends(EventHistoryPollQuery, _super);
    function EventHistoryPollQuery(collection, timestamp) {
        if (timestamp === void 0) { timestamp = (new Date(Date.now() - 11 * 1000)).toISOString(); }
        var _this = _super.call(this, _eventHistoryPollQuery) || this;
        _this.id = 'EventHistoryPollQuery';
        _this.variables = {
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
        _this.variables.collections.push(collection);
        _this.variables.eventTimestamp_Gt = timestamp;
        return _this;
    }
    return EventHistoryPollQuery;
}(Query));
exports.EventHistoryPollQuery = EventHistoryPollQuery;
var SymbolPriceQuery = /** @class */ (function (_super) {
    __extends(SymbolPriceQuery, _super);
    function SymbolPriceQuery(symbol) {
        var _this = _super.call(this, _symbolPriceQuery) || this;
        _this.id = 'priceQuery';
        _this.variables = {
            symbol: symbol
        };
        return _this;
    }
    return SymbolPriceQuery;
}(Query));
exports.SymbolPriceQuery = SymbolPriceQuery;
