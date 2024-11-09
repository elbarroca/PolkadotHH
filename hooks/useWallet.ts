import { useState, useEffect, useCallback } from 'react';
import { WalletService, WalletError, ChainError } from '../services/walletService';
import { WalletState } from '../types';

export const useWallet = (): WalletState & {
  connectWithWalletConnect: () => Promise<void>;
  connectionType: 'metamask' | 'walletconnect' | null;
} => {
  const [address, setAddress] = useState<string | null>(null);
  const [isConnected, setIsConnected] = useState(false);
  const [chainId, setChainId] = useState<number | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [balance, setBalance] = useState<string | null>(null);
  const [connectionType, setConnectionType] = useState<'metamask' | 'walletconnect' | null>(null);

  const walletService = WalletService.getInstance();

  const connect = useCallback(async () => {
    try {
      const { address, chainId } = await walletService.connectMetaMask();
      setAddress(address);
      setChainId(chainId);
      setIsConnected(true);
      setError(null);
      setConnectionType('metamask');

      const balance = await walletService.getBalance(address);
      setBalance(balance);
    } catch (error) {
      handleConnectionError(error);
    }
  }, []);

  const connectWithWalletConnect = useCallback(async () => {
    try {
      const { address, chainId } = await walletService.connectWalletConnect();
      setAddress(address);
      setChainId(chainId);
      setIsConnected(true);
      setError(null);
      setConnectionType('walletconnect');

      const balance = await walletService.getBalance(address);
      setBalance(balance);
    } catch (error) {
      handleConnectionError(error);
    }
  }, []);

  const disconnect = useCallback(async () => {
    try {
      await walletService.disconnectWallet();
      setAddress(null);
      setChainId(null);
      setIsConnected(false);
      setError(null);
      setBalance(null);
      setConnectionType(null);
    } catch (error) {
      setError('Failed to disconnect wallet');
      console.error('Wallet disconnection error:', error);
    }
  }, []);

  const handleConnectionError = (error: any) => {
    if (error instanceof WalletError) {
      setError(`${error.message} (${error.code})`);
    } else if (error instanceof ChainError) {
      setError(`${error.message} (Chain ID: ${error.chainId})`);
    } else {
      setError('Failed to connect wallet');
    }
    console.error('Wallet connection error:', error);
  };

  return {
    address,
    isConnected,
    chainId,
    balance,
    connect,
    connectWithWalletConnect,
    disconnect,
    error,
    connectionType,
  };
}; 