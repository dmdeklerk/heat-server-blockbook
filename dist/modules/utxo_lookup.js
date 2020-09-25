"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.utxoLookup = void 0;
const heat_server_common_1 = require("heat-server-common");
const lodash_1 = require("lodash");
async function utxoLookup(context, param) {
    try {
        const { req, protocol, host, logger, middleWare } = context;
        const { addrXpub } = param;
        const addrXpub_ = middleWare && lodash_1.isFunction(middleWare.getAddress)
            ? await middleWare.getAddress(addrXpub)
            : addrXpub;
        const url = `${protocol}://${host}/api/v2/utxo/${addrXpub_}`;
        const json = await req.get(url);
        const data = heat_server_common_1.tryParse(json, logger);
        if (!Array.isArray(data)) {
            return {
                error: 'Invalid api response',
            };
        }
        const value = [];
        data.forEach(tx => {
            value.push({
                value: tx.value,
                txid: tx.txid,
                vout: tx.vout,
                confirmations: tx.confirmations,
                lockTime: tx.lockTime,
                height: tx.height,
            });
        });
        return {
            value,
        };
    }
    catch (e) {
        return {
            error: e.message,
        };
    }
}
exports.utxoLookup = utxoLookup;
//# sourceMappingURL=utxo_lookup.js.map