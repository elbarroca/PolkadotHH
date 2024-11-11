import { DdcClient, MAINNET } from '@cere-ddc-sdk/ddc-client';
import { useState, useEffect } from 'react';
import { useWallet } from '@/contexts/WalletProvider';
import { Web3Signer } from '@cere-ddc-sdk/blockchain';

export const useDdcClient = () => {
  const { web3Signer, activeAccount } = useWallet(); // Use web3Signer instead of signer
  const [client, setClient] = useState<DdcClient | null>(null);
  const [error, setError] = useState<Error | null>(null);
  const [isInitializing, setIsInitializing] = useState(true);

  useEffect(() => {
    const initializeClient = async () => {
      if (!web3Signer || !activeAccount) {
        setClient(null);
        setIsInitializing(false);
        return;
      }

      try {
        const ddcClient = await DdcClient.create(web3Signer, MAINNET);
        await ddcClient.connect();

        setClient(ddcClient);
        setError(null);
      } catch (err) {
        console.error('DDC client initialization failed:', err);
        setError(err instanceof Error ? err : new Error('Failed to initialize DDC client'));
        setClient(null);
      } finally {
        setIsInitializing(false);
      }
    };

    initializeClient();

    return () => {
      if (client) {
        client.disconnect();
      }
    };
  }, [web3Signer, activeAccount]); // Include web3Signer in the dependencies

  return { 
    client, 
    error, 
    isInitializing,
    walletAddress: activeAccount
  };
};