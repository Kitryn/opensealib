const fs = require('fs')
const path = require('path')

const _assetSearchQueryString = fs.readFileSync(path.resolve(__dirname, '../constants/CustomAssetSearch.gql'), 'utf8')
const _itemQueryString = fs.readFileSync(path.resolve(__dirname, '../constants/CustomItemQuery.gql'), 'utf8')


class Query {
    id = 'itemQuery'
    query = ''
    variables = {}

    init (query) {
        this.query = query
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

    // collections: 'hashmasks', 'waifusion'
    init (collection, start, end) {
        super.init(_assetSearchQueryString)
        this.variables.collections[0] = collection
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

    init (address, id) {
        super.init(_itemQueryString)
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
