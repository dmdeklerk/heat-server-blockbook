import * as chai from 'chai';
const { isObject, isString } = chai.assert
import 'mocha';
import { createContext, ethConfig } from './test_config'
import { nonceLookup } from '../src/modules/nonce_lookup';
import { Blockchains, NonceLookupParam, AssetTypes } from 'heat-server-common';
import { isNumber } from 'util';

describe('Nonce Lookup', () => {
  it('should work for ethereum', async () => {
    const context = createContext('nonce', { }, ethConfig)
    const param: NonceLookupParam = {
      blockchain: Blockchains.ETHEREUM,
      assetType: AssetTypes.TOKEN_TYPE_1,
      assetId: '0',
      addrXpub: '0x0F33a461848dFb9DE84cddD721ef560f3326634E'
    }
    const resp = await nonceLookup(context, param)
    console.log('response', resp)
    isObject(resp)
    isObject(resp.value)
    isString(resp.value.value)
    isNumber(parseInt(resp.value.value))
  });
});