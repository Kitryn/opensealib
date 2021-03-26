"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __generator = (this && this.__generator) || function (thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g;
    return g = { next: verb(0), "throw": verb(1), "return": verb(2) }, typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (_) try {
            if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [op[0] & 2, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.OpenSeaLib = void 0;
var node_fetch_1 = __importDefault(require("node-fetch"));
var winston_1 = __importDefault(require("winston"));
var parentLogger = winston_1.default.loggers.get('default');
var moduleLogger = parentLogger.child({ module: 'opensealib' });
var types_1 = require("./types");
var GRAPHQL_URL = 'https://api.opensea.io/graphql/';
var OpenSeaLib = /** @class */ (function () {
    function OpenSeaLib(nftContractAddress, collection, xApiKey) {
        if (xApiKey === void 0) { xApiKey = '0106d29713754b448f4513d7a66d0875'; }
        this.nftContractAddress = nftContractAddress;
        this.collection = collection;
        this.xApiKey = xApiKey;
        this.logger = moduleLogger.child({ collection: this.collection });
        this._defaultHeaders = {
            'Content-Type': 'application/json',
            'X-API-KEY': this.xApiKey,
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:86.0) Gecko/20100101 Firefox/86.0',
        };
    }
    OpenSeaLib.prototype._postApi = function (query) {
        return __awaiter(this, void 0, void 0, function () {
            var res, json;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, node_fetch_1.default(GRAPHQL_URL, {
                            method: 'post',
                            body: JSON.stringify(query),
                            headers: this._defaultHeaders
                        })
                            .catch(function (err) {
                            throw new types_1.ApiError('POST Api error', err, query, undefined);
                        })];
                    case 1:
                        res = _a.sent();
                        if (!res.ok) return [3 /*break*/, 3];
                        return [4 /*yield*/, res.json().catch(function (err) {
                                throw new types_1.ValidateResponseError('Error parsing response into json', res, err);
                            })];
                    case 2:
                        json = _a.sent();
                        if (json.errors) {
                            // graphql error, not http error
                            throw new types_1.ApiError('GraphQL Api Error', json.errors, query);
                        }
                        return [2 /*return*/, json];
                    case 3: throw new types_1.ApiError('POST Api Response not ok', res, query, res.status);
                }
            });
        });
    };
    OpenSeaLib.prototype._parseRangeQueryResponse = function (edges) {
        var output = new Array();
        // if input is [], returns []
        for (var _i = 0, edges_1 = edges; _i < edges_1.length; _i++) {
            var elem = edges_1[_i];
            try {
                // Try to parse elem and push to output
                var data = elem.node.asset;
                var asset = {
                    assetContractAddress: data.assetContract.account.address,
                    tokenId: parseInt(data.tokenId),
                    name: data.name
                };
                var assetOwner = data.assetOwners.edges;
                if (assetOwner.length !== 0) {
                    asset.owner = assetOwner[0].node.owner.user ? assetOwner[0].node.owner.user.username : undefined;
                    asset.ownerContractAddress = assetOwner[0].node.owner.address;
                }
                var lastSaleData = data.assetEventData.lastSale;
                if (lastSaleData) {
                    var lastSale = {
                        symbol: lastSaleData.unitPriceQuantity.asset.symbol,
                        quantity: parseInt(lastSaleData.unitPriceQuantity.quantity) / (Math.pow(10, lastSaleData.unitPriceQuantity.asset.decimals)),
                        usdSpotPrice: lastSaleData.unitPriceQuantity.asset.usdSpotPrice
                    };
                    asset.lastSale = lastSale;
                }
                // Range query cannot obtain bestBid and bestAsk bidder names!
                var bestBidData = data.orderData.bestBid;
                if (bestBidData) {
                    var bestBid = {
                        orderType: bestBidData.orderType,
                        symbol: bestBidData.paymentAssetQuantity.asset.symbol,
                        quantity: parseInt(bestBidData.paymentAssetQuantity.quantity) / (Math.pow(10, bestBidData.paymentAssetQuantity.asset.decimals)),
                        usdSpotPrice: bestBidData.paymentAssetQuantity.asset.usdSpotPrice,
                    };
                    asset.bestBid = bestBid;
                }
                var bestAskData = data.orderData.bestAsk;
                if (bestAskData) {
                    var bestAsk = {
                        orderType: bestAskData.orderType,
                        symbol: bestAskData.paymentAssetQuantity.asset.symbol,
                        quantity: parseInt(bestAskData.paymentAssetQuantity.quantity) / (Math.pow(10, bestAskData.paymentAssetQuantity.asset.decimals)),
                        usdSpotPrice: bestAskData.paymentAssetQuantity.asset.usdSpotPrice
                    };
                    asset.bestAsk = bestAsk;
                }
                output.push(asset);
            }
            catch (err) {
                // parsing of elem failed
                this.logger.warn("Error parsing element in range query response", { elem: elem });
                this.logger.warn(err);
                continue;
            }
        }
        return output;
    };
    OpenSeaLib.prototype._parseSingleAssetResponse = function (data) {
        var _a, _b, _c, _d;
        var asset;
        try {
            asset = {
                assetContractAddress: data.archetype.asset.assetContract.account.address,
                tokenId: parseInt(data.archetype.asset.tokenId),
                name: data.archetype.asset.name
            };
            var traitListData = (_d = (_c = (_b = (_a = data === null || data === void 0 ? void 0 : data.archetype) === null || _a === void 0 ? void 0 : _a.asset) === null || _b === void 0 ? void 0 : _b.traits) === null || _c === void 0 ? void 0 : _c.edges) !== null && _d !== void 0 ? _d : [];
            var traitList = new Array();
            for (var _i = 0, traitListData_1 = traitListData; _i < traitListData_1.length; _i++) {
                var trait = traitListData_1[_i];
                var node = trait.node;
                var value = node.value || node.intValue || node.floatValue || node.dateValue;
                traitList.push({
                    traitType: node.traitType,
                    value: value
                });
            }
            if (traitList.length > 0)
                asset.traits = traitList;
            var owner = data.archetype.asset.assetOwners.edges;
            if (owner.length !== 0) {
                asset.owner = owner[0].node.owner.user ? owner[0].node.owner.user.username : undefined;
                asset.ownerContractAddress = owner[0].node.owner.address;
            }
            var lastSaleData = data.archetype.asset.assetEventData.lastSale;
            if (lastSaleData) {
                var lastSale = {
                    symbol: lastSaleData.unitPriceQuantity.asset.symbol,
                    quantity: parseInt(lastSaleData.unitPriceQuantity.quantity) / (Math.pow(10, lastSaleData.unitPriceQuantity.asset.decimals)),
                    usdSpotPrice: lastSaleData.unitPriceQuantity.asset.usdSpotPrice
                };
                asset.lastSale = lastSale;
            }
            var bestBidData = data.tradeSummary.bestBid;
            if (bestBidData) {
                var bestBid = {
                    orderType: bestBidData.orderType,
                    symbol: bestBidData.makerAssetBundle.assetQuantities.edges[0].node.asset.symbol,
                    quantity: parseInt(bestBidData.makerAssetBundle.assetQuantities.edges[0].node.quantity) / (Math.pow(10, bestBidData.makerAssetBundle.assetQuantities.edges[0].node.asset.decimals)),
                    usdSpotPrice: bestBidData.makerAssetBundle.assetQuantities.edges[0].node.asset.usdSpotPrice,
                    username: bestBidData.maker.user ? bestBidData.maker.user.username : undefined,
                    userContractAddress: bestBidData.maker.address
                };
                asset.bestBid = bestBid;
            }
            var bestAskData = data.tradeSummary.bestAsk;
            if (bestAskData) {
                var bestAsk = {
                    orderType: bestAskData.orderType,
                    symbol: bestAskData.takerAssetBundle.assetQuantities.edges[0].node.asset.symbol,
                    usdSpotPrice: bestAskData.takerAssetBundle.assetQuantities.edges[0].node.asset.usdSpotPrice,
                    username: bestAskData.maker.user ? bestAskData.maker.user.username : undefined,
                    userContractAddress: bestAskData.maker.address,
                    quantity: parseInt(bestAskData.takerAssetBundle.assetQuantities.edges[0].node.quantity) / (Math.pow(10, bestAskData.takerAssetBundle.assetQuantities.edges[0].node.asset.decimals))
                };
                // WARNING: ENGLISH AUCTIONS SOMETIMES SAY BASIC INSTEAD OF ENGLISH
                // ALSO IF ITS ENGLISH -- BEST ASK IS NOT ACTUALLY BEST ASK, CHECK BEST BID
                if (bestAskData.orderType === 'DUTCH') {
                    // WARNING -- DUTCH AUCTION PRICES ARE ESTIMATED!!
                    var closedAt = bestAskData.closedAt + "+00:00";
                    var openedAt = bestAskData.openedAt + "+00:00";
                    var auctionDuration = Date.parse(closedAt) - Date.parse(openedAt);
                    var remainingDuration = Date.parse(closedAt) - Date.now();
                    var quantity = parseInt(bestAskData.takerAssetBundle.assetQuantities.edges[0].node.quantity);
                    var difference = quantity - parseInt(bestAskData.dutchAuctionFinalPrice);
                    var currentPrice = parseInt(bestAskData.dutchAuctionFinalPrice) + (difference * (remainingDuration / auctionDuration));
                    bestAsk.quantity = currentPrice / (Math.pow(10, bestAskData.takerAssetBundle.assetQuantities.edges[0].node.asset.decimals));
                }
                asset.bestAsk = bestAsk;
            }
            return asset;
        }
        catch (err) {
            throw new types_1.ValidateResponseError('Error parsing singleAssetResponse from json', data, err);
        }
    };
    OpenSeaLib.prototype._parseRecentBidsResponse = function (edges) {
        var output = new Array();
        for (var _i = 0, edges_2 = edges; _i < edges_2.length; _i++) {
            var edge = edges_2[_i];
            try {
                var node = edge.node;
                var asset = {
                    assetContractAddress: node.assetQuantity.asset.assetContract.account.address,
                    tokenId: parseInt(node.assetQuantity.asset.tokenId),
                    name: node.assetQuantity.asset.name
                }; // unable to get owner and ownercontractaddress right now...
                var bestBid = {
                    orderType: 'BASIC',
                    symbol: node.price.asset.symbol,
                    usdSpotPrice: node.price.asset.usdSpotPrice,
                    quantity: parseInt(node.price.quantity) / (Math.pow(10, node.price.asset.decimals)),
                    username: node.fromAccount.user ? node.fromAccount.user.username : undefined,
                    userContractAddress: node.fromAccount.address
                };
                asset.bestBid = bestBid;
                output.push(asset);
            }
            catch (err) {
                this.logger.warn("Error parsing recent bid edge!", { data: edge });
            }
        }
        if (edges.length !== output.length) {
            this.logger.warn("_parseRecentBids: num parsed != num returned by api!", { response: edges });
        }
        return output;
    };
    OpenSeaLib.prototype.fetchLatestMinted = function () {
        var _a, _b, _c, _d;
        return __awaiter(this, void 0, void 0, function () {
            var query, res, edges, output;
            return __generator(this, function (_e) {
                switch (_e.label) {
                    case 0:
                        query = new types_1.AssetSearchQuery(this.collection);
                        query.variables.count = 1;
                        return [4 /*yield*/, this._postApi(query)]; // can throw ValidateResponseError or ApiError
                    case 1:
                        res = _e.sent() // can throw ValidateResponseError or ApiError
                        ;
                        edges = (_d = (_c = (_b = (_a = res === null || res === void 0 ? void 0 : res.data) === null || _a === void 0 ? void 0 : _a.query) === null || _b === void 0 ? void 0 : _b.search) === null || _c === void 0 ? void 0 : _c.edges) !== null && _d !== void 0 ? _d : [];
                        output = this._parseRangeQueryResponse(edges)[0] // this shouldn't throw any errors but logger.warns any parse errors
                        ;
                        return [2 /*return*/, output];
                }
            });
        });
    };
    OpenSeaLib.prototype.fetchSymbolUsdPrice = function (symbol) {
        var _a, _b, _c, _d;
        return __awaiter(this, void 0, void 0, function () {
            var query, res, usdSpotPrice;
            return __generator(this, function (_e) {
                switch (_e.label) {
                    case 0:
                        query = new types_1.SymbolPriceQuery(symbol);
                        return [4 /*yield*/, this._postApi(query)]; // can throw ValidateResponseError or ApiError
                    case 1:
                        res = _e.sent() // can throw ValidateResponseError or ApiError
                        ;
                        usdSpotPrice = (_d = (_c = (_b = (_a = res === null || res === void 0 ? void 0 : res.data) === null || _a === void 0 ? void 0 : _a.paymentAsset) === null || _b === void 0 ? void 0 : _b.asset) === null || _c === void 0 ? void 0 : _c.usdSpotPrice) !== null && _d !== void 0 ? _d : null;
                        if (usdSpotPrice)
                            return [2 /*return*/, usdSpotPrice
                                // if null then something went wrong
                            ];
                        // if null then something went wrong
                        this.logger.warn("Error in fetchSymbolUsdPrice for " + symbol, { response: res });
                        throw new types_1.ValidateResponseError("Error fetching usdSpotSprice for " + symbol, res, query);
                }
            });
        });
    };
    OpenSeaLib.prototype.fetchSingleAsset = function (id) {
        var _a;
        return __awaiter(this, void 0, void 0, function () {
            var query, res, data, parsed;
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0:
                        query = new types_1.ItemQuery(this.nftContractAddress, id);
                        return [4 /*yield*/, this._postApi(query)]; // can throw ValidateResponseError or ApiError
                    case 1:
                        res = _b.sent() // can throw ValidateResponseError or ApiError
                        ;
                        data = (_a = res === null || res === void 0 ? void 0 : res.data) !== null && _a !== void 0 ? _a : undefined;
                        if (data == null) {
                            throw new types_1.ValidateResponseError("Malformed response in fetchSingleAsset id " + id, res, query);
                        }
                        parsed = this._parseSingleAssetResponse(data) // can throw a ValidateResponseError
                        ;
                        return [2 /*return*/, parsed];
                }
            });
        });
    };
    OpenSeaLib.prototype.fetchRecentBids = function () {
        var _a, _b, _c, _d, _e, _f;
        return __awaiter(this, void 0, void 0, function () {
            var query, res, edges;
            return __generator(this, function (_g) {
                switch (_g.label) {
                    case 0:
                        query = new types_1.EventHistoryPollQuery(this.collection, this.lastBidPollTimestamp ? this.lastBidPollTimestamp : undefined);
                        return [4 /*yield*/, this._postApi(query)]; // can throw ValidateResponseError or ApiError
                    case 1:
                        res = _g.sent() // can throw ValidateResponseError or ApiError
                        ;
                        edges = (_c = (_b = (_a = res === null || res === void 0 ? void 0 : res.data) === null || _a === void 0 ? void 0 : _a.assetEvents) === null || _b === void 0 ? void 0 : _b.edges) !== null && _c !== void 0 ? _c : undefined;
                        if (edges == null) {
                            throw new types_1.ValidateResponseError("Malformed response in fetchRecentBids", res, query);
                        }
                        if (edges.length >= 1) {
                            this.lastBidPollTimestamp = (_f = (_e = (_d = edges[0]) === null || _d === void 0 ? void 0 : _d.node) === null || _e === void 0 ? void 0 : _e.eventTimestamp) !== null && _f !== void 0 ? _f : (function () {
                                throw new types_1.ValidateResponseError("Malformed timestamp in response", res, query);
                            })();
                        }
                        else {
                            if (this.lastBidPollTimestamp == null)
                                this.lastBidPollTimestamp = (new Date(Date.now() - 11 * 1000)).toISOString();
                        }
                        return [2 /*return*/, this._parseRecentBidsResponse(edges)]; // this shouldn't throw any errors but logger.warns any parse errors
                }
            });
        });
    };
    return OpenSeaLib;
}());
exports.OpenSeaLib = OpenSeaLib;
