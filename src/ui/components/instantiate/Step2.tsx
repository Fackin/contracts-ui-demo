// Copyright 2022 @paritytech/contracts-ui authors & contributors
// SPDX-License-Identifier: GPL-3.0-only

import { useEffect, useMemo, useState } from 'react';
import { useParams } from 'react-router';
import { Button, Buttons } from '../common/Button';
import { Form, FormField, getValidation } from '../form/FormField';
import { InputBalance } from '../form/InputBalance';
import { InputSalt } from '../form/InputSalt';
import { InputGas } from '../form/InputGas';
import { InputStorageDepositLimit } from '../form/InputStorageDepositLimit';
import { isNumber, genRanHex, transformUserInput, BN_ZERO } from 'helpers';
import { ArgumentForm } from 'ui/components/form/ArgumentForm';
import { Dropdown } from 'ui/components/common/Dropdown';
import { createConstructorOptions } from 'ui/util/dropdown';
import { useApi, useInstantiate } from 'ui/contexts';
import { useBalance } from 'ui/hooks/useBalance';
import { useArgValues } from 'ui/hooks/useArgValues';
import { useFormField } from 'ui/hooks/useFormField';
import { useWeight } from 'ui/hooks/useWeight';
import { useToggle } from 'ui/hooks/useToggle';
import { AbiMessage, OrFalsy } from 'types';
import { useStorageDepositLimit } from 'ui/hooks/useStorageDepositLimit';

function validateSalt(value: OrFalsy<string>) {
  if (!!value && value.length === 66) {
    return { isValid: true };
  }

  return { isValid: false, isError: true, message: 'Invalid hex string' };
}

