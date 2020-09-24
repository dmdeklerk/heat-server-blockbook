"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.networkStatus = void 0;
const heat_server_common_1 = require("heat-server-common");
const lodash_1 = require("lodash");
async function networkStatus(context, param) {
    try {
        const { req, protocol, host, logger } = context;
        const url = `${protocol}://${host}/api/v2`;
        const json = await req.get(url);
        const data = heat_server_common_1.tryParse(json, logger);
        if (lodash_1.isObjectLike(data) &&
            lodash_1.isObjectLike(data.blockbook) &&
            !data.blockbook.inSync) {
            return {
                error: 'Blockbook server not in sync',
            };
        }
        const lastBlockTime = new Date(Date.parse(data.blockbook.lastBlockTime));
        const lastBlockHeight = data.backend.blocks;
        const lastBlockId = data.backend.bestBlockHash;
        return {
            value: {
                lastBlockTime,
                lastBlockHeight,
                lastBlockId,
            },
        };
    }
    catch (e) {
        return {
            error: e.message,
        };
    }
}
exports.networkStatus = networkStatus;
//# sourceMappingURL=network_status.js.map