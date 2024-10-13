// 
import { useEffect, useMemo, useState, useRef } from 'react';
import type { UIGas, CallResult, AbiMessage, Balance, ContractExecResult, UseStorageDepositLimit, ContractSubmittableResult, ContractOptions, SubmittableResult, UIContract, TransactionsQueue, UseBalance, SetState } from 'types';
import { useApi, useTransactions } from 'ui/contexts';
import { BN_ZERO } from 'lib/bn';
import { useArgValues, useBalance, useWeight } from 'ui/hooks';
import { useStorageDepositLimit } from 'ui/hooks/useStorageDepositLimit';
import {
    decodeStorageDeposit,
    getGasLimit,
    getStorageDepositLimit,
    transformUserInput,
} from 'lib/callOptions';
import { getDecodedOutput } from 'lib/output';

type ArgValues = Record<string, unknown>;

type OutputType = {
    decodedOutput: string;
    isError: boolean;
}

type RType = {
    call: () => any;
    decodedOutput: OutputType;
    argValues: ArgValues;
    setArgValues: SetState<ArgValues>;
    txs: TransactionsQueue;
    txId: number;
    setTxId: (value: number) => void;
    nextResultId: number;
    setNextResultId: (value: number) => void;
    outcome: ContractExecResult | undefined;
    setOutcome: (value: ContractExecResult | undefined) => void;
    storageDepositLimit: UseStorageDepositLimit;
    refTime: UIGas;
    proofSize: UIGas;
    isCustom: boolean;
    callDisabled: boolean;
    isDispatchable: boolean | undefined;
    valueState: UseBalance;
    callResults: CallResult[];
};

export const useGetDecodedOutput = (contract: UIContract, msg: AbiMessage | string | undefined, accountId: string, callback?: ()=>any): RType => {
    // if (!contract || !msg) return {} as RType;
    const {
        abi,
        abi: { registry },
        tx,
        address,
    } = contract;

    const message: AbiMessage | undefined = typeof msg === 'string' ? (abi.messages).find((m) => m?.identifier === msg) : (msg as AbiMessage);

    const { api, isAccountAvailable } = useApi();

    // accountId = accountId ?? (!accounts || accounts.length === 0 ? '' : accounts?.[0]?.address);

    const { queue, process, txs } = useTransactions();
    const valueState = useBalance(BN_ZERO);
    const { value } = valueState;
    const [argValues, setArgValues, inputData] = useArgValues(message, registry);
    const [callResults, setCallResults] = useState<CallResult[]>([]);


    const [txId, setTxId] = useState<number>(0);
    const [nextResultId, setNextResultId] = useState(1);
    const [outcome, setOutcome] = useState<ContractExecResult>();
    const storageDepositLimit = useStorageDepositLimit(accountId);
    const refTime = useWeight(outcome?.gasRequired.refTime.toBn());
    const proofSize = useWeight(outcome?.gasRequired.proofSize.toBn());
    const isCustom = refTime.mode === 'custom' || proofSize.mode === 'custom';

    const isDispatchable = message && (message?.isMutating || message?.isPayable);
    console.log(isDispatchable, message);

    const [decodedOutput, setDecodedOutput] = useState<OutputType>({
        decodedOutput: '',
        isError: false,
    });


    const callDisabled =
        !refTime.isValid ||
        !proofSize.isValid ||
        txs[txId]?.status === 'processing' ||
        !!outcome?.result.isErr ||
        !!decodedOutput?.isError ||
        isAccountAvailable === false;

    const params: Parameters<typeof api.call.contractsApi['call']> = useMemo(() => {
        return [
            accountId,
            address,
            message?.isPayable
                ? api.registry.createType('Balance', value)
                : api.registry.createType('Balance', BN_ZERO),
            getGasLimit(isCustom, refTime.limit, proofSize.limit, api.registry),
            getStorageDepositLimit(storageDepositLimit.isActive, storageDepositLimit.value, api.registry),
            inputData ?? '',
        ];
    }, [
        accountId,
        address,
        api.registry,
        inputData,
        isCustom,
        message?.isPayable,
        proofSize.limit,
        refTime.limit,
        storageDepositLimit.isActive,
        storageDepositLimit.value,
        value,
    ])

    useEffect(() => {
        setOutcome(undefined);
        setCallResults([]);
    }, [message, setArgValues, address]);

    useEffect((): void => {
        async function dryRun() {
            if (!message) return;
            const o = await api.call.contractsApi.call(...params);
            setOutcome(o);
            !isDispatchable && run();
        }
        dryRun().catch(err => console.error(err));
    }, [api.call.contractsApi, message, params, nextResultId]);


    async function run() {
        if (!message || !outcome) return;
        const decodedOutput = getDecodedOutput(outcome, message, registry);
        // return { decodedOutput, isError }
        setDecodedOutput(decodedOutput)
    }

    useEffect(() => {
        async function processTx() {
            txs[txId]?.status === 'queued' && (await process(txId));
        }
        processTx().catch(e => console.error(e));
    }, [process, txId, txs]);

    const onSuccess = ({ events, contractEvents, dispatchError }: ContractSubmittableResult) => {
        message &&
            setCallResults([
                ...callResults,
                {
                    id: nextResultId,
                    message,
                    time: Date.now(),
                    contractEvents,
                    events,
                    error: dispatchError?.isModule
                        ? api.registry.findMetaError(dispatchError.asModule)
                        : undefined,
                },
            ]);
        callback && callback()
        setNextResultId(nextResultId + 1);
    };

    const newId = useRef<number>();

    const call = () => {
        if (!outcome || !message || !accountId) throw new Error('Unable to call contract.');


        const { storageDeposit, gasRequired } = outcome;
        const { isActive, value: userInput } = storageDepositLimit;
        const predictedStorageDeposit = decodeStorageDeposit(storageDeposit);

        console.log('call-----------')
        // console.log(isCustom, refTime.limit, proofSize.limit, api.registry)
        console.log(message.method, argValues)
        console.log('call-----------end')

        const options: ContractOptions = {
            gasLimit: getGasLimit(isCustom, refTime.limit, proofSize.limit, api.registry) ?? gasRequired,
            storageDepositLimit: getStorageDepositLimit(
                isActive,
                userInput,
                api.registry,
                predictedStorageDeposit,
            ),
            value: message.isPayable ? (params[2] as Balance) : undefined,
        };

        const isValid = (result: SubmittableResult) => !result.isError && !result.dispatchError;

        const extrinsic = tx[message.method](
            options,
            ...transformUserInput(registry, message.args, argValues),
        );

        newId.current = queue({
            extrinsic,
            accountId,
            onSuccess,
            isValid,
        });
        setTxId(newId.current);
    };

    return {
        call,
        decodedOutput,
        argValues,
        setArgValues,
        txs,
        txId,
        setTxId,
        nextResultId,
        setNextResultId,
        outcome,
        setOutcome,
        storageDepositLimit,
        refTime,
        proofSize,
        isCustom,
        callDisabled,
        isDispatchable,
        valueState,
        callResults,
    };
};
