const fetch = require('node-fetch')
const fs = require('fs/promises')
const { winston } = require('../../lib/logger')
const logger = winston.loggers.get('default')
const {OpenSeaLib} = require('../opensealib')

class query {
    id = "AssetSearchQuery"
    query = ""
    variables = {
        collections: ['waifusion'],
        count: 100,
        resultModel: 'ASSETS',
        cursor: null,
        sortBy: 'BIRTH_DATE',
        numericTraits: []
    }
}

const opensealib = new OpenSeaLib('0x2216d47494E516d8206B70FCa8585820eD3C4946', 'waifusion')

async function main() {
    let test_query = new query()
    test_query.query = await fs.readFile('./CustomAssetSearch2.gql', 'utf8')

    // let res = await fetch('https://api.opensea.io/graphql/', {
    //     method: 'post',
    //     body: JSON.stringify(test_query),
    //     headers: {
    //         'Content-Type': 'application/json',
    //         'X-API-KEY': '0106d29713754b448f4513d7a66d0875'
    //     }
    // })
    // .then(res => res.json())
    // .catch(err => console.error(err))

    let res = await opensealib._fetch_all_from_query(test_query)
    logger.info(res)
}

main()