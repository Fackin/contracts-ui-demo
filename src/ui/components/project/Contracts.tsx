import { ContractDocument } from 'types';
import { useStoredContract } from 'ui/hooks';
import { ContractLine } from './ContractLine';
import { Loader } from 'ui/components/common/Loader';


interface Props {
  contract: ContractDocument;
  erc721: ContractDocument | undefined;
  erc20: ContractDocument | undefined;
}

export function Contracts({ contract: { address }, erc721, erc20 }: Props) {
  const contract = useStoredContract(address);
  const erc721N = erc721 && useStoredContract(erc721.address);
  const erc20N = erc20 && useStoredContract(erc20.address);
  return (
    <Loader isLoading={!contract} message="Loading contract...">
      {contract && (
        <ContractLine contract={contract} erc721={erc721N} erc20={erc20N}/>
      )}
    </Loader>
  );
}
