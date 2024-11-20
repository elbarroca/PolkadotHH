'use client';

import { ApiPromise, WsProvider } from '@polkadot/api';
import { web3Enable, web3Accounts } from '@polkadot/extension-dapp';
import React, { createContext, useContext, useRef, useState, useCallback } from 'react';
import { Web3Signer } from '@cere-ddc-sdk/blockchain';
import { DdcClient, MAINNET } from '@cere-ddc-sdk/ddc-client';
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
  activeAccount: string | null;
  accounts: ImportedAccount[];
  web3Signer: Web3Signer | null;
  client: DdcClient | null;
}

const defaultContext: WalletContextInterface = {
  connectWallet: async () => ({ address: '', network: '' }),
  disconnectWallet: async () => {},
  activeAccount: null,
  accounts: [],
  web3Signer: null,
  client: null,
};

const WalletContext = createContext<WalletContextInterface>(defaultContext);

export const useWallet = () => useContext(WalletContext);

export const WalletProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [api, setApi] = useState<ApiPromise | null>(null);
  const [accounts, setAccounts] = useState<ImportedAccount[]>([]);
  const [activeAccount, setActiveAccount] = useState<string | null>(null);
  const [web3Signer, setWeb3Signer] = useState<Web3Signer | null>(null);
  const [client, setClient] = useState<DdcClient | null>(null);

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
  
      if (!api) {
        await initializeApi('cereMainnet');
      }

      if (accountToUse) {
        setActiveAccount(accountToUse);
        activeAccountRef.current = accountToUse;
        const activeExtension = injectedExtensions.find(ext => ext.signer && ext.signer.signRaw);
        if (activeExtension) {
          const signerInstance = new Web3Signer();
          await signerInstance.connect();
          setWeb3Signer(signerInstance);

          const ddcClient = await DdcClient.create(signerInstance, MAINNET);
          await ddcClient.connect();

          setClient(ddcClient); 
        }
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
    setActiveAccount(null);
    setAccounts([]);
    setWeb3Signer(null);
    
    if (client) {
      await client.disconnect();
      setClient(null);
    }
  }, [client]);

  return (
    <WalletContext.Provider
      value={{
        connectWallet,
        disconnectWallet,
        activeAccount,
        accounts,
        web3Signer,
        client,
      }}
    >
      {children}
    </WalletContext.Provider>
  );
};