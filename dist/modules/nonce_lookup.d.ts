import { NonceLookupParam, NonceLookupResult, CallContext, ModuleResponse } from 'heat-server-common';
export declare function nonceLookup(context: CallContext, param: NonceLookupParam): Promise<ModuleResponse<NonceLookupResult>>;
