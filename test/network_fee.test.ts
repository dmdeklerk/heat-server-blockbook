import * as chai from 'chai';
const { isObject, isString } = chai.assert
import 'mocha';
import { createContext, ltcConfig, ethConfig } from './test_config'
import { networkFee } from '../src/modules/network_fee';
import { Blockchains } from 'heat-server-common';
import { BLOCKBOOK_UTXO_NETWORK_FEE, BLOCKBOOK_ETH_NETWORK_FEE } from '../src/index';

describe('Network Fee', () => {

  /// Litecoin
  it('should work for litecoin', async () => {
    const context = createContext('Fee', { getNetworkFee: BLOCKBOOK_UTXO_NETWORK_FEE }, ltcConfig)
    const resp = await networkFee(context, { blockchain: Blockchains.LITECOIN })
    //console.log('response', resp)
    isObject(resp)
    let result = resp.value
    isObject(result)
    isString(result.satByte)
  });

  /// Ethereum
  it('should work for ethereum', async () => {
    const context = createContext('Fee', { getNetworkFee: BLOCKBOOK_ETH_NETWORK_FEE }, ethConfig)
    const resp = await networkFee(context, { blockchain: Blockchains.ETHEREUM })
    //console.log('response', resp)
    isObject(resp)
    let result = resp.value
    isObject(result)
    isString(result.gasPriceWei)
  });

});