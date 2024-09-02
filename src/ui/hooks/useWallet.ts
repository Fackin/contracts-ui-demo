import { useAccount } from 'ui/contexts';
import { useEffect, useState } from 'react';

import { WALLET } from '../components/connect/consts';
import { WalletId } from '../components/connect/types';

function useWallet() {
  const { account } = useAccount();

  const defaultWalletId = account?.meta.source as WalletId | undefined;
  const [walletId, setWalletId] = useState(defaultWalletId);
  const wallet = walletId ? WALLET[walletId] : undefined;

  useEffect(() => {
    setWalletId(defaultWalletId);
  }, [defaultWalletId]);

  const resetWalletId = () => setWalletId(undefined);

  return { wallet, walletId, setWalletId, resetWalletId };
}

export { useWallet };
