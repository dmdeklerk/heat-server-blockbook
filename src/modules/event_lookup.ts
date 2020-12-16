import { EventLookupParam, EventLookupResult, EventLookupEvent, tryParse, SourceTypes, CallContext, ModuleResponse, Blockchains, AssetTypes, MonitoredRequest, prettyPrint, compareCaseInsensitive, buildEventSend, buildEventReceive, buildEventInput, buildEventOutput, buildEventFee, createEventData } from 'heat-server-common'
import { isFunction, isNumber } from 'lodash';
import { tokenDiscovery } from './token_discovery'
import { isUtxo } from '../blockchains'

export async function eventLookup(context: CallContext, param: EventLookupParam): Promise<ModuleResponse<Array<EventLookupResult>>> {
  try {
    const { logger, middleWare } = context
    const { blockchain, assetType, assetId, addrXpub, from, to, minimal } = param
    const addrXpub_ =
      middleWare && isFunction(middleWare.getAddress)
        ? await middleWare.getAddress(addrXpub)
        : addrXpub;
    const pageSize = to - from;
    const page = Math.round(to / pageSize);
    const body = await eventsLookupReq(
      context,
      blockchain,
      assetType,
      assetId,
      addrXpub_,
      page,
      pageSize,
      minimal,
    );
    const data = tryParse(body, logger);

    // ==========================================================================================
    // When NO {page} property is provided this indicates an error (could be the indexer is not
    // ready) we return an error in this case so the ExplorerService will retry a different node.
    // ==========================================================================================
    if (!isNumber(data.page)) {
      return {
        error: 'Invalid api response',
      };
    }

    // ==========================================================================================
    // blockbook always indicates the page of the result set as well as the number of pages
    // in total. when a resultset consists of 1 page and you request the second page, blockbook
    // will return the first page and indicate thats the case through its {page} property in the
    // response.
    // when we find the response {page} not to match the {page} we requested we return an
    // empty result set.
    // ==========================================================================================
    if (data.page != page) {
      return {
        value: [],
      };
    }

    let value;
    // Go after minimal result
    if (minimal) {
      value = data.txids || [];
    }
    // Go after FULL result
    else {
      value = [];
      if (data.transactions) {
        for (let i = 0; i < data.transactions.length; i++) {
          let txData = data.transactions[i];
          let events = await getEventsFromTransaction(
            blockchain,
            context,
            txData,
            addrXpub_,
            addrXpub,
          );
          events.forEach(event => {
            event.data = createEventData(event);
          });
          value.push({
            timestamp: txData.blockTime * 1000,
            sourceId: txData.txid,
            sourceType: SourceTypes.TRANSACTION,
            confirmations: txData.confirmations,
            events,
          });
        }
        logger.log(
          `Blockbook.eventsLookup ${prettyPrint({
            blockchain,
            assetType,
            assetId,
            addrXpub,
            from,
            to,
            minimal,
            value: `Array(${value.length})`,
          })}`,
        );
      }
    }
    return {
      value,
    };
  } catch (e) {
    return {
      error: e.message,
    };
  }
}

/**
 * Builds a Request object
 * https://eth1.trezor.io/api/v2/address/0xebb948075bc344a6e3ccc6fe91ac8b933aef1018?details=txs&page=1&pageSize=10&filter=1
 */
async function eventsLookupReq(
  context: CallContext,
  blockchain: Blockchains,
  assetType: AssetTypes,
  assetId: string,
  addrXpub: string,
  page: number,
  pageSize: number,
  minimal: boolean,
) {
  const { req, protocol, host, logger } = context
  let url = null;
  const details = minimal ? 'txids' : 'txs';
  if (blockchain == Blockchains.ETHEREUM) {
    if (assetType == AssetTypes.TOKEN_TYPE_1) {
      const filter = await getFilterIndexForContract(
        context,
        blockchain,
        assetType,
        assetId,
        addrXpub,
      );
      url = `${protocol}://${host}/api/v2/address/${addrXpub}?details=${details}&page=${page}&pageSize=${pageSize}&filter=${filter}`;
    } else if (assetType == AssetTypes.NATIVE) {
      url = `${protocol}://${host}/api/v2/address/${addrXpub}?details=${details}&page=${page}&pageSize=${pageSize}&filter=0`;
    }
  } else {
    url = `${protocol}://${host}/api/v2/address/${addrXpub}?details=${details}&page=${page}&pageSize=${pageSize}`;
  }
  let response = await req.get(url);
  logger.log(`EVENT LOOKUP ${url} ${prettyPrint(response)}`);
  return response;
}

/**
 * Returns the filter index needed for history events lookup API in blockbook.
 * Applies to 'ethereum type' coins.
 */
async function getFilterIndexForContract(
  context: CallContext,
  blockchain: Blockchains,
  assetType: AssetTypes,
  assetId: string,
  addrXpub: string,
) {
  const { logger } = context
  const response = await tokenDiscovery(context, { blockchain, assetType, addrXpub });
  const { value } = response;
  if (value) {
    assetId = assetId.toLowerCase();
    for (let i = 1; i < value.length; i++) {
      if (
        value[i].assetType == assetType &&
        compareCaseInsensitive(value[i].assetId, assetId)
      ) {
        return i;
      }
    }
  }
  logger.warn(
    `could not determine filter index ${prettyPrint({
      blockchain,
      assetType,
      assetId,
      addrXpub,
      response,
    })}`,
  );
  throw new Error('Could not determine filter index');
}

