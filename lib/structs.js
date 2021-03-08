const fs = require('fs/promises')
const path = require('path')


class Query {
    id = 'itemQuery'
    query = ''
    variables = {}

    async init (query_filepath) {
        this.query = await fs.readFile(query_filepath, 'utf8')
    }
}

class AssetSearchQuery extends Query {
    id = 'AssetSearchQuery'
    variables = {
        collections: ['hashmasks'],
        count: 100,
        resultModel: 'ASSETS',
        cursor: null,
        sortBy: 'BIRTH_DATE',
        numericTraits: [
            {
                name: 'Token ID',
                ranges: [
                    {
                        max: null,
                        min: null
                    }
                ]
            }
        ]
    }

    async init (start, end) {
        await super.init(path.resolve(__dirname, '../constants/CustomAssetSearch.gql'))
        this.variables.numericTraits[0].ranges[0].min = start
        this.variables.numericTraits[0].ranges[0].max = end
    }
}

class ItemQuery extends Query {
    id = 'itemQuery'
    variables = {
        archetype: {
            assetContractAddress: null,
            tokenId: null
        }
    }

    async init (address, id) {
        await super.init(path.resolve(__dirname, '../constants/CustomItemQuery.gql'))
        this.variables.archetype.assetContractAddress = address
        this.variables.archetype.tokenId = id
    }
}

class ASSET_STRUCT {
    assetContractAddress = null
    tokenId = null
    owner = null
    ownerContractAddress = null
    name = null
    lastSale = {
        symbol: null,
        quantity: null
    }
    bestBid = {
        orderType: null,
        symbol: null,
        quantity: null,
        username: null,
        userContractAddress: null
    }
    bestAsk = {
        orderType: null,
        symbol: null,
        quantity: null,
        username: null,
        userContractAddress: null
    }
}

module.exports = {
    ASSET_STRUCT, ItemQuery, AssetSearchQuery
}
