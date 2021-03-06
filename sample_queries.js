// ---------------------------
// OrdersQuery -- makerArchetype filled -- returns Sell listings
// takerAssetIsPayment is true, makerAssetIsPayment is false
// sortAscending is true, sortBy is TAKER_ASSET_USD_PRICE
// Query:
// {
//     "id": "OrdersQuery",
//     "query": "query OrdersQuery(\n  $cursor: String\n  $count: Int = 10\n  $excludeMaker: IdentityInputType\n  $isExpired: Boolean\n  $isFilled: Boolean\n  $isValid: Boolean\n  $maker: IdentityInputType\n  $makerArchetype: ArchetypeInputType\n  $makerAssetIsPayment: Boolean\n  $takerArchetype: ArchetypeInputType\n  $takerAssetCategories: [CollectionSlug!]\n  $takerAssetCollections: [CollectionSlug!]\n  $takerAssetIsOwnedBy: IdentityInputType\n  $takerAssetIsPayment: Boolean\n  $sortAscending: Boolean\n  $sortBy: OrderSortOption\n  $makerAssetBundle: BundleSlug\n  $takerAssetBundle: BundleSlug\n) {\n  ...Orders_data_2g7x2d\n}\n\nfragment AccountLink_data on AccountType {\n  address\n  chain {\n    identifier\n    id\n  }\n  user {\n    username\n    id\n  }\n  ...ProfileImage_data\n  ...wallet_accountKey\n}\n\nfragment AskPrice_data on OrderV2Type {\n  dutchAuctionFinalPrice\n  openedAt\n  priceFnEndedAt\n  makerAssetBundle {\n    assetQuantities(first: 1) {\n      edges {\n        node {\n          ...quantity_data\n          id\n        }\n      }\n    }\n    id\n  }\n  takerAssetBundle {\n    assetQuantities(first: 1) {\n      edges {\n        node {\n          ...AssetQuantity_data\n          id\n        }\n      }\n    }\n    id\n  }\n}\n\nfragment AssetCell_assetBundle on AssetBundleType {\n  assetQuantities(first: 2) {\n    edges {\n      node {\n        asset {\n          collection {\n            name\n            id\n          }\n          name\n          ...AssetMedia_asset\n          ...asset_url\n          id\n        }\n        relayId\n        id\n      }\n    }\n  }\n  name\n  slug\n}\n\nfragment AssetMedia_asset on AssetType {\n  animationUrl\n  backgroundColor\n  collection {\n    description\n    displayData {\n      cardDisplayStyle\n    }\n    imageUrl\n    hidden\n    name\n    slug\n    id\n  }\n  description\n  name\n  tokenId\n  imageUrl\n}\n\nfragment AssetQuantity_data on AssetQuantityType {\n  asset {\n    ...Price_data\n    id\n  }\n  quantity\n}\n\nfragment Orders_data_2g7x2d on Query {\n  orders(after: $cursor, excludeMaker: $excludeMaker, first: $count, isExpired: $isExpired, isFilled: $isFilled, isValid: $isValid, maker: $maker, makerArchetype: $makerArchetype, makerAssetIsPayment: $makerAssetIsPayment, takerArchetype: $takerArchetype, takerAssetCategories: $takerAssetCategories, takerAssetCollections: $takerAssetCollections, takerAssetIsOwnedBy: $takerAssetIsOwnedBy, takerAssetIsPayment: $takerAssetIsPayment, sortAscending: $sortAscending, sortBy: $sortBy, makerAssetBundle: $makerAssetBundle, takerAssetBundle: $takerAssetBundle) {\n    edges {\n      node {\n        closedAt\n        isFulfillable\n        isValid\n        oldOrder\n        openedAt\n        orderType\n        maker {\n          address\n          ...AccountLink_data\n          ...wallet_accountKey\n          id\n        }\n        makerAsset: makerAssetBundle {\n          assetQuantities(first: 1) {\n            edges {\n              node {\n                asset {\n                  assetContract {\n                    account {\n                      address\n                      chain {\n                        identifier\n                        id\n                      }\n                      id\n                    }\n                    id\n                  }\n                  id\n                }\n                id\n              }\n            }\n          }\n          id\n        }\n        makerAssetBundle {\n          assetQuantities(first: 1) {\n            edges {\n              node {\n                ...AssetQuantity_data\n                ...quantity_data\n                id\n              }\n            }\n          }\n          id\n        }\n        relayId\n        side\n        taker {\n          ...AccountLink_data\n          ...wallet_accountKey\n          id\n          address\n        }\n        takerAssetBundle {\n          assetQuantities(first: 1) {\n            edges {\n              node {\n                ...AssetQuantity_data\n                ...quantity_data\n                asset {\n                  ownedQuantity(identity: {})\n                  decimals\n                  symbol\n                  relayId\n                  assetContract {\n                    account {\n                      address\n                      id\n                    }\n                    id\n                  }\n                  id\n                }\n                quantity\n                id\n              }\n            }\n          }\n          id\n        }\n        ...AskPrice_data\n        ...orderLink_data\n        makerAssetBundleDisplay: makerAssetBundle {\n          ...AssetCell_assetBundle\n          id\n        }\n        takerAssetBundleDisplay: takerAssetBundle {\n          ...AssetCell_assetBundle\n          id\n        }\n        id\n        __typename\n      }\n      cursor\n    }\n    pageInfo {\n      endCursor\n      hasNextPage\n    }\n  }\n}\n\nfragment Price_data on AssetType {\n  decimals\n  imageUrl\n  symbol\n  usdSpotPrice\n  assetContract {\n    blockExplorerLink\n    id\n  }\n}\n\nfragment ProfileImage_data on AccountType {\n  imageUrl\n  address\n  chain {\n    identifier\n    id\n  }\n}\n\nfragment asset_url on AssetType {\n  assetContract {\n    account {\n      address\n      chain {\n        identifier\n        id\n      }\n      id\n    }\n    id\n  }\n  tokenId\n}\n\nfragment orderLink_data on OrderV2Type {\n  makerAssetBundle {\n    assetQuantities(first: 1) {\n      edges {\n        node {\n          asset {\n            externalLink\n            collection {\n              externalUrl\n              id\n            }\n            id\n          }\n          id\n        }\n      }\n    }\n    id\n  }\n}\n\nfragment quantity_data on AssetQuantityType {\n  asset {\n    decimals\n    id\n  }\n  quantity\n}\n\nfragment wallet_accountKey on AccountType {\n  address\n  chain {\n    identifier\n    id\n  }\n}\n",
//     "variables": {
//       "cursor": null,
//       "count": 10,
//       "excludeMaker": null,
//       "isExpired": false,
//       "isFilled": null,
//       "isValid": true,
//       "maker": null,
//       "makerArchetype": {
//         "assetContractAddress": "0xc2c747e0f7004f9e8817db2ca4997657a7746928",
//         "tokenId": "2062"
//       },
//       "makerAssetIsPayment": null,
//       "takerArchetype": null,
//       "takerAssetCategories": null,
//       "takerAssetCollections": null,
//       "takerAssetIsOwnedBy": null,
//       "takerAssetIsPayment": true,
//       "sortAscending": true,
//       "sortBy": "TAKER_ASSETS_USD_PRICE",
//       "makerAssetBundle": null,
//       "takerAssetBundle": null
//     }
//   }
// Response:
// 
// {
//     "data": {
//       "orders": {
//         "edges": [
//           {
//             "node": {
//               "closedAt": null,
//               "isFulfillable": false,
//               "isValid": true,
//               "oldOrder": "{\"id\": 4513867, \"asset\": {\"id\": 17727826, \"token_id\": \"2062\", \"num_sales\": 1, \"background_color\": null, \"image_url\": \"https://lh3.googleusercontent.com/N9mNXnlCjZASu9h431tliBobCCihVH3YhTNkS-antRiM_KJNyQiwkSSTDZTVMYssHVycJThHM3cpBsK04qIRbs_So1XCYaJ8wkDKXw\", \"image_preview_url\": \"https://lh3.googleusercontent.com/N9mNXnlCjZASu9h431tliBobCCihVH3YhTNkS-antRiM_KJNyQiwkSSTDZTVMYssHVycJThHM3cpBsK04qIRbs_So1XCYaJ8wkDKXw=s250\", \"image_thumbnail_url\": \"https://lh3.googleusercontent.com/N9mNXnlCjZASu9h431tliBobCCihVH3YhTNkS-antRiM_KJNyQiwkSSTDZTVMYssHVycJThHM3cpBsK04qIRbs_So1XCYaJ8wkDKXw=s128\", \"image_original_url\": \"https://hashmasksstore.blob.core.windows.net/hashmasks/12203.jpg\", \"animation_url\": null, \"animation_original_url\": null, \"name\": \"Golden Boy\", \"description\": \"\\u26a0\\ufe0f **ATTENTION**: Hashmask names can change at any time. Immediately before purchasing a Hashmask, enter the Hashmask's token ID into the `tokenNameByIndex` function on a site like [Etherscan](https://etherscan.io/address/0xc2c747e0f7004f9e8817db2ca4997657a7746928#readContract) to verify that the blockchain indicates that the Hashmask you're purchasing has the name you expect.\\n\\nHashmask #2062\", \"external_link\": \"https://www.thehashmasks.com/detail/2062\", \"asset_contract\": {\"address\": \"0xc2c747e0f7004f9e8817db2ca4997657a7746928\", \"asset_contract_type\": \"non-fungible\", \"created_date\": \"2021-01-28T10:22:01.756793\", \"name\": \"Hashmasks\", \"nft_version\": \"3.0\", \"opensea_version\": null, \"owner\": 18650025, \"schema_name\": \"ERC721\", \"symbol\": \"HM\", \"total_supply\": \"0\", \"description\": \"Become part of digital art and collectibles history.\", \"external_link\": \"https://www.thehashmasks.com/\", \"image_url\": \"https://lh3.googleusercontent.com/6X867ZmCsuYcjHpx-nmNkXeHaDFd2m-EDEEkExVLKETphkfcrpRJOyzFxRQlc-29J0e-9mB9uDGze0O9yracSA9ibnQm2sIq5i2Yuw=s120\", \"default_to_fiat\": false, \"dev_buyer_fee_basis_points\": 0, \"dev_seller_fee_basis_points\": 0, \"only_proxied_transfers\": false, \"opensea_buyer_fee_basis_points\": 0, \"opensea_seller_fee_basis_points\": 250, \"buyer_fee_basis_points\": 0, \"seller_fee_basis_points\": 250, \"payout_address\": null}, \"owner\": {\"user\": {\"username\": \"ART-Invest\"}, \"profile_img_url\": \"https://storage.googleapis.com/opensea-static/opensea-profile/29.png\", \"address\": \"0x6c21f680ea667aa9efc596977993e8a42f58ea29\", \"config\": \"\", \"discord_id\": \"\"}, \"permalink\": \"https://opensea.io/assets/0xc2c747e0f7004f9e8817db2ca4997657a7746928/2062\", \"collection\": {\"banner_image_url\": \"https://lh3.googleusercontent.com/D1SwtrOZMJRnc7aDHGX1ANHVsL67nPXOma5bVuvgVTlocTcVNs_t76YYI5FMfjfcDpgjV7get7jx2vLSjj4UefSiXuxJf75Rx7rwTg=s2500\", \"chat_url\": null, \"created_date\": \"2021-01-28T15:01:12.705115\", \"default_to_fiat\": false, \"description\": \"Become part of digital art and collectibles history.\", \"dev_buyer_fee_basis_points\": \"0\", \"dev_seller_fee_basis_points\": \"0\", \"discord_url\": \"https://discord.gg/crJmxxzGuZ\", \"display_data\": {\"card_display_style\": \"contain\"}, \"external_url\": \"https://www.thehashmasks.com/\", \"featured\": false, \"featured_image_url\": null, \"hidden\": false, \"safelist_request_status\": \"verified\", \"image_url\": \"https://lh3.googleusercontent.com/6X867ZmCsuYcjHpx-nmNkXeHaDFd2m-EDEEkExVLKETphkfcrpRJOyzFxRQlc-29J0e-9mB9uDGze0O9yracSA9ibnQm2sIq5i2Yuw=s120\", \"is_subject_to_whitelist\": false, \"large_image_url\": null, \"medium_username\": null, \"name\": \"Hashmasks\", \"only_proxied_transfers\": false, \"opensea_buyer_fee_basis_points\": \"0\", \"opensea_seller_fee_basis_points\": \"250\", \"payout_address\": null, \"require_email\": false, \"short_description\": null, \"slug\": \"hashmasks\", \"telegram_url\": null, \"twitter_username\": \"TheHashmasks\", \"instagram_username\": null, \"wiki_url\": null}, \"decimals\": 0}, \"asset_bundle\": null, \"created_date\": \"2021-02-28T01:03:08.877743\", \"closing_date\": null, \"closing_extendable\": false, \"expiration_time\": 0, \"listing_time\": 1614474085, \"order_hash\": \"0x5432f468657db8bebcaf75786c2ae381fb25298da508eb1579e89349fbc8cc38\", \"metadata\": {\"asset\": {\"id\": \"2062\", \"address\": \"0xc2c747e0f7004f9e8817db2ca4997657a7746928\"}, \"schema\": \"ERC721\"}, \"exchange\": \"0x7be8076f4ea4a4ad08075c2508e481d6c946d12b\", \"maker\": {\"user\": {\"username\": \"ART-Invest\"}, \"profile_img_url\": \"https://storage.googleapis.com/opensea-static/opensea-profile/29.png\", \"address\": \"0x6c21f680ea667aa9efc596977993e8a42f58ea29\", \"config\": \"\", \"discord_id\": \"\"}, \"taker\": {\"user\": {\"username\": \"NullAddress\"}, \"profile_img_url\": \"https://storage.googleapis.com/opensea-static/opensea-profile/1.png\", \"address\": \"0x0000000000000000000000000000000000000000\", \"config\": \"\", \"discord_id\": \"\"}, \"current_price\": \"9000000000000000000\", \"current_bounty\": \"90000000000000000\", \"bounty_multiple\": \"0.01\", \"maker_relayer_fee\": \"250\", \"taker_relayer_fee\": \"0\", \"maker_protocol_fee\": \"0\", \"taker_protocol_fee\": \"0\", \"maker_referrer_fee\": \"0\", \"fee_recipient\": {\"user\": {\"username\": \"OS-Wallet\"}, \"profile_img_url\": \"https://storage.googleapis.com/opensea-static/opensea-profile/28.png\", \"address\": \"0x5b3256965e7c3cf26e11fcaf296dfc8807c01073\", \"config\": \"verified\", \"discord_id\": \"\"}, \"fee_method\": 1, \"side\": 1, \"sale_kind\": 0, \"target\": \"0xc2c747e0f7004f9e8817db2ca4997657a7746928\", \"how_to_call\": 0, \"calldata\": \"0x23b872dd0000000000000000000000006c21f680ea667aa9efc596977993e8a42f58ea290000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000080e\", \"replacement_pattern\": \"0x000000000000000000000000000000000000000000000000000000000000000000000000ffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffff0000000000000000000000000000000000000000000000000000000000000000\", \"static_target\": \"0x0000000000000000000000000000000000000000\", \"static_extradata\": \"0x\", \"payment_token\": \"0x0000000000000000000000000000000000000000\", \"payment_token_contract\": {\"id\": 1, \"symbol\": \"ETH\", \"address\": \"0x0000000000000000000000000000000000000000\", \"image_url\": \"https://lh3.googleusercontent.com/7hQyiGtBt8vmUTq4T0aIUhIhT00dPhnav87TuFQ5cLtjlk724JgXdjQjoH_CzYz-z37JpPuMFbRRQuyC7I9abyZRKA\", \"name\": \"Ether\", \"decimals\": 18, \"eth_price\": \"1.004193870598586\", \"usd_price\": \"1518.069999999999936335\"}, \"base_price\": \"9000000000000000000\", \"extra\": \"0\", \"quantity\": \"1\", \"salt\": \"3957738796678391218868236436212312705136430518686427894228180056002856995113\", \"v\": 28, \"r\": \"0x9bd70cfa07858a5f6f48b06093d852547d67a27c8e87e210e982e5319ea8c32b\", \"s\": \"0x44692520e9f1d5e6e8d8f74f604931a1822f19ee9c21e3aa56f57b56ad420f54\", \"approved_on_chain\": false, \"cancelled\": false, \"finalized\": false, \"marked_invalid\": false, \"prefixed_hash\": \"0x300d976d081c1ac3f4673532234cac45620383cc79644f02aa2bc214189aa476\"}",
//               "openedAt": "2021-02-28T01:01:25",
//               "orderType": "BASIC",
//               "maker": {
//                 "address": "0x6c21f680ea667aa9efc596977993e8a42f58ea29",
//                 "chain": {
//                   "identifier": "ETHEREUM",
//                   "id": "Q2hhaW5UeXBlOjE="
//                 },
//                 "user": {
//                   "username": "ART-Invest",
//                   "id": "VXNlclR5cGU6MTUxMzg5"
//                 },
//                 "imageUrl": "https://lh3.googleusercontent.com/Uo0MR9WVB9RK9NQzwbuVNLIpuSTQe8b9VM5-efFf_48jvGkOuIXb98WyNUtdqtKncMkKglJvDwArpSFhABdo-9c_oNeCH5xgOCvY=s100",
//                 "id": "QWNjb3VudFR5cGU6MjAxNjI1MTk="
//               },
//               "makerAsset": {
//                 "assetQuantities": {
//                   "edges": [
//                     {
//                       "node": {
//                         "asset": {
//                           "assetContract": {
//                             "account": {
//                               "address": "0xc2c747e0f7004f9e8817db2ca4997657a7746928",
//                               "chain": {
//                                 "identifier": "ETHEREUM",
//                                 "id": "Q2hhaW5UeXBlOjE="
//                               },
//                               "id": "QWNjb3VudFR5cGU6MTg2NTAwMjc="
//                             },
//                             "id": "QXNzZXRDb250cmFjdFR5cGU6MTkxNjcx"
//                           },
//                           "id": "QXNzZXRUeXBlOjE3NzI3ODI2"
//                         },
//                         "id": "QXNzZXRRdWFudGl0eVR5cGU6MTUxNDA4Mw=="
//                       }
//                     }
//                   ]
//                 },
//                 "id": "QXNzZXRCdW5kbGVUeXBlOjM4NTc1MTg="
//               },
//               "makerAssetBundle": {
//                 "assetQuantities": {
//                   "edges": [
//                     {
//                       "node": {
//                         "asset": {
//                           "decimals": 0,
//                           "imageUrl": "https://lh3.googleusercontent.com/N9mNXnlCjZASu9h431tliBobCCihVH3YhTNkS-antRiM_KJNyQiwkSSTDZTVMYssHVycJThHM3cpBsK04qIRbs_So1XCYaJ8wkDKXw",
//                           "symbol": null,
//                           "usdSpotPrice": null,
//                           "assetContract": {
//                             "blockExplorerLink": "https://etherscan.io/address/0xc2c747e0f7004f9e8817db2ca4997657a7746928",
//                             "id": "QXNzZXRDb250cmFjdFR5cGU6MTkxNjcx"
//                           },
//                           "id": "QXNzZXRUeXBlOjE3NzI3ODI2",
//                           "externalLink": "https://www.thehashmasks.com/detail/2062",
//                           "collection": {
//                             "externalUrl": "https://www.thehashmasks.com/",
//                             "id": "Q29sbGVjdGlvblR5cGU6MjE1MTk="
//                           }
//                         },
//                         "quantity": "1",
//                         "id": "QXNzZXRRdWFudGl0eVR5cGU6MTUxNDA4Mw=="
//                       }
//                     }
//                   ]
//                 },
//                 "id": "QXNzZXRCdW5kbGVUeXBlOjM4NTc1MTg="
//               },
//               "relayId": "T3JkZXJWMlR5cGU6NDg2ODM2OA==",
//               "side": "ASK",
//               "taker": null,
//               "takerAssetBundle": {
//                 "assetQuantities": {
//                   "edges": [
//                     {
//                       "node": {
//                         "asset": {
//                           "decimals": 18,
//                           "imageUrl": "https://lh3.googleusercontent.com/7hQyiGtBt8vmUTq4T0aIUhIhT00dPhnav87TuFQ5cLtjlk724JgXdjQjoH_CzYz-z37JpPuMFbRRQuyC7I9abyZRKA",
//                           "symbol": "ETH",
//                           "usdSpotPrice": 1518.07,
//                           "assetContract": {
//                             "blockExplorerLink": "https://etherscan.io/address/0x0000000000000000000000000000000000000000",
//                             "id": "QXNzZXRDb250cmFjdFR5cGU6MjMzMQ==",
//                             "account": {
//                               "address": "0x0000000000000000000000000000000000000000",
//                               "id": "QWNjb3VudFR5cGU6NjAx"
//                             }
//                           },
//                           "id": "QXNzZXRUeXBlOjEzNjg5MDc3",
//                           "ownedQuantity": null,
//                           "relayId": "QXNzZXRUeXBlOjEzNjg5MDc3"
//                         },
//                         "quantity": "9000000000000000000",
//                         "id": "QXNzZXRRdWFudGl0eVR5cGU6MTk1MjU2"
//                       }
//                     }
//                   ]
//                 },
//                 "id": "QXNzZXRCdW5kbGVUeXBlOjMyNDQwMjU="
//               },
//               "dutchAuctionFinalPrice": null,
//               "priceFnEndedAt": null,
//               "makerAssetBundleDisplay": {
//                 "assetQuantities": {
//                   "edges": [
//                     {
//                       "node": {
//                         "asset": {
//                           "collection": {
//                             "name": "Hashmasks",
//                             "id": "Q29sbGVjdGlvblR5cGU6MjE1MTk=",
//                             "description": "Become part of digital art and collectibles history.",
//                             "displayData": {
//                               "cardDisplayStyle": "CONTAIN"
//                             },
//                             "imageUrl": "https://lh3.googleusercontent.com/6X867ZmCsuYcjHpx-nmNkXeHaDFd2m-EDEEkExVLKETphkfcrpRJOyzFxRQlc-29J0e-9mB9uDGze0O9yracSA9ibnQm2sIq5i2Yuw=s120",
//                             "hidden": false,
//                             "slug": "hashmasks"
//                           },
//                           "name": "Golden Boy",
//                           "animationUrl": null,
//                           "backgroundColor": null,
//                           "description": "\u26a0\ufe0f **ATTENTION**: Hashmask names can change at any time. Immediately before purchasing a Hashmask, enter the Hashmask's token ID into the `tokenNameByIndex` function on a site like [Etherscan](https://etherscan.io/address/0xc2c747e0f7004f9e8817db2ca4997657a7746928#readContract) to verify that the blockchain indicates that the Hashmask you're purchasing has the name you expect.\n\nHashmask #2062",
//                           "tokenId": "2062",
//                           "imageUrl": "https://lh3.googleusercontent.com/N9mNXnlCjZASu9h431tliBobCCihVH3YhTNkS-antRiM_KJNyQiwkSSTDZTVMYssHVycJThHM3cpBsK04qIRbs_So1XCYaJ8wkDKXw",
//                           "assetContract": {
//                             "account": {
//                               "address": "0xc2c747e0f7004f9e8817db2ca4997657a7746928",
//                               "chain": {
//                                 "identifier": "ETHEREUM",
//                                 "id": "Q2hhaW5UeXBlOjE="
//                               },
//                               "id": "QWNjb3VudFR5cGU6MTg2NTAwMjc="
//                             },
//                             "id": "QXNzZXRDb250cmFjdFR5cGU6MTkxNjcx"
//                           },
//                           "id": "QXNzZXRUeXBlOjE3NzI3ODI2"
//                         },
//                         "relayId": "QXNzZXRRdWFudGl0eVR5cGU6MTUxNDA4Mw==",
//                         "id": "QXNzZXRRdWFudGl0eVR5cGU6MTUxNDA4Mw=="
//                       }
//                     }
//                   ]
//                 },
//                 "name": null,
//                 "slug": null,
//                 "id": "QXNzZXRCdW5kbGVUeXBlOjM4NTc1MTg="
//               },
//               "takerAssetBundleDisplay": {
//                 "assetQuantities": {
//                   "edges": [
//                     {
//                       "node": {
//                         "asset": {
//                           "collection": {
//                             "name": "Ether",
//                             "id": "Q29sbGVjdGlvblR5cGU6NDAwOA==",
//                             "description": "This is the collection of owners of Ether",
//                             "displayData": {
//                               "cardDisplayStyle": null
//                             },
//                             "imageUrl": null,
//                             "hidden": true,
//                             "slug": "ether"
//                           },
//                           "name": "Ether",
//                           "animationUrl": null,
//                           "backgroundColor": null,
//                           "description": null,
//                           "tokenId": "0",
//                           "imageUrl": "https://lh3.googleusercontent.com/7hQyiGtBt8vmUTq4T0aIUhIhT00dPhnav87TuFQ5cLtjlk724JgXdjQjoH_CzYz-z37JpPuMFbRRQuyC7I9abyZRKA",
//                           "assetContract": {
//                             "account": {
//                               "address": "0x0000000000000000000000000000000000000000",
//                               "chain": {
//                                 "identifier": "ETHEREUM",
//                                 "id": "Q2hhaW5UeXBlOjE="
//                               },
//                               "id": "QWNjb3VudFR5cGU6NjAx"
//                             },
//                             "id": "QXNzZXRDb250cmFjdFR5cGU6MjMzMQ=="
//                           },
//                           "id": "QXNzZXRUeXBlOjEzNjg5MDc3"
//                         },
//                         "relayId": "QXNzZXRRdWFudGl0eVR5cGU6MTk1MjU2",
//                         "id": "QXNzZXRRdWFudGl0eVR5cGU6MTk1MjU2"
//                       }
//                     }
//                   ]
//                 },
//                 "name": "Ether",
//                 "slug": null,
//                 "id": "QXNzZXRCdW5kbGVUeXBlOjMyNDQwMjU="
//               },
//               "id": "T3JkZXJWMlR5cGU6NDg2ODM2OA==",
//               "__typename": "OrderV2Type"
//             },
//             "cursor": "YXJyYXljb25uZWN0aW9uOjA="
//           }
//         ],
//         "pageInfo": {
//           "endCursor": "YXJyYXljb25uZWN0aW9uOjI=",
//           "hasNextPage": false
//         }
//       }
//     }
//   }
// ---------------------------
// Orders Query 2 -- takerArchetype filled -- returns bid listings?
// makerAssetIsPayment is true, takerAssetIsPayment is false
// sortAscending is null, sortBy is MAKER_ASSET_USD_PRICE
// Query:
// {
//     "id": "OrdersQuery",
//     "query": "query OrdersQuery(\n  $cursor: String\n  $count: Int = 10\n  $excludeMaker: IdentityInputType\n  $isExpired: Boolean\n  $isFilled: Boolean\n  $isValid: Boolean\n  $maker: IdentityInputType\n  $makerArchetype: ArchetypeInputType\n  $makerAssetIsPayment: Boolean\n  $takerArchetype: ArchetypeInputType\n  $takerAssetCategories: [CollectionSlug!]\n  $takerAssetCollections: [CollectionSlug!]\n  $takerAssetIsOwnedBy: IdentityInputType\n  $takerAssetIsPayment: Boolean\n  $sortAscending: Boolean\n  $sortBy: OrderSortOption\n  $makerAssetBundle: BundleSlug\n  $takerAssetBundle: BundleSlug\n) {\n  ...Orders_data_2g7x2d\n}\n\nfragment AccountLink_data on AccountType {\n  address\n  chain {\n    identifier\n    id\n  }\n  user {\n    username\n    id\n  }\n  ...ProfileImage_data\n  ...wallet_accountKey\n}\n\nfragment AskPrice_data on OrderV2Type {\n  dutchAuctionFinalPrice\n  openedAt\n  priceFnEndedAt\n  makerAssetBundle {\n    assetQuantities(first: 1) {\n      edges {\n        node {\n          ...quantity_data\n          id\n        }\n      }\n    }\n    id\n  }\n  takerAssetBundle {\n    assetQuantities(first: 1) {\n      edges {\n        node {\n          ...AssetQuantity_data\n          id\n        }\n      }\n    }\n    id\n  }\n}\n\nfragment AssetCell_assetBundle on AssetBundleType {\n  assetQuantities(first: 2) {\n    edges {\n      node {\n        asset {\n          collection {\n            name\n            id\n          }\n          name\n          ...AssetMedia_asset\n          ...asset_url\n          id\n        }\n        relayId\n        id\n      }\n    }\n  }\n  name\n  slug\n}\n\nfragment AssetMedia_asset on AssetType {\n  animationUrl\n  backgroundColor\n  collection {\n    description\n    displayData {\n      cardDisplayStyle\n    }\n    imageUrl\n    hidden\n    name\n    slug\n    id\n  }\n  description\n  name\n  tokenId\n  imageUrl\n}\n\nfragment AssetQuantity_data on AssetQuantityType {\n  asset {\n    ...Price_data\n    id\n  }\n  quantity\n}\n\nfragment Orders_data_2g7x2d on Query {\n  orders(after: $cursor, excludeMaker: $excludeMaker, first: $count, isExpired: $isExpired, isFilled: $isFilled, isValid: $isValid, maker: $maker, makerArchetype: $makerArchetype, makerAssetIsPayment: $makerAssetIsPayment, takerArchetype: $takerArchetype, takerAssetCategories: $takerAssetCategories, takerAssetCollections: $takerAssetCollections, takerAssetIsOwnedBy: $takerAssetIsOwnedBy, takerAssetIsPayment: $takerAssetIsPayment, sortAscending: $sortAscending, sortBy: $sortBy, makerAssetBundle: $makerAssetBundle, takerAssetBundle: $takerAssetBundle) {\n    edges {\n      node {\n        closedAt\n        isFulfillable\n        isValid\n        oldOrder\n        openedAt\n        orderType\n        maker {\n          address\n          ...AccountLink_data\n          ...wallet_accountKey\n          id\n        }\n        makerAsset: makerAssetBundle {\n          assetQuantities(first: 1) {\n            edges {\n              node {\n                asset {\n                  assetContract {\n                    account {\n                      address\n                      chain {\n                        identifier\n                        id\n                      }\n                      id\n                    }\n                    id\n                  }\n                  id\n                }\n                id\n              }\n            }\n          }\n          id\n        }\n        makerAssetBundle {\n          assetQuantities(first: 1) {\n            edges {\n              node {\n                ...AssetQuantity_data\n                ...quantity_data\n                id\n              }\n            }\n          }\n          id\n        }\n        relayId\n        side\n        taker {\n          ...AccountLink_data\n          ...wallet_accountKey\n          id\n          address\n        }\n        takerAssetBundle {\n          assetQuantities(first: 1) {\n            edges {\n              node {\n                ...AssetQuantity_data\n                ...quantity_data\n                asset {\n                  ownedQuantity(identity: {})\n                  decimals\n                  symbol\n                  relayId\n                  assetContract {\n                    account {\n                      address\n                      id\n                    }\n                    id\n                  }\n                  id\n                }\n                quantity\n                id\n              }\n            }\n          }\n          id\n        }\n        ...AskPrice_data\n        ...orderLink_data\n        makerAssetBundleDisplay: makerAssetBundle {\n          ...AssetCell_assetBundle\n          id\n        }\n        takerAssetBundleDisplay: takerAssetBundle {\n          ...AssetCell_assetBundle\n          id\n        }\n        id\n        __typename\n      }\n      cursor\n    }\n    pageInfo {\n      endCursor\n      hasNextPage\n    }\n  }\n}\n\nfragment Price_data on AssetType {\n  decimals\n  imageUrl\n  symbol\n  usdSpotPrice\n  assetContract {\n    blockExplorerLink\n    id\n  }\n}\n\nfragment ProfileImage_data on AccountType {\n  imageUrl\n  address\n  chain {\n    identifier\n    id\n  }\n}\n\nfragment asset_url on AssetType {\n  assetContract {\n    account {\n      address\n      chain {\n        identifier\n        id\n      }\n      id\n    }\n    id\n  }\n  tokenId\n}\n\nfragment orderLink_data on OrderV2Type {\n  makerAssetBundle {\n    assetQuantities(first: 1) {\n      edges {\n        node {\n          asset {\n            externalLink\n            collection {\n              externalUrl\n              id\n            }\n            id\n          }\n          id\n        }\n      }\n    }\n    id\n  }\n}\n\nfragment quantity_data on AssetQuantityType {\n  asset {\n    decimals\n    id\n  }\n  quantity\n}\n\nfragment wallet_accountKey on AccountType {\n  address\n  chain {\n    identifier\n    id\n  }\n}\n",
//     "variables": {
//       "cursor": null,
//       "count": 10,
//       "excludeMaker": null,
//       "isExpired": false,
//       "isFilled": null,
//       "isValid": true,
//       "maker": null,
//       "makerArchetype": null,
//       "makerAssetIsPayment": true,
//       "takerArchetype": {
//         "assetContractAddress": "0xc2c747e0f7004f9e8817db2ca4997657a7746928",
//         "tokenId": "2062"
//       },
//       "takerAssetCategories": null,
//       "takerAssetCollections": null,
//       "takerAssetIsOwnedBy": null,
//       "takerAssetIsPayment": null,
//       "sortAscending": null,
//       "sortBy": "MAKER_ASSETS_USD_PRICE",
//       "makerAssetBundle": null,
//       "takerAssetBundle": null
//     }
//   }
// Response:
// {
//     "data": {
//       "orders": {
//         "edges": [
//           {
//             "node": {
//               "closedAt": "2021-03-05T14:08:49",
//               "isFulfillable": false,
//               "isValid": true,
//               "oldOrder": "{\"id\": 4239435, \"asset\": {\"id\": 17727826, \"token_id\": \"2062\", \"num_sales\": 1, \"background_color\": null, \"image_url\": \"https://lh3.googleusercontent.com/N9mNXnlCjZASu9h431tliBobCCihVH3YhTNkS-antRiM_KJNyQiwkSSTDZTVMYssHVycJThHM3cpBsK04qIRbs_So1XCYaJ8wkDKXw\", \"image_preview_url\": \"https://lh3.googleusercontent.com/N9mNXnlCjZASu9h431tliBobCCihVH3YhTNkS-antRiM_KJNyQiwkSSTDZTVMYssHVycJThHM3cpBsK04qIRbs_So1XCYaJ8wkDKXw=s250\", \"image_thumbnail_url\": \"https://lh3.googleusercontent.com/N9mNXnlCjZASu9h431tliBobCCihVH3YhTNkS-antRiM_KJNyQiwkSSTDZTVMYssHVycJThHM3cpBsK04qIRbs_So1XCYaJ8wkDKXw=s128\", \"image_original_url\": \"https://hashmasksstore.blob.core.windows.net/hashmasks/12203.jpg\", \"animation_url\": null, \"animation_original_url\": null, \"name\": \"Golden Boy\", \"description\": \"\\u26a0\\ufe0f **ATTENTION**: Hashmask names can change at any time. Immediately before purchasing a Hashmask, enter the Hashmask's token ID into the `tokenNameByIndex` function on a site like [Etherscan](https://etherscan.io/address/0xc2c747e0f7004f9e8817db2ca4997657a7746928#readContract) to verify that the blockchain indicates that the Hashmask you're purchasing has the name you expect.\\n\\nHashmask #2062\", \"external_link\": \"https://www.thehashmasks.com/detail/2062\", \"asset_contract\": {\"address\": \"0xc2c747e0f7004f9e8817db2ca4997657a7746928\", \"asset_contract_type\": \"non-fungible\", \"created_date\": \"2021-01-28T10:22:01.756793\", \"name\": \"Hashmasks\", \"nft_version\": \"3.0\", \"opensea_version\": null, \"owner\": 18650025, \"schema_name\": \"ERC721\", \"symbol\": \"HM\", \"total_supply\": \"0\", \"description\": \"Become part of digital art and collectibles history.\", \"external_link\": \"https://www.thehashmasks.com/\", \"image_url\": \"https://lh3.googleusercontent.com/6X867ZmCsuYcjHpx-nmNkXeHaDFd2m-EDEEkExVLKETphkfcrpRJOyzFxRQlc-29J0e-9mB9uDGze0O9yracSA9ibnQm2sIq5i2Yuw=s120\", \"default_to_fiat\": false, \"dev_buyer_fee_basis_points\": 0, \"dev_seller_fee_basis_points\": 0, \"only_proxied_transfers\": false, \"opensea_buyer_fee_basis_points\": 0, \"opensea_seller_fee_basis_points\": 250, \"buyer_fee_basis_points\": 0, \"seller_fee_basis_points\": 250, \"payout_address\": null}, \"owner\": {\"user\": {\"username\": \"ART-Invest\"}, \"profile_img_url\": \"https://storage.googleapis.com/opensea-static/opensea-profile/29.png\", \"address\": \"0x6c21f680ea667aa9efc596977993e8a42f58ea29\", \"config\": \"\", \"discord_id\": \"\"}, \"permalink\": \"https://opensea.io/assets/0xc2c747e0f7004f9e8817db2ca4997657a7746928/2062\", \"collection\": {\"banner_image_url\": \"https://lh3.googleusercontent.com/D1SwtrOZMJRnc7aDHGX1ANHVsL67nPXOma5bVuvgVTlocTcVNs_t76YYI5FMfjfcDpgjV7get7jx2vLSjj4UefSiXuxJf75Rx7rwTg=s2500\", \"chat_url\": null, \"created_date\": \"2021-01-28T15:01:12.705115\", \"default_to_fiat\": false, \"description\": \"Become part of digital art and collectibles history.\", \"dev_buyer_fee_basis_points\": \"0\", \"dev_seller_fee_basis_points\": \"0\", \"discord_url\": \"https://discord.gg/crJmxxzGuZ\", \"display_data\": {\"card_display_style\": \"contain\"}, \"external_url\": \"https://www.thehashmasks.com/\", \"featured\": false, \"featured_image_url\": null, \"hidden\": false, \"safelist_request_status\": \"verified\", \"image_url\": \"https://lh3.googleusercontent.com/6X867ZmCsuYcjHpx-nmNkXeHaDFd2m-EDEEkExVLKETphkfcrpRJOyzFxRQlc-29J0e-9mB9uDGze0O9yracSA9ibnQm2sIq5i2Yuw=s120\", \"is_subject_to_whitelist\": false, \"large_image_url\": null, \"medium_username\": null, \"name\": \"Hashmasks\", \"only_proxied_transfers\": false, \"opensea_buyer_fee_basis_points\": \"0\", \"opensea_seller_fee_basis_points\": \"250\", \"payout_address\": null, \"require_email\": false, \"short_description\": null, \"slug\": \"hashmasks\", \"telegram_url\": null, \"twitter_username\": \"TheHashmasks\", \"instagram_username\": null, \"wiki_url\": null}, \"decimals\": 0}, \"asset_bundle\": null, \"created_date\": \"2021-02-26T14:09:07.551328\", \"closing_date\": \"2021-03-05T14:08:49\", \"closing_extendable\": false, \"expiration_time\": 1614953329, \"listing_time\": 1614348441, \"order_hash\": \"0xd9d2b3e35464377489a6457d3e61c1700fc620d0cb9189b17d8c124c95bf27c6\", \"metadata\": {\"asset\": {\"id\": \"2062\", \"address\": \"0xc2c747e0f7004f9e8817db2ca4997657a7746928\"}, \"schema\": \"ERC721\", \"referrerAddress\": \"0x6efef34e81fd201edf18c7902948168e9ebb88ae\"}, \"exchange\": \"0x7be8076f4ea4a4ad08075c2508e481d6c946d12b\", \"maker\": {\"user\": {\"username\": \"ricfish\"}, \"profile_img_url\": \"https://storage.googleapis.com/opensea-static/opensea-profile/30.png\", \"address\": \"0x3d0d7f8720a02cfc9fee5dc7dc08181303a6ed86\", \"config\": \"\", \"discord_id\": \"\"}, \"taker\": {\"user\": {\"username\": \"NullAddress\"}, \"profile_img_url\": \"https://storage.googleapis.com/opensea-static/opensea-profile/1.png\", \"address\": \"0x0000000000000000000000000000000000000000\", \"config\": \"\", \"discord_id\": \"\"}, \"current_price\": \"1660000000000000000.000000000\", \"current_bounty\": \"16600000000000000\", \"bounty_multiple\": \"0.01\", \"maker_relayer_fee\": \"0\", \"taker_relayer_fee\": \"250\", \"maker_protocol_fee\": \"0\", \"taker_protocol_fee\": \"0\", \"maker_referrer_fee\": \"0\", \"fee_recipient\": {\"user\": {\"username\": \"OS-Wallet\"}, \"profile_img_url\": \"https://storage.googleapis.com/opensea-static/opensea-profile/28.png\", \"address\": \"0x5b3256965e7c3cf26e11fcaf296dfc8807c01073\", \"config\": \"verified\", \"discord_id\": \"\"}, \"fee_method\": 1, \"side\": 0, \"sale_kind\": 0, \"target\": \"0xc2c747e0f7004f9e8817db2ca4997657a7746928\", \"how_to_call\": 0, \"calldata\": \"0x23b872dd00000000000000000000000000000000000000000000000000000000000000000000000000000000000000003d0d7f8720a02cfc9fee5dc7dc08181303a6ed86000000000000000000000000000000000000000000000000000000000000080e\", \"replacement_pattern\": \"0x00000000ffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffff00000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000\", \"static_target\": \"0x0000000000000000000000000000000000000000\", \"static_extradata\": \"0x\", \"payment_token\": \"0xc02aaa39b223fe8d0a0e5c4f27ead9083c756cc2\", \"payment_token_contract\": {\"id\": 2, \"symbol\": \"WETH\", \"address\": \"0xc02aaa39b223fe8d0a0e5c4f27ead9083c756cc2\", \"image_url\": \"https://lh3.googleusercontent.com/kPzD9AH9Xt4Vr7NXphLy2Yyf5ZWM0vfN_wMhJs0HWJpQjFZm0pcmZ880vcJQVLxPgdnOTEfUuYbkiaGxcTT_ZnCy\", \"name\": \"Wrapped Ether\", \"decimals\": 18, \"eth_price\": \"1.004193870598586\", \"usd_price\": \"1518.069999999999936335\"}, \"base_price\": \"1660000000000000000\", \"extra\": \"0\", \"quantity\": \"1\", \"salt\": \"81386129577632658829347910346518821271694237363361643638832048535097387810134\", \"v\": 27, \"r\": \"0x7ad6c6db5a7dd5e3b4f5d4e95d8121b305154a47e9d27e41671a3f4ed30842af\", \"s\": \"0x74665a37a44d553e78ffa238a513f51311224a4312807b9ae459cad4daba89d1\", \"approved_on_chain\": false, \"cancelled\": false, \"finalized\": false, \"marked_invalid\": false, \"prefixed_hash\": \"0x6954b4592517074eaecb9695a5ad65bd389697ffac46ea7419c49eb1ff2686bd\"}",
//               "openedAt": "2021-02-26T14:07:21",
//               "orderType": "BASIC",
//               "maker": {
//                 "address": "0x3d0d7f8720a02cfc9fee5dc7dc08181303a6ed86",
//                 "chain": {
//                   "identifier": "ETHEREUM",
//                   "id": "Q2hhaW5UeXBlOjE="
//                 },
//                 "user": {
//                   "username": "ricfish",
//                   "id": "VXNlclR5cGU6NzQ3NjA="
//                 },
//                 "imageUrl": "https://lh3.googleusercontent.com/1fjT2TaBPZy0fL-IZ6iYzHxQCcFPD_aRdV-6hMaN5bRaEdG3dH_ADZsSkOKJ-uUqZs3Yj4CfbjWqCW-lK-5fgFqBCjU8vMvyC0a3=s100",
//                 "id": "QWNjb3VudFR5cGU6NjgyMjEy"
//               },
//               "makerAsset": {
//                 "assetQuantities": {
//                   "edges": [
//                     {
//                       "node": {
//                         "asset": {
//                           "assetContract": {
//                             "account": {
//                               "address": "0xc02aaa39b223fe8d0a0e5c4f27ead9083c756cc2",
//                               "chain": {
//                                 "identifier": "ETHEREUM",
//                                 "id": "Q2hhaW5UeXBlOjE="
//                               },
//                               "id": "QWNjb3VudFR5cGU6MTczMjQw"
//                             },
//                             "id": "QXNzZXRDb250cmFjdFR5cGU6MjMzOA=="
//                           },
//                           "id": "QXNzZXRUeXBlOjQ2NDU2ODE="
//                         },
//                         "id": "QXNzZXRRdWFudGl0eVR5cGU6MjA0MDY4"
//                       }
//                     }
//                   ]
//                 },
//                 "id": "QXNzZXRCdW5kbGVUeXBlOjMyNDE4NTQ="
//               },
//               "makerAssetBundle": {
//                 "assetQuantities": {
//                   "edges": [
//                     {
//                       "node": {
//                         "asset": {
//                           "decimals": 18,
//                           "imageUrl": "https://lh3.googleusercontent.com/kPzD9AH9Xt4Vr7NXphLy2Yyf5ZWM0vfN_wMhJs0HWJpQjFZm0pcmZ880vcJQVLxPgdnOTEfUuYbkiaGxcTT_ZnCy",
//                           "symbol": "WETH",
//                           "usdSpotPrice": 1518.07,
//                           "assetContract": {
//                             "blockExplorerLink": "https://etherscan.io/address/0xc02aaa39b223fe8d0a0e5c4f27ead9083c756cc2",
//                             "id": "QXNzZXRDb250cmFjdFR5cGU6MjMzOA=="
//                           },
//                           "id": "QXNzZXRUeXBlOjQ2NDU2ODE=",
//                           "externalLink": null,
//                           "collection": {
//                             "externalUrl": null,
//                             "id": "Q29sbGVjdGlvblR5cGU6NDAxNQ=="
//                           }
//                         },
//                         "quantity": "1660000000000000000",
//                         "id": "QXNzZXRRdWFudGl0eVR5cGU6MjA0MDY4"
//                       }
//                     }
//                   ]
//                 },
//                 "id": "QXNzZXRCdW5kbGVUeXBlOjMyNDE4NTQ="
//               },
//               "relayId": "T3JkZXJWMlR5cGU6NDU5MjY0OQ==",
//               "side": "BID",
//               "taker": null,
//               "takerAssetBundle": {
//                 "assetQuantities": {
//                   "edges": [
//                     {
//                       "node": {
//                         "asset": {
//                           "decimals": 0,
//                           "imageUrl": "https://lh3.googleusercontent.com/N9mNXnlCjZASu9h431tliBobCCihVH3YhTNkS-antRiM_KJNyQiwkSSTDZTVMYssHVycJThHM3cpBsK04qIRbs_So1XCYaJ8wkDKXw",
//                           "symbol": null,
//                           "usdSpotPrice": null,
//                           "assetContract": {
//                             "blockExplorerLink": "https://etherscan.io/address/0xc2c747e0f7004f9e8817db2ca4997657a7746928",
//                             "id": "QXNzZXRDb250cmFjdFR5cGU6MTkxNjcx",
//                             "account": {
//                               "address": "0xc2c747e0f7004f9e8817db2ca4997657a7746928",
//                               "id": "QWNjb3VudFR5cGU6MTg2NTAwMjc="
//                             }
//                           },
//                           "id": "QXNzZXRUeXBlOjE3NzI3ODI2",
//                           "ownedQuantity": null,
//                           "relayId": "QXNzZXRUeXBlOjE3NzI3ODI2"
//                         },
//                         "quantity": "1",
//                         "id": "QXNzZXRRdWFudGl0eVR5cGU6MTUxNDA4Mw=="
//                       }
//                     }
//                   ]
//                 },
//                 "id": "QXNzZXRCdW5kbGVUeXBlOjM4NTc1MTg="
//               },
//               "dutchAuctionFinalPrice": null,
//               "priceFnEndedAt": null,
//               "makerAssetBundleDisplay": {
//                 "assetQuantities": {
//                   "edges": [
//                     {
//                       "node": {
//                         "asset": {
//                           "collection": {
//                             "name": "Wrapped Ether",
//                             "id": "Q29sbGVjdGlvblR5cGU6NDAxNQ==",
//                             "description": "This is the collection of owners of Wrapped Ether",
//                             "displayData": {
//                               "cardDisplayStyle": null
//                             },
//                             "imageUrl": "https://storage.googleapis.com/opensea-static/tokens-high-res/WETH.png",
//                             "hidden": true,
//                             "slug": "wrapped-ether"
//                           },
//                           "name": "Wrapped Ether",
//                           "animationUrl": null,
//                           "backgroundColor": null,
//                           "description": "Wrapped Ether is a token that can be used on the Ethereum network.",
//                           "tokenId": "0",
//                           "imageUrl": "https://lh3.googleusercontent.com/kPzD9AH9Xt4Vr7NXphLy2Yyf5ZWM0vfN_wMhJs0HWJpQjFZm0pcmZ880vcJQVLxPgdnOTEfUuYbkiaGxcTT_ZnCy",
//                           "assetContract": {
//                             "account": {
//                               "address": "0xc02aaa39b223fe8d0a0e5c4f27ead9083c756cc2",
//                               "chain": {
//                                 "identifier": "ETHEREUM",
//                                 "id": "Q2hhaW5UeXBlOjE="
//                               },
//                               "id": "QWNjb3VudFR5cGU6MTczMjQw"
//                             },
//                             "id": "QXNzZXRDb250cmFjdFR5cGU6MjMzOA=="
//                           },
//                           "id": "QXNzZXRUeXBlOjQ2NDU2ODE="
//                         },
//                         "relayId": "QXNzZXRRdWFudGl0eVR5cGU6MjA0MDY4",
//                         "id": "QXNzZXRRdWFudGl0eVR5cGU6MjA0MDY4"
//                       }
//                     }
//                   ]
//                 },
//                 "name": "Wrapped Ether",
//                 "slug": null,
//                 "id": "QXNzZXRCdW5kbGVUeXBlOjMyNDE4NTQ="
//               },
//               "takerAssetBundleDisplay": {
//                 "assetQuantities": {
//                   "edges": [
//                     {
//                       "node": {
//                         "asset": {
//                           "collection": {
//                             "name": "Hashmasks",
//                             "id": "Q29sbGVjdGlvblR5cGU6MjE1MTk=",
//                             "description": "Become part of digital art and collectibles history.",
//                             "displayData": {
//                               "cardDisplayStyle": "CONTAIN"
//                             },
//                             "imageUrl": "https://lh3.googleusercontent.com/6X867ZmCsuYcjHpx-nmNkXeHaDFd2m-EDEEkExVLKETphkfcrpRJOyzFxRQlc-29J0e-9mB9uDGze0O9yracSA9ibnQm2sIq5i2Yuw=s120",
//                             "hidden": false,
//                             "slug": "hashmasks"
//                           },
//                           "name": "Golden Boy",
//                           "animationUrl": null,
//                           "backgroundColor": null,
//                           "description": "\u26a0\ufe0f **ATTENTION**: Hashmask names can change at any time. Immediately before purchasing a Hashmask, enter the Hashmask's token ID into the `tokenNameByIndex` function on a site like [Etherscan](https://etherscan.io/address/0xc2c747e0f7004f9e8817db2ca4997657a7746928#readContract) to verify that the blockchain indicates that the Hashmask you're purchasing has the name you expect.\n\nHashmask #2062",
//                           "tokenId": "2062",
//                           "imageUrl": "https://lh3.googleusercontent.com/N9mNXnlCjZASu9h431tliBobCCihVH3YhTNkS-antRiM_KJNyQiwkSSTDZTVMYssHVycJThHM3cpBsK04qIRbs_So1XCYaJ8wkDKXw",
//                           "assetContract": {
//                             "account": {
//                               "address": "0xc2c747e0f7004f9e8817db2ca4997657a7746928",
//                               "chain": {
//                                 "identifier": "ETHEREUM",
//                                 "id": "Q2hhaW5UeXBlOjE="
//                               },
//                               "id": "QWNjb3VudFR5cGU6MTg2NTAwMjc="
//                             },
//                             "id": "QXNzZXRDb250cmFjdFR5cGU6MTkxNjcx"
//                           },
//                           "id": "QXNzZXRUeXBlOjE3NzI3ODI2"
//                         },
//                         "relayId": "QXNzZXRRdWFudGl0eVR5cGU6MTUxNDA4Mw==",
//                         "id": "QXNzZXRRdWFudGl0eVR5cGU6MTUxNDA4Mw=="
//                       }
//                     }
//                   ]
//                 },
//                 "name": null,
//                 "slug": null,
//                 "id": "QXNzZXRCdW5kbGVUeXBlOjM4NTc1MTg="
//               },
//               "id": "T3JkZXJWMlR5cGU6NDU5MjY0OQ==",
//               "__typename": "OrderV2Type"
//             },
//             "cursor": "YXJyYXljb25uZWN0aW9uOjA="
//           }
//         ],
//         "pageInfo": {
//           "endCursor": "YXJyYXljb25uZWN0aW9uOjA=",
//           "hasNextPage": false
//         }
//       }
//     }
//   }













