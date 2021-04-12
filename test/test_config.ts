import { MonitoredRequest, CallContext, ExplorerMiddleware, createLogger } from 'heat-server-common';
import * as chai from 'chai';
const { isArray, isTrue, isString } = chai.assert

// // litecoin
// export const ltcConfig = {
//   protocol: 'https',
//   host: 'ltc1.heatwallet.com'
// }

// // bitcoin cash
// export const bchConfig = {
//   protocol: 'https',
//   host: 'bch1.heatwallet.com'
// }

// // ethereum
// export const ethConfig = {
//   protocol: 'https',
//   host: 'eth1.heatwallet.com'
// }

// // bitcoin
// export const btcConfig = {
//   protocol: 'https',
//   host: 'btc1.heatwallet.com'
// }

// litecoin
export const ltcConfig = {
  protocol: 'https',
  host: 'ltc1.trezor.io'
}

// bitcoin cash
export const bchConfig = {
  protocol: 'https',
  host: 'bch1.trezor.io'
}

// ethereum
export const ethConfig = {
  protocol: 'https',
  host: 'eth1.trezor.io'
}

// bitcoin
export const btcConfig = {
  protocol: 'https',
  host: 'btc1.trezor.io'
}

export function createContext(label?: string, middleWare?: ExplorerMiddleware, testConfig?: {protocol:string,host:string}): CallContext {
  let { host, protocol } = testConfig;
  let logger = createLogger(label)
  let context: CallContext = {
    host,
    protocol,
    logger,
    req: new MonitoredRequest(logger, label ? label : ''),
    middleWare: middleWare
  }
  return context
}

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
