import { NetworkStatusParam, NetworkStatusResult, tryParse, CallContext, ModuleResponse } from 'heat-server-common'
import { isObjectLike } from 'lodash'

export async function networkStatus(context: CallContext, param: NetworkStatusParam): Promise<ModuleResponse<NetworkStatusResult>> {
  try {
    const { req, protocol, host, logger } = context
    const url = `${protocol}://${host}/api/v2`;
    const json = await req.get(url);
    const data = tryParse(json, logger);
    
    // When initial sync is processing this node is not considered in sync
    if (
      isObjectLike(data) &&
      isObjectLike(data.blockbook) &&
      !data.blockbook.inSync
    ) {
      return {
        error: 'Blockbook server not in sync',
      };
    }

    // "2020-02-02T00:03:52.870766541Z"
    const lastBlockTime = new Date(Date.parse(data.blockbook.lastBlockTime));
    const lastBlockHeight = data.backend.blocks;
    const lastBlockId = data.backend.bestBlockHash;
    return {
      value: {
        lastBlockTime,
        lastBlockHeight,
        lastBlockId,
      },
    };


  } catch (e) {
    return {
      error: e.message,
    };
  }
}