const NUMERIC_TRAITS = [
  {
      "name": "Token ID",
      "ranges": [{
          "max": "10000",
          "min": "0"
      }]
  }
]
const ASSET_STRUCT = {
    tokenId: null,
    owner: null,
    name: null,
    lastSale: {
        symbol: null,
        quantity: null
    },
    bestBid: {
        orderType: null,
        symbol: null,
        quantity: null,
        username: null
    },
    bestAsk: {
        orderType: null,
        symbol: null,
        quantity: null,
        username: null
    }
}
const DECIMALS = 10 ** 18

module.exports = {
    NUMERIC_TRAITS, DECIMALS, ASSET_STRUCT
}