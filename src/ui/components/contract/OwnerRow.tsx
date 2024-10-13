// Copyright 2022-2024 use-ink/contracts-ui authors & contributors
// SPDX-License-Identifier: GPL-3.0-only
import { Identicon } from '../account/Identicon';

interface Props {
  owner: string | null;
  admin: string | null;
}

export function OwnerRow({ owner, admin }: Props) {

  return (
    // <Link
    //   className={`grid w-full cursor-pointer grid-cols-4 items-center border border-l-0 border-r-0 border-t-0 border-gray-200 p-3 text-sm last:border-b-0 hover:bg-gray-50 dark:border-gray-700 dark:text-white dark:hover:bg-elevation-1`}
    //   to={`/contract/${address}`}
    // >
    <div className={`grid w-full cursor-pointer grid-cols-5 items-center border border-l-0 border-r-0 border-t-0 border-gray-200 p-3 text-sm last:border-b-0 bg-white dark:bg-transparent hover:bg-gray-50 dark:border-gray-700 dark:text-white dark:hover:bg-elevation-1`}>
      <div className="flex flex-row gap-3">
        <Identicon size={18} value={owner} />
        <div>{owner}</div>
        <div>{admin == owner ? 'admin' : ''}</div>
      </div>
    </div>
    // </Link>
  );
}
