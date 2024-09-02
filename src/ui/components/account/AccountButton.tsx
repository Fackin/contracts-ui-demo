// import Identicon from '@polkadot/react-identicon';
import { classes } from 'lib/util';
import { Button } from '../common';
import { IdenticonNew } from './IdenticonNew';

type Props = {
  name?: string;
  address: string;
  className?: string;
  onClick: () => void;
};

const AccountButton = ({ name, address, className, onClick }: Props) => {

  return (
    <Button onClick={onClick} className={classes(className, '')}>
      {/* <Identicon value={address} size={24} theme="polkadot" /> */}
      <div className='w-full flex justify-center items-center'>
        <IdenticonNew className="pr-2" size={24} value={address} />
        <span>{name}</span>
      </div>
    </Button>
  );
};

export { AccountButton };
