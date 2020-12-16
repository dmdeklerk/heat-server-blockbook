"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.isUtxo = void 0;
const heat_server_common_1 = require("heat-server-common");
function isUtxo(blockchain) {
    return blockchain == heat_server_common_1.Blockchains.BITCOIN || blockchain == heat_server_common_1.Blockchains.LITECOIN ||
        blockchain == heat_server_common_1.Blockchains.BITCOIN_CASH || blockchain == heat_server_common_1.Blockchains.BITCOIN_TEST;
}
exports.isUtxo = isUtxo;
//# sourceMappingURL=blockchains.js.map