import { UtxoLookupParam, UtxoLookupResult, CallContext, ModuleResponse } from 'heat-server-common';
export declare function utxoLookup(context: CallContext, param: UtxoLookupParam): Promise<ModuleResponse<Array<UtxoLookupResult>>>;
