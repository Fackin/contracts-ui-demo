import { HexString } from '@polkadot/util/types';
import { InjectedAccountWithMeta } from '@polkadot/extension-inject/types';
import { Signer } from '@polkadot/types/types';
// import { Injected } from '@polkadot/extension-inject/types';
import { WALLET_STATUS } from '../../constants';

type WalletStatus = typeof WALLET_STATUS[keyof typeof WALLET_STATUS];

type AccountG = InjectedAccountWithMeta & {
    decodedAddress: HexString;
    signer: Signer;
};

type Wallet = {
    id: string;
    status: WalletStatus;
    version?: string;
    accounts?: AccountG[];
    connect: () => Promise<void>;
    reConnect?: () => Promise<void>;
};

type Wallets = Record<string, Wallet>;

export type { WalletStatus, AccountG, Wallet, Wallets };

