import { NetworkFeeParam, NetworkFeeResult, CallContext, ModuleResponse } from 'heat-server-common';
export declare function networkFee(context: CallContext, param: NetworkFeeParam): Promise<ModuleResponse<NetworkFeeResult>>;