// --------------
// EventHistoryQuery
// This returns the Trading History table section -- unneeded for now
// Request:
// {
//     "id": "EventHistoryQuery",
//     "query": "query EventHistoryQuery(\n  $archetype: ArchetypeInputType\n  $bundle: BundleSlug\n  $collections: [CollectionSlug!]\n  $categories: [CollectionSlug!]\n  $eventTypes: [EventType!]\n  $cursor: String\n  $count: Int = 10\n  $showAll: Boolean = false\n  $identity: IdentityInputType\n) {\n  ...EventHistory_data_3WnwJ9\n}\n\nfragment AccountLink_data on AccountType {\n  address\n  chain {\n    identifier\n    id\n  }\n  user {\n    username\n    id\n  }\n  ...ProfileImage_data\n  ...wallet_accountKey\n}\n\nfragment AssetCell_asset on AssetType {\n  collection {\n    name\n    id\n  }\n  name\n  ...AssetMedia_asset\n  ...asset_url\n}\n\nfragment AssetCell_assetBundle on AssetBundleType {\n  assetQuantities(first: 2) {\n    edges {\n      node {\n        asset {\n          collection {\n            name\n            id\n          }\n          name\n          ...AssetMedia_asset\n          ...asset_url\n          id\n        }\n        relayId\n        id\n      }\n    }\n  }\n  name\n  slug\n}\n\nfragment AssetMedia_asset on AssetType {\n  animationUrl\n  backgroundColor\n  collection {\n    description\n    displayData {\n      cardDisplayStyle\n    }\n    imageUrl\n    hidden\n    name\n    slug\n    id\n  }\n  description\n  name\n  tokenId\n  imageUrl\n}\n\nfragment AssetQuantity_data on AssetQuantityType {\n  asset {\n    ...Price_data\n    id\n  }\n  quantity\n}\n\nfragment EventHistory_data_3WnwJ9 on Query {\n  assetEvents(after: $cursor, bundle: $bundle, archetype: $archetype, first: $count, categories: $categories, collections: $collections, eventTypes: $eventTypes, identity: $identity) {\n    edges {\n      node {\n        assetBundle @include(if: $showAll) {\n          ...AssetCell_assetBundle\n          id\n        }\n        assetQuantity {\n          asset @include(if: $showAll) {\n            ...AssetCell_asset\n            id\n          }\n          ...quantity_data\n          id\n        }\n        relayId\n        eventTimestamp\n        eventType\n        customEventName\n        devFee {\n          quantity\n          ...AssetQuantity_data\n          id\n        }\n        devFeePaymentEvent {\n          ...EventTimestamp_data\n          id\n        }\n        fromAccount {\n          address\n          ...AccountLink_data\n          id\n        }\n        price {\n          quantity\n          ...AssetQuantity_data\n          id\n        }\n        endingPrice {\n          quantity\n          ...AssetQuantity_data\n          id\n        }\n        seller {\n          ...AccountLink_data\n          id\n        }\n        toAccount {\n          ...AccountLink_data\n          id\n        }\n        winnerAccount {\n          ...AccountLink_data\n          id\n        }\n        ...EventTimestamp_data\n        id\n        __typename\n      }\n      cursor\n    }\n    pageInfo {\n      endCursor\n      hasNextPage\n    }\n  }\n}\n\nfragment EventTimestamp_data on AssetEventType {\n  eventTimestamp\n  transaction {\n    blockExplorerLink\n    id\n  }\n}\n\nfragment Price_data on AssetType {\n  decimals\n  imageUrl\n  symbol\n  usdSpotPrice\n  assetContract {\n    blockExplorerLink\n    id\n  }\n}\n\nfragment ProfileImage_data on AccountType {\n  imageUrl\n  address\n  chain {\n    identifier\n    id\n  }\n}\n\nfragment asset_url on AssetType {\n  assetContract {\n    account {\n      address\n      chain {\n        identifier\n        id\n      }\n      id\n    }\n    id\n  }\n  tokenId\n}\n\nfragment quantity_data on AssetQuantityType {\n  asset {\n    decimals\n    id\n  }\n  quantity\n}\n\nfragment wallet_accountKey on AccountType {\n  address\n  chain {\n    identifier\n    id\n  }\n}\n",
//     "variables": {
//       "archetype": {
//         "assetContractAddress": "0xc2c747e0f7004f9e8817db2ca4997657a7746928",
//         "tokenId": "2062"
//       },
//       "bundle": null,
//       "collections": null,
//       "categories": null,
//       "eventTypes": null,
//       "cursor": null,
//       "count": 10,
//       "showAll": false,
//       "identity": null
//     }
//   }






