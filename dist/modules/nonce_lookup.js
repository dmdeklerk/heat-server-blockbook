"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.nonceLookup = void 0;
const heat_server_common_1 = require("heat-server-common");
const lodash_1 = require("lodash");
async function nonceLookup(context, param) {
    try {
        const { req, protocol, host, logger, middleWare } = context;
        const { blockchain, assetType, addrXpub, assetId } = param;
        const addrXpub_ = lodash_1.isFunction(middleWare.getAddress) ? await middleWare.getAddress(addrXpub) : addrXpub;
        const url = `${protocol}://${host}/api/v2/address/${addrXpub_}?details=basic`;
        const json = await req.get(url);
        const data = heat_server_common_1.tryParse(json, logger);
        return {
            value: {
                value: data['nonce']
            }
        };
    }
    catch (e) {
        return {
            error: e.message,
        };
    }
}
exports.nonceLookup = nonceLookup;
//# sourceMappingURL=nonce_lookup.js.map