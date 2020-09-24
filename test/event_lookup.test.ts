import * as chai from 'chai';
const { isObject, isNumber, isString, isArray } = chai.assert
import 'mocha';
import { createContext, ethConfig, ltcConfig, isNonEmptyArrayOfUniqueStrings } from './test_config'
import { eventLookup } from '../src/modules/event_lookup';
import { Blockchains, AssetTypes } from 'heat-server-common';

describe('Event Lookup', () => {
  it('should work for ethereum native', async () => {
    const blockchain: Blockchains = Blockchains.ETHEREUM
    const assetType: AssetTypes = AssetTypes.NATIVE
    const assetId: string = '0'
    const addrXpub: string = '0x0F33a461848dFb9DE84cddD721ef560f3326634E'
    const from: number = 0
    const to: number = 100
    const minimal: boolean = false

    const context = createContext('Event', {}, ethConfig)
    const resp = await eventLookup(context, {
      blockchain, assetType, assetId, addrXpub, from, to, minimal
    })
    testResponse(resp)

    // test minimal
    const respMinimal = await eventLookup(context, {
      blockchain, assetType, assetId, addrXpub, from, to, minimal:true
    })    
    isObject(respMinimal)
    isNonEmptyArrayOfUniqueStrings(respMinimal.value)    
  });

  it('should work for ethereum erc20', async () => {
    const blockchain: Blockchains = Blockchains.ETHEREUM
    const assetType: AssetTypes = AssetTypes.TOKEN_TYPE_1
    const assetId: string = '0x45245bc59219eeaaf6cd3f382e078a461ff9de7b'
    const addrXpub: string = '0x0F33a461848dFb9DE84cddD721ef560f3326634E'
    const from: number = 0
    const to: number = 100
    const minimal: boolean = false

    const context = createContext('Event', {}, ethConfig)
    const resp = await eventLookup(context, {
      blockchain, assetType, assetId, addrXpub, from, to, minimal
    })
    testResponse(resp)

    // test minimal
    const respMinimal = await eventLookup(context, {
      blockchain, assetType, assetId, addrXpub, from, to, minimal:true
    })    
    isObject(respMinimal)
    isNonEmptyArrayOfUniqueStrings(respMinimal.value)    
  });  

  it('should work for litecoin native', async () => {
    const blockchain: Blockchains = Blockchains.LITECOIN
    const assetType: AssetTypes = AssetTypes.NATIVE
    const assetId: string = '0'
    const addrXpub: string = 'LTftqUCs7KF7d3iu9QfNU7u2Fc3bxtr6Ug'
    const from: number = 0
    const to: number = 100
    const minimal: boolean = false

    const context = createContext('Event', {}, ltcConfig)
    const resp = await eventLookup(context, {
      blockchain, assetType, assetId, addrXpub, from, to, minimal
    })
    testResponse(resp)

    // test minimal
    const respMinimal = await eventLookup(context, {
      blockchain, assetType, assetId, addrXpub, from, to, minimal:true
    })    
    isObject(respMinimal)
    isNonEmptyArrayOfUniqueStrings(respMinimal.value)
  });  
});

function testResponse(resp) {
  isObject(resp)
  let result = resp.value
  isArray(result)
  for (const entry of result) {
    isObject(entry)
    isNumber(entry.timestamp)
    isString(entry.sourceId)
    isNumber(entry.sourceType)
    isNumber(entry.confirmations)
    isArray(entry.events)
    for (const event of entry.events) {
      isObject(event)
      isNumber(event.type)
      isNumber(event.assetType)
      isString(event.assetId)
      isArray(event.data)
    }
  }
}