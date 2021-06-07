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
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.OpenSeaLib = void 0;
const node_fetch_1 = __importDefault(require("node-fetch"));
const winston_1 = __importDefault(require("winston"));
const parentLogger = winston_1.default.loggers.get('default');
const moduleLogger = parentLogger.child({ module: 'opensealib' });
const types_1 = require("./types");
const GRAPHQL_URL = 'https://api.opensea.io/graphql/';
class OpenSeaLib {
    constructor(nftContractAddress, collection, xApiKey = '0106d29713754b448f4513d7a66d0875') {
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
    _postApi(query) {
        return __awaiter(this, void 0, void 0, function* () {
            this.logger.verbose('POST');
            let res = yield node_fetch_1.default(GRAPHQL_URL, {
                method: 'post',
                body: JSON.stringify(query),
                headers: this._defaultHeaders
            })
                .catch((err) => {
                throw new types_1.ApiError('POST Api error', err, query, undefined);
            });
            this.logger.verbose(res);
            if (res.ok) {
                let json = yield res.json().catch((err) => {
                    throw new types_1.ValidateResponseError('Error parsing response into json', res, err);
                });
                if (json.errors) {
                    // graphql error, not http error
                    throw new types_1.GqlApiError('GraphQL Api Error', json.errors, query);
                }
                return json;
            }
            throw new types_1.ApiError('POST Api Response not ok', res, query, res.status);
        });
    }
    _parseRangeQueryResponse(edges) {
        let output = new Array();
        // if input is [], returns []
        for (let elem of edges) {
            try {
                // Try to parse elem and push to output
                const data = elem.node.asset;
                let asset = {
                    assetContractAddress: data.assetContract.account.address,
                    tokenId: parseInt(data.tokenId),
                    name: data.name
                };
                const assetOwner = data.assetOwners.edges;
                if (assetOwner.length !== 0) {
                    asset.owner = assetOwner[0].node.owner.user ? assetOwner[0].node.owner.user.username : undefined;
                    asset.ownerContractAddress = assetOwner[0].node.owner.address;
                }
                const lastSaleData = data.assetEventData.lastSale;
                if (lastSaleData) {
                    let lastSale = {
                        symbol: lastSaleData.unitPriceQuantity.asset.symbol,
                        quantity: parseInt(lastSaleData.unitPriceQuantity.quantity) / (Math.pow(10, lastSaleData.unitPriceQuantity.asset.decimals)),
                        usdSpotPrice: lastSaleData.unitPriceQuantity.asset.usdSpotPrice
                    };
                    asset.lastSale = lastSale;
                }
                // Range query cannot obtain bestBid and bestAsk bidder names!
                const bestBidData = data.orderData.bestBid;
                if (bestBidData) {
                    let bestBid = {
                        orderType: bestBidData.orderType,
                        symbol: bestBidData.paymentAssetQuantity.asset.symbol,
                        quantity: parseInt(bestBidData.paymentAssetQuantity.quantity) / (Math.pow(10, bestBidData.paymentAssetQuantity.asset.decimals)),
                        usdSpotPrice: bestBidData.paymentAssetQuantity.asset.usdSpotPrice,
                    };
                    asset.bestBid = bestBid;
                }
                const bestAskData = data.orderData.bestAsk;
                if (bestAskData) {
                    let bestAsk = {
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
                this.logger.warn(`Error parsing element in range query response`, { elem: elem });
                this.logger.warn(err);
                continue;
            }
        }
        return output;
    }
    _parseSingleAssetResponse(data) {
        var _a, _b, _c, _d;
        let asset;
        try {
            asset = {
                assetContractAddress: data.archetype.asset.assetContract.account.address,
                tokenId: parseInt(data.archetype.asset.tokenId),
                name: data.archetype.asset.name
            };
            let traitListData = (_d = (_c = (_b = (_a = data === null || data === void 0 ? void 0 : data.archetype) === null || _a === void 0 ? void 0 : _a.asset) === null || _b === void 0 ? void 0 : _b.traits) === null || _c === void 0 ? void 0 : _c.edges) !== null && _d !== void 0 ? _d : [];
            let traitList = new Array();
            for (let trait of traitListData) {
                const node = trait.node;
                const value = node.value || node.intValue || node.floatValue || node.dateValue;
                traitList.push({
                    traitType: node.traitType,
                    value: value
                });
            }
            if (traitList.length > 0)
                asset.traits = traitList;
            const owner = data.archetype.asset.assetOwners.edges;
            if (owner.length !== 0) {
                asset.owner = owner[0].node.owner.user ? owner[0].node.owner.user.username : undefined;
                asset.ownerContractAddress = owner[0].node.owner.address;
            }
            const lastSaleData = data.archetype.asset.assetEventData.lastSale;
            if (lastSaleData) {
                const lastSale = {
                    symbol: lastSaleData.unitPriceQuantity.asset.symbol,
                    quantity: parseInt(lastSaleData.unitPriceQuantity.quantity) / (Math.pow(10, lastSaleData.unitPriceQuantity.asset.decimals)),
                    usdSpotPrice: lastSaleData.unitPriceQuantity.asset.usdSpotPrice
                };
                asset.lastSale = lastSale;
            }
            const bestBidData = data.tradeSummary.bestBid;
            if (bestBidData) {
                const bestBid = {
                    orderType: bestBidData.orderType,
                    symbol: bestBidData.makerAssetBundle.assetQuantities.edges[0].node.asset.symbol,
                    quantity: parseInt(bestBidData.makerAssetBundle.assetQuantities.edges[0].node.quantity) / (Math.pow(10, bestBidData.makerAssetBundle.assetQuantities.edges[0].node.asset.decimals)),
                    usdSpotPrice: bestBidData.makerAssetBundle.assetQuantities.edges[0].node.asset.usdSpotPrice,
                    username: bestBidData.maker.user ? bestBidData.maker.user.username : undefined,
                    userContractAddress: bestBidData.maker.address
                };
                asset.bestBid = bestBid;
            }
            const bestAskData = data.tradeSummary.bestAsk;
            if (bestAskData) {
                let bestAsk = {
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
                    let closedAt = `${bestAskData.closedAt}+00:00`;
                    let openedAt = `${bestAskData.openedAt}+00:00`;
                    let auctionDuration = Date.parse(closedAt) - Date.parse(openedAt);
                    let remainingDuration = Date.parse(closedAt) - Date.now();
                    let quantity = parseInt(bestAskData.takerAssetBundle.assetQuantities.edges[0].node.quantity);
                    let difference = quantity - parseInt(bestAskData.dutchAuctionFinalPrice);
                    let currentPrice = parseInt(bestAskData.dutchAuctionFinalPrice) + (difference * (remainingDuration / auctionDuration));
                    bestAsk.quantity = currentPrice / (Math.pow(10, bestAskData.takerAssetBundle.assetQuantities.edges[0].node.asset.decimals));
                }
                asset.bestAsk = bestAsk;
            }
            return asset;
        }
        catch (err) {
            throw new types_1.ValidateResponseError('Error parsing singleAssetResponse from json', data, err);
        }
    }
    _parseRecentBidsResponse(edges) {
        let output = new Array();
        for (let edge of edges) {
            try {
                const node = edge.node;
                let asset = {
                    assetContractAddress: node.assetQuantity.asset.assetContract.account.address,
                    tokenId: parseInt(node.assetQuantity.asset.tokenId),
                    name: node.assetQuantity.asset.name
                }; // unable to get owner and ownercontractaddress right now...
                let bestBid = {
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
                this.logger.warn(`Error parsing recent bid edge!`, { data: edge });
            }
        }
        if (edges.length !== output.length) {
            this.logger.warn(`_parseRecentBids: num parsed != num returned by api!`, { response: edges });
        }
        return output;
    }
    fetchLatestMinted() {
        var _a, _b, _c, _d;
        return __awaiter(this, void 0, void 0, function* () {
            let query = new types_1.AssetSearchQuery(this.collection);
            query.variables.count = 1;
            let res = yield this._postApi(query); // can throw ValidateResponseError or ApiError
            let edges = (_d = (_c = (_b = (_a = res === null || res === void 0 ? void 0 : res.data) === null || _a === void 0 ? void 0 : _a.query) === null || _b === void 0 ? void 0 : _b.search) === null || _c === void 0 ? void 0 : _c.edges) !== null && _d !== void 0 ? _d : [];
            let output = this._parseRangeQueryResponse(edges)[0]; // this shouldn't throw any errors but logger.warns any parse errors
            return output;
        });
    }
    fetchSymbolUsdPrice(symbol) {
        var _a, _b, _c, _d;
        return __awaiter(this, void 0, void 0, function* () {
            let query = new types_1.SymbolPriceQuery(symbol);
            let res = yield this._postApi(query); // can throw ValidateResponseError or ApiError
            let usdSpotPrice = (_d = (_c = (_b = (_a = res === null || res === void 0 ? void 0 : res.data) === null || _a === void 0 ? void 0 : _a.paymentAsset) === null || _b === void 0 ? void 0 : _b.asset) === null || _c === void 0 ? void 0 : _c.usdSpotPrice) !== null && _d !== void 0 ? _d : null;
            if (usdSpotPrice)
                return usdSpotPrice;
            // if null then something went wrong
            this.logger.warn(`Error in fetchSymbolUsdPrice for ${symbol}`, { response: res });
            throw new types_1.ValidateResponseError(`Error fetching usdSpotSprice for ${symbol}`, res, query);
        });
    }
    fetchSingleAsset(id) {
        var _a;
        return __awaiter(this, void 0, void 0, function* () {
            let query = new types_1.ItemQuery(this.nftContractAddress, id);
            let res = yield this._postApi(query); // can throw ValidateResponseError or ApiError
            let data = (_a = res === null || res === void 0 ? void 0 : res.data) !== null && _a !== void 0 ? _a : undefined;
            if (data == null) {
                throw new types_1.ValidateResponseError(`Malformed response in fetchSingleAsset id ${id}`, res, query);
            }
            const parsed = this._parseSingleAssetResponse(data); // can throw a ValidateResponseError
            return parsed;
        });
    }
    fetchRecentBids() {
        var _a, _b, _c, _d, _e, _f;
        return __awaiter(this, void 0, void 0, function* () {
            let query = new types_1.EventHistoryPollQuery(this.collection, this.lastBidPollTimestamp ? this.lastBidPollTimestamp : undefined);
            let res = yield this._postApi(query); // can throw ValidateResponseError or ApiError
            let edges = (_c = (_b = (_a = res === null || res === void 0 ? void 0 : res.data) === null || _a === void 0 ? void 0 : _a.assetEvents) === null || _b === void 0 ? void 0 : _b.edges) !== null && _c !== void 0 ? _c : undefined;
            if (edges == null) {
                throw new types_1.ValidateResponseError(`Malformed response in fetchRecentBids`, res, query);
            }
            if (edges.length >= 1) {
                this.lastBidPollTimestamp = (_f = (_e = (_d = edges[0]) === null || _d === void 0 ? void 0 : _d.node) === null || _e === void 0 ? void 0 : _e.eventTimestamp) !== null && _f !== void 0 ? _f : (() => {
                    throw new types_1.ValidateResponseError(`Malformed timestamp in response`, res, query);
                })();
            }
            else {
                if (this.lastBidPollTimestamp == null)
                    this.lastBidPollTimestamp = (new Date(Date.now() - 11 * 1000)).toISOString();
            }
            return this._parseRecentBidsResponse(edges); // this shouldn't throw any errors but logger.warns any parse errors
        });
    }
}
exports.OpenSeaLib = OpenSeaLib;
