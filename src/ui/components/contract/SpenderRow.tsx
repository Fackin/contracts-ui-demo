import { Identicon } from '../account/Identicon';

interface Props {
  spender: any;
}

export function SpenderRow({ spender }: Props) {

  console.log(spender, 'spender', spender[0], spender[1], spender[2])

  return (
    // <Link
    //   className={`grid w-full cursor-pointer grid-cols-4 items-center border border-l-0 border-r-0 border-t-0 border-gray-200 p-3 text-sm last:border-b-0 hover:bg-gray-50 dark:border-gray-700 dark:text-white dark:hover:bg-elevation-1`}
    //   to={`/contract/${address}`}
    // >
    <div className={`grid w-full cursor-pointer grid-cols-[1fr_200px_200px] items-center border border-l-0 border-r-0 border-t-0 border-gray-200 p-3 text-sm last:border-b-0 bg-white dark:bg-transparent hover:bg-gray-50 dark:border-gray-700 dark:text-white dark:hover:bg-elevation-1`}>
      <div className="flex flex-row gap-4">
        <Identicon size={18} value={spender[0]} />
        <div>{spender[0]}</div>
      </div>
      <div>{spender[1]}</div>
      <div>{spender[2] ? 'Y' : 'N'}</div>
    </div>
    // </Link>
  );
}
