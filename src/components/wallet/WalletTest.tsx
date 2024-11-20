'use client';

import React, { createContext, useState, useContext, useCallback } from 'react';
import { ApiPromise, WsProvider } from '@polkadot/api';
import { web3Enable, web3Accounts, web3FromAddress } from '@polkadot/extension-dapp';
import keyring from '@polkadot/ui-keyring';
import { cryptoWaitReady } from '@polkadot/util-crypto';
import { stringToHex } from '@polkadot/util';
import { Web3Signer } from '@cere-ddc-sdk/blockchain';
import { NETWORKS } from '@/lib/cereNetwork';
import { addLocalExtension, setLocalActiveAccount } from '@/lib/localStorage';
import AccountSelectionModal from '../wallet/AccountSelection';

declare global {
  interface Window {
    injectedWeb3?: {
      'polkadot-js'?: any;
      [key: string]: any;
    };
  }
}

export interface ImportedAccount {
  address: string;
  name?: string;
  meta?: {
    name: string;
    source: string;
  };
}

interface WalletContextType {
  activeAccount: string | null;
  connectWallet: () => Promise<void>;
  disconnectWallet: () => Promise<void>;
  signMessage: (message: string) => Promise<string | null>;
  error: string | null;
  isLoading: boolean;
  accounts: ImportedAccount[];
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
  const [isKeyringInitialized, setIsKeyringInitialized] = useState(false);

  const initializeKeyring = async () => {
    try {
      await cryptoWaitReady();
      
      try {
        keyring.getPairs();
      } catch (e) {
        keyring.loadAll({
          ss58Format: 42,
          type: 'sr25519',
          isDevelopment: false
        });
      }
      
      setIsKeyringInitialized(true);
      console.log('Keyring ready');
    } catch (error) {
      console.error('Keyring initialization error:', error);
      throw error;
    }
  };

  const initializeApi = async (networkKey: string) => {
    try {
      const network = NETWORKS[networkKey];
      const provider = new WsProvider(network.endpoints.rpc);
      const apiInstance = await ApiPromise.create({ 
        provider,
        throwOnConnect: true,
        throwOnUnknown: true
      });
      await apiInstance.isReady;
      setApi(apiInstance);
      return apiInstance;
    } catch (error) {
      console.error('API initialization failed:', error);
      throw new Error('Failed to connect to network');
    }
  };

  const signMessage = async (message: string): Promise<string | null> => {
    try {
      if (!activeAccount) {
        throw new Error('No active account');
      }

      const injector = await web3FromAddress(activeAccount);
      const signRaw = injector?.signer?.signRaw;

      if (!signRaw) {
        throw new Error('Signing not supported');
      }

      const { signature } = await signRaw({
        address: activeAccount,
        data: stringToHex(message),
        type: 'bytes'
      });

      return signature;
    } catch (error) {
      console.error('Signing failed:', error);
      setError('Failed to sign message');
      return null;
    }
  };

  const connectWallet = useCallback(async () => {
    try {
      console.log('Starting wallet connection...');
      setError(null);
      setIsLoading(true);

      if (!window?.injectedWeb3?.['polkadot-js']) {
        throw new Error(
          'Polkadot.js extension not found. Please install it from https://polkadot.js.org/extension/'
        );
      }

      try {
        await initializeKeyring();
      } catch (error) {
        console.log('Keyring already initialized, continuing...');
      }

      console.log('Requesting extension access...');
      const extensions = await web3Enable('PolkaDrive');
      console.log('Extensions enabled:', extensions);

      if (extensions.length === 0) {
        throw new Error(
          'No extensions authorized. Please accept the authorization request.'
        );
      }

      console.log('Requesting accounts...');
      const allAccounts = await web3Accounts();
      console.log('Retrieved accounts:', allAccounts);

      if (!allAccounts || allAccounts.length === 0) {
        throw new Error(
          'No accounts found. To create a new account:\n' +
          '1. Click the Polkadot.js extension icon\n' +
          '2. Click the "+" button\n' +
          '3. Follow the account creation process'
        );
      }

      const formattedAccounts = allAccounts.map((account) => ({
        address: account.address,
        name: account.meta.name,
        meta: account.meta
      }));

      const typedAccounts: ImportedAccount[] = formattedAccounts.map(account => ({
        address: account.address,
        name: account.meta.name || '',
        meta: {
          name: account.meta.name || '',
          source: account.meta.source
        }
      }));

      setAccounts(typedAccounts);

      if (typedAccounts.length > 1) {
        console.log('Multiple accounts found, showing selection modal');
        setShowModal(true);
      } else {
        console.log('Single account found, selecting automatically');
        await handleAccountSelection(typedAccounts[0]);
      }

    } catch (error: any) {
      console.error('Wallet connection error:', error);
      const errorMessage = error?.message || 'An unknown error occurred';
      if (!errorMessage.includes('Unable to initialise')) {
        setError(errorMessage);
      }
    } finally {
      setIsLoading(false);
    }
  }, []);

  const handleAccountSelection = async (account: ImportedAccount) => {
    try {
      console.log('Starting account selection for:', account);
      
      setActiveAccount(account.address);
      setLocalActiveAccount('cereMainnet', account.address);

      if (!api) {
        console.log('Initializing API...');
        await initializeApi('cereMainnet');
      }

      console.log('Initializing Web3Signer...');
      const signerInstance = new Web3Signer();
      await signerInstance.connect();
      setWeb3Signer(signerInstance);

      setShowModal(false);
      console.log('Account selection completed:', account.address);
    } catch (error) {
      console.error('Error in account selection:', error);
      setError('Failed to initialize account connection');
    }
  };

  const disconnectWallet = useCallback(async () => {
    try {
      console.log('Starting wallet disconnection...');
      setIsLoading(true);

      if (api) {
        await api.disconnect();
        setApi(null);
      }

      if (web3Signer) {
        setWeb3Signer(null);
      }

      // Reset states
      setActiveAccount(null);
      setAccounts([]);
      setError(null);

      // Clear local storage
      localStorage.removeItem('activeAccount');

      console.log('Wallet disconnected successfully');
    } catch (error: any) {
      console.error('Error disconnecting wallet:', error);
      setError('Failed to disconnect wallet');
    } finally {
      setIsLoading(false);
    }
  }, [api, web3Signer]);

  return (
    <WalletContext.Provider value={{ 
      activeAccount,
      connectWallet,
      disconnectWallet,
      signMessage,
      error,
      isLoading,
      accounts
    }}>
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
