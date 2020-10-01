import { TokenDiscoveryParam, TokenDiscoveryResult, tryParse, CallContext, ModuleResponse, AssetTypes } from 'heat-server-common'
import { isFunction } from 'lodash';
type TokenClassEthereum = {
  contract: string,
  decimals: number,
  name: string,
  symbol: string,
  transfers: number,
  type: string
}

class TokenDiscoveryResultEx implements TokenDiscoveryResult {
  assetId: string;
  assetType: number;
  value: string;
  exists: boolean;
  constructor(parentResult: TokenDiscoveryResult ) {
    this.assetId = parentResult.assetId
    this.assetType = parentResult.assetType
    this.value = parentResult.value
    this.exists = parentResult.exists
  }
  /**
   * Details
   */
  details?: TokenClassEthereum
}

function nativeEtherDetails(transfers: number) {
  return {
    contract: '0',
    decimals: 18,
    name: 'Ether',
    symbol: 'ETH',
    transfers,
    type: '' 
  }
}

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
    const value: Array<TokenDiscoveryResultEx> = [];
    const exists = data.txs > 0;
    // Native currency balance
    value.push({
      assetId: '0',
      assetType: AssetTypes.NATIVE,
      value: data.balance || '0',
      exists,
      details: nativeEtherDetails(data.nonTokenTxs)
    });
    // Iterate over the tokens (test with IF in case of null)
    if (data.tokens) {
      data.tokens.forEach(entry => {
        value.push({
          assetId: entry.contract,
          assetType: AssetTypes.TOKEN_TYPE_1,
          value: entry.balance || '0',
          exists,
          details: {
            contract: entry.contract,
            decimals: entry.decimals || 0,
            name: entry.name || '',
            symbol: entry.symbol || '',
            transfers: entry.transfers || 0,
            type: entry.type || ''
          }
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