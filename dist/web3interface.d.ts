import Web3 from 'web3';
import { Contract } from 'web3-eth-contract';
import { ContractAddress, CollectionSlug } from './types';
interface contractInfo {
    CONTRACT_ABI: any;
    CONTRACT_ADDRESS: ContractAddress;
    COLLECTION_SLUG?: CollectionSlug;
}
export interface NFTBalance {
    contractAddress: ContractAddress;
    collectionSlug: CollectionSlug;
    tokenIdList: Array<number>;
}
export declare class Web3Interface {
    web3: Web3;
    hashmasks: contractInfo;
    ganV2: contractInfo;
    waifu: contractInfo;
    mooncats: contractInfo;
    chubbies: contractInfo;
    wethInfo: contractInfo;
    maskSushi: contractInfo;
    crypteriors: contractInfo;
    foxpunkjrs: contractInfo;
    hashmasksInstance: Contract;
    ganV2Instance: Contract;
    waifuInstance: Contract;
    mooncatsInstance: Contract;
    chubbiesInstance: Contract;
    wethInstance: Contract;
    maskSushiInstance: Contract;
    crypteriorsInstance: Contract;
    foxpunkjrsInstance: Contract;
    constructor(infuraApiKeys: Array<string>);
    GetMASKPrice(): Promise<number>;
    GetEthBalance(address: string): Promise<number>;
    GetWEthBalance(address: string): Promise<number>;
    private GetTokenIds;
    GetFoxpunkJrsTokenIds(address: string): Promise<Array<number>>;
    GetHashmaskTokenIds(address: string): Promise<Array<number>>;
    GetMooncatTokenIds(address: string): Promise<Array<number>>;
    GetGanV2TokenIds(address: string): Promise<Array<number>>;
    GetChubbiesTokenIds(address: string): Promise<Array<number>>;
    GetWaifuTokenIds(address: string): Promise<Array<number>>;
    GetAllTokenIds(address: string): Promise<Array<NFTBalance>>;
}
export {};
