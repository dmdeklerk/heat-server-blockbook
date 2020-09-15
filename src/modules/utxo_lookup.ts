import { UtxoLookupParam, UtxoLookupResult, tryParse, CallContext, ModuleResponse } from 'heat-server-common'
import { isFunction } from 'lodash';

export async function utxoLookup(context: CallContext, param: UtxoLookupParam): Promise<ModuleResponse<Array<UtxoLookupResult>>> {
  try {
    const { req, protocol, host, logger, middleWare } = context
    const { addrXpub, assetType } = param
    const addrXpub_ = this.middleWare && isFunction(middleWare.getAddress)
      ? await middleWare.getAddress(addrXpub)
      : addrXpub;
    const url = `${protocol}://${host}/api/v2/utxo/${addrXpub_}`;
    const json = await req.get(url);
    const data = tryParse(json, logger);
    if (!Array.isArray(data)) {
      return {
        error: 'Invalid api response',
      };
    }
    const value = [];
    data.forEach(tx => {
      value.push({
        value: tx.value,
        txid: tx.txid,
        vout: tx.vout,
        confirmations: tx.confirmations,
        lockTime: tx.lockTime,
        height: tx.height,
      });
    });
    return {
      value,
    };

  } catch (e) {
    return {
      error: e.message,
    };
  }
}