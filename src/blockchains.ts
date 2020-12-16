import { Blockchains } from "heat-server-common";

export function isUtxo(blockchain: Blockchains): boolean {
  return blockchain == Blockchains.BITCOIN || blockchain == Blockchains.LITECOIN ||
    blockchain == Blockchains.BITCOIN_CASH || blockchain == Blockchains.BITCOIN_TEST
}