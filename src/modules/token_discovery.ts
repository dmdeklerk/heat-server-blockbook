import { TokenDiscoveryParam, TokenDiscoveryResult, tryParse, CallContext, ModuleResponse, AssetTypes } from 'heat-server-common'
import { isFunction } from 'lodash';

export async function tokenDiscovery(context: CallContext, param: TokenDiscoveryParam): Promise<ModuleResponse<Array<TokenDiscoveryResult>>> {
  try {
    const { req, protocol, host, logger, middleWare } = context
    const { addrXpub } = param
    const addrXpub_ = middleWare && isFunction(middleWare.getAddress)
      ? await middleWare.getAddress(addrXpub)
      : addrXpub;    
    const url = `${protocol}://${host}/api/v2/address/${addrXpub_}?details=tokenBalances`;
    const json = await req.get(url);
    const data = tryParse(json, logger);
    if (!data.balance && !data.tokens) {
      return {
        error: 'Invalid api response',
      };
    }
    const value: Array<TokenDiscoveryResult> = [];
    const exists = data.txs > 0;
    // Native currency balance
    value.push({
      assetId: '0',
      assetType: AssetTypes.NATIVE,
      value: data.balance || '0',
      exists,
    });
    // Iterate over the tokens (test with IF in case of null)
    if (data.tokens) {
      data.tokens.forEach(entry => {
        value.push({
          assetId: entry.contract,
          assetType: AssetTypes.TOKEN_TYPE_1,
          value: entry.balance || '0',
          exists,
        });
      });
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