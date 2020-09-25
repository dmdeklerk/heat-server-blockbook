import { TransactionStatusParam, TransactionStatusResult, tryParse, CallContext, ModuleResponse } from 'heat-server-common'
import { isObjectLike, isNumber, isUndefined } from 'lodash';

export async function transactionStatus(context: CallContext, param: TransactionStatusParam): Promise<ModuleResponse<TransactionStatusResult>> {
  try {
    const { req, protocol, host, logger } = context
    const { transactionId } = param
    const url = `${protocol}://${host}/api/v2/tx/${transactionId}`;
    const json = await req.get(url, {}, [200, 400]);
    const transaction = tryParse(json, logger);
    if (
      isObjectLike(transaction) &&
      isNumber(transaction.confirmations)
    ) {
      return {
        value: {
          isAccepted: true,
          confirmations: transaction.confirmations,
        },
      };
    } else if (
      isObjectLike(transaction) &&
      !isUndefined(transaction.error)
    ) {
      return {
        value: {
          isAccepted: false,
          confirmations: 0,
        },
      };
    } else {
      return {
        error: 'Invalid api response',
      };
    }    
  } catch (e) {
    return {
      error: e.message,
    };
  }
}