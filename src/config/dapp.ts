import { Network } from "@cedra-labs/ts-sdk";
import { DappConfig } from "@cedra-labs/wallet-adapter-core";


export const dappConfig: DappConfig = {
    network: Network.TESTNET,
    cedraConnect: {
        dappImageURI: '/favicon.ico',
    }
};