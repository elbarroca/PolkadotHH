'use client';

import React, { createContext, useState, useContext, useCallback } from 'react';
import { ApiPromise, WsProvider } from '@polkadot/api';
import { web3Enable, web3Accounts } from '@polkadot/extension-dapp';
import keyring from '@polkadot/ui-keyring';
import { cryptoWaitReady } from '@polkadot/util-crypto';
import { Web3Signer } from '@cere-ddc-sdk/blockchain';
import { NETWORKS } from '@/lib/cereNetwork';
import { addLocalExtension, setLocalActiveAccount } from '@/lib/localStorage';
import AccountSelectionModal from '../wallet/AccountSelection';

export interface ImportedAccount {
  address: string;
  name?: string;
}

interface WalletContextType {
  activeAccount: string | null;
  connectWallet: () => Promise<void>;
  error: string | null;
  isLoading: boolean;
}

const WalletContext = createContext<WalletContextType | null>(null);

export const useWallet = () => {
  const context = useContext(WalletContext);
  if (!context) {
    throw new Error('useWallet must be used within a WalletProvider');
  }
  return context;
};

export const WalletProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [api, setApi] = useState<ApiPromise | null>(null);
  const [accounts, setAccounts] = useState<ImportedAccount[]>([]);
  const [activeAccount, setActiveAccount] = useState<string | null>(null);
  const [showModal, setShowModal] = useState(false);
  const [web3Signer, setWeb3Signer] = useState<Web3Signer | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const initializeKeyring = async () => {
    await cryptoWaitReady();
    keyring.loadAll({
      ss58Format: 42,
      type: 'sr25519',
    });
  };

  const initializeApi = async (networkKey: string) => {
    const network = NETWORKS[networkKey];
    const provider = new WsProvider(network.endpoints.rpc);
    const apiInstance = await ApiPromise.create({ provider });
    setApi(apiInstance);
    return apiInstance;
  };

  const connectWallet = useCallback(async () => {
    try {
      setError(null);
      setIsLoading(true);

      // Force disconnect any existing connections first
      const injectedWeb3 = window.injectedWeb3;
      if (injectedWeb3) {
        Object.values(injectedWeb3).forEach((injected: any) => {
          if (injected && injected.accounts && injected.accounts.disconnect) {
            try {
              injected.accounts.disconnect();
            } catch (e) {
              console.log('Disconnect error:', e);
            }
          }
        });
      }

      // Clear any stored authorizations
      localStorage.removeItem('polkadot-js-authorized');

      // Now try to connect - this should trigger the extension popup
      const injectedExtensions = await web3Enable('PolkaDrive');
      if (!injectedExtensions.length) {
        throw new Error(
          'Polkadot.js extension not found. Please install it from https://polkadot.js.org/extension/'
        );
      }

      const allAccounts = await web3Accounts();
      if (allAccounts.length === 0) {
        throw new Error(
          'No accounts found. Please create an account in the Polkadot.js extension first.'
        );
      }

      injectedExtensions.forEach((ext) => addLocalExtension(ext.name));

      const formattedAccounts = allAccounts.map((account) => ({
        address: account.address,
        name: account.meta.name || 'Unnamed Account',
      }));

      if (formattedAccounts.length > 1) {
        setAccounts(formattedAccounts);
        setShowModal(true);
      } else {
        await handleAccountSelection(formattedAccounts[0]);
      }
    } catch (error: any) {
      if (error.message.includes('User rejected')) {
        setError('Connection rejected. Please accept the connection request in the Polkadot.js extension.');
      } else {
        const errorMessage = error instanceof Error ? error.message : 'Failed to connect wallet';
        setError(errorMessage);
      }
      console.error('Error connecting wallet:', error);
    } finally {
      setIsLoading(false);
    }
  }, []);

  const handleAccountSelection = async (account: ImportedAccount) => {
    setActiveAccount(account.address);
    setLocalActiveAccount('cereMainnet', account.address);

    const signerInstance = new Web3Signer();
    await signerInstance.connect();
    setWeb3Signer(signerInstance);

    if (!api) {
      await initializeApi('cereMainnet');
    }

    setShowModal(false);
    console.log('Connected account:', account.address);
  };

  return (
    <WalletContext.Provider value={{ activeAccount, connectWallet, error, isLoading }}>
      {children}
      {showModal && (
        <AccountSelectionModal
          accounts={accounts}
          onSelect={handleAccountSelection}
          onClose={() => setShowModal(false)}
        />
      )}
    </WalletContext.Provider>
  );
};
