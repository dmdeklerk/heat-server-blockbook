"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.broadcast = void 0;
const heat_server_common_1 = require("heat-server-common");
async function broadcast(context, param) {
    try {
        const { req, protocol, host, logger } = context;
        const { transactionHex } = param;
        const url = `${protocol}://${host}/api/BROADCAST`;
        const json = await req.post(url, { form: { transactionBytes: transactionHex } }, [200]);
        const data = heat_server_common_1.tryParse(json, logger);
        return {
            value: {
                transactionId: '0x12345',
                errorMessage: undefined,
            },
        };
    }
    catch (e) {
        return {
            error: e.message,
        };
    }
}
exports.broadcast = broadcast;
//# sourceMappingURL=broadcast.js.map