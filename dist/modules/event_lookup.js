"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.eventLookup = void 0;
const heat_server_common_1 = require("heat-server-common");
const lodash_1 = require("lodash");
const token_discovery_1 = require("./token_discovery");
async function eventLookup(context, param) {
    try {
        const { req, protocol, host, logger, middleWare } = context;
        const { blockchain, assetType, assetId, addrXpub, from, to, minimal } = param;
        const addrXpub_ = middleWare && lodash_1.isFunction(middleWare.getAddress)
            ? await middleWare.getAddress(addrXpub)
            : addrXpub;
        const pageSize = to - from;
        const page = Math.round(to / pageSize);
        const body = await eventsLookupReq(context, blockchain, assetType, assetId, addrXpub_, page, pageSize, minimal);
        const data = heat_server_common_1.tryParse(body, logger);
        if (!lodash_1.isNumber(data.page)) {
            return {
                error: 'Invalid api response',
            };
        }
        if (data.page != page) {
            return {
                value: [],
            };
        }
        let value;
        if (minimal) {
            value = data.txids || [];
        }
        else {
            value = [];
            if (data.transactions) {
                for (let i = 0; i < data.transactions.length; i++) {
                    let txData = data.transactions[i];
                    let events = await getEventsFromTransaction(context, txData, addrXpub_, addrXpub);
                    events.forEach(event => {
                        event.data = heat_server_common_1.createEventData(event);
                    });
                    value.push({
                        timestamp: txData.blockTime * 1000,
                        sourceId: txData.txid,
                        sourceType: heat_server_common_1.SourceTypes.TRANSACTION,
                        confirmations: txData.confirmations,
                        events,
                    });
                }
                logger.log(`Blockbook.eventsLookup ${heat_server_common_1.prettyPrint({
                    blockchain,
                    assetType,
                    assetId,
                    addrXpub,
                    from,
                    to,
                    minimal,
                    value: `Array(${value.length})`,
                })}`);
            }
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
exports.eventLookup = eventLookup;
async function eventsLookupReq(context, blockchain, assetType, assetId, addrXpub, page, pageSize, minimal) {
    const { req, protocol, host, logger } = context;
    let url = null;
    const details = minimal ? 'txids' : 'txs';
    if (blockchain == heat_server_common_1.Blockchains.ETHEREUM) {
        if (assetType == heat_server_common_1.AssetTypes.TOKEN_TYPE_1) {
            const filter = await getFilterIndexForContract(context, blockchain, assetType, assetId, addrXpub);
            url = `${protocol}://${host}/api/v2/address/${addrXpub}?details=${details}&page=${page}&pageSize=${pageSize}&filter=${filter}`;
        }
        else if (assetType == heat_server_common_1.AssetTypes.NATIVE) {
            url = `${protocol}://${host}/api/v2/address/${addrXpub}?details=${details}&page=${page}&pageSize=${pageSize}&filter=0`;
        }
    }
    else {
        url = `${protocol}://${host}/api/v2/address/${addrXpub}?details=${details}&page=${page}&pageSize=${pageSize}`;
    }
    let response = await req.get(url);
    logger.log(`EVENT LOOKUP ${url} ${heat_server_common_1.prettyPrint(response)}`);
    return response;
}
async function getFilterIndexForContract(context, blockchain, assetType, assetId, addrXpub) {
    const { logger } = context;
    const response = await token_discovery_1.tokenDiscovery(context, { blockchain, assetType, addrXpub });
    const { value } = response;
    if (value) {
        assetId = assetId.toLowerCase();
        for (let i = 1; i < value.length; i++) {
            if (value[i].assetType == assetType &&
                heat_server_common_1.compareCaseInsensitive(value[i].assetId, assetId)) {
                return i;
            }
        }
    }
    logger.warn(`could not determine filter index ${heat_server_common_1.prettyPrint({
        blockchain,
        assetType,
        assetId,
        addrXpub,
        response,
    })}`);
    throw new Error('Could not determine filter index');
}
async function getEventsFromTransaction(context, txData, addrXpub, originalAddrXpub) {
    const { logger } = context;
    try {
        const vin = txData.vin || [];
        const vout = txData.vout || [];
        const tokenTransfers = txData.tokenTransfers || [];
        const value = txData.value || '0';
        const fees = txData.fees || '0';
        const events = [];
        const isAccountBased = vin[0] && !lodash_1.isString(vin[0].hex);
        if (isAccountBased) {
            vin.forEach(input => {
                if (heat_server_common_1.compareCaseInsensitive(input.addresses && input.addresses[0], addrXpub) &&
                    value != '0') {
                    const address = vout[0].addresses ? vout[0].addresses[0] : '0';
                    events.push(heat_server_common_1.buildEventSend(address, heat_server_common_1.AssetTypes.NATIVE, '0', value, input.n));
                }
            });
        }
        if (isAccountBased) {
            vout.forEach(output => {
                if (heat_server_common_1.compareCaseInsensitive(output.addresses && output.addresses[0], addrXpub)) {
                    const address = vin[0].addresses ? vin[0].addresses[0] : '0';
                    events.push(heat_server_common_1.buildEventReceive(address, heat_server_common_1.AssetTypes.NATIVE, '0', output.value, output.n));
                }
            });
        }
        if (isAccountBased) {
            tokenTransfers.forEach((transfer, index) => {
                if (heat_server_common_1.compareCaseInsensitive(transfer.from, addrXpub)) {
                    events.push(heat_server_common_1.buildEventSend(transfer.to, heat_server_common_1.AssetTypes.TOKEN_TYPE_1, transfer.token, transfer.value, index));
                }
                else {
                    events.push(heat_server_common_1.buildEventReceive(transfer.from, heat_server_common_1.AssetTypes.TOKEN_TYPE_1, transfer.token, transfer.value, index));
                }
            });
        }
        if (!isAccountBased) {
            vin.forEach(input => {
                const { addresses, value, n } = input;
                const address = addresses ? addresses[0] || '' : '';
                const _address = replaceAddrXpubWithOriginalAddrXpub(address, addrXpub, originalAddrXpub);
                events.push(heat_server_common_1.buildEventInput(_address, heat_server_common_1.AssetTypes.NATIVE, '0', value, n));
            });
        }
        if (!isAccountBased) {
            vout.forEach(output => {
                let { addresses, value, n } = output;
                const address = addresses ? addresses[0] || '' : '';
                const _address = replaceAddrXpubWithOriginalAddrXpub(address, addrXpub, originalAddrXpub);
                events.push(heat_server_common_1.buildEventOutput(_address, heat_server_common_1.AssetTypes.NATIVE, '0', value, n));
            });
        }
        let outbound = !!vin.find(input => {
            const { addresses } = input;
            const address = addresses ? addresses[0] || '' : '';
            return heat_server_common_1.compareCaseInsensitive(address, addrXpub);
        });
        if (outbound && parseInt(fees) > 0) {
            events.push(heat_server_common_1.buildEventFee(fees));
        }
        return events;
    }
    catch (e) {
        logger.error(e);
        throw e;
    }
}
function replaceAddrXpubWithOriginalAddrXpub(address, ourAddrXpub, originalAddrXpub) {
    if (heat_server_common_1.compareCaseInsensitive(address, ourAddrXpub)) {
        return originalAddrXpub;
    }
    return address;
}
//# sourceMappingURL=event_lookup.js.map