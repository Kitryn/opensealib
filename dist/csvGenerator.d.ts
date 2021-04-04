import { ContractAddress, CollectionSlug } from './types';
export declare function generateCsv(address: ContractAddress, collection: CollectionSlug): Promise<string>;
export declare function generateCsvFromUri(infuraApiKeys: any[]): Promise<string>;
