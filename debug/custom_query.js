const fetch = require('node-fetch')
const fs = require('fs/promises')
const { winston } = require('../../lib/logger')
const logger = winston.loggers.get('default')

class query {
    id = "itemQuery"
    query = ""
    variables = {
   
    }
}


async function main() {
    let test_query = new query()
    // test_query.query = await fs.readFile()

    let res = await fetch('https://api.opensea.io/graphql/', {
        method: 'post',
        body: JSON.stringify(test_query),
        headers: {
            'Content-Type': 'application/json',
            'X-API-KEY': '0106d29713754b448f4513d7a66d0875'
        }
    })
    .then(res => res.json())
    .catch(err => console.error(err))

    logger.info(res)
}

main()