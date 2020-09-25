"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.transactionStatus = void 0;
const heat_server_common_1 = require("heat-server-common");
const lodash_1 = require("lodash");
async function transactionStatus(context, param) {
    try {
        const { req, protocol, host, logger } = context;
        const { transactionId } = param;
        const url = `${protocol}://${host}/api/v2/tx/${transactionId}`;
        const json = await req.get(url, {}, [200, 400]);
        const transaction = heat_server_common_1.tryParse(json, logger);
        if (lodash_1.isObjectLike(transaction) &&
            lodash_1.isNumber(transaction.confirmations)) {
            return {
                value: {
                    isAccepted: true,
                    confirmations: transaction.confirmations,
                },
            };
        }
        else if (lodash_1.isObjectLike(transaction) &&
            !lodash_1.isUndefined(transaction.error)) {
            return {
                value: {
                    isAccepted: false,
                    confirmations: 0,
                },
            };
        }
        else {
            return {
                error: 'Invalid api response',
            };
        }
    }
    catch (e) {
        return {
            error: e.message,
        };
    }
}
exports.transactionStatus = transactionStatus;
//# sourceMappingURL=transaction_status.js.map