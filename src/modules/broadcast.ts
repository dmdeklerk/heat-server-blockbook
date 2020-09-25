import { BroadcastParam, BroadcastResult, tryParse, CallContext, ModuleResponse } from 'heat-server-common'

export async function broadcast(context: CallContext, param: BroadcastParam): Promise<ModuleResponse<BroadcastResult>> {
  try {
    const { req, protocol, host, logger } = context
    const { transactionHex } = param
    const url = `${protocol}://${host}/api/v2/sendtx/${transactionHex}`;
    const json = await req.get(url, {}, [200, 400]);
    const data = tryParse(json, logger);
    if (data.error) {
      return {
        value: {
          errorMessage: data.error.message || data.error,
        },
      };
    } else if (data.result) {
      return {
        value: {
          transactionId: data.result,
        },
      };
    } else {
      return {
        error: `Unregognized response: ${JSON.stringify(data)}`,
      };
    }    
  } catch (e) {
    return {
      error: e.message,
    };
  }
}