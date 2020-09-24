"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    Object.defineProperty(o, k2, { enumerable: true, get: function() { return m[k]; } });
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __exportStar = (this && this.__exportStar) || function(m, exports) {
    for (var p in m) if (p !== "default" && !Object.prototype.hasOwnProperty.call(exports, p)) __createBinding(exports, m, p);
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.BLOCKBOOK_BCH_SERVER = exports.BLOCKBOOK_LTC_GETADDRESS = exports.BLOCKBOOK_UTXO_NETWORK_FEE = exports.BLOCKBOOK_ETH_NETWORK_FEE = void 0;
const big_js_1 = require("big.js");
const bitcoinjs_lib_1 = require("bitcoinjs-lib");
const bchaddrjs_1 = require("bchaddrjs");
__exportStar(require("./explorer"), exports);
const WEI = new big_js_1.default(10).pow(18);
exports.BLOCKBOOK_ETH_NETWORK_FEE = function (input) {
    console.log(`WEI = ${WEI}`);
    return {
        gasPriceWei: new big_js_1.default(input).times(WEI).toString(),
    };
};
const SATOSHI = new big_js_1.default(10).pow(8);
exports.BLOCKBOOK_UTXO_NETWORK_FEE = function (input) {
    console.log(`SATOSHI = ${SATOSHI}, input = ${input}`);
    return {
        satByte: new big_js_1.default(input)
            .times(SATOSHI)
            .div(1000)
            .round()
            .toString(),
    };
};
exports.BLOCKBOOK_LTC_GETADDRESS = function (address) {
    try {
        if ((address || '').startsWith('M'))
            return address;
        let decoded = bitcoinjs_lib_1.address.fromBase58Check(address);
        let version = decoded['version'];
        return bitcoinjs_lib_1.address.toBase58Check(decoded['hash'], version);
    }
    catch (err) {
        console.error(err);
    }
    return address;
};
exports.BLOCKBOOK_BCH_SERVER = function (address) {
    try {
        return bchaddrjs_1.toCashAddress(address);
    }
    catch (err) {
        console.error(err);
    }
    return address;
};
//# sourceMappingURL=index.js.map