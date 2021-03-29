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
exports.Web3Interface = void 0;
const web3_1 = __importDefault(require("web3"));
const assert_1 = __importDefault(require("assert"));
const web3_provider_engine_1 = __importDefault(require("web3-provider-engine"));
const p_queue_1 = __importDefault(require("p-queue"));
const patchedsubproviders_1 = require("patchedsubproviders");
const types_1 = require("./types");
const CONCURRENCY = 10;
class Web3Interface {
    constructor(infuraApiKeys) {
        const infuraUrls = infuraApiKeys.map((key) => {
            return `https://mainnet.infura.io/v3/${key}`;
        });
        const infuraMultiRpcSubprovider = new patchedsubproviders_1.MultiRPCSubprovider(infuraUrls);
        const providerEngine = new web3_provider_engine_1.default();
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
    GetMASKPrice() {
        return __awaiter(this, void 0, void 0, function* () {
            const reserves = yield this.maskSushiInstance.methods.getReserves().call();
            let price = reserves._reserve1 / reserves._reserve0;
            price = parseFloat(price.toPrecision(5));
            return price;
        });
    }
    GetEthBalance(address) {
        return __awaiter(this, void 0, void 0, function* () {
            let balance = parseInt(yield this.web3.eth.getBalance(address)) / (Math.pow(10, 18));
            balance = parseFloat(balance.toPrecision(5));
            return balance;
        });
    }
    GetWEthBalance(address) {
        return __awaiter(this, void 0, void 0, function* () {
            let balance = parseInt(yield this.wethInstance.methods.balanceOf(address).call()) / (Math.pow(10, 18));
            balance = parseFloat(balance.toPrecision(5));
            return balance;
        });
    }
    GetTokenIds(address, instance) {
        return __awaiter(this, void 0, void 0, function* () {
            const numberOwned = parseInt(yield instance.methods.balanceOf(address).call());
            let output = new Array();
            const queue = new p_queue_1.default({ concurrency: CONCURRENCY });
            let count = 0;
            queue.on('active', () => {
                count += 1;
            });
            for (let i = 0; i < numberOwned; i++) {
                (() => __awaiter(this, void 0, void 0, function* () {
                    let out = yield queue.add(() => instance.methods.tokenOfOwnerByIndex(address, i).call());
                    output.push(out);
                }))();
            }
            yield queue.onIdle(); // all work is done
            output = output.map((elem) => { return parseInt(elem); });
            assert_1.default(count === output.length);
            assert_1.default(output.length === numberOwned);
            return output;
        });
    }
    GetHashmaskTokenIds(address) {
        return __awaiter(this, void 0, void 0, function* () {
            return yield this.GetTokenIds(address, this.hashmasksInstance);
        });
    }
    GetMooncatTokenIds(address) {
        return __awaiter(this, void 0, void 0, function* () {
            return yield this.GetTokenIds(address, this.mooncatsInstance);
        });
    }
    GetGanV2TokenIds(address) {
        return __awaiter(this, void 0, void 0, function* () {
            // untested!
            let output = yield this.ganV2Instance.methods.tokensOfOwner(address).call();
            output = output.map((elem) => { return parseInt(elem); });
            return output;
        });
    }
    GetChubbiesTokenIds(address) {
        return __awaiter(this, void 0, void 0, function* () {
            // untested!
            let output = yield this.chubbiesInstance.methods.tokensOfOwner(address).call();
            output = output.map((elem) => { return parseInt(elem); });
            return output;
        });
    }
    GetWaifuTokenIds(address) {
        return __awaiter(this, void 0, void 0, function* () {
            return yield this.GetTokenIds(address, this.waifuInstance);
        });
    }
    GetAllTokenIds(address) {
        return __awaiter(this, void 0, void 0, function* () {
            let promises = [];
            promises.push(this.GetHashmaskTokenIds(address).then((idList) => {
                let bal = {
                    contractAddress: types_1.ContractAddress.hashmasks,
                    collectionSlug: types_1.CollectionSlug.hashmasks,
                    tokenIdList: idList
                };
                return bal;
            }));
            promises.push(this.GetGanV2TokenIds(address).then((idList) => {
                let bal = {
                    contractAddress: types_1.ContractAddress.gan_v2,
                    collectionSlug: types_1.CollectionSlug.gan_v2,
                    tokenIdList: idList
                };
                return bal;
            }));
            promises.push(this.GetWaifuTokenIds(address).then((idList) => {
                let bal = {
                    contractAddress: types_1.ContractAddress.waifusion,
                    collectionSlug: types_1.CollectionSlug.waifusion,
                    tokenIdList: idList
                };
                return bal;
            }));
            promises.push(this.GetMooncatTokenIds(address).then((idList) => {
                let bal = {
                    contractAddress: types_1.ContractAddress.mooncats,
                    collectionSlug: types_1.CollectionSlug.mooncats,
                    tokenIdList: idList
                };
                return bal;
            }));
            promises.push(this.GetChubbiesTokenIds(address).then((idList) => {
                let bal = {
                    contractAddress: types_1.ContractAddress.chubbies,
                    collectionSlug: types_1.CollectionSlug.chubbies,
                    tokenIdList: idList
                };
                return bal;
            }));
            let output = yield Promise.all(promises);
            output = output.filter((bal) => {
                if (bal.tokenIdList.length === 0)
                    return false;
                return true;
            });
            return output;
        });
    }
}
exports.Web3Interface = Web3Interface;
