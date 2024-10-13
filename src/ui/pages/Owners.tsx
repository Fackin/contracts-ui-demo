import { useParams } from 'react-router-dom';
import { OwnersList } from 'ui/components/contract/OwnersList';
import { Loader } from 'ui/components/common/Loader';
import { RootLayout } from 'ui/layout';
import { useStoredContract } from 'ui/hooks';


export function Owners() {
  const { address } = useParams();
  if (!address) throw new Error('No address in url');
  const contract = useStoredContract(address);

  return (
    <Loader isLoading={!contract} message="Loading contract...">
      {contract && (
        <RootLayout
          heading={contract.displayName || contract.name}
          // help={}
        >
          <OwnersList contract={contract} />
        </RootLayout>
      )}
    </Loader>
  );
}
