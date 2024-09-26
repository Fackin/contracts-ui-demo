// Copyright 2022-2024 use-ink/contracts-ui authors & contributors
// SPDX-License-Identifier: GPL-3.0-only

import { createContext, useEffect, useContext, useState, useMemo } from 'react';
import { useSearchParams } from 'react-router-dom';
import { web3Accounts, web3Enable, web3EnablePromise } from '@polkadot/extension-dapp';
import { WsProvider } from '@polkadot/api';
import { keyring } from '@polkadot/ui-keyring';
import { LOCAL_STORAGE_KEY, ROCOCO_CONTRACTS } from '../../constants';
import { ApiPromise, ApiState, ChainProperties, Account, Status, WeightV2 } from 'types';
import { isValidWsUrl, isKeyringLoaded } from 'lib/util';
import { useLocalStorage } from 'ui/hooks/useLocalStorage';
import { NoticeBanner } from 'ui/components/common/NoticeBanner';
import { getChainProperties } from 'src/services/chain/chainProps';

import { useAccount } from 'ui/contexts';
import { KeyringAddress } from '@polkadot/ui-keyring/types';

// fixes internal pjs type mismatch `Type 'string' is not assignable to type '`0x${string}`'`
export interface InjectedAccountWithMetaOverride {
  address: string;
  meta: {
    genesisHash?: `0x{string}` | null;
    name?: string;
    source: string;
  };
}

export const ApiContext = createContext<ApiState | undefined>(undefined);

export const ApiContextProvider = ({ children }: React.PropsWithChildren<Partial<ApiState>>) => {
  const [searchParams] = useSearchParams();
  const rpcUrl = searchParams.get('rpc');
  const [preferredEndpoint, setPreferredEndpoint] = useLocalStorage<string>(
    LOCAL_STORAGE_KEY.PREFERRED_ENDPOINT,
    ROCOCO_CONTRACTS.rpc,
  );
  const [api, setApi] = useState({} as ApiPromise);
  const [endpoint, setEndpoint] = useState(preferredEndpoint);
  const [accounts, setAccounts] = useState<Account[]>();
  const [accountsAll, setAccountsAll] = useState<Account[]>();
  const [chainProps, setChainProps] = useState<ChainProperties>();
  const [status, setStatus] = useState<Status>('loading');
  const [isSupported, setIsSupported] = useState(true);
  const [isEthereumChain, setIsEthereumChain] = useState(false);

  const { account, wallets } = useAccount();

  const isAccountAvailable = useMemo(() => {

    const obj = Object.values(wallets || {}).flatMap(({ accounts }) => accounts)
      .find((_account) => _account?.address === account?.address)
console.log('isAccountAvailable', wallets, account, obj);
      return obj !== undefined;
    }, [wallets, account]);

  useEffect(() => {
    if (rpcUrl && isValidWsUrl(rpcUrl) && rpcUrl !== preferredEndpoint) {
      setEndpoint(rpcUrl);
      setPreferredEndpoint(rpcUrl);
      // window.location.reload();
    }
  }, [preferredEndpoint, rpcUrl, searchParams, setPreferredEndpoint]);

  useEffect((): void => {
    setStatus('loading');
    console.log('==================loading api 111============')
    console.log(endpoint, account)
    console.log('==================loading api 222============')
    const wsProvider = new WsProvider(endpoint);
    const _api = new ApiPromise({ provider: wsProvider });
    _api.on('connected', async () => {
      await _api.isReady;
      const _chainProps = await getChainProperties(_api);
      const w2 = _api.registry.createType<WeightV2>('Weight').proofSize;
      const isEth = _api.runtimeVersion.specName.toString() === 'frontier-template';
      setApi(_api);
      setChainProps(_chainProps);
      setIsSupported(!!w2);
      setStatus('connected');
      setIsEthereumChain(isEth);
    });
    _api.on('disconnected', () => {
      setStatus('error');
    });
  }, [endpoint, account]);

  useEffect(() => {
    const getAccounts = async () => {
      if (status === 'connected' && chainProps) {
        !web3EnablePromise && (await web3Enable('contracts-ui'));
        const accounts = await web3Accounts();
        console.log('loading accounts', accounts, account);
        isKeyringLoaded() ||
          keyring.loadAll(
            {
              isDevelopment: chainProps.systemChainType.isDevelopment,
              type: isEthereumChain ? 'ethereum' : 'ed25519',
            },
            accounts as InjectedAccountWithMetaOverride[],
          );
          console.log('loading accounts', keyring.getAccounts());
        // setAccounts(keyring.getAccounts());
        setAccountsAll(keyring.getAccounts());
        setAccounts([account as unknown as KeyringAddress]);
      }
    };
    getAccounts().catch(e => console.error(e));
  }, [chainProps, isEthereumChain, status, account]);

  return (
    <ApiContext.Provider
      value={{
        api,
        accounts,
        accountsAll,
        isAccountAvailable,
        setEndpoint,
        endpoint,
        status,
        ...(chainProps as ChainProperties),
      }}
    >
      <NoticeBanner endpoint={endpoint} isVisible={!isSupported} />
      {children}
    </ApiContext.Provider>
  );
};

export const useApi = () => {
  const context = useContext(ApiContext);
  if (context === undefined) {
    throw new Error('useApi must be used within an ApiContextProvider');
  }
  return context;
};
