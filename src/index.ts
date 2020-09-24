import Big from 'big.js';
import { address as bitcoinAddress } from 'bitcoinjs-lib';
import { toCashAddress } from 'bchaddrjs';

export * from './explorer'

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

// Blockbook BCH server
export const BLOCKBOOK_BCH_SERVER = function(address) {
  // https://github.com/bitcoincashjs/bchaddrjs/#translate-address-from-any-address-format-into-a-specific-format
  try {
    return toCashAddress(address);
  } catch (err) {
    console.error(err);
  }
  return address;
};