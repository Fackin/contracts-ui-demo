import { useEffect, useState } from 'react';
import { UIContract, ContractDocument } from 'types';
import { useApi } from 'ui/contexts';
import { useGetDecodedOutput } from 'ui/hooks';
import { ContractCard } from './ContractCard';

interface Props {
  contract: UIContract;
  erc721: UIContract | undefined;
  erc20: UIContract | undefined;
}

export function ContractLine({ contract: { address, name, date, abi, ...other }, erc721, erc20 }: Props) {
  const { accounts } = useApi();
  const [accountId, setAccountId] = useState('');
  const contract = { address, name, date, abi, ...other }


  useEffect((): void => {
    if (!accounts || accounts.length === 0) return;
    setAccountId(accounts[0]?.address);
  }, [accounts]);


  const outputToArray = (value: string) => {
    if (!value || value == 'null') return [];
    // value = value.trim();
    // 替换每个数组对象最后一个逗号
    value = value.replaceAll("'", '"').replace(/\s/g, '').replace(/(,)\s*(\]\s*,\s*\[)/g, "$2").replace(/(,)\s*(\]\s*,\s*\])/g, "$2");
    // 再次替换，以确保最后一个数组后面没有逗号
    value = value.replace(/,\s*]$/, "]");
    if (!value) return [];
    try {
      return JSON.parse(value);
    } catch (error) {
      return [];
    }
  }

  const { decodedOutput } = useGetDecodedOutput(contract, 'get_all_owner_rewards_for_spender', accountId);

  return (
    <>
      {
        outputToArray(decodedOutput?.decodedOutput).length > 0 ?
          outputToArray(decodedOutput?.decodedOutput).map((item: any, index: number) => {
            return <ContractCard key={index} contract={contract} item={item} erc721={erc721} erc20={erc20} />
          }) : (
            <div className="flex flex-col items-center space-y-2 rounded border px-5 py-7  text-sm dark:border-gray-700 dark:text-gray-500">
              <div>There hasn&apos;t any contracts yet on this browser.</div>
            </div>
          )
      }
    </>
  );
}
