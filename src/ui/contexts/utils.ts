import { InjectedAccount, InjectedWindowProvider, InjectedWindow, Unsubcall } from '@polkadot/extension-inject/types';
import { Signer } from '@polkadot/types/types';

import { LOCAL_STORAGE_KEY, WALLET_STATUS } from '../../constants';
import { AccountG as Account, Wallet, Wallets } from '../../types';

import { HexString } from '@polkadot/util/types';
import { Keyring } from '@polkadot/api';
import { u8aToHex } from '@polkadot/util';
import { web3Accounts, web3Enable, web3EnablePromise } from '@polkadot/extension-dapp';

export function decodeAddress(publicKey: string): HexString {
  return u8aToHex(new Keyring().decodeAddress(publicKey));
}

export function encodeAddress(publicKeyRaw: string | Uint8Array): string {
  return new Keyring().encodeAddress(publicKeyRaw);
}


const getAccounts = (source: string, signer: Signer, accounts: InjectedAccount[]): Account[] =>
  accounts.map(({ address, name, genesisHash, type }) => {
    const decodedAddress = decodeAddress(address);

    return {
      address: address, // new Keyring().encodeAddress(decodedAddress, VARA_SS58_FORMAT),
      decodedAddress,
      meta: { source, name, genesisHash },
      type,
      signer,
    };
  });

const getLoggedInAccount = (_wallets: Wallets) => {
  const localStorageAccountAddress = localStorage.getItem(LOCAL_STORAGE_KEY.ACCOUNT_ADDRESS);

  if (!localStorageAccountAddress) return;

  console.log('localStorageAccountAddress: ', localStorageAccountAddress, _wallets);

  return Object.values(_wallets)
    .flatMap(({ accounts }) => accounts)
    .find((_account) => _account?.address === localStorageAccountAddress);
};

const getLocalStorageWalletIds = () => {
  const result = localStorage.getItem(LOCAL_STORAGE_KEY.WALLET_IDS);

  return result ? (JSON.parse(result) as string[]) : [];
};

const addLocalStorageWalletId = (id: string) => {
  const uniqueIds = new Set([...getLocalStorageWalletIds(), id]);
  const result = JSON.stringify(Array.from(uniqueIds));

  localStorage.setItem(LOCAL_STORAGE_KEY.WALLET_IDS, result);
};

const getConnectedWallet = async (
  origin: string,
  id: string,
  wallet: InjectedWindowProvider,
  onAccountsChange: (_id: string, value: Account[]) => void,
  registerUnsub: (unsub: Unsubcall) => void,
) => {
  try {
    console.log('getConnectedWallet');
    const connect = wallet.connect || wallet.enable;

    if (!connect) throw new Error('Connection method is not found');

    const { version } = wallet;
    const status = WALLET_STATUS.CONNECTED;

    // if auth popup closed/rejected,
    // polkadot-js extension will not resolve promise at all
    console.log('connecting to wallet: ', id, origin);
    const connectedWallet = await connect(origin);
    const { signer } = connectedWallet;

    // every other extension will throw error there
    // it is hacky, but works for right now. worth to consider better solution to handle loading state
    const accounts = getAccounts(id, signer, await connectedWallet.accounts.get());

    // probably it instantly writes to state on a first call. need to investigate
    const accountsUnsub = connectedWallet.accounts.subscribe((result) =>
      onAccountsChange(id, getAccounts(id, signer, result)),
    );

    registerUnsub(accountsUnsub);

    const reConnect = async () => {
      // return getConnectedWallet(origin, id, wallet, onAccountsChange, registerUnsub);
      // const connect = wallet.enable;
      // if (!connect) throw new Error('Connection method is not found');
      // console.log('reConnect to wallet: ', id, origin);
      // const connectedWallet = await connect(origin);
      // console.log('reConnectedWallet: ', connectedWallet);
      // const { signer } = connectedWallet;
      // const accountsUnsub = connectedWallet.accounts.subscribe((result) =>
      //   onAccountsChange(id, getAccounts(id, signer, result)),
      // );
      // registerUnsub(accountsUnsub);

      // !web3EnablePromise && (await web3Enable('contracts-ui'));
      const allInjected = await web3Enable('contracts-ui')
      console.log('已启用的钱包插件:', allInjected);

      // 筛选出特定的插件，例如 Polkadot.js 插件
      const polkadotJsWallet = allInjected.find(injected => injected.name === 'polkadot-js');

      if (polkadotJsWallet) {
        console.log('Polkadot.js 插件已找到:', polkadotJsWallet);

        // 获取该插件中的账户
        const accounts = await web3Accounts();
        console.log('已授权账户:', accounts);
      } else {
        console.log('未找到 Polkadot.js 插件。');
      }
      // const accounts = await web3Accounts();
      // console.log('loading accounts', accounts);
    }

    return {
      id,
      version,
      status,
      accounts,
      connect: () => Promise.reject(new Error('Wallet is already connected')),
      reConnect,
    };
  } catch (error) {
    console.error('Error while connecting wallet: ', error);
  }
};

