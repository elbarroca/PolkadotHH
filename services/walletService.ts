import { Web3Provider } from '@ethersproject/providers';
import { Chain } from 'viem';
import { mainnet, sepolia } from 'viem/chains';
import * as ethers from 'ethers';
import WalletConnectProvider from "@walletconnect/web3-provider";

export class WalletService {
  private static instance: WalletService;
  private provider: Web3Provider | null = null;
  private wcProvider: WalletConnectProvider | null = null;
  private supportedChains: Chain[] = [mainnet, sepolia];
  private readonly projectId = process.env.NEXT_PUBLIC_WALLET_CONNECT_PROJECT_ID!;

  private constructor() {}

  public static getInstance(): WalletService {
    if (!WalletService.instance) {
      WalletService.instance = new WalletService();
    }
    return WalletService.instance;
  }

  public async connectWalletConnect(): Promise<{
    address: string;
    chainId: number;
  }> {
    try {
      // Initialize WalletConnect Provider
      this.wcProvider = new WalletConnectProvider({
        projectId: this.projectId,
        chains: this.supportedChains.map(chain => chain.id),
        rpc: Object.fromEntries(
          this.supportedChains.map(chain => [
            chain.id,
            chain.rpcUrls.default.http[0]
          ])
        ),
      });

      // Enable session (triggers QR Code modal)
      await this.wcProvider.enable();

      // Create Web3Provider wrapper
      this.provider = new Web3Provider(this.wcProvider as any);

      // Get connected address
      const accounts = await this.wcProvider.request({
        method: 'eth_accounts'
      });

      if (!accounts || accounts.length === 0) {
        throw new WalletError(
          'No accounts found after connection.',
          'NO_ACCOUNTS'
        );
      }

      const address = accounts[0];
      const chainId = await this.wcProvider.request({ method: 'eth_chainId' });
      const numericChainId = parseInt(chainId as string, 16);

      // Verify chain
      if (!this.isSupportedChain(numericChainId)) {
        throw new ChainError(
          'Unsupported network. Please switch to Ethereum Mainnet or Sepolia.',
          numericChainId
        );
      }

      // Setup WalletConnect event listeners
      this.setupWalletConnectListeners();

      return {
        address,
        chainId: numericChainId,
      };
    } catch (error: any) {
      if (error instanceof WalletError || error instanceof ChainError) {
        throw error;
      }

      // Handle WalletConnect specific errors
      if (error.message?.includes('User closed modal')) {
        throw new WalletError(
          'Connection cancelled by user.',
          'USER_CANCELLED'
        );
      }

      throw new WalletError(
        'Failed to connect with WalletConnect.',
        'WALLETCONNECT_ERROR'
      );
    }
  }

  private setupWalletConnectListeners(): void {
    if (!this.wcProvider) return;

    this.wcProvider.on('accountsChanged', this.handleWCAccountsChanged);
    this.wcProvider.on('chainChanged', this.handleWCChainChanged);
    this.wcProvider.on('disconnect', this.handleWCDisconnect);
  }

  private handleWCAccountsChanged = (accounts: string[]): void => {
    if (accounts.length === 0) {
      this.disconnectWallet();
      throw new WalletError('Wallet disconnected.', 'NO_ACCOUNTS');
    }
    // Emit account change event if needed
  };

  private handleWCChainChanged = async (chainIdHex: string): Promise<void> => {
    const chainId = parseInt(chainIdHex, 16);
    if (!this.isSupportedChain(chainId)) {
      throw new ChainError(
        'Unsupported network. Please switch to Ethereum Mainnet or Sepolia.',
        chainId
      );
    }
    // Emit chain change event if needed
  };

  private handleWCDisconnect = async (): Promise<void> => {
    await this.disconnectWallet();
  };

