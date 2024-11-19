import React from 'react';
import { ImportedAccount } from './WalletTest';

interface AccountSelectionModalProps {
  accounts: ImportedAccount[];
  onSelect: (account: ImportedAccount) => Promise<void>;
  onClose: () => void;
}

const AccountSelectionModal: React.FC<AccountSelectionModalProps> = ({ accounts, onSelect, onClose }) => (
  <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
    <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
      <h3 className="text-xl font-semibold mb-4">Select an Account</h3>
      <div className="space-y-2">
        {accounts.map((account) => (
          <button
            key={account.address}
            onClick={() => onSelect(account)}
            className="w-full text-left p-3 rounded-lg hover:bg-gray-100 transition-colors"
          >
            <strong className="block text-gray-900">{account.name}</strong>
            <span className="text-sm text-gray-600 break-all">{account.address}</span>
          </button>
        ))}
      </div>
      <button 
        onClick={onClose}
        className="mt-4 w-full py-2 px-4 bg-gray-200 hover:bg-gray-300 rounded-lg transition-colors"
      >
        Close
      </button>
    </div>
  </div>
);

export default AccountSelectionModal;
