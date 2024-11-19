'use client';

import { ApiPromise, WsProvider } from '@polkadot/api';
import { web3Enable, web3Accounts } from '@polkadot/extension-dapp';
import { InjectedExtension } from '@polkadot/extension-inject/types';
import React, { createContext, useContext, useRef, useState, useCallback } from 'react';
import { AccountInfo } from '@polkadot/types/interfaces';
import type { AccountData } from '@polkadot/types/interfaces/balances';
import { 
    addLocalExtension, 
    getLocalActiveAccount, 
    setLocalActiveAccount, 
    removeLocalActiveAccount, 
    removeLocalExtension 
} from '../lib/localStorage';
import { Web3Signer } from '@cere-ddc-sdk/blockchain';
import { encodeAddress, decodeAddress } from '@polkadot/util-crypto';
import { NETWORKS } from '@/lib/cereNetwork';

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
  web3Signer: Web3Signer | null;
  getAvailableAccounts: () => Promise<ImportedAccount[]>;
  connectWithAccount: (account: ImportedAccount) => Promise<{ address: string; network: string }>;
}

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
  web3Signer: null,
  getAvailableAccounts: async () => [],
  connectWithAccount: async () => ({ address: '', network: '' }),
};

const WalletContext = createContext<WalletContextInterface>(defaultContext);

export const useWallet = () => useContext(WalletContext);

export const WalletProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [api, setApi] = useState<ApiPromise | null>(null);
  const [accounts, setAccounts] = useState<ImportedAccount[]>([]);
  const [activeAccount, setActiveAccount] = useState<string | null>(null);
  const [activeNetwork, setActiveNetwork] = useState<string | null>(null);
  const [extensions, setExtensions] = useState<InjectedExtension[]>([]);
  const [web3Signer, setWeb3Signer] = useState<Web3Signer | null>(null); // State for Web3Signer

  const accountsRef = useRef(accounts);
  const activeAccountRef = useRef(activeAccount);

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
      const injectedExtensions = await web3Enable('PolkaDrive');
      if (!injectedExtensions.length) {
        throw new Error('No extension found');
      }
      
      injectedExtensions.forEach(ext => addLocalExtension(ext.name));
      setExtensions(injectedExtensions);
  
      const allAccounts = await web3Accounts();
      const formattedAccounts: ImportedAccount[] = allAccounts.map(account => ({
        address: account.address,
        name: account.meta.name || undefined,
        source: account.meta.source || 'unknown',
        signer: account.meta.source
      }));
  
      setAccounts(formattedAccounts);
      accountsRef.current = formattedAccounts;
  
      const network = 'cereMainnet';
      const accountToUse = formattedAccounts[0]?.address;
  
      if (accountToUse) {
        setActiveAccount(accountToUse);
        activeAccountRef.current = accountToUse;
        setLocalActiveAccount(network, accountToUse);
        const activeExtension = injectedExtensions.find(ext => ext.signer && ext.signer.signRaw);
        if (activeExtension) {
          const signerInstance = new Web3Signer();
          await signerInstance.connect();
          setWeb3Signer(signerInstance); 
        }
      }
  
      if (!api) {
        await initializeApi('cereMainnet');
      }
  
      return {
        address: accountToUse || '',
        network: network
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
    
    if (activeNetwork && activeAccount) {
      removeLocalActiveAccount(activeNetwork);
    }
    
    extensions.forEach(ext => removeLocalExtension(ext.name));
    
    setActiveAccount(null);
    setAccounts([]);
    setExtensions([]);
    setWeb3Signer(null);
  }, [api, activeNetwork, activeAccount, extensions]);

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
        return accountInfo.data.free.toString();
    } catch (error) {
      console.error('Failed to fetch balance:', error);
      throw new Error('Failed to fetch balance');
    }
  }, [api]);

  const signMessage = useCallback(async (message: string) => {
    if (!activeAccount || !web3Signer) {
      throw new Error('No active account or Web3Signer available');
    }

    const signature = await web3Signer.sign(message);

    return signature.toString();
  }, [activeAccount, web3Signer]);

  const getAvailableAccounts = useCallback(async (): Promise<ImportedAccount[]> => {
    try {
      // Enable web3 first
      const injectedExtensions = await web3Enable('PolkaDrive');
      if (!injectedExtensions.length) {
        throw new Error('No extension found');
      }
      
      // Store extensions
      injectedExtensions.forEach(ext => addLocalExtension(ext.name));
      setExtensions(injectedExtensions);
  
      // Get all accounts
      const allAccounts = await web3Accounts();
      
      // Format accounts
      return allAccounts.map(account => ({
        address: account.address,
        name: account.meta.name || undefined,
        source: account.meta.source || 'unknown',
        signer: account.meta.source
      }));
    } catch (error) {
      console.error('Failed to get accounts:', error);
      throw error;
    }
  }, []);

  const connectWithAccount = useCallback(async (selectedAccount: ImportedAccount) => {
    try {
      // Set the selected account
      setAccounts([selectedAccount]);
      accountsRef.current = [selectedAccount];
  
      const network = 'cereMainnet';
      
      // Update active account
      setActiveAccount(selectedAccount.address);
      activeAccountRef.current = selectedAccount.address;
      setLocalActiveAccount(network, selectedAccount.address);
      
      // Initialize Web3Signer
      const activeExtension = extensions.find(ext => ext.signer && ext.signer.signRaw);
      if (activeExtension) {
        const signerInstance = new Web3Signer();
        await signerInstance.connect();
        setWeb3Signer(signerInstance);
      }
  
      // Initialize API if not already done
      if (!api) {
        await initializeApi('cereMainnet');
      }
  
      return {
        address: selectedAccount.address,
        network: network
      };
    } catch (error) {
      console.error('Failed to connect with account:', error);
      throw error;
    }
  }, [api, extensions]);

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
        web3Signer,
        getAvailableAccounts,
        connectWithAccount,
      }}
    >
      {children}
    </WalletContext.Provider>
  );
};