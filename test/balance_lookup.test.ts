import * as chai from 'chai';
const { isObject, isBoolean, isString } = chai.assert
import 'mocha';
import { createContext, ltcConfig, ethConfig } from './test_config'
import { balanceLookup } from '../src/modules/balance_lookup';
import { Blockchains, AssetTypes } from 'heat-server-common';
import { BLOCKBOOK_LTC_GETADDRESS } from '../src/index'

describe('Balance Lookup', () => {
  
  it('should work for litecoin', async () => {
    const blockchain: Blockchains = Blockchains.LITECOIN
    const assetType: AssetTypes = AssetTypes.NATIVE
    const assetId: string = '0'
    const addrXpub: string = 'LTftqUCs7KF7d3iu9QfNU7u2Fc3bxtr6Ug'    
    const context = createContext('Balance', { getAddress: BLOCKBOOK_LTC_GETADDRESS }, ltcConfig)
    let resp = await balanceLookup(context, {
      blockchain, assetType, assetId, addrXpub
    })
    // console.log('response', resp)
    isObject(resp)
    let result = resp.value
    isObject(result)
    isBoolean(result.exists)
    isString(result.value)
  });

  it('should work for ethereum', async () => {
    const blockchain: Blockchains = Blockchains.ETHEREUM
    const assetType: AssetTypes = AssetTypes.NATIVE
    const assetId: string = '0'
    const addrXpub: string = '0x0F33a461848dFb9DE84cddD721ef560f3326634E'    
    let resp = await balanceLookup(createContext('Balance', { getAddress: (v) => v }, ethConfig), {
      blockchain, assetType, assetId, addrXpub
    })
    // console.log('response', resp)
    isObject(resp)
    let result = resp.value
    isObject(result)
    isBoolean(result.exists)
    isString(result.value)
  });

});