const getInjectedWallet = (
  origin: string,
  id: string,
  wallet: InjectedWindowProvider,
  onAccountsChange: (_id: string, value: Account[]) => void,
  onConnect: (_id: string, _wallet: Wallet) => void,
  registerUnsub: (unsub: Unsubcall) => void,
) => {
  const { version } = wallet;
  const status = WALLET_STATUS.INJECTED;

  const connect = async () => {
    console.log('connect: ', id, origin);
    const connectedWallet = await getConnectedWallet(origin, id, wallet, onAccountsChange, registerUnsub);
    if (!connectedWallet) return;
    console.log('connectedWallet: ', connectedWallet);
    addLocalStorageWalletId(id);
    onConnect(id, connectedWallet);
  };

  return { id, version, status, connect };
};

const getWallets = async (
  origin: string,
  onAccountsChange: (_id: string, value: Account[]) => void,
  onWalletConnect: (_id: string, _wallet: Wallet) => void,
  registerUnsub: (unsub: Unsubcall) => void,
) => {
  const { injectedWeb3 } = window as unknown as InjectedWindow;
  if (!injectedWeb3) return {};

  const promiseEntries = Object.entries(injectedWeb3).map(
    async ([id, wallet]) =>
      [
        id,
        getLocalStorageWalletIds().includes(id)
          ? (await getConnectedWallet(origin, id, wallet, onAccountsChange, registerUnsub)) ||
            // in case if wallet was connected, but extension's auth access is not present,
            // localStorage entry still exists and we're trying to establish connection again
            getInjectedWallet(origin, id, wallet, onAccountsChange, onWalletConnect, registerUnsub)
          : getInjectedWallet(origin, id, wallet, onAccountsChange, onWalletConnect, registerUnsub),
      ] as const,
  );

  return Object.fromEntries(await Promise.all(promiseEntries));
};

const reConnectWalletById = async (id: string, origin: string,
  onAccountsChange: (_id: string, value: Account[]) => void,
  onWalletConnect: (_id: string, _wallet: Wallet) => void,
  registerUnsub: (unsub: Unsubcall) => void,) => {
  // const { injectedWeb3 } = window as unknown as InjectedWindow;
  // if (!injectedWeb3) return;
  // const wallet = injectedWeb3[id];
  // return getConnectedWallet(origin, id, wallet, onAccountsChange, registerUnsub);
  const { injectedWeb3 } = window as unknown as InjectedWindow;
  if (!injectedWeb3) return {};

  // const promiseEntries = getInjectedWallet(origin, id, injectedWeb3[id], onAccountsChange, onWalletConnect, registerUnsub);

  return await getInjectedWallet(origin, id, injectedWeb3[id], onAccountsChange, onWalletConnect, registerUnsub);
}

export { getWallets, getLoggedInAccount, reConnectWalletById };
