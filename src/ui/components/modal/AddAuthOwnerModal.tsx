import type { ModalProps } from './ModalBase';
import { ModalBase as Modal } from './ModalBase';
export const AddAuthOwnerModal = ({ isOpen, setIsOpen, children }: Omit<ModalProps, 'title'>) => {

  return (
    <Modal isOpen={isOpen} setIsOpen={setIsOpen} title="Add Auth Owner">
      <div className="mt-4 border-b border-gray-200 pb-10 text-gray-600 dark:border-gray-800 dark:text-white">
        <div className="flex w-full flex-col gap-2">
          {children}
        </div>
      </div>

    </Modal>
  );
};
