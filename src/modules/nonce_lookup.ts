import { NonceLookupParam, NonceLookupResult, tryParse, CallContext, ModuleResponse, compareCaseInsensitive } from 'heat-server-common'
import { isFunction } from 'lodash';

export async function nonceLookup(context: CallContext, param: NonceLookupParam): Promise<ModuleResponse<NonceLookupResult>> {
  try {
    const { req, protocol, host, logger, middleWare } = context
    const { blockchain, assetType, addrXpub, assetId } = param
    const addrXpub_ = isFunction(middleWare.getAddress) ? await middleWare.getAddress(addrXpub) : addrXpub;
    const url = `${protocol}://${host}/api/v2/address/${addrXpub_}?details=basic`;
    const json = await req.get(url);
    const data = tryParse(json, logger);
    // console.log('nonce lookup', data)    
    return {
      value: {
        value: data['nonce']
      }
    }
  } catch (e) {
    return {
      error: e.message,
    };
  }
}