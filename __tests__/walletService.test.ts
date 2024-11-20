import {
  WalletService,
  WalletError,
  ChainError,
} from '../services/walletService';
import { Web3Provider } from '@ethersproject/providers';
import WalletConnectProvider from '@walletconnect/web3-provider';

// Mock WalletConnect Provider
jest.mock('@walletconnect/web3-provider');

// Mock environment variables
process.env.NEXT_PUBLIC_WALLET_CONNECT_PROJECT_ID = 'test-project-id';

describe('WalletService', () => {
  let walletService: WalletService;

  beforeEach(() => {
    // Reset all mocks
    jest.clearAllMocks();

    // Reset window.ethereum mock for each test
    (global as any).window = {
      ethereum: {
        isMetaMask: true,
        request: jest.fn(),
        on: jest.fn(),
        removeListener: jest.fn(),
        removeAllListeners: jest.fn(),
      },
    };

    walletService = WalletService.getInstance();
  });

  describe('MetaMask Connection', () => {
    it('should connect successfully to MetaMask', async () => {
      // Mock successful connection
      const mockAddress = '0x1234567890123456789012345678901234567890';
      const mockChainId = '0x1'; // Mainnet

      window.ethereum.request
        .mockResolvedValueOnce([mockAddress]) // eth_requestAccounts
        .mockResolvedValueOnce(mockChainId) // eth_chainId
        .mockResolvedValueOnce('1000000000000000000'); // eth_getBalance

      const result = await walletService.connectMetaMask();

      expect(result).toEqual({
        address: mockAddress,
        chainId: 1, // Converted from hex
      });

      expect(window.ethereum.request).toHaveBeenCalledWith({
        method: 'eth_requestAccounts',
      });
    });

    it('should throw error when MetaMask is not installed', async () => {
      // Remove MetaMask from window
      delete window.ethereum;

      await expect(walletService.connectMetaMask()).rejects.toThrow(
        new WalletError('MetaMask is not installed.', 'METAMASK_NOT_INSTALLED'),
      );
    });

    it('should handle user rejection', async () => {
      window.ethereum.request.mockRejectedValueOnce({
        code: 4001,
        message: 'User rejected the request.',
      });

      await expect(walletService.connectMetaMask()).rejects.toThrow(
        new WalletError(
          'You rejected the connection request.',
          'USER_REJECTED',
        ),
      );
    });

    it('should handle unsupported networks', async () => {
      const mockAddress = '0x1234567890123456789012345678901234567890';
      const mockChainId = '0x63564C40'; // Unsupported chain

      window.ethereum.request
        .mockResolvedValueOnce([mockAddress])
        .mockResolvedValueOnce(mockChainId);

      await expect(walletService.connectMetaMask()).rejects.toThrow(
        new ChainError(
          'Unsupported network. Please switch to Ethereum Mainnet or Sepolia.',
          1666600000,
        ),
      );
    });
  });

  describe('WalletConnect Integration', () => {
    beforeEach(() => {
      // Mock WalletConnect Provider
      (WalletConnectProvider as jest.Mock).mockImplementation(() => ({
        enable: jest.fn(),
        request: jest.fn(),
        on: jest.fn(),
        removeListener: jest.fn(),
        disconnect: jest.fn(),
      }));
    });

    it('should connect successfully with WalletConnect', async () => {
      const mockAddress = '0x1234567890123456789012345678901234567890';
      const mockChainId = '0x1'; // Mainnet

      const mockWCProvider = new WalletConnectProvider({});
      mockWCProvider.enable.mockResolvedValueOnce(true);
      mockWCProvider.request
        .mockResolvedValueOnce([mockAddress]) // eth_accounts
        .mockResolvedValueOnce(mockChainId); // eth_chainId

      const result = await walletService.connectWalletConnect();

      expect(result).toEqual({
        address: mockAddress,
        chainId: 1,
      });

      expect(mockWCProvider.enable).toHaveBeenCalled();
    });

    it('should handle WalletConnect connection cancellation', async () => {
      const mockWCProvider = new WalletConnectProvider({});
      mockWCProvider.enable.mockRejectedValueOnce(
        new Error('User closed modal'),
      );

      await expect(walletService.connectWalletConnect()).rejects.toThrow(
        new WalletError('Connection cancelled by user.', 'USER_CANCELLED'),
      );
    });

    it('should handle WalletConnect provider errors', async () => {
      const mockWCProvider = new WalletConnectProvider({});
      mockWCProvider.enable.mockRejectedValueOnce(new Error('Provider Error'));

      await expect(walletService.connectWalletConnect()).rejects.toThrow(
        new WalletError(
          'Failed to connect with WalletConnect.',
          'WALLETCONNECT_ERROR',
        ),
      );
    });
  });

  describe('Wallet Disconnection', () => {
    it('should disconnect successfully', async () => {
      const mockWCProvider = new WalletConnectProvider({});
      (walletService as any).wcProvider = mockWCProvider;

      await walletService.disconnectWallet();

      expect(mockWCProvider.disconnect).toHaveBeenCalled();
      expect(window.ethereum.removeAllListeners).toHaveBeenCalled();
    });

    it('should handle disconnection errors gracefully', async () => {
      const mockWCProvider = new WalletConnectProvider({});
      mockWCProvider.disconnect.mockRejectedValueOnce(
        new Error('Disconnect Error'),
      );
      (walletService as any).wcProvider = mockWCProvider;

      await expect(walletService.disconnectWallet()).rejects.toThrow(
        new WalletError(
          'Failed to disconnect wallet properly.',
          'DISCONNECT_ERROR',
        ),
      );
    });
  });

  describe('Chain Management', () => {
    it('should switch chains successfully', async () => {
      window.ethereum.request.mockResolvedValueOnce(undefined);

      await walletService.switchChain(1); // Mainnet

      expect(window.ethereum.request).toHaveBeenCalledWith({
        method: 'wallet_switchEthereumChain',
        params: [{ chainId: '0x1' }],
      });
    });

    it('should add chain if not present', async () => {
      window.ethereum.request
        .mockRejectedValueOnce({ code: 4902 })
        .mockResolvedValueOnce(undefined);

      await walletService.switchChain(1);

      expect(window.ethereum.request).toHaveBeenCalledWith({
        method: 'wallet_addEthereumChain',
        params: [expect.any(Object)],
      });
    });
  });
});