  public async disconnectWallet(): Promise<void> {
    try {
      if (this.wcProvider) {
        this.wcProvider.removeListener('accountsChanged', this.handleWCAccountsChanged);
        this.wcProvider.removeListener('chainChanged', this.handleWCChainChanged);
        this.wcProvider.removeListener('disconnect', this.handleWCDisconnect);
        await this.wcProvider.disconnect();
        this.wcProvider = null;
      }

      if (window.ethereum) {
        window.ethereum.removeAllListeners('accountsChanged');
        window.ethereum.removeAllListeners('chainChanged');
        window.ethereum.removeAllListeners('disconnect');
      }

      this.provider = null;
    } catch (error) {
      console.error('Error disconnecting wallet:', error);
      throw new WalletError(
        'Failed to disconnect wallet properly.',
        'DISCONNECT_ERROR'
      );
    }
  }

  // Add a method to determine the current connection type
  public getConnectionType(): 'metamask' | 'walletconnect' | null {
    if (this.wcProvider) return 'walletconnect';
    if (window.ethereum?.isMetaMask) return 'metamask';
    return null;
  }

  // Update existing methods to work with both providers
  public async getBalance(address: string): Promise<string> {
    if (!this.provider) {
      throw new WalletError('No provider available', 'NO_PROVIDER');
    }

    try {
      const balance = await this.provider.getBalance(address);
      return ethers.formatEther(balance);
    } catch (error) {
      throw new WalletError('Failed to fetch balance', 'BALANCE_FETCH_FAILED');
    }
  }

  public async initializeProvider(): Promise<Web3Provider | null> {
    if (!this.isMetaMaskInstalled()) {
      throw new WalletError(
        'MetaMask is not installed.',
        'METAMASK_NOT_INSTALLED'
      );
    }

    try {
      this.provider = new Web3Provider(window.ethereum);
      return this.provider;
    } catch (error) {
      console.error('Error initializing provider:', error);
      return null;
    }
  }

  public async switchChain(chainId: number): Promise<void> {
    if (!this.provider || !window.ethereum) {
      throw new Error('No provider available');
    }

    if (!this.isSupportedChain(chainId)) {
      throw new Error('Unsupported chain');
    }

    try {
      await window.ethereum.request({
        method: 'wallet_switchEthereumChain',
        params: [{ chainId: `0x${chainId.toString(16)}` }],
      });
    } catch (error: any) {
      if (error.code === 4902) {
        // Chain not added to MetaMask
        await this.addChain(chainId);
      } else {
        throw error;
      }
    }
  }

  private async addChain(chainId: number): Promise<void> {
    const chain = this.supportedChains.find(c => c.id === chainId);
    if (!chain) {
      throw new Error('Chain configuration not found');
    }

    await window.ethereum.request({
      method: 'wallet_addEthereumChain',
      params: [{
        chainId: `0x${chain.id.toString(16)}`,
        chainName: chain.name,
        nativeCurrency: chain.nativeCurrency,
        rpcUrls: [chain.rpcUrls.default.http[0]],
        blockExplorerUrls: [chain.blockExplorers?.default.url],
      }],
    });
  }

  private isSupportedChain(chainId: number): boolean {
    return this.supportedChains.some(chain => chain.id === chainId);
  }

  public async signMessage(message: string): Promise<string> {
    if (!this.provider) {
      throw new Error('No provider available');
    }

    const signer = this.provider.getSigner();
    return await signer.signMessage(message);
  }

  public getProvider(): Web3Provider | null {
    return this.provider;
  }
}

// Enhanced Error types
export class WalletError extends Error {
  code: string;

  constructor(message: string, code: string) {
    super(message);
    this.name = 'WalletError';
    this.code = code;
  }
}

export class ChainError extends Error {
  chainId: number;

  constructor(message: string, chainId: number) {
    super(message);
    this.name = 'ChainError';
    this.chainId = chainId;
  }
}

// Type declarations for window.ethereum
declare global {
  interface Window {
    ethereum?: {
      isMetaMask?: boolean;
      request: (args: { method: string; params?: any[] }) => Promise<any>;
      on: (event: string, handler: (...args: any[]) => void) => void;
      removeListener: (event: string, handler: (...args: any[]) => void) => void;
      removeAllListeners: (event: string) => void;
    };
  }
} 