import { useEffect, useState } from 'react';
import { Identicon } from '../account/Identicon';
import { UIContract, ContractDocument } from 'types';
import { useApi } from 'ui/contexts';
import { truncate } from 'lib/util';
import { getContractInfo } from 'services/chain';
import { useGetDecodedOutput } from 'ui/hooks';
import { Button, Buttons } from 'ui/components/common';

interface Props {
  contract: UIContract;
  item: any;
  erc721: UIContract | undefined;
  erc20: UIContract | undefined;
}

export function ContractCard({ contract: { address, name, date, abi, ...other }, item, erc721, erc20 }: Props) {
  const { api, accounts } = useApi();
  const [isOnChain, setIsOnChain] = useState(true);
  const [accountId, setAccountId] = useState('');
  const contract = { address, name, date, abi, ...other }

  const owner = item && item[0]
  const dotNum = item && item.length > 1 && item[1]
  const tokenNum = item && item.length > 2 && item[2]


  useEffect((): void => {
    if (!accounts || accounts.length === 0) return;
    setAccountId(accounts[0]?.address);
  }, [accounts]);



  useEffect(() => {
    getContractInfo(api, address)
      .then(info => {
        setIsOnChain(info ? true : false);
      })
      .catch(console.error);
  }, [address, api]);

  // const outputToArray = (value: string) => {
  //   if (!value || value == 'null') return [];
  //   // value = value.trim();
  //   // 替换每个数组对象最后一个逗号
  //   value = value.replaceAll("'", '"').replace(/\s/g, '').replace(/(,)\s*(\]\s*,\s*\[)/g, "$2").replace(/(,)\s*(\]\s*,\s*\])/g, "$2");
  //   // 再次替换，以确保最后一个数组后面没有逗号
  //   value = value.replace(/,\s*]$/, "]");
  //   if (!value) return [];
  //   try {
  //     return JSON.parse(value);
  //   } catch (error) {
  //     return [];
  //   }
  // }

  // const { decodedOutput, setArgValues } = useGetDecodedOutput(contract, 'get_spender_dot_allowances', accountId);
  // console.log(decodedOutput?.decodedOutput, '1project-----====');

  // const { decodedOutput: output, setArgValues: setArg } = useGetDecodedOutput(contract, 'get_spender_token_allowances', accountId);
  // console.log(output, '2project-----====');

  const { decodedOutput: output1, setArgValues: setArg1 } = useGetDecodedOutput(contract, 'get_spender_nft_allowances', accountId);
  console.log(output1?.decodedOutput, '3project-----====');

  // useEffect(() => {
  //   setArgValues({ owner: owner })
  // }, [setArgValues, accountId, owner]);

  // useEffect(() => {
  //   setArg({ owner: owner })
  // }, [setArg, accountId, owner]);

  useEffect(() => {
    setArg1({ owner: owner })
  }, [setArg1, accountId, owner]);



  const { decodedOutput } = useGetDecodedOutput(contract, 'get_erc721_address', accountId);
  console.log(decodedOutput?.decodedOutput, 'get_erc721_address');


  const { decodedOutput: output } = useGetDecodedOutput(contract, 'get_erc20_address', accountId);
  console.log(output?.decodedOutput, 'get_erc20_address');


  const callback = () => {
    console.log(callResults, 'callResults')

  }

  const { call, callDisabled, isDispatchable, proofSize, refTime, storageDepositLimit, valueState, txs, txId, callResults, setArgValues } = useGetDecodedOutput(contract, "transfer_nft_from", accountId, callback);
  const { call: callBalances, callDisabled: callDisabledB, callResults: resBalances, txs: txsB, txId: txIdB, setArgValues: setArgBalances } = useGetDecodedOutput(contract, "transfer_balances_from", accountId);

  useEffect(() => {
    console.log(callResults, 'callResults')
  }, [callResults]);


  useEffect(() => {
    console.log(resBalances, 'resBalances')
  }, [resBalances]);

  const claim = () => {
    setArgValues({ owner: owner })
    call()
    console.log(callResults)
    // setArgBalances({ owner: owner })
    // callBalances()
  }


  return (
    <div className={`w-60 rounded-lg border p-4 border-gray-200 bg-white dark:bg-transparent cursor-pointer items-centerp-3 text-sm hover:bg-gray-50 dark:border-gray-700 dark:text-white dark:hover:bg-elevation-1`}>

      <div className="flex flex-row gap-2">
        <Identicon size={18} value={address} />
        <div>{name}</div>
        {isOnChain ? (
          <div className="font-mono text-gray-500 dark:text-gray-400" title={address}>
            {truncate(address, 4)}
          </div>
        ) : (
          <div className="text-gray-500 dark:text-gray-400">not on-chain</div>
        )}
      </div>


      <div className="flex flex-row gap-2">
        <Identicon size={18} value={owner} />
        <div>{truncate(owner, 4)}</div>
      </div>

      <div>{dotNum}</div>
      <div>{tokenNum}</div>
      {/* <div className={`justify-self-end inline-flex`}>

      </div> */}

      <Buttons>
        <Button
          isDisabled={callDisabled || callDisabledB}
          isLoading={txs[txId]?.status === 'processing' || txsB[txIdB]?.status === 'processing'}
          onClick={claim}
          variant="primary"
        >
          Claim
        </Button>
      </Buttons>
    </div>
  );
}