export function Step2() {
  const { api } = useApi();
  const { data, setStep, step, setData, dryRunResult, setDryRunResult } = useInstantiate();
  const { accountId, metadata } = data;
  const [constructorIndex, setConstructorIndex] = useState<number>(0);
  const [deployConstructor, setDeployConstructor] = useState<AbiMessage>();
  const { value, onChange: onChangeValue, ...valueValidation } = useBalance(BN_ZERO);
  const weight = useWeight(dryRunResult?.gasRequired);
  const storageDepositLimit = useStorageDepositLimit(accountId);
  const salt = useFormField<string>(genRanHex(64), validateSalt);
  const [argValues, setArgValues] = useArgValues(deployConstructor?.args ?? [], metadata?.registry);
  const { codeHash: codeHashUrlParam } = useParams<{ codeHash: string }>();

  useEffect(() => {
    setConstructorIndex(0);
    metadata && setDeployConstructor(metadata.constructors[0]);
  }, [metadata, setConstructorIndex]);

  const [isUsingSalt, toggleIsUsingSalt] = useToggle(true);
  const [isUsingStorageDepositLimit, toggleIsUsingStorageDepositLimit] = useToggle();

  const params = useMemo(() => {
    const inputData = deployConstructor?.toU8a(
      transformUserInput(api.registry, deployConstructor.args, argValues)
    );

    return {
      origin: accountId,
      gasLimit: weight.mode === 'custom' ? weight.megaGas : weight.maxWeight,
      storageDepositLimit: isUsingStorageDepositLimit ? storageDepositLimit.value : undefined,
      code: codeHashUrlParam
        ? { Existing: codeHashUrlParam }
        : { Upload: metadata?.info.source.wasm },
      data: inputData,
      salt: salt.value || undefined,
      value: deployConstructor?.isPayable ? value : undefined,
    };
  }, [
    accountId,
    api.registry,
    argValues,
    codeHashUrlParam,
    deployConstructor,
    isUsingStorageDepositLimit,
    metadata?.info.source.wasm,
    salt.value,
    storageDepositLimit.value,
    value,
    weight.maxWeight,
    weight.megaGas,
    weight.mode,
  ]);

  useEffect((): void => {
    async function dryRun() {
      try {
        const result = await api.rpc.contracts.instantiate(params);
        setDryRunResult(result);
      } catch (e) {
        console.error(e);
      }
    }
    dryRun().catch(e => console.error(e));
  }, [api.rpc.contracts, params, setDryRunResult]);

  const onSubmit = () => {
    const { salt, storageDepositLimit, value } = params;
    const { storageDeposit, gasRequired } = dryRunResult ?? {};
    setData({
      ...data,
      constructorIndex,
      salt,
      value,
      argValues,
      storageDepositLimit: isUsingStorageDepositLimit
        ? storageDepositLimit
        : storageDeposit?.isCharge
        ? storageDeposit?.asCharge
        : undefined,
      weight: weight.mode === 'custom' ? weight.megaGas : gasRequired ?? weight.maxWeight,
    });
    setStep(3);
  };

  if (step !== 2) return null;

  return metadata ? (
    <>
      <Form>
        <FormField
          help="The constructor to use for this contract deployment."
          id="constructor"
          label="Deployment Constructor"
        >
          <Dropdown
            id="constructor"
            options={createConstructorOptions(metadata.registry, metadata.constructors)}
            className="mb-4"
            value={constructorIndex}
            onChange={v => {
              if (isNumber(v)) {
                setConstructorIndex(v);
                setDeployConstructor(metadata.constructors[v]);
              }
            }}
          >
            No constructors found
          </Dropdown>
          {deployConstructor && argValues && (
            <ArgumentForm
              key={`args-${deployConstructor.method}`}
              args={deployConstructor.args}
              registry={metadata.registry}
              setArgValues={setArgValues}
              argValues={argValues}
              className="argument-form"
            />
          )}
        </FormField>
        {deployConstructor?.isPayable && (
          <FormField
            help="The balance to transfer from the `origin` to the newly created contract."
            id="value"
            label="Value"
            {...valueValidation}
          >
            <InputBalance id="value" value={value} onChange={onChangeValue} />
          </FormField>
        )}
        <FormField
          help="A hex or string value that acts as a salt for this deployment."
          id="salt"
          label="Deployment Salt"
          {...getValidation(salt)}
        >
          <InputSalt isActive={isUsingSalt} toggleIsActive={toggleIsUsingSalt} {...salt} />
        </FormField>

        <div className="flex justify-between">
          <FormField
            help="The maximum amount of gas (in millions of units) to use for this instantiation. If the transaction requires more, it will fail."
            id="maxGas"
            label="Max Gas Allowed"
            isError={!weight.isValid}
            message={!weight.isValid && weight.errorMsg}
            className="basis-2/4 mr-4"
          >
            <InputGas {...weight} />
          </FormField>
          <FormField
            help="The maximum balance allowed to be deducted for the new contract's storage deposit."
            id="storageDepositLimit"
            label="Storage Deposit Limit"
            isError={!storageDepositLimit.isValid}
            message={
              !storageDepositLimit.isValid
                ? storageDepositLimit.message || 'Invalid storage deposit limit'
                : null
            }
            className="basis-2/4 shrink-0"
          >
            <InputStorageDepositLimit
              isActive={isUsingStorageDepositLimit}
              toggleIsActive={toggleIsUsingStorageDepositLimit}
              {...storageDepositLimit}
            />
          </FormField>
        </div>
      </Form>
      <Buttons>
        <Button
          isDisabled={
            (deployConstructor?.isPayable && !valueValidation.isValid) ||
            (isUsingSalt && !salt.isValid) ||
            !weight.isValid ||
            !storageDepositLimit.isValid ||
            !deployConstructor?.method ||
            (dryRunResult && dryRunResult.result.isErr)
          }
          onClick={onSubmit}
          variant="primary"
          data-cy="next-btn"
        >
          Next
        </Button>

        <Button
          onClick={() => {
            setStep(1);
          }}
          variant="default"
        >
          Go Back
        </Button>
      </Buttons>
    </>
  ) : null;
}
