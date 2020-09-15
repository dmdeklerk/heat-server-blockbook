import { BalanceLookupParam, BalanceLookupResult, tryParse, CallContext, ModuleResponse, compareCaseInsensitive } from 'heat-server-common'
import { tokenDiscovery } from './token_discovery'

export async function balanceLookup(context: CallContext, param: BalanceLookupParam): Promise<ModuleResponse<BalanceLookupResult>> {
  try {
    const { req, protocol, host, logger, middleWare } = context
    const { blockchain, assetType, addrXpub, assetId } = param
    const addrXpub_ = await middleWare.getAddress(addrXpub);
    const response = await tokenDiscovery(context, {
      blockchain, assetType, addrXpub: addrXpub_
    });
    if (response.value) {
      let entry = response.value.find(
        entry =>
          entry.assetType == assetType &&
          compareCaseInsensitive(entry.assetId, assetId),
      );
      return {
        value: {
          value: entry ? entry.value : '0',
          exists: entry ? entry.exists : false,
        }
      };
    }
    return {
      error: response.error,
    };
  } catch (e) {
    return {
      error: e.message,
    };
  }
}