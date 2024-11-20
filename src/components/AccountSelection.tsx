import { ImportedAccount, useWallet } from '@/contexts/WalletProvider';
import React, { useEffect, useState } from 'react';

interface AccountSelectionModalProps {
  onSelect: (account: ImportedAccount) => Promise<void>;
  onClose: () => void;
}

const AccountSelectionModal: React.FC<AccountSelectionModalProps> = ({ onSelect, onClose }) => {
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
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="bg-gray-900/95 border border-gray-800 shadow-xl shadow-emerald-500/10 rounded-lg p-6 max-w-md w-full mx-4">
        <h3 className="text-xl font-semibold mb-4 text-gray-100">Select an Account</h3>
        <div className="space-y-2">
          {accounts.map((account) => (
            <button
              key={account.address}
              onClick={() => handleSelect(account)}
              className="w-full text-left p-3 rounded-lg hover:bg-gray-800 transition-colors text-gray-200"
            >
              <strong className="block">{account.name}</strong>
              <span className="text-sm text-gray-400 break-all">{truncateAddress(account.address)}</span>
            </button>
          ))}
        </div>
        <button 
          onClick={onClose}
          className="mt-4 w-full py-2 px-4 bg-gray-800 hover:bg-gray-700 rounded-lg transition-colors text-gray-200"
        >
          Close
        </button>
      </div>
    </div>
  );
};

export default AccountSelectionModal;