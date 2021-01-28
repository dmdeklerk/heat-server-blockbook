import { RateLimiterClass, ExplorerMiddleware, ExplorerBase } from 'heat-server-common'
import { balanceLookup } from './modules/balance_lookup';
import { eventLookup } from './modules/event_lookup';
import { networkFee } from './modules/network_fee';
import { networkStatus } from './modules/network_status';
import { tokenDiscovery } from './modules/token_discovery'
import { transactionStatus } from './modules/transaction_status'
import { utxoLookup } from './modules/utxo_lookup'
import { nonceLookup } from './modules/nonce_lookup'
import { broadcast } from './modules/broadcast'
import { ModuleProvider } from 'heat-server-common/dist/types/module_provider.interface';

/* ------------------- Configuration Start ------------------- */

// Must provide an id for this explorer
const ID = "blockbook"

// Must list all exposed/implemented modules 
const modules: ModuleProvider = {
  balanceLookup,
  eventLookup,
  broadcast,
  networkFee,
  networkStatus,
  tokenDiscovery,
  transactionStatus,
  utxoLookup,
  nonceLookup,
}

/* ------------------- Configuration End --------------------- */

export class Explorer extends ExplorerBase {
  constructor(
    protocol: string,
    public host: string,
    public rateLimiter: RateLimiterClass,
    apiKey?: string,
    middleWare?: ExplorerMiddleware,
  ) {
    super(ID, protocol, host, modules, middleWare)
  }
}