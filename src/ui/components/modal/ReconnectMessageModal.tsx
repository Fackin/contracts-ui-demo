
import type { ModalProps } from './ModalBase';
import { ModalBase as Modal } from './ModalBase';
import Pol1 from '../../assets/pol-1.png';
import Pol2 from 'ui/assets/pol-2.png';
import Sub1 from '../../assets/sub-1.png';
import Sub2 from 'ui/assets/sub-2.png';
import Sub3 from '../../assets/sub-3.png';
import Sub4 from 'ui/assets/sub-4.png';

interface Props extends ModalProps {
  type: string;
}
export const ReconnectMessageModal = ({ isOpen, setIsOpen, type }: Omit<Props, 'title'>) => {

  return (
    <Modal isOpen={isOpen} setIsOpen={setIsOpen} title="Message" className="max-w-xl" >
      <div className='my-6 grid w-full grid-cols-2 gap-4 max-h-96 overflow-y-auto'>
        {
          type === 'Polkadot JS' ?
            <>
              <img src={Pol1} alt='Polkadot-1' className='w-60' />
              <img src={Pol2} alt='Polkadot-2' className='w-60' />
            </>
            :
            <>
              <img src={Sub1} alt='SubWallet-1' className='w-60' />
              <img src={Sub2} alt='SubWallet-2' className='w-60' />
              <img src={Sub3} alt='SubWallet-3' className='w-60' />
              <img src={Sub4} alt='SubWallet-4' className='w-60' />
            </>
        }
      </div>
    </Modal>
  );
};
