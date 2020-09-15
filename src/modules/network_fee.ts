import { NetworkFeeParam, NetworkFeeResult, tryParse, CallContext, ModuleResponse, BlockchainConfig } from 'heat-server-common'
import { isUndefined } from 'lodash'

export async function networkFee(context: CallContext, param: NetworkFeeParam): Promise<ModuleResponse<NetworkFeeResult>> {
  try {
    const { req, protocol, host, logger, middleWare } = context
    const { blockchain } = param
    const { feeBlocks } = BlockchainConfig[blockchain];
    const url = `${protocol}://${host}/api/v2/estimatefee/${feeBlocks}?conservative=true`;
    const json = await req.get(url);
    const data = tryParse(json, logger);

    if (!data || isUndefined(data.result)) {
      return {
        error: 'Invalid api response',
      };
    }
    const value = middleWare.getNetworkFee(data.result);
    if (!value) {
      return {
        error: `Middleware invalid network fee ${data.result}`,
      };
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