import { useEffect, useState } from 'react';
import {
    AbiMessage,
    UIContract,
} from 'types';
import { ArgumentForm, Form, FormField, OptionsForm } from 'ui/components/form';
import { useApi } from 'ui/contexts';
import { useGetDecodedOutput } from 'ui/hooks';
import { classes } from 'lib/util';
import { SpenderRow } from './SpenderRow';
import { Button, Buttons } from 'ui/components/common';
import { UserAddIcon } from '@heroicons/react/outline';
import { AddAuthOwnerModal } from 'ui/components/modal';
import BN from 'bn.js';

interface Props {
    contract: UIContract;
}

export const SpenderList = ({
    contract: {
        abi,
        abi: { registry },
        tx,
        address,
        ...other
    },
}: Props) => {
    const { accounts } = useApi();
    const [message, setMessage] = useState<AbiMessage>();
    const [mintMsg, setMintMsg] = useState<AbiMessage>();
    const [approveMsg, setApproveMsg] = useState<AbiMessage>();
    const [accountId, setAccountId] = useState('');
    const [showAdd, setShowAdd] = useState(false);
    const [step, setStep] = useState(0);

    const contract = {
        abi,
        tx,
        address,
        ...other,
    }

    useEffect((): void => {
        if (!accounts || accounts.length === 0) return;
        setAccountId(accounts[0]?.address);
    }, [accounts]);

    const callback1 = () => {
        setShowAdd(false)
        setStep(1)
    }

    const callback = () => {
        console.log('callback----mint_approve_nft')
        // call1()
        setStep(1)
    }
    const {
        call,
        callDisabled,
        proofSize,
        refTime,
        storageDepositLimit,
        valueState,
        txs,
        txId,
        setArgValues
    } = useGetDecodedOutput(contract, "mint_approve_nft", accountId, callback);
    const {
        call: call1,
        callDisabled: callDisabled1,
        proofSize: proofSize1,
        refTime: refTime1,
        storageDepositLimit: storageDepositLimit1,
        valueState: valueState1,
        txs: txs1,
        txId: txId1,
        argValues: argValues1,
        setArgValues: setArgValues1
    } = useGetDecodedOutput(contract, "approve_balances", accountId, callback1);

    useEffect(() => {
        const authOwnerM = (abi.messages).find((m) => m?.identifier === 'get_all_spender_claimed_for_owner')
        const mintM = (abi.messages).find((m) => m?.identifier === 'mint_approve_nft')
        const approveM = (abi.messages).find((m) => m?.identifier === 'approve_balances')
        setMessage(authOwnerM);
        setMintMsg(mintM);
        setApproveMsg(approveM)
    }, [abi.messages, address]);


    const outputToArray = (value: string) => {
        console.log(value, 'value1111')
        if (!value || value == 'null') return [];
        console.log(value, 'value')
        // value = value.trim();
        // 替换每个数组对象最后一个逗号
        value = value.replaceAll("'", '"').replace(/\s/g, '').replace(/(,)\s*(\]\s*,\s*\[)/g, "$2").replace(/(,)\s*(\]\s*,\s*\])/g, "$2");
        // 再次替换，以确保最后一个数组后面没有逗号
        value = value.replace(/,\s*]$/, "]");
        console.log(value, 'value')
        if (!value) return [];
        try {
            return JSON.parse(value);
        } catch (error) {
            return [];
        }
    }

    const { decodedOutput } = useGetDecodedOutput(contract, message, accountId);
    console.log(decodedOutput?.decodedOutput, 'spender-----=====', outputToArray(decodedOutput?.decodedOutput))


    const handleClickAdd = () => {
        setShowAdd(true)
    };

    const handleCall = () => {
        const { spender } = argValues1;
        // const { onChange, value } = valueState1;
        setArgValues({ spender });
        // dotValue && onChange(dotValue as BN)
        // return;
        call();
    }
    const handleApprove = () => {
        const { dotValue } = argValues1;
        const { onChange } = valueState1;
        dotValue && onChange(dotValue as BN)
        call1();
    }

    return (
        <>
            <div className={classes("grid w-full grid-cols-12", 'block')} >
                <div className="col-span-6 w-full rounded-lg lg:col-span-6 2xl:col-span-7" >
                    <Form key={`${address}`}>
                        <FormField
                            help="Spenders"
                            id="message"
                            label={<><span>Spenders</span><UserAddIcon onClick={handleClickAdd} aria-hidden="true" className="w-4 !cursor-pointer justify-self-end dark:text-gray-500" /></>}

                        >
                            <div className='w-auto border-collapse overflow-hidden rounded border border-gray-200 dark:border-gray-700 bg-white dark:bg-transparent'>
                                <div className={`grid w-full cursor-pointer grid-cols-[1fr_200px_200px] font-bold items-center border border-l-0 border-r-0 border-t-0 border-gray-200 p-3 text-sm last:border-b-0 bg-white dark:bg-transparent hover:bg-gray-50 dark:border-gray-700 dark:text-white dark:hover:bg-elevation-1`}>
                                    {/* <div className="flex flex-row gap-4"> */}
                                    <div>address</div>
                                    <div>nft id</div>
                                    <div>claim</div>
                                    {/* </div> */}
                                </div>
                                {
                                    decodedOutput?.decodedOutput && outputToArray(decodedOutput?.decodedOutput).map((spender: any, index: number) => {
                                        return <SpenderRow spender={spender} key={`spender-${index}`} />;
                                    })
                                }
                            </div>

                            {/* <table border={1} className='w-full border-collapse overflow-hidden rounded border border-gray-200 dark:border-gray-700 bg-white dark:bg-transparent'>
                                <thead>
                                    <tr>
                                        <th key="1"></th>
                                        <th key="address">address</th>
                                        <th key="nft id">nft id</th>
                                        <th key="claim">claim</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {
                                        decodedOutput?.decodedOutput && outputToArray(decodedOutput?.decodedOutput).map((spender: any, index: number) => {
                                            return (
                                                <tr key={index}>
                                                    <td><Identicon size={18} value={spender[0]} /></td>
                                                    <td>{spender[0]}</td>
                                                    <td>{spender[1]}</td>
                                                    <td>{spender[2] ? 'Y' : 'N'}</td>
                                                </tr>
                                            );
                                        })
                                    }
                                </tbody>
                            </table> */}
                        </FormField>
                    </Form>
                </div>
            </div>
            <AddAuthOwnerModal isOpen={showAdd} setIsOpen={setShowAdd}>
                <div className="w-full rounded-lg">
                    <Form key={`${address}1`}>
                        <FormField
                            id="message"
                        >
                            {argValues1 && (
                                <ArgumentForm
                                    argValues={argValues1}
                                    args={approveMsg?.args ?? []}
                                    registry={registry}
                                    setArgValues={setArgValues1}
                                    className='ml-0'
                                />
                            )}
                        </FormField>

                        <div className='hidden'>
                            <OptionsForm
                                isPayable={!!mintMsg?.isPayable}
                                proofSize={proofSize}
                                refTime={refTime}
                                storageDepositLimit={storageDepositLimit}
                                value={valueState}
                            />
                            <OptionsForm
                                isPayable={!!approveMsg?.isPayable}
                                proofSize={proofSize1}
                                refTime={refTime1}
                                storageDepositLimit={storageDepositLimit1}
                                value={valueState1}
                            />
                        </div>
                    </Form>
                    <Buttons>
                        {
                            step == 0 && (
                                <Button
                                    isDisabled={callDisabled || callDisabled1}
                                    isLoading={txs[txId]?.status === 'processing' || txs1[txId1]?.status === 'processing'}
                                    onClick={handleCall}
                                    variant="primary"
                                >
                                    Mint
                                </Button>

                            )
                        }
                        {
                            step == 1 && (
                                <Button
                                    isDisabled={callDisabled || callDisabled1}
                                    isLoading={txs[txId]?.status === 'processing' || txs1[txId1]?.status === 'processing'}
                                    onClick={handleApprove}
                                    variant="primary"
                                >
                                    Approve
                                </Button>

                            )
                        }
                    </Buttons>
                </div>
            </AddAuthOwnerModal>
        </>
    )
};
