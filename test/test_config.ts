import { Logger } from '@nestjs/common';
import { MonitoredRequest, CallContext, ExplorerMiddleware } from 'heat-server-common';
import Big from 'big.js';
import { address as bitcoinAddress } from 'bitcoinjs-lib';
import * as chai from 'chai';
const { isArray, isTrue, isString } = chai.assert

// litecoin
export const ltcConfig = {
  protocol: 'https',
  host: 'ltc1.heatwallet.com'
}

// ethereum
export const ethConfig = {
  protocol: 'https',
  host: 'eth1.heatwallet.com'
}

export function createContext(label?: string, middleWare?: ExplorerMiddleware, testConfig?: {protocol:string,host:string}): CallContext {
  let { host, protocol } = testConfig;
  let logger = new Logger()
  let context: CallContext = {
    host,
    protocol,
    logger,
    req: new MonitoredRequest(logger, label ? label : ''),
    middleWare: middleWare
  }
  return context
}

// Value is GasPrice in ETH 0.000000001, must return as WEI 10^18
const WEI = new Big(10).pow(18);
export const BLOCKBOOK_ETH_NETWORK_FEE = function (input) {
  console.log(`WEI = ${WEI}`);
  return {
    gasPriceWei: new Big(input).times(WEI).toString(),
  };
};

// Value is BTC per 1000 byte 0.00010717, must return as SATOSHI 10^8 and per single byte
const SATOSHI = new Big(10).pow(8);
export const BLOCKBOOK_UTXO_NETWORK_FEE = function (input) {
  console.log(`SATOSHI = ${SATOSHI}, input = ${input}`);
  return {
    satByte: new Big(input)
      .times(SATOSHI)
      .div(1000)
      .round()
      .toString(),
  };
};

// Blockbook LTC server
export const BLOCKBOOK_LTC_GETADDRESS = function(address) {
  // https://litecoin-project.github.io/p2sh-convert/
  try {
    if ((address || '').startsWith('M')) return address;
    let decoded = bitcoinAddress.fromBase58Check(address);
    let version = decoded['version'];
    return bitcoinAddress.toBase58Check(decoded['hash'], version);
  } catch (err) {
    console.error(err);
  }
  return address;
};

export function isNonEmptyArrayOfUniqueStrings(value: Array<string> | any) {
  const set = new Set()
  isArray(value)
  isTrue(value.length > 0)
  for (let i=0; i<value.length; i++) {
    isString(value[i])
    isTrue(!set.has(value[i]), `Duplicate entry "${value[i]}"`)
    set.add(value[i])
  }
}
