import * as chai from 'chai';
const { isObject, isNumber, isString, isArray } = chai.assert
import 'mocha';
import { createContext, ltcConfig, bchConfig, btcConfig } from './test_config'
import { utxoLookup } from '../src/modules/utxo_lookup';
import { Blockchains, AssetTypes } from 'heat-server-common';
import { BLOCKBOOK_LTC_GETADDRESS, BLOCKBOOK_BCH_SERVER } from '../src/index'

describe('Utxo Lookup', () => {
  it('should work for litecoin', async () => {
    const blockchain: Blockchains = Blockchains.LITECOIN
    const assetType: AssetTypes = AssetTypes.NATIVE
    const assetId: string = '0'
    const addrXpub: string = 'LTftqUCs7KF7d3iu9QfNU7u2Fc3bxtr6Ug'
    const context = createContext('Utxo', { getAddress: BLOCKBOOK_LTC_GETADDRESS }, ltcConfig)
    const resp = await utxoLookup(context, {
      blockchain, assetType, assetId, addrXpub,
    })
    isObject(resp)
    let result = resp.value
    isArray(result)
    for (const utxo of result) {
      isObject(utxo)
      isString(utxo.value)
      isString(utxo.txid)
      isNumber(utxo.vout)
      isNumber(utxo.confirmations)
      if (utxo.lockTime) isNumber(utxo.lockTime)
      isNumber(utxo.height)
    }
  });
  it('should work for bitcoin', async () => {
    const blockchain: Blockchains = Blockchains.LITECOIN
    const assetType: AssetTypes = AssetTypes.NATIVE
    const assetId: string = '0'
    //const addrXpub: string = '1Drvc8ihkVKWsEZWutP5R9eAAcqb8GZJLp'
    const addrXpub: string = '1Bb6D1uUcMo9Gt4imnpAkipWijMQaWtdGF'
    const context = createContext('Utxo', { }, btcConfig)
    const resp = await utxoLookup(context, {
      blockchain, assetType, assetId, addrXpub,
    })
    isObject(resp)
    let result = resp.value
    isArray(result)
    for (const utxo of result) {
      isObject(utxo)
      isString(utxo.value)
      isString(utxo.txid)
      isNumber(utxo.vout)
      isNumber(utxo.confirmations)
      if (utxo.lockTime) isNumber(utxo.lockTime)
      isNumber(utxo.height)
    }
  });
  

  it('should work for bitcoin cash', async () => {
    const blockchain: Blockchains = Blockchains.BITCOIN_CASH
    const assetType: AssetTypes = AssetTypes.NATIVE
    const assetId: string = '0'
    const addrXpub: string = 'bitcoincash:qqgwqfn6qjavqmeux499gvvwavqqq8nf3urmtctasd'
    const context = createContext('Utxo', { getAddress: BLOCKBOOK_BCH_SERVER }, bchConfig)
    const resp = await utxoLookup(context, {
      blockchain, assetType, assetId, addrXpub,
    })
    isObject(resp)
    let result = resp.value
    isArray(result)
    for (const utxo of result) {
      isObject(utxo)
      isString(utxo.value)
      isString(utxo.txid)
      isNumber(utxo.vout)
      isNumber(utxo.confirmations)
      if (utxo.lockTime) isNumber(utxo.lockTime)
      isNumber(utxo.height)
    }
  });  
});