import * as chai from 'chai';
const { isObject, isTrue, isNumber, isString } = chai.assert
import 'mocha';
import { createContext } from './test_config'
import { broadcast } from '../src/modules/broadcast';
import { Blockchains, AssetTypes } from 'heat-server-common';

// describe('Broadcast', () => {
//   it('should work', async () => {
//     const blockchain = Blockchains.ETHEREUM
//     const transactionHex = '0x12345'
//     const assetType = AssetTypes.NATIVE
//     let resp = await broadcast(createContext('Status'), {
//       blockchain, transactionHex, assetType
//     })
//     //console.log('response', resp)
//     isObject(resp)
//     let result = resp.value
//     isObject(result)
//     isString(result.transactionId)
//     isString(result.errorMessage)
//   });
// });