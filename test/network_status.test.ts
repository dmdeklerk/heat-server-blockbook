import * as chai from 'chai';
const { isObject, isTrue, isNumber, isString } = chai.assert
import 'mocha';
import { createContext, ethConfig, ltcConfig } from './test_config'
import { networkStatus } from '../src/modules/network_status';
import { Blockchains } from 'heat-server-common';

describe('Network Status', () => {
  it('should work for ethereum', async () => {
    const blockchain: Blockchains = Blockchains.ETHEREUM
    const context = createContext('Status', {}, ethConfig)    
    const resp = await networkStatus(context, {blockchain})
    isObject(resp)
    let result = resp.value
    isObject(result)
    isTrue(result.lastBlockTime instanceof Date)
    isNumber(result.lastBlockHeight)
    isString(result.lastBlockId)
  });

  it('should work for litecoin', async () => {
    const blockchain: Blockchains = Blockchains.LITECOIN
    const context = createContext('Status', {}, ltcConfig)    
    const resp = await networkStatus(context, {blockchain})
    isObject(resp)
    let result = resp.value
    isObject(result)
    isTrue(result.lastBlockTime instanceof Date)
    isNumber(result.lastBlockHeight)
    isString(result.lastBlockId)
  });  
});