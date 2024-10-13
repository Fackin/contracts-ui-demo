import { Contracts } from 'ui/components/project/Contracts';
import { RootLayout } from 'ui/layout';
import { FolderOpenIcon } from '@heroicons/react/outline';
import { useDatabase } from 'ui/contexts';
import { useDbQuery } from 'ui/hooks';

export function Project() {
  const { db } = useDatabase();
  const [contracts, isLoading] = useDbQuery(() => db.contracts.toArray(), [db]);

  if (isLoading || !contracts) {
    return null;
  }

  if (contracts.length === 0) {
    return (
      <div className="flex flex-col items-center space-y-2 rounded border px-5 py-7  text-sm dark:border-gray-700 dark:text-gray-500">
        <FolderOpenIcon className="h-8 w-8" />
        <div>There hasn&apos;t any contracts yet on this browser.</div>
      </div>
    );
  }

  const mainContracts = contracts.filter((contract) => {
    const spec: any = contract.abi.spec
    return spec ? !!spec?.messages.find((m: any) => m.label === "get_admin_address") : false;
  });
  console.log(contracts)
  const erc721 = contracts.find((contract) => contract.name === "erc721")
  const erc20 = contracts.find((contract) => contract.name === "erc20")
  return (
    <RootLayout
      heading="Home"
    // help={}
    >
      <div>
        <div className="w-auto">
          {mainContracts?.map(contract => {
            return <Contracts contract={contract} erc721={erc721} erc20={erc20} key={`contract-${contract.address}`} />;
          })}
        </div>
        <div className="grid justify-items-end pt-4">
        </div>
      </div>
    </RootLayout>
  );
}
