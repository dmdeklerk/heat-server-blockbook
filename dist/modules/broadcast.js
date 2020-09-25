"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.broadcast = void 0;
const heat_server_common_1 = require("heat-server-common");
async function broadcast(context, param) {
    try {
        const { req, protocol, host, logger } = context;
        const { transactionHex } = param;
        const url = `${protocol}://${host}/api/v2/sendtx/${transactionHex}`;
        const json = await req.get(url, {}, [200, 400]);
        const data = heat_server_common_1.tryParse(json, logger);
        if (data.error) {
            return {
                value: {
                    errorMessage: data.error.message || data.error,
                },
            };
        }
        else if (data.result) {
            return {
                value: {
                    transactionId: data.result,
                },
            };
        }
        else {
            return {
                error: `Unregognized response: ${JSON.stringify(data)}`,
            };
        }
    }
    catch (e) {
        return {
            error: e.message,
        };
    }
}
exports.broadcast = broadcast;
//# sourceMappingURL=broadcast.js.map