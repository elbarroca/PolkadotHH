import { ImportedAccount, useWallet } from '@/contexts/WalletProvider';
import React, { useEffect, useState } from 'react';

interface AccountSelectionModalProps {
  onSelect: (account: ImportedAccount) => Promise<void>;
  onClose: () => void;
}

const AccountSelectionModal: React.FC<AccountSelectionModalProps> = ({
  onSelect,
  onClose,
}) => {
  const { getAvailableAccounts } = useWallet();
  const [accounts, setAccounts] = useState<ImportedAccount[]>([]);

  useEffect(() => {
    const fetchAccounts = async () => {
      try {
        const availableAccounts = await getAvailableAccounts();
        setAccounts(availableAccounts);
      } catch (error) {
        console.error('Failed to fetch accounts:', error);
      }
    };

    fetchAccounts();
  }, [getAvailableAccounts]);

  const truncateAddress = (address: string) =>
    `${address.slice(0, 15)}...${address.slice(-15)}`;

  const handleSelect = async (account: ImportedAccount) => {
    await onSelect(account);
    onClose();
  };

  return (
    <div className='fixed inset-0 z-50 flex items-center justify-center bg-black/50'>
      <div className='mx-4 w-full max-w-md rounded-lg border border-gray-800 bg-gray-900/95 p-6 shadow-xl shadow-emerald-500/10'>
        <h3 className='mb-4 text-xl font-semibold text-gray-100'>
          Select an Account
        </h3>
        <div className='space-y-2'>
          {accounts.map((account) => (
            <button
              key={account.address}
              onClick={() => handleSelect(account)}
              className='w-full rounded-lg p-3 text-left text-gray-200 transition-colors hover:bg-gray-800'
            >
              <strong className='block'>{account.name}</strong>
              <span className='break-all text-sm text-gray-400'>
                {truncateAddress(account.address)}
              </span>
            </button>
          ))}
        </div>
        <button
          onClick={onClose}
          className='mt-4 w-full rounded-lg bg-gray-800 px-4 py-2 text-gray-200 transition-colors hover:bg-gray-700'
        >
          Close
        </button>
      </div>
    </div>
  );
};

export default AccountSelectionModal;
