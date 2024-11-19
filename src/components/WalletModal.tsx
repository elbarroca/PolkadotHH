'use client';

import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { ImportedAccount } from "@/contexts/WalletProvider";
import { Button } from "./ui/button";

interface WalletModalProps {
  isOpen: boolean;
  onClose: () => void;
  accounts: ImportedAccount[];
  onSelectAccount: (account: ImportedAccount) => void;
}

export function WalletModal({ isOpen, onClose, accounts, onSelectAccount }: WalletModalProps) {
  if (accounts.length === 0) {
    return (
      <Dialog open={isOpen} onOpenChange={onClose}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Connect Wallet</DialogTitle>
          </DialogHeader>
          <div className="flex flex-col gap-4 py-4">
            <p className="text-center text-gray-500">
              Please install and unlock the Polkadot.js extension first.
            </p>
            <Button
              variant="outline"
              onClick={() => window.open('https://polkadot.js.org/extension/', '_blank')}
              className="w-full"
            >
              Get Polkadot.js Extension
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    );
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Select Account</DialogTitle>
        </DialogHeader>
        <div className="flex flex-col gap-2 py-4">
          {accounts.map((account) => (
            <Button
              key={account.address}
              variant="outline"
              className="w-full justify-between flex items-center p-4 hover:bg-gray-100"
              onClick={() => onSelectAccount(account)}
            >
              <div className="flex flex-col items-start gap-1">
                <span className="font-medium">
                  {account.name || 'Account'}
                </span>
                <span className="text-sm text-gray-500 font-mono">
                  {`${account.address.slice(0, 6)}...${account.address.slice(-4)}`}
                </span>
              </div>
              <div className="text-xs text-gray-400">
                Click to connect
              </div>
            </Button>
          ))}
        </div>
      </DialogContent>
    </Dialog>
  );
}