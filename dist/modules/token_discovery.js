"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.tokenDiscovery = void 0;
const heat_server_common_1 = require("heat-server-common");
const lodash_1 = require("lodash");
async function tokenDiscovery(context, param) {
    try {
        const { req, protocol, host, logger, middleWare } = context;
        const { addrXpub } = param;
        const addrXpub_ = middleWare && lodash_1.isFunction(middleWare.getAddress)
            ? await middleWare.getAddress(addrXpub)
            : addrXpub;
        const url = `${protocol}://${host}/api/v2/address/${addrXpub_}?details=tokenBalances`;
        const json = await req.get(url);
        const data = heat_server_common_1.tryParse(json, logger);
        if (!data.balance && !data.tokens) {
            return {
                error: 'Invalid api response',
            };
        }
        const value = [];
        const exists = data.txs > 0;
        value.push({
            assetId: '0',
            assetType: heat_server_common_1.AssetTypes.NATIVE,
            value: data.balance || '0',
            exists,
        });
        if (data.tokens) {
            data.tokens.forEach(entry => {
                value.push({
                    assetId: entry.contract,
                    assetType: heat_server_common_1.AssetTypes.TOKEN_TYPE_1,
                    value: entry.balance || '0',
                    exists,
                });
            });
        }
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
exports.tokenDiscovery = tokenDiscovery;
//# sourceMappingURL=token_discovery.js.map