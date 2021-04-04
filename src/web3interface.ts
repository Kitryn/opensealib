import Web3 from 'web3'
import { Contract } from 'web3-eth-contract'
import assert from 'assert'
import Web3ProviderEngine from 'web3-provider-engine'
import PQueue from 'p-queue'
import { MultiRPCSubprovider } from 'patchedsubproviders'
import { ContractAddress, CollectionSlug } from './types'

const CONCURRENCY = 10

interface contractInfo {
    CONTRACT_ABI: any
    CONTRACT_ADDRESS: ContractAddress
    COLLECTION_SLUG?: CollectionSlug
}

export interface NFTBalance {
    contractAddress: ContractAddress
    collectionSlug: CollectionSlug
    tokenIdList: Array<number>
}

export class Web3Interface {
    web3: Web3
    hashmasks: contractInfo
    ganV2: contractInfo
    waifu: contractInfo
    mooncats: contractInfo
    chubbies: contractInfo
    wethInfo: contractInfo
    maskSushi: contractInfo
    crypteriors: contractInfo
    hashmasksInstance: Contract
    ganV2Instance: Contract
    waifuInstance: Contract
    mooncatsInstance: Contract
    chubbiesInstance: Contract
    wethInstance: Contract
    maskSushiInstance: Contract
    crypteriorsInstance: Contract
    
    constructor(infuraApiKeys: Array<string>) {
        const infuraUrls = infuraApiKeys.map((key: string) => {
            return `https://mainnet.infura.io/v3/${key}`
        })
        const infuraMultiRpcSubprovider = new MultiRPCSubprovider(infuraUrls)
        const providerEngine = new Web3ProviderEngine()
        providerEngine.addProvider(infuraMultiRpcSubprovider)
        providerEngine.start()
        this.web3 = new Web3(providerEngine)

        this.hashmasks = {
            CONTRACT_ABI: require('./ABI/hashmasks_ABI.json'),
            CONTRACT_ADDRESS: ContractAddress.hashmasks,
            COLLECTION_SLUG: CollectionSlug.hashmasks
        }
        this.ganV2 = {
            CONTRACT_ABI: require('./ABI/gan_v2_ABI.json'),
            CONTRACT_ADDRESS: ContractAddress.gan_v2,
            COLLECTION_SLUG: CollectionSlug.gan_v2
        }
        this.waifu = {
            CONTRACT_ABI: require('./ABI/waifu_ABI.json'),
            CONTRACT_ADDRESS: ContractAddress.waifusion,
            COLLECTION_SLUG: CollectionSlug.waifusion
        }
        this.mooncats = {
            CONTRACT_ABI: require('./ABI/mooncats_ABI.json'),
            CONTRACT_ADDRESS: ContractAddress.mooncats,
            COLLECTION_SLUG: CollectionSlug.mooncats
        }
        this.chubbies = {
            CONTRACT_ABI: require('./ABI/chubbies_ABI.json'),
            CONTRACT_ADDRESS: ContractAddress.chubbies,
            COLLECTION_SLUG: CollectionSlug.chubbies
        }
        this.wethInfo ={
            CONTRACT_ABI: require('./ABI/weth_ABI.json'),
            CONTRACT_ADDRESS: ContractAddress.weth
        }
        this.maskSushi = {
            CONTRACT_ABI: require('./ABI/masksushiswap_ABI.json'),
            CONTRACT_ADDRESS: ContractAddress.maskSushi
        }
        this.crypteriors = {
            CONTRACT_ABI: require('./ABI/crypteriors_ABI.json'),
            CONTRACT_ADDRESS: ContractAddress.crypteriors
        }

        this.hashmasksInstance = new this.web3.eth.Contract(this.hashmasks.CONTRACT_ABI, this.hashmasks.CONTRACT_ADDRESS)
        this.ganV2Instance = new this.web3.eth.Contract(this.ganV2.CONTRACT_ABI, this.ganV2.CONTRACT_ADDRESS)
        this.waifuInstance = new this.web3.eth.Contract(this.waifu.CONTRACT_ABI, this.waifu.CONTRACT_ADDRESS)
        this.mooncatsInstance = new this.web3.eth.Contract(this.mooncats.CONTRACT_ABI, this.mooncats.CONTRACT_ADDRESS)
        this.chubbiesInstance = new this.web3.eth.Contract(this.chubbies.CONTRACT_ABI, this.chubbies.CONTRACT_ADDRESS)
        this.wethInstance = new this.web3.eth.Contract(this.wethInfo.CONTRACT_ABI, this.wethInfo.CONTRACT_ADDRESS)
        this.maskSushiInstance = new this.web3.eth.Contract(this.maskSushi.CONTRACT_ABI, this.maskSushi.CONTRACT_ADDRESS)
        this.crypteriorsInstance = new this.web3.eth.Contract(this.crypteriors.CONTRACT_ABI, this.crypteriors.CONTRACT_ADDRESS)
    }

    async GetMASKPrice(): Promise<number> {
        const reserves = await this.maskSushiInstance.methods.getReserves().call()
        let price = reserves._reserve1 / reserves._reserve0
        price = parseFloat(price.toPrecision(5))
        return price
    }

    async GetEthBalance(address: string): Promise<number> {
        let balance = parseInt(await this.web3.eth.getBalance(address)) / (10 ** 18)
        balance = parseFloat(balance.toPrecision(5))
        return balance
    }

    async GetWEthBalance(address: string): Promise<number> {
        let balance = parseInt(await this.wethInstance.methods.balanceOf(address).call()) / (10 ** 18)
        balance = parseFloat(balance.toPrecision(5))
        return balance
    }

    private async GetTokenIds(address: string, instance: Contract): Promise<Array<number>> {
        const numberOwned = parseInt(await instance.methods.balanceOf(address).call())
        let output = new Array<number>()
        
        const queue = new PQueue({concurrency: CONCURRENCY})
        let count = 0
        queue.on('active', () => {
            count += 1
        })

        for (let i = 0; i < numberOwned; i++) {
            (async () => {
                let out = await queue.add(() => instance.methods.tokenOfOwnerByIndex(address, i).call())
                output.push(out)
            })()
        }

        await queue.onIdle()  // all work is done
        output = output.map((elem: any) => {return parseInt(elem)})
        assert(count === output.length)
        assert(output.length === numberOwned)
        return output
    }

    async GetHashmaskTokenIds(address: string): Promise<Array<number>> {
        return await this.GetTokenIds(address, this.hashmasksInstance)
    }

    async GetMooncatTokenIds(address: string): Promise<Array<number>> {
        return await this.GetTokenIds(address, this.mooncatsInstance)
    }

    async GetGanV2TokenIds(address: string): Promise<Array<number>> {
        // untested!
        let output: Array<any> = await this.ganV2Instance.methods.tokensOfOwner(address).call()
        output = output.map((elem: any) => {return parseInt(elem)})
        return output
    }

    async GetChubbiesTokenIds(address: string): Promise<Array<number>> {
        // untested!
        let output: Array<any> = await this.chubbiesInstance.methods.tokensOfOwner(address).call()
        output = output.map((elem: any) => {return parseInt(elem)})
        return output
    }

    async GetWaifuTokenIds(address: string): Promise<Array<number>> {
        return await this.GetTokenIds(address, this.waifuInstance)
    }

    async GetAllTokenIds(address: string): Promise<Array<NFTBalance>> {
        let promises: Array<any> = []

        promises.push(this.GetHashmaskTokenIds(address).then((idList: Array<number>) => {
            let bal: NFTBalance = {
                contractAddress: ContractAddress.hashmasks,
                collectionSlug: CollectionSlug.hashmasks,
                tokenIdList: idList
            }
            return bal
        }))
        promises.push(this.GetGanV2TokenIds(address).then((idList: Array<number>) => {
            let bal: NFTBalance = {
                contractAddress: ContractAddress.gan_v2,
                collectionSlug: CollectionSlug.gan_v2,
                tokenIdList: idList
            }
            return bal
        }))
        promises.push(this.GetWaifuTokenIds(address).then((idList: Array<number>) => {
            let bal: NFTBalance = {
                contractAddress: ContractAddress.waifusion,
                collectionSlug: CollectionSlug.waifusion,
                tokenIdList: idList
            }
            return bal
        }))
        promises.push(this.GetMooncatTokenIds(address).then((idList: Array<number>) => {
            let bal: NFTBalance = {
                contractAddress: ContractAddress.mooncats,
                collectionSlug: CollectionSlug.mooncats,
                tokenIdList: idList
            }
            return bal
        }))
        promises.push(this.GetChubbiesTokenIds(address).then((idList: Array<number>) => {
            let bal: NFTBalance = {
                contractAddress: ContractAddress.chubbies,
                collectionSlug: CollectionSlug.chubbies,
                tokenIdList: idList
            }
            return bal
        }))

        let output = await Promise.all(promises)
        output = output.filter((bal: NFTBalance) => {
            if (bal.tokenIdList.length === 0) return false
            return true
        })
        return output
    }
}