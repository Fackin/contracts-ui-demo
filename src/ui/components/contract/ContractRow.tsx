// Copyright 2022-2024 use-ink/contracts-ui authors & contributors
// SPDX-License-Identifier: GPL-3.0-only

import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Identicon } from '../account/Identicon';
import { ObservedBalance } from '../common/ObservedBalance';
import { ContractDocument } from 'types';
import { useApi } from 'ui/contexts';
import { displayDate, truncate } from 'lib/util';
import { getContractInfo } from 'services/chain';
import { UsersIcon, UserGroupIcon } from '@heroicons/react/outline';
import { HeaderButtons } from 'ui/components/common/HeaderButtons';
import { useStoredContract } from 'ui/hooks';
import { Tooltip } from 'react-tooltip';

interface Props {
  contract: ContractDocument;
}

export function ContractRow({ contract: { address, name, date, abi } }: Props) {

  // console.log(spec, 'ContractRow----')


  const { api } = useApi();
  const [isOnChain, setIsOnChain] = useState(true);
  const contract = useStoredContract(address);

  const spec: any = abi.spec

  const isMainContract = spec ? !!spec?.messages.find((m:any) => m.label === "get_admin_address") : false;

  useEffect(() => {
    getContractInfo(api, address)
      .then(info => {
        setIsOnChain(info ? true : false);
      })
      .catch(console.error);
  }, [address, api]);

  return (
    // <Link
    //   className={`grid w-full cursor-pointer grid-cols-4 items-center border border-l-0 border-r-0 border-t-0 border-gray-200 p-3 text-sm last:border-b-0 hover:bg-gray-50 dark:border-gray-700 dark:text-white dark:hover:bg-elevation-1`}
    //   to={`/contract/${address}`}
    // >
     <div className={`grid w-full cursor-pointer grid-cols-5 items-center border border-l-0 border-r-0 border-t-0 border-gray-200 p-3 text-sm last:border-b-0 hover:bg-gray-50 dark:border-gray-700 dark:text-white dark:hover:bg-elevation-1`}>

      <div className="flex flex-row gap-2">
        <Identicon size={18} value={address} />
        <div>{name}</div>
      </div>

      {isOnChain ? (
        <div className="font-mono text-gray-500 dark:text-gray-400" title={address}>
          {truncate(address, 4)}
        </div>
      ) : (
        <div className="text-gray-500 dark:text-gray-400">not on-chain</div>
      )}
      <div className="text-gray-500 dark:text-gray-400">{displayDate(date)}</div>

      <div className="font-mono text-gray-500 dark:text-gray-400">
        <ObservedBalance address={address} />
      </div>
      <div className={`justify-self-end inline-flex`}>
        {
          isMainContract && (
            <>
              <Link
                className={`justify-self-end cursor-pointer text-sm`}
                to={`/contract/owners/${address}`}
              >
                <button className="mr-2 flex h-full items-center rounded bg-white border px-3 font-semibold text-gray-600 hover:text-gray-400 dark:border-gray-700 dark:bg-elevation-1 dark:text-gray-300 dark:hover:bg-elevation-2">
                  <>
                    <UsersIcon
                      aria-hidden="true"
                      className="w-4 justify-self-end dark:text-gray-500"
                      data-tip
                      data-tooltip-id={`owners-${address}`}
                    />
                    <Tooltip id={`owners-${address}`}>Owners</Tooltip>
                  </>
                </button>
              </Link>
              <Link
                className={`justify-self-end cursor-pointer text-sm`}
                to={`/contract/spender/${address}`}
              >
                <button className="mr-2 flex h-full items-center rounded bg-white border px-3 font-semibold text-gray-600 hover:text-gray-400 dark:border-gray-700 dark:bg-elevation-1 dark:text-gray-300 dark:hover:bg-elevation-2">
                  <>
                    <UserGroupIcon
                      aria-hidden="true"
                      className="w-4 justify-self-end dark:text-gray-500"
                      data-tip
                      data-tooltip-id={`spender-${address}`}
                    />
                    <Tooltip id={`spender-${address}`}>Spender</Tooltip>
                  </>
                </button>
              </Link>
            </>
          )
        }
        {contract && <HeaderButtons contract={contract} />}
        <Link
          className={`justify-self-end cursor-pointer text-sm`}
          to={`/contract/${address}`}
        >
          <button className="ml-2 flex h-full items-center rounded bg-white border px-3 font-semibold text-gray-600 hover:text-gray-400 dark:border-gray-700 dark:bg-elevation-1 dark:text-gray-300 dark:hover:bg-elevation-2">
            test
          </button>
        </Link>

      </div>
    </div>
    // </Link>
  );
}
