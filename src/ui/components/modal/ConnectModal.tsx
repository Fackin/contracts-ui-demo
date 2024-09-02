// Copyright 2022-2024 use-ink/contracts-ui authors & contributors
// SPDX-License-Identifier: GPL-3.0-only

import { Button, Buttons } from '../common';
import type { ModalProps } from './ModalBase';
import { ModalBase as Modal } from './ModalBase';
import { useAccount } from 'ui/contexts';
import { WALLETS } from '../connect/consts';
import { useWallet } from '../../hooks';
import { AccountButton } from '../account';
import { LogoutIcon } from '@heroicons/react/solid';
import { classes } from 'lib/util';

export const ConnectModal = ({ isOpen, setIsOpen }: Omit<ModalProps, 'title'>) => {


  const { wallets, isAnyWallet, account, login, logout } = useAccount();
  const { wallet, walletId, setWalletId, resetWalletId } = useWallet();
  const renderWallets = () =>
    WALLETS.map(([id, { SVG, name }]) => {
      const { status, accounts, connect } = wallets?.[id] || {};
      const isEnabled = Boolean(status);
      const isConnected = status === 'connected';

      const accountsCount = accounts?.length;
      const accountsStatus = `${accountsCount} ${accountsCount === 1 ? 'account' : 'accounts'}`;



      return (
        <Button
          key={id}
          className="w-full h-12 px-2 py-4 rounded-full dark:text-white disabled:border"
          onClick={() => (isConnected ? setWalletId(id) : connect?.())}
          isDisabled={!isEnabled}
          variant="default">
            <div className="w-full px-4 flex justify-between items-center gap-4 font-bold">
              <span className='flex justify-start items-center gap-2'>
                {/* <SVG /> */}
                <img className='w-4' src={SVG} alt={name} />
                {name}
              </span>
              <div>
                <p >{isConnected ? 'Enabled' : 'Disabled'}</p>

                {isConnected && <p className='text-green-400'>{accountsStatus}</p>}
              </div>
            </div>
        </Button>
      );
    });


  const walletAccounts = wallets && walletId ? wallets[walletId]?.accounts : undefined;

  const renderAccoounts = () =>
    walletAccounts?.map((_account) => {
      const { address, meta } = _account;
      const isActive = address === account?.address;

      const handleClick = () => {
        if (isActive) return;

        login(_account);
        setIsOpen(false);
      };

      return (
        <li key={address} className='flex items-center'>
          <AccountButton
            className={classes("mx-auto my-0 w-10/12 rounded-full border px-2 dark:text-white", isActive && 'border-none bg-green-400 text-white')}
            name={meta.name}
            address={address}
            onClick={handleClick} />
          {/* <Button color="transparent" onClick={() => copyToClipboard(address, alert)} /> */}
        </li>
      );
    });

    const handleLogoutClick = () => {
      logout();
      setIsOpen(false);
    };

    const renderFooter = () =>
      (wallet || account) && (
        <div className='px-0 py-4 flex justify-between items-center border-t border-gray-200 dark:border-gray-800 dark:text-white -mx-6'>
          {wallet && <Button 
            onClick={resetWalletId} >
            <img src={wallet.SVG} aria-hidden="true" className="mr-2 h-4 w-4 dark:text-gray-500" />{wallet.name}
          </Button>}
          {account && <Button 
            onClick={handleLogoutClick} >
              <LogoutIcon aria-hidden="true" className="mr-2 h-4 w-4 dark:text-gray-500" />Logout
            </Button>}
        </div>
      );
  
  return (
    <Modal isOpen={isOpen} setIsOpen={setIsOpen} title={wallet ? 'Connect account' : 'Choose Wallet'} className="max-w-sm" >
      <div className='py-6 flex flex-col gap-2'>
        {isAnyWallet ? (
          <>
            {!wallet && renderWallets()}

            {!!wallet &&
              (walletAccounts?.length ? (
                <ul className='flex justify-center flex-col gap-2'>{renderAccoounts()}</ul>
              ) : (
                <p>No accounts found. Please open your extension and create a new account or import existing.</p>
              ))}
          </>
        ) : (
          <p>
            Wallet extensions were not found or disconnected. Please check how to install a supported wallet and create an
            account.
          </p>
        )}
        {/* {renderWallets()} */}
        {/* <Button
          className="w-full px-2 py-4 rounded-full dark:text-white flex justify-center items-center gap-4 font-bold"
          onClick={() => { }}
          variant="default">
          <img className='w-4' src={PolkadotSvg} alt='PolkadotSvg' />
          Polkadot Js
        </Button>
        <Button
          className="w-full px-2 dark:text-white"
          onClick={() => { }}
          variant="default">
          <img className='w-4' src={PolkadotSvg} alt='PolkadotSvg' />
          Connect
        </Button> */}
      </div>
      {renderFooter()}
    </Modal>
  );
};