// graphql queries
// X-API-KEY: 0106d29713754b448f4513d7a66d0875
// PriceHistoryQuery
// Query:
// {
//   "id": "PriceHistoryQuery",
//   "query": "query PriceHistoryQuery(\n  $archetype: ArchetypeInputType\n  $bucketSize: BucketSize = WEEK\n  $cutoff: DateTime\n  $collection: CollectionSlug\n) {\n  ...PriceHistory_data_XmWqM\n}\n\nfragment PriceHistoryGraph_data on TradeHistoryType {\n  results {\n    bucketStart\n    bucketEnd\n    quantity\n    volume {\n      asset {\n        assetContract {\n          symbol\n          id\n        }\n        decimals\n        id\n      }\n      quantity\n      id\n    }\n  }\n}\n\nfragment PriceHistoryStats_data on TradeHistoryType {\n  results {\n    quantity\n    volume {\n      asset {\n        assetContract {\n          symbol\n          id\n        }\n        decimals\n        id\n      }\n      quantity\n      id\n    }\n  }\n}\n\nfragment PriceHistory_data_XmWqM on Query {\n  tradeHistory(archetype: $archetype, minTime: $cutoff, collection: $collection, bucketSize: $bucketSize) {\n    ...PriceHistoryStats_data\n    ...PriceHistoryGraph_data\n  }\n}\n",
//   "variables": {
//     "archetype": {
//       "assetContractAddress": "0xc2c747e0f7004f9e8817db2ca4997657a7746928",
//       "tokenId": "2062"
//     },
//     "bucketSize": "DAY",
//     "cutoff": null,
//     "collection": null
//   }
// }
// Response:
// {
//     "data": {
//       "tradeHistory": {
//         "results": [
//           {
//             "quantity": 1.0,
//             "volume": {
//               "asset": {
//                 "assetContract": {
//                   "symbol": "ETH",
//                   "id": "QXNzZXRDb250cmFjdFR5cGU6MjMzMQ=="
//                 },
//                 "decimals": 18,
//                 "id": "QXNzZXRUeXBlOjEzNjg5MDc3"
//               },
//               "quantity": "3464468853565120021",
//               "id": "QXNzZXRRdWFudGl0eVR5cGU6NTA2ODU1NTA5OTg3MTg2NDMwMTA1MTgzNzk2NjI1MjM2OTk1NzU="
//             },
//             "bucketStart": "2021-02-15T00:00:00",
//             "bucketEnd": "2021-02-16T00:00:00"
//           }
//         ]
//       }
//     }
//   }
// Suspect this is the Price History graph