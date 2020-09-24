import * as chai from 'chai';
const { isObject, isNumber, isString, isArray, isBoolean } = chai.assert
import 'mocha';
import { createContext, ltcConfig, ethConfig } from './test_config'
import { tokenDiscovery } from '../src/modules/token_discovery';
import { Blockchains, AssetTypes } from 'heat-server-common';

describe('Token Discovery', () => {
  
  /// Litecoin
  it('should work for litecoin', async () => {
    const blockchain: Blockchains = Blockchains.LITECOIN
    const assetType: AssetTypes = AssetTypes.NATIVE
    const addrXpub: string = 'LTftqUCs7KF7d3iu9QfNU7u2Fc3bxtr6Ug'
    let resp = await tokenDiscovery(createContext('Token', {}, ltcConfig), {
      blockchain, assetType, addrXpub
    })
    //console.log('response', resp)
    isObject(resp)
    let result = resp.value
    isArray(result)
    for (const token of result) {
      isObject(token)
      isString(token.assetId)
      isNumber(token.assetType)
      isString(token.value)
      isBoolean(token.exists)
    }
  });

  /// Ethereum
  it('should work for ethereum', async () => {
    const blockchain: Blockchains = Blockchains.ETHEREUM
    const assetType: AssetTypes = AssetTypes.TOKEN_TYPE_1
    const addrXpub: string = '0x0F33a461848dFb9DE84cddD721ef560f3326634E'
    let resp = await tokenDiscovery(createContext('Token', {}, ethConfig), {
      blockchain, assetType, addrXpub
    })
    //console.log('response', resp)
    isObject(resp)
    let result = resp.value
    isArray(result)
    for (const token of result) {
      isObject(token)
      isString(token.assetId)
      isNumber(token.assetType)
      isString(token.value)
      isBoolean(token.exists)
    }
  });
});