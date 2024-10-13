import { useParams } from 'react-router-dom';
import { SpenderList } from 'ui/components/contract';
import { Loader } from 'ui/components/common/Loader';
import { RootLayout } from 'ui/layout';
import { useStoredContract } from 'ui/hooks';


export function Spender() {
    const { address } = useParams();
    if (!address) throw new Error('No address in url');
    const contract = useStoredContract(address);

    return (
        <Loader isLoading={!contract} message="Loading contract...">
            {contract && (
                <RootLayout
                    heading={contract.displayName || contract.name}
                >
                    <SpenderList contract={contract} />
                </RootLayout>
            )}
        </Loader>
    );
}
