import { HeaderProps } from '../../../types';

export const Header = ({ walletAddress, onConnect, onDisconnect }: HeaderProps) => {
  const truncateAddress = (address: string) => 
    `${address.slice(0, 6)}...${address.slice(-4)}`;

  return (
    <header className="w-full px-6 py-4 bg-gray-900 shadow-lg">
      <div className="max-w-7xl mx-auto flex items-center justify-between">
        <h1 className="text-2xl font-bold text-white">
          Decentralized File Sharing
        </h1>
        
        <div className="flex items-center space-x-4">
          {walletAddress ? (
            <div className="flex items-center space-x-4">
              <span className="text-gray-300">
                {truncateAddress(walletAddress)}
              </span>
              <button
                onClick={onDisconnect}
                className="px-4 py-2 bg-red-600 hover:bg-red-700 
                         text-white rounded-lg transition-colors"
                aria-label="Disconnect wallet"
              >
                Disconnect
              </button>
            </div>
          ) : (
            <button
              onClick={onConnect}
              className="px-4 py-2 bg-blue-600 hover:bg-blue-700 
                       text-white rounded-lg transition-colors"
              aria-label="Connect wallet"
            >
              Connect Wallet
            </button>
          )}
        </div>
      </div>
    </header>
  );
}; 