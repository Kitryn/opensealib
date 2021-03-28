"use strict";
var __assign = (this && this.__assign) || function () {
    __assign = Object.assign || function(t) {
        for (var s, i = 1, n = arguments.length; i < n; i++) {
            s = arguments[i];
            for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p))
                t[p] = s[p];
        }
        return t;
    };
    return __assign.apply(this, arguments);
};
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
exports.generateCsv = void 0;
var winston = require('winston');
var parentLogger = winston.loggers.get('default');
var logger = parentLogger.child({ module: 'csvGenerator' });
var types_1 = require("./types");
var opensealib_1 = require("./opensealib");
var p_queue_1 = __importDefault(require("p-queue"));
var jsonexport_1 = __importDefault(require("jsonexport"));
var CONCURRENCY = 400;
function flattenTraits(asset) {
    var output = __assign({}, asset);
    if (asset.traits) {
        for (var _i = 0, _a = asset.traits; _i < _a.length; _i++) {
            var trait = _a[_i];
            output[trait.traitType] = trait.value;
        }
    }
    delete output.traits;
    return output;
}
function generateCsv(address, collection) {
    return __awaiter(this, void 0, void 0, function () {
        var opensealib, queue, lastMinted, lastTokenId, output, count, _loop_1, i, parsedOutput;
        var _this = this;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    opensealib = new opensealib_1.OpenSeaLib(address, collection);
                    queue = new p_queue_1.default({ concurrency: CONCURRENCY });
                    return [4 /*yield*/, opensealib.fetchLatestMinted()]; // can throw ValidateResponseError or ApiError -- not handled to let rethrow
                case 1:
                    lastMinted = _a.sent() // can throw ValidateResponseError or ApiError -- not handled to let rethrow
                    ;
                    lastTokenId = lastMinted.tokenId // inclusive
                    ;
                    output = new Array();
                    count = 0;
                    queue.on('active', function () {
                        count += 1;
                        if (count % 100 === 0)
                            logger.info("Item " + count + ". Size " + queue.size + " Pending " + queue.pending);
                    });
                    _loop_1 = function (i) {
                        (function () { return __awaiter(_this, void 0, void 0, function () {
                            var asset, err_1;
                            return __generator(this, function (_a) {
                                switch (_a.label) {
                                    case 0:
                                        _a.trys.push([0, 2, , 3]);
                                        return [4 /*yield*/, queue.add(function () { return opensealib.fetchSingleAsset(i); })];
                                    case 1:
                                        asset = _a.sent();
                                        if (asset)
                                            output.push(asset);
                                        return [3 /*break*/, 3];
                                    case 2:
                                        err_1 = _a.sent();
                                        if (err_1 instanceof types_1.ApiError) {
                                            // should be safe to retry  TODO
                                            logger.error(err_1);
                                        }
                                        else if (err_1 instanceof types_1.GqlApiError) {
                                            // Not safe to retry
                                            logger.error(err_1);
                                        }
                                        else if (err_1 instanceof types_1.ValidateResponseError) {
                                            // May or may not be safe to retry
                                            logger.error(err_1);
                                        }
                                        else {
                                            throw err_1;
                                        }
                                        return [3 /*break*/, 3];
                                    case 3: return [2 /*return*/];
                                }
                            });
                        }); })();
                    };
                    for (i = 0; i <= lastTokenId; i++) {
                        _loop_1(i);
                    }
                    return [4 /*yield*/, queue.onIdle()]; // all work is done
                case 2:
                    _a.sent(); // all work is done
                    logger.info(output.length + " / " + (lastMinted.tokenId + 1) + " fetched");
                    parsedOutput = [];
                    parsedOutput = output.map(function (elem) {
                        var out = flattenTraits(elem);
                        return out;
                    });
                    return [4 /*yield*/, jsonexport_1.default(parsedOutput)];
                case 3: return [2 /*return*/, _a.sent()];
            }
        });
    });
}
exports.generateCsv = generateCsv;
