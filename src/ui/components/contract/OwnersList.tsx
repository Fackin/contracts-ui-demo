// Copyright 2022-2024 use-ink/contracts-ui authors & contributors
// SPDX-License-Identifier: GPL-3.0-only

import { useEffect, useState } from 'react';
import {
  AbiMessage,
  UIContract,
} from 'types';
import { Button, Buttons } from 'ui/components/common';
import { ArgumentForm, Form, FormField, OptionsForm } from 'ui/components/form';
import { useApi } from 'ui/contexts';
import { useGetDecodedOutput } from 'ui/hooks';
import { classes } from 'lib/util';
import { OwnerRow } from './OwnerRow';
import { UserAddIcon } from '@heroicons/react/outline';
import { AddAuthOwnerModal } from 'ui/components/modal';

interface Props {
  contract: UIContract;
}

export const OwnersList = ({
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
  const [accountId, setAccountId] = useState('');
  const [adminMessage, setAddminMessage] = useState<AbiMessage>();
  const [addAuthTokenOwnerMessage, setAddAuthTokenOwnerMessage] = useState<AbiMessage>();
  const [showAddOwner, setShowAddOwner] = useState(false);

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

  const callback = () => {
    setShowAddOwner(false)
    const m = JSON.parse(JSON.stringify(message))
    setMessage(m);
    // setMessage({} as AbiMessage);
    // setTimeout(() => {
    // }, 500);
  }

  const { call, callDisabled, isDispatchable, proofSize, refTime, storageDepositLimit, valueState, txs, txId, argValues, setArgValues } = useGetDecodedOutput(contract, addAuthTokenOwnerMessage, accountId, callback);


  useEffect(() => {
    const authOwnerM = (abi.messages).find((m) => m?.identifier === 'get_auth_token_owner_address')
    const adminAddressM = (abi.messages).find((m) => m?.identifier === 'get_admin_address')
    const addAuthTokenOwnerM = (abi.messages).find((m) => m?.identifier === 'add_auth_token_owner')
    setMessage(authOwnerM);
    setAddminMessage(adminAddressM);
    addAuthTokenOwnerM?.args.forEach((a) => {
      if (a.name === 'ownerAddress') {
        // a.type.type = 'Owner';
        setArgValues({ ownerAddress: '' })
      }
    })
    setAddAuthTokenOwnerMessage(addAuthTokenOwnerM);
  }, [abi.messages, setArgValues, address]);



  const handleClickAdd = () => {
    setShowAddOwner(true)
  };

  const outputToArray = (value: string) => {
    if (!value) return [];
    value = value.replaceAll("'", '"').replace(/\s/g, '').replace(new RegExp(',]$'), ']')
    try {
      return JSON.parse(value);
    } catch (error) {
      return [];
    }
  }


  const { decodedOutput } = useGetDecodedOutput(contract, message, accountId);
  const { decodedOutput: adminOutput } = useGetDecodedOutput(contract, adminMessage, accountId);
  const adminList =  outputToArray(adminOutput.decodedOutput);
  const adminAddress =  adminList && adminList[0];


  return (
    <>
      <div className={classes("grid w-full grid-cols-12", 'block')} >
        <div className="col-span-6 w-full rounded-lg lg:col-span-6 2xl:col-span-7" >
          <Form key={`${address}`}>
            {/* <FormField
              className="caller mb-8"
              help="The sending account for this interaction. Any transaction fees will be deducted from this account."
              id="accountId"
              isError={isAccountAvailable === false}
              label="Caller"
              message="Selected Account is not available to sign extrinsics."
            >
              <AccountSelect
                className="mb-2"
                id="accountId"
                isDisabled
                onChange={setAccountId}
                value={accountId}
              />
            </FormField> */}
            <FormField
              help="Auth token owners"
              id="message"
              label={<><span>Owners</span><UserAddIcon onClick={handleClickAdd} aria-hidden="true" className="w-4 !cursor-pointer justify-self-end dark:text-gray-500" /></>}
            >
              <div className='w-auto border-collapse overflow-hidden rounded border border-gray-200 dark:border-gray-700 bg-white dark:bg-transparent'>
                {
                  decodedOutput?.decodedOutput && outputToArray(decodedOutput?.decodedOutput).map((owner: any) => {
                    return <OwnerRow owner={owner} key={`owner-${owner}`} admin={adminAddress} />;
                  })
                }
              </div>
            </FormField>
          </Form>
        </div>
      </div>
      <AddAuthOwnerModal isOpen={showAddOwner} setIsOpen={setShowAddOwner}>
        <div className="w-full rounded-lg">
          <Form key={`${address}1`}>
            <FormField
              id="message"
            >
              {argValues && (
                <ArgumentForm
                  argValues={argValues}
                  args={addAuthTokenOwnerMessage?.args ?? []}
                  registry={registry}
                  setArgValues={setArgValues}
                  className='ml-0'
                />
              )}
            </FormField>

            {isDispatchable && (
              <OptionsForm
                isPayable={!!addAuthTokenOwnerMessage?.isPayable}
                proofSize={proofSize}
                refTime={refTime}
                storageDepositLimit={storageDepositLimit}
                value={valueState}
              />
            )}
          </Form>
          <Buttons>
            {isDispatchable && (
              <Button
                isDisabled={callDisabled}
                isLoading={txs[txId]?.status === 'processing'}
                onClick={call}
                variant="primary"
              >
                Call contract
              </Button>
            )}
          </Buttons>
        </div>
      </AddAuthOwnerModal>
    </>
  )
};
