'use client';

import { ApiPromise, WsProvider } from '@polkadot/api';
import { web3Enable, web3Accounts } from '@polkadot/extension-dapp';
import { InjectedExtension } from '@polkadot/extension-inject/types';
import React, { createContext, useContext, useRef, useState, useCallback } from 'react';
import { NETWORKS } from '../config/cereNetwork';
import { AccountInfo } from '@polkadot/types/interfaces';
import type { AccountData } from '@polkadot/types/interfaces/balances';

export interface ImportedAccount {
  address: string;
  name?: string;
  source: string;
  signer?: any;
}

export interface WalletContextInterface {
  connectWallet: () => Promise<{ address: string; network: string }>;
  disconnectWallet: () => Promise<void>;
  getBalance: (address: string) => Promise<string>;
  switchNetwork: (network: string) => Promise<void>;
  signMessage: (message: string) => Promise<string>;
  api: ApiPromise | null;
  activeAccount: string | null;
  activeNetwork: string | null;
  accounts: ImportedAccount[];
}

const APP_NAME = 'Cere Network dApp';

const defaultContext: WalletContextInterface = {
  connectWallet: async () => ({ address: '', network: '' }),
  disconnectWallet: async () => {},
  getBalance: async () => '0',
  switchNetwork: async () => {},
  signMessage: async () => '',
  api: null,
  activeAccount: null,
  activeNetwork: null,
  accounts: [],
};

const WalletContext = createContext<WalletContextInterface>(defaultContext);

export const useWallet = () => useContext(WalletContext);

export const WalletProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [api, setApi] = useState<ApiPromise | null>(null);
  const [accounts, setAccounts] = useState<ImportedAccount[]>([]);
  const [activeAccount, setActiveAccount] = useState<string | null>(null);
  const [activeNetwork, setActiveNetwork] = useState<string | null>(null);
  const [extensions, setExtensions] = useState<InjectedExtension[]>([]);

  const accountsRef = useRef(accounts);
  const activeAccountRef = useRef(activeAccount);

  // Initialize connection to network
  const initializeApi = async (networkKey: string) => {
    const network = NETWORKS[networkKey];
    if (!network) throw new Error('Network not supported');

    try {
      const provider = new WsProvider(network.endpoints.rpc);
      const api = await ApiPromise.create({ provider });
      await api.isReady;
      
      setApi(api);
      setActiveNetwork(networkKey);
      return api;
    } catch (error) {
      console.error('Failed to connect to network:', error);
      throw error;
    }
  };

  const connectWallet = useCallback(async () => {
    try {
      // Enable all extensions
      const injectedExtensions = await web3Enable(APP_NAME);
      if (!injectedExtensions.length) {
        throw new Error('No extension found');
      }
      setExtensions(injectedExtensions);

      // Get all accounts
      const allAccounts = await web3Accounts();
      console.log(allAccounts)
      const formattedAccounts: ImportedAccount[] = allAccounts.map(account => ({
        address: account.address,
        name: account.meta.name || undefined,
        source: account.meta.source || 'unknown',
        signer: account.meta.source
      }));

      setAccounts(formattedAccounts);
      accountsRef.current = formattedAccounts;

      // Set first account as active if none selected
      if (!activeAccount && formattedAccounts.length > 0) {
        setActiveAccount(formattedAccounts[0].address);
        activeAccountRef.current = formattedAccounts[0].address;
      }

      console.log(activeAccount)

      // Initialize API if not already done
      if (!api) {
        await initializeApi('cereMainnet'); // Default to mainnet
      }

      return {
        address: formattedAccounts[0].address,
        network: activeNetwork || 'cereMainnet'
      };
    } catch (error) {
      console.error('Failed to connect wallet:', error);
      throw error;
    }
  }, [api, activeAccount]);

  const disconnectWallet = useCallback(async () => {
    if (api) {
      await api.disconnect();
      setApi(null);
    }
    setActiveAccount(null);
    setAccounts([]);
    setExtensions([]);
  }, [api]);

  const switchNetwork = useCallback(async (networkKey: string) => {
    if (api) {
      await api.disconnect();
    }
    await initializeApi(networkKey);
  }, [api]);

  const getBalance = useCallback(async (address: string): Promise<string> => {
    if (!api) throw new Error('API not initialized');
    
    try {
        const result = await api.query.system.account<AccountInfo>(address);
        const accountInfo = result as unknown as { data: AccountData };
        console.log('accountInfo', accountInfo)
        return accountInfo.data.free.toString();
    } catch (error) {
      console.error('Failed to fetch balance:', error);
      throw new Error('Failed to fetch balance');
    }
  }, [api]);

  const signMessage = useCallback(async (message: string) => {
    if (!activeAccount || !extensions.length) {
      throw new Error('No active account or extension');
    }

    const extension = extensions[0];
    const signer = extension?.signer;
    
    if (!signer || !signer.signRaw) throw new Error('No signer available');

    const { signature } = await signer.signRaw({
      address: activeAccount,
      data: message,
      type: 'bytes'
    });

    return signature;
  }, [activeAccount, extensions]);

  return (
    <WalletContext.Provider
      value={{
        connectWallet,
        disconnectWallet,
        getBalance,
        switchNetwork,
        signMessage,
        api,
        activeAccount,
        activeNetwork,
        accounts,
      }}
    >
      {children}
    </WalletContext.Provider>
  );
};