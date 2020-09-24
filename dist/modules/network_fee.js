"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.networkFee = void 0;
const heat_server_common_1 = require("heat-server-common");
const lodash_1 = require("lodash");
async function networkFee(context, param) {
    try {
        const { req, protocol, host, logger, middleWare } = context;
        const { blockchain } = param;
        const { feeBlocks } = heat_server_common_1.BlockchainConfig[blockchain];
        const url = `${protocol}://${host}/api/v2/estimatefee/${feeBlocks}?conservative=true`;
        const json = await req.get(url);
        const data = heat_server_common_1.tryParse(json, logger);
        if (!data || lodash_1.isUndefined(data.result)) {
            return {
                error: 'Invalid api response',
            };
        }
        const value = middleWare.getNetworkFee(data.result);
        if (!value) {
            return {
                error: `Middleware invalid network fee ${data.result}`,
            };
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
exports.networkFee = networkFee;
//# sourceMappingURL=network_fee.js.map