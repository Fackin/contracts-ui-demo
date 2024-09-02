// Copyright 2022-2024 use-ink/contracts-ui authors & contributors
// SPDX-License-Identifier: GPL-3.0-only

import { CogIcon, CubeTransparentIcon } from '@heroicons/react/outline';
import { useCallback, useEffect, useState } from 'react';
import { Button, Buttons } from 'ui/components';
// import { HelpModal } from 'ui/components/modal';
import { SettingsModal } from 'ui/components/modal/SettingsModal';
import { ConnectModal } from 'ui/components/modal/ConnectModal';

import { useAccount } from 'ui/contexts';
import { AccountButton } from '../../components/account';

type ModalName = 'help' | 'settings' | 'connect';

export function Footer() {
  const [visibleModal, setVisibleModal] = useState<ModalName | undefined>(undefined);

  const { account, isAccountReady } = useAccount();

  // console.log('account-footer', account);
  useEffect(() => {
    console.log('account-footer', account);
  }, [account]);

  const createSetVisibleModal = useCallback(
    (modal: ModalName) => (isOpen: boolean) => {
      if (isOpen) {
        setVisibleModal(modal);
      } else {
        setVisibleModal(undefined);
      }
    },
    [setVisibleModal],
  );


  return (
    <footer className="footer flex flex-col gap-4">
      <div className='flex-row gap-2'>
        {/* <a
          className="text-md flex cursor-pointer content-center items-center py-2 font-medium text-gray-600 hover:text-gray-400 dark:text-gray-300 dark:hover:text-gray-300 md:py-0 md:text-xs md:dark:text-gray-400"
          onClick={() => setVisibleModal('help')}
        >
          <ChatAltIcon aria-hidden="true" className="mr-2 h-4 w-4 dark:text-gray-500" />
          Help &amp; Feedback
        </a> */}
        <Buttons>
          {isAccountReady &&
            (account ? (
              <AccountButton
                className="connect-btn px-2 dark:text-white"
                name={account.meta.name}
                address={account.address}
                onClick={() => setVisibleModal('connect')}
              />
            ) : (
              <Button
                className="connect-btn px-2 dark:text-white"
                onClick={() => setVisibleModal('connect')}
                variant="default">
                  <CubeTransparentIcon aria-hidden="true" className="mr-1 h-4 w-4 dark:text-gray-500"></CubeTransparentIcon>
                  Connect
              </Button>
            ))}
          
        </Buttons>
        <a
          className="text-md flex cursor-pointer content-center items-center py-2 font-medium text-gray-600 hover:text-gray-400 dark:text-gray-300 dark:hover:text-gray-300 md:py-0 md:text-xs md:dark:text-gray-400"
          onClick={() => setVisibleModal('settings')}
        >
          <CogIcon
            aria-hidden="true"
            className="mr-2 h-4 w-4 text-gray-600 hover:text-gray-400 dark:text-gray-500 dark:hover:text-gray-300"
          />
          <div className="text-md dark:text-gray-300 md:hidden">Settings</div>
        </a>
      </div>
      {/* <div>
        <a
          className="text-md flex cursor-pointer content-center items-center py-2 font-medium text-gray-600 hover:text-gray-400 dark:text-gray-300 dark:hover:text-gray-300 md:py-0 md:text-xs md:dark:text-gray-400"
          href="https://www.netlify.com"
          rel="noreferrer noopener"
          target="_blank"
        >
          This site is powered by Netlify
        </a>
      </div> */}
      {/* <HelpModal isOpen={visibleModal === 'help'} setIsOpen={createSetVisibleModal('help')} /> */}
      <ConnectModal isOpen={visibleModal === 'connect'}  setIsOpen={createSetVisibleModal('connect')}/>
      <SettingsModal
        isOpen={visibleModal === 'settings'}
        setIsOpen={createSetVisibleModal('settings')}
      />
    </footer>
  );
}
