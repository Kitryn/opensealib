import { CollectionSlug, Asset } from './types';
export declare class OpenSeaLib {
    nftContractAddress: string;
    collection: CollectionSlug;
    xApiKey: string;
    private logger;
    private lastBidPollTimestamp?;
    private _defaultHeaders;
    constructor(nftContractAddress: string, collection: CollectionSlug, xApiKey?: string);
    private _postApi;
    private _parseRangeQueryResponse;
    private _parseSingleAssetResponse;
    private _parseRecentBidsResponse;
    fetchLatestMinted(): Promise<Asset>;
    fetchSymbolUsdPrice(symbol: string): Promise<number>;
    fetchSingleAsset(id: number): Promise<Asset>;
    fetchRecentBids(): Promise<Asset[]>;
}
