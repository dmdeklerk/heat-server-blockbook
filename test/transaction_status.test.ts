import * as chai from 'chai';
const { isObject, isNumber, isBoolean } = chai.assert
import 'mocha';
import { createContext, ethConfig } from './test_config'
import { transactionStatus } from '../src/modules/transaction_status';
import { Blockchains, AssetTypes } from 'heat-server-common';

describe('Transaction Status', () => {
  it('should work for ethereum', async () => {
    const blockchain: Blockchains = Blockchains.ETHEREUM
    const assetType: AssetTypes = AssetTypes.NATIVE
    const addrXpub: string = '0x0F33a461848dFb9DE84cddD721ef560f3326634E'
    const transactionId: string = '0xfd3d1fecaf66c40b9c54f129d97fd9fa6ac8cda12d72cb323b4ad6a1334a2c4c'
    const context = createContext('Transaction', {}, ethConfig)
    const resp = await transactionStatus(context, {
      blockchain, assetType, addrXpub, transactionId
    })
    //console.log('response', resp)
    isObject(resp)
    let result = resp.value
    isObject(result)
    isNumber(result.confirmations)
    isBoolean(result.isAccepted)
  });
  it('should work for litecoin', async () => {
    const blockchain: Blockchains = Blockchains.LITECOIN
    const assetType: AssetTypes = AssetTypes.NATIVE
    const addrXpub: string = 'LTftqUCs7KF7d3iu9QfNU7u2Fc3bxtr6Ug'
    const transactionId: string = '9fd7b2163ecad7b46f9adcf606f984bec5cc8a21ea32633113594f4ef4b9ec9c'
    const context = createContext('Transaction', {}, ethConfig)
    const resp = await transactionStatus(context, {
      blockchain, assetType, addrXpub, transactionId
    })
    //console.log('response', resp)
    isObject(resp)
    let result = resp.value
    isObject(result)
    isNumber(result.confirmations)
    isBoolean(result.isAccepted)
  });  
});