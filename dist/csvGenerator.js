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
exports.generateCsv = void 0;
const winston = require('winston');
const parentLogger = winston.loggers.get('default');
const logger = parentLogger.child({ module: 'csvGenerator' });
const types_1 = require("./types");
const opensealib_1 = require("./opensealib");
const p_queue_1 = __importDefault(require("p-queue"));
const jsonexport_1 = __importDefault(require("jsonexport"));
const CONCURRENCY = 400;
function flattenTraits(asset) {
    let output = Object.assign({}, asset);
    if (asset.traits) {
        for (let trait of asset.traits) {
            output[trait.traitType] = trait.value;
        }
    }
    delete output.traits;
    return output;
}
function generateCsv(address, collection) {
    return __awaiter(this, void 0, void 0, function* () {
        const opensealib = new opensealib_1.OpenSeaLib(address, collection);
        const queue = new p_queue_1.default({ concurrency: CONCURRENCY });
        let lastMinted = yield opensealib.fetchLatestMinted(); // can throw ValidateResponseError or ApiError -- not handled to let rethrow
        const lastTokenId = lastMinted.tokenId; // inclusive
        const output = new Array();
        let count = 0;
        queue.on('active', () => {
            count += 1;
            if (count % 100 === 0)
                logger.info(`Item ${count}. Size ${queue.size} Pending ${queue.pending}`);
        });
        for (let i = 0; i <= lastTokenId; i++) {
            (() => __awaiter(this, void 0, void 0, function* () {
                try {
                    let asset = yield queue.add(() => opensealib.fetchSingleAsset(i));
                    if (asset)
                        output.push(asset);
                }
                catch (err) {
                    if (err instanceof types_1.ApiError) {
                        // should be safe to retry  TODO
                        logger.error(err);
                    }
                    else if (err instanceof types_1.GqlApiError) {
                        // Not safe to retry
                        logger.error(err);
                    }
                    else if (err instanceof types_1.ValidateResponseError) {
                        // May or may not be safe to retry
                        logger.error(err);
                    }
                    else {
                        throw err;
                    }
                }
            }))();
        }
        yield queue.onIdle(); // all work is done
        logger.info(`${output.length} / ${lastMinted.tokenId + 1} fetched`);
        let parsedOutput = [];
        parsedOutput = output.map((elem) => {
            let out = flattenTraits(elem);
            return out;
        });
        return yield jsonexport_1.default(parsedOutput);
    });
}
exports.generateCsv = generateCsv;
