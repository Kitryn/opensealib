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
exports.Web3Interface = void 0;
var web3_1 = __importDefault(require("web3"));
var assert_1 = __importDefault(require("assert"));
var web3_provider_engine_1 = __importDefault(require("web3-provider-engine"));
var p_queue_1 = __importDefault(require("p-queue"));
var patchedsubproviders_1 = require("patchedsubproviders");
var types_1 = require("./types");
var CONCURRENCY = 10;
var Web3Interface = /** @class */ (function () {
    function Web3Interface(infuraApiKeys) {
        var infuraUrls = infuraApiKeys.map(function (key) {
            return "https://mainnet.infura.io/v3/" + key;
        });
        var infuraMultiRpcSubprovider = new patchedsubproviders_1.MultiRPCSubprovider(infuraUrls);
        var providerEngine = new web3_provider_engine_1.default();
        providerEngine.addProvider(infuraMultiRpcSubprovider);
        providerEngine.start();
        this.web3 = new web3_1.default(providerEngine);
        this.hashmasks = {
            CONTRACT_ABI: require('./ABI/hashmasks_ABI.json'),
            CONTRACT_ADDRESS: types_1.ContractAddress.hashmasks,
            COLLECTION_SLUG: types_1.CollectionSlug.hashmasks
        };
        this.ganV2 = {
            CONTRACT_ABI: require('./ABI/gan_v2_ABI.json'),
            CONTRACT_ADDRESS: types_1.ContractAddress.gan_v2,
            COLLECTION_SLUG: types_1.CollectionSlug.gan_v2
        };
        this.waifu = {
            CONTRACT_ABI: require('./ABI/waifu_ABI.json'),
            CONTRACT_ADDRESS: types_1.ContractAddress.waifusion,
            COLLECTION_SLUG: types_1.CollectionSlug.waifusion
        };
        this.mooncats = {
            CONTRACT_ABI: require('./ABI/mooncats_ABI.json'),
            CONTRACT_ADDRESS: types_1.ContractAddress.mooncats,
            COLLECTION_SLUG: types_1.CollectionSlug.mooncats
        };
        this.chubbies = {
            CONTRACT_ABI: require('./ABI/chubbies_ABI.json'),
            CONTRACT_ADDRESS: types_1.ContractAddress.chubbies,
            COLLECTION_SLUG: types_1.CollectionSlug.chubbies
        };
        this.wethInfo = {
            CONTRACT_ABI: require('./ABI/weth_ABI.json'),
            CONTRACT_ADDRESS: types_1.ContractAddress.weth
        };
        this.maskSushi = {
            CONTRACT_ABI: require('./ABI/masksushiswap_ABI.json'),
            CONTRACT_ADDRESS: types_1.ContractAddress.maskSushi
        };
        this.hashmasksInstance = new this.web3.eth.Contract(this.hashmasks.CONTRACT_ABI, this.hashmasks.CONTRACT_ADDRESS);
        this.ganV2Instance = new this.web3.eth.Contract(this.ganV2.CONTRACT_ABI, this.ganV2.CONTRACT_ADDRESS);
        this.waifuInstance = new this.web3.eth.Contract(this.waifu.CONTRACT_ABI, this.waifu.CONTRACT_ADDRESS);
        this.mooncatsInstance = new this.web3.eth.Contract(this.mooncats.CONTRACT_ABI, this.mooncats.CONTRACT_ADDRESS);
        this.chubbiesInstance = new this.web3.eth.Contract(this.chubbies.CONTRACT_ABI, this.chubbies.CONTRACT_ADDRESS);
        this.wethInstance = new this.web3.eth.Contract(this.wethInfo.CONTRACT_ABI, this.wethInfo.CONTRACT_ADDRESS);
        this.maskSushiInstance = new this.web3.eth.Contract(this.maskSushi.CONTRACT_ABI, this.maskSushi.CONTRACT_ADDRESS);
    }
    Web3Interface.prototype.GetMASKPrice = function () {
        return __awaiter(this, void 0, void 0, function () {
            var reserves, price;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, this.maskSushiInstance.methods.getReserves().call()];
                    case 1:
                        reserves = _a.sent();
                        price = reserves._reserve1 / reserves._reserve0;
                        price = parseFloat(price.toPrecision(5));
                        return [2 /*return*/, price];
                }
            });
        });
    };
    Web3Interface.prototype.GetEthBalance = function (address) {
        return __awaiter(this, void 0, void 0, function () {
            var balance, _a;
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0:
                        _a = parseInt;
                        return [4 /*yield*/, this.web3.eth.getBalance(address)];
                    case 1:
                        balance = _a.apply(void 0, [_b.sent()]) / (Math.pow(10, 18));
                        balance = parseFloat(balance.toPrecision(5));
                        return [2 /*return*/, balance];
                }
            });
        });
    };
    Web3Interface.prototype.GetWEthBalance = function (address) {
        return __awaiter(this, void 0, void 0, function () {
            var balance, _a;
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0:
                        _a = parseInt;
                        return [4 /*yield*/, this.wethInstance.methods.balanceOf(address).call()];
                    case 1:
                        balance = _a.apply(void 0, [_b.sent()]) / (Math.pow(10, 18));
                        balance = parseFloat(balance.toPrecision(5));
                        return [2 /*return*/, balance];
                }
            });
        });
    };
    Web3Interface.prototype.GetTokenIds = function (address, instance) {
        return __awaiter(this, void 0, void 0, function () {
            var numberOwned, _a, output, queue, count, _loop_1, i;
            var _this = this;
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0:
                        _a = parseInt;
                        return [4 /*yield*/, instance.methods.balanceOf(address).call()];
                    case 1:
                        numberOwned = _a.apply(void 0, [_b.sent()]);
                        output = new Array();
                        queue = new p_queue_1.default({ concurrency: CONCURRENCY });
                        count = 0;
                        queue.on('active', function () {
                            count += 1;
                        });
                        _loop_1 = function (i) {
                            (function () { return __awaiter(_this, void 0, void 0, function () {
                                var out;
                                return __generator(this, function (_a) {
                                    switch (_a.label) {
                                        case 0: return [4 /*yield*/, queue.add(function () { return instance.methods.tokenOfOwnerByIndex(address, i).call(); })];
                                        case 1:
                                            out = _a.sent();
                                            output.push(out);
                                            return [2 /*return*/];
                                    }
                                });
                            }); })();
                        };
                        for (i = 0; i < numberOwned; i++) {
                            _loop_1(i);
                        }
                        return [4 /*yield*/, queue.onIdle()]; // all work is done
                    case 2:
                        _b.sent(); // all work is done
                        output = output.map(function (elem) { return parseInt(elem); });
                        assert_1.default(count === output.length);
                        assert_1.default(output.length === numberOwned);
                        return [2 /*return*/, output];
                }
            });
        });
    };
    Web3Interface.prototype.GetHashmaskTokenIds = function (address) {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, this.GetTokenIds(address, this.hashmasksInstance)];
                    case 1: return [2 /*return*/, _a.sent()];
                }
            });
        });
    };
    Web3Interface.prototype.GetMooncatTokenIds = function (address) {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, this.GetTokenIds(address, this.mooncatsInstance)];
                    case 1: return [2 /*return*/, _a.sent()];
                }
            });
        });
    };
    Web3Interface.prototype.GetGanV2TokenIds = function (address) {
        return __awaiter(this, void 0, void 0, function () {
            var output;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, this.ganV2Instance.methods.tokensOfOwner(address).call()];
                    case 1:
                        output = _a.sent();
                        output = output.map(function (elem) { return parseInt(elem); });
                        return [2 /*return*/, output];
                }
            });
        });
    };
    Web3Interface.prototype.GetChubbiesTokenIds = function (address) {
        return __awaiter(this, void 0, void 0, function () {
            var output;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, this.chubbiesInstance.methods.tokensOfOwner(address).call()];
                    case 1:
                        output = _a.sent();
                        output = output.map(function (elem) { return parseInt(elem); });
                        return [2 /*return*/, output];
                }
            });
        });
    };
    Web3Interface.prototype.GetWaifuTokenIds = function (address) {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, this.GetTokenIds(address, this.waifuInstance)];
                    case 1: return [2 /*return*/, _a.sent()];
                }
            });
        });
    };
    Web3Interface.prototype.GetAllTokenIds = function (address) {
        return __awaiter(this, void 0, void 0, function () {
            var promises, output;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        promises = [];
                        promises.push(this.GetHashmaskTokenIds(address).then(function (idList) {
                            var bal = {
                                contractAddress: types_1.ContractAddress.hashmasks,
                                collectionSlug: types_1.CollectionSlug.hashmasks,
                                tokenIdList: idList
                            };
                            return bal;
                        }));
                        promises.push(this.GetGanV2TokenIds(address).then(function (idList) {
                            var bal = {
                                contractAddress: types_1.ContractAddress.gan_v2,
                                collectionSlug: types_1.CollectionSlug.gan_v2,
                                tokenIdList: idList
                            };
                            return bal;
                        }));
                        promises.push(this.GetWaifuTokenIds(address).then(function (idList) {
                            var bal = {
                                contractAddress: types_1.ContractAddress.waifusion,
                                collectionSlug: types_1.CollectionSlug.waifusion,
                                tokenIdList: idList
                            };
                            return bal;
                        }));
                        promises.push(this.GetMooncatTokenIds(address).then(function (idList) {
                            var bal = {
                                contractAddress: types_1.ContractAddress.mooncats,
                                collectionSlug: types_1.CollectionSlug.mooncats,
                                tokenIdList: idList
                            };
                            return bal;
                        }));
                        promises.push(this.GetChubbiesTokenIds(address).then(function (idList) {
                            var bal = {
                                contractAddress: types_1.ContractAddress.chubbies,
                                collectionSlug: types_1.CollectionSlug.chubbies,
                                tokenIdList: idList
                            };
                            return bal;
                        }));
                        return [4 /*yield*/, Promise.all(promises)];
                    case 1:
                        output = _a.sent();
                        output = output.filter(function (bal) {
                            if (bal.tokenIdList.length === 0)
                                return false;
                            return true;
                        });
                        return [2 /*return*/, output];
                }
            });
        });
    };
    return Web3Interface;
}());
exports.Web3Interface = Web3Interface;