/**
 * Extracts an array of EventData objects from a single transaction
 * @param context
 * @param txData
 * @param addrXpub
 * @param originalAddrXpub
 * @returns Array<{
 *   type: number,        -- the event type
 *   assetType: number,   -- the asset type
 *   assetId: string,     -- the asset id
 *   data: array,         -- JSON data, normal usage looks like [VALUE, ADDR_XPUB, N]
 * }>
 */
async function getEventsFromTransaction(
  blockchain: Blockchains,
  context: CallContext,
  txData: BlockbookTxData,
  addrXpub: string,
  originalAddrXpub: string,
) {
  const { logger } = context  
  try {    
    const vin = txData.vin || [];
    const vout = txData.vout || [];
    const tokenTransfers = txData.tokenTransfers || [];
    const value = txData.value || '0';
    const fees = txData.fees || '0';
    const events = [];
    const isAccountBased = !isUtxo(blockchain)

    // EVENT_SEND, NATIVE
    if (isAccountBased) {
      for (const input of vin) {
        if (
          compareCaseInsensitive(
            input.addresses && input.addresses[0],
            addrXpub,
          ) &&
          value != '0'
        ) {
          const address = vout[0].addresses ? vout[0].addresses[0] : '0';
          events.push(
            buildEventSend(address, AssetTypes.NATIVE, '0', value, input.n),
          );
        }
      }
    }
    // EVENT_RECEIVE, NATIVE
    if (isAccountBased) {
      for (const output of vout) {
        if (
          compareCaseInsensitive(
            output.addresses && output.addresses[0],
            addrXpub,
          )
        ) {
          const address = vin[0].addresses ? vin[0].addresses[0] : '0';
          events.push(
            buildEventReceive(
              address,
              AssetTypes.NATIVE,
              '0',
              output.value,
              output.n,
            ),
          );
        }        
      }
    }
    // EVENT_SEND, EVENT_RECEIVE, TOKEN
    if (isAccountBased) {
      for (let index = 0; index<tokenTransfers.length; index++) {
        const transfer = tokenTransfers[index]
        if (compareCaseInsensitive(transfer.from, addrXpub)) {
          events.push(
            buildEventSend(
              transfer.to,
              AssetTypes.TOKEN_TYPE_1,
              transfer.token,
              transfer.value,
              index,
            ),
          );
        } else {
          //if (transfer.to == addrXpub) {
          events.push(
            buildEventReceive(
              transfer.from,
              AssetTypes.TOKEN_TYPE_1,
              transfer.token,
              transfer.value,
              index,
            ),
          );
        }
      }
    }
    // EVENT_INPUT
    if (!isAccountBased) {
      for (const input of vin) {
        const { addresses, value, n } = input;
        const address = addresses ? addresses[0] || '' : '';
        const _address = replaceAddrXpubWithOriginalAddrXpub(
          address,
          addrXpub,
          originalAddrXpub,
        );
        events.push(
          buildEventInput(_address, AssetTypes.NATIVE, '0', value, n),
        );
      }
    }
    // EVENT_OUTPUT
    if (!isAccountBased) {
      for (const output of vout) {
        console.log('process output utxo', output)
        let { addresses, value, n } = output;
        const address = addresses ? addresses[0] || '' : '';
        const _address = replaceAddrXpubWithOriginalAddrXpub(
          address,
          addrXpub,
          originalAddrXpub,
        );
        events.push(
          buildEventOutput(_address, AssetTypes.NATIVE, '0', value, n),
        );
      }
    }
    // EVENT_FEE
    let outbound = !!vin.find(input => {
      const { addresses } = input;
      const address = addresses ? addresses[0] || '' : '';
      return compareCaseInsensitive(address, addrXpub);
    });
    if (outbound && parseInt(fees) > 0) {
      events.push(buildEventFee(fees));
    }
    return events;
  } catch (e) {
    logger.error(e);
    throw e;
  }
}

/**
 * On returned events we make sure
 */
function replaceAddrXpubWithOriginalAddrXpub(
  address: string,
  ourAddrXpub: string,
  originalAddrXpub: string,
) {
  if (compareCaseInsensitive(address, ourAddrXpub)) {
    return originalAddrXpub;
  }
  return address;
}

interface BlockbookTxData {
  txid: string;
  vin: Array<{
    n: number;
    addresses: Array<string>;
    isAddress: boolean;
    // bitcoin types only
    value: string;
    hex: string;
    txid: string;
    sequence: number;
  }>;
  vout: Array<{
    value: string;
    n: number;
    addresses: Array<string>;
    isAddress: boolean;
  }>;
  blockHash: string;
  blockHeight: number;
  confirmations: number;
  blockTime: number;
  value: string;
  fees: string;
  tokenTransfers: Array<{
    type: string;
    from: string;
    to: string;
    token: string;
    name: string;
    symbol: string;
    decimals: number;
    value: string;
  }>;
  ethereumSpecific: {
    status: number;
    nonce: number;
    gasLimit: number;
    gasUsed: number;
    gasPrice: string;
  };
}