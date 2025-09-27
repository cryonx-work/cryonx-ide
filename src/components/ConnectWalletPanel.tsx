import { 
  Wallet, 
  Copy, 
  ExternalLink, 
  Settings,
  CheckCircle,
  AlertCircle,
  Plug,
  DollarSign,
  RefreshCw
} from 'lucide-react';
import { useState } from 'react';

export function ConnectWalletPanel() {
  const [isConnected, setIsConnected] = useState(false);
  const [isConnecting, setIsConnecting] = useState(false);
  const [selectedWallet, setSelectedWallet] = useState('');

  const wallets = [
    { 
      id: 'metamask', 
      name: 'MetaMask', 
      icon: '🦊', 
      description: 'Connect using MetaMask browser extension' 
    },
    { 
      id: 'walletconnect', 
      name: 'WalletConnect', 
      icon: '🔗', 
      description: 'Connect using WalletConnect protocol' 
    },
    { 
      id: 'coinbase', 
      name: 'Coinbase Wallet', 
      icon: '🔵', 
      description: 'Connect using Coinbase Wallet' 
    },
    { 
      id: 'phantom', 
      name: 'Phantom', 
      icon: '👻', 
      description: 'Connect to Solana using Phantom' 
    },
  ];

  const networks = [
    { id: 'ethereum', name: 'Ethereum', symbol: 'ETH' },
    { id: 'polygon', name: 'Polygon', symbol: 'MATIC' },
    { id: 'binance', name: 'Binance Smart Chain', symbol: 'BNB' },
    { id: 'arbitrum', name: 'Arbitrum', symbol: 'ARB' },
    { id: 'solana', name: 'Solana', symbol: 'SOL' },
  ];

  const walletInfo = {
    address: '0x742d35Cc6c4B4C8aC6465...b6e4a3c5',
    balance: '2.45',
    network: 'Ethereum',
    symbol: 'ETH'
  };

  const handleConnect = async (walletId: string) => {
    setSelectedWallet(walletId);
    setIsConnecting(true);
    
    // Simulate connection process
    setTimeout(() => {
      setIsConnecting(false);
      setIsConnected(true);
    }, 2000);
  };

  const handleDisconnect = () => {
    setIsConnected(false);
    setSelectedWallet('');
  };

  const copyAddress = () => {
    navigator.clipboard.writeText(walletInfo.address);
  };

  return (
    <div className="p-4 h-full">
      <h3 className="text-sm font-medium text-gray-300 mb-4 uppercase tracking-wide">
        Connect Wallet
      </h3>

      {!isConnected ? (
        <>
          {/* Wallet Selection */}
          <div className="mb-6">
            <h4 className="text-xs text-gray-400 uppercase tracking-wide mb-3">
              Choose Wallet
            </h4>
            <div className="space-y-2">
              {wallets.map((wallet) => (
                <button
                  key={wallet.id}
                  onClick={() => handleConnect(wallet.id)}
                  disabled={isConnecting}
                  className={`w-full p-3 rounded border transition-colors text-left ${
                    selectedWallet === wallet.id && isConnecting
                      ? 'border-purple-400 bg-purple-500/10'
                      : 'border-gray-600 bg-gray-700 hover:bg-gray-600'
                  } ${isConnecting ? 'cursor-not-allowed opacity-50' : ''}`}
                >
                  <div className="flex items-center space-x-3">
                    <span className="text-2xl">{wallet.icon}</span>
                    <div>
                      <div className="font-medium text-gray-300">{wallet.name}</div>
                      <div className="text-xs text-gray-400">{wallet.description}</div>
                    </div>
                  </div>
                  {selectedWallet === wallet.id && isConnecting && (
                    <div className="mt-2 flex items-center space-x-2 text-purple-400">
                      <RefreshCw className="w-3 h-3 animate-spin" />
                      <span className="text-xs">Connecting...</span>
                    </div>
                  )}
                </button>
              ))}
            </div>
          </div>

          {/* Connection Status */}
          {isConnecting && (
            <div className="mb-4 p-3 bg-yellow-500/10 border border-yellow-500/20 rounded">
              <div className="flex items-center space-x-2 text-yellow-400">
                <RefreshCw className="w-4 h-4 animate-spin" />
                <span className="text-sm">Waiting for wallet connection...</span>
              </div>
            </div>
          )}

          {/* Features */}
          <div className="mb-6">
            <h4 className="text-xs text-gray-400 uppercase tracking-wide mb-3">
              Why Connect Your Wallet?
            </h4>
            <div className="space-y-3">
              <div className="flex items-center space-x-3 text-sm text-gray-300">
                <Plug className="w-4 h-4 text-green-400" />
                <span>Deploy smart contracts</span>
              </div>
              <div className="flex items-center space-x-3 text-sm text-gray-300">
                <DollarSign className="w-4 h-4 text-blue-400" />
                <span>Interact with DeFi protocols</span>
              </div>
              <div className="flex items-center space-x-3 text-sm text-gray-300">
                <CheckCircle className="w-4 h-4 text-purple-400" />
                <span>Sign transactions securely</span>
              </div>
            </div>
          </div>
        </>
      ) : (
        <>
          {/* Connected Wallet Info */}
          <div className="mb-6">
            <div className="p-3 bg-green-500/10 border border-green-500/20 rounded">
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center space-x-2">
                  <CheckCircle className="w-4 h-4 text-green-400" />
                  <span className="text-sm font-medium text-green-400">Connected</span>
                </div>
                <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
              </div>
              
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs text-gray-400">Wallet</span>
                  <span className="text-xs text-gray-300">
                    {wallets.find(w => w.id === selectedWallet)?.name}
                  </span>
                </div>
                
                <div className="flex items-center justify-between">
                  <span className="text-xs text-gray-400">Address</span>
                  <div className="flex items-center space-x-1">
                    <span className="text-xs text-gray-300 font-mono">
                      {walletInfo.address}
                    </span>
                    <button
                      onClick={copyAddress}
                      className="p-1 text-gray-400 hover:text-gray-300"
                    >
                      <Copy className="w-3 h-3" />
                    </button>
                  </div>
                </div>
                
                <div className="flex items-center justify-between">
                  <span className="text-xs text-gray-400">Network</span>
                  <span className="text-xs text-gray-300">{walletInfo.network}</span>
                </div>
                
                <div className="flex items-center justify-between">
                  <span className="text-xs text-gray-400">Balance</span>
                  <span className="text-xs text-gray-300">
                    {walletInfo.balance} {walletInfo.symbol}
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Quick Actions */}
          <div className="mb-6">
            <h4 className="text-xs text-gray-400 uppercase tracking-wide mb-3">
              Quick Actions
            </h4>
            <div className="space-y-2">
              <button className="w-full p-2 bg-purple-600 hover:bg-purple-700 text-white rounded text-sm transition-colors">
                Send Transaction
              </button>
              <button className="w-full p-2 bg-gray-700 hover:bg-gray-600 text-gray-300 rounded text-sm transition-colors">
                View on Explorer
              </button>
              <button className="w-full p-2 bg-gray-700 hover:bg-gray-600 text-gray-300 rounded text-sm transition-colors">
                Add Network
              </button>
            </div>
          </div>

          {/* Network Selector */}
          <div className="mb-6">
            <h4 className="text-xs text-gray-400 uppercase tracking-wide mb-3">
              Switch Network
            </h4>
            <select className="w-full bg-gray-700 text-gray-300 text-sm px-3 py-2 rounded border border-gray-600 focus:border-purple-400 focus:outline-none">
              {networks.map((network) => (
                <option key={network.id} value={network.id}>
                  {network.name} ({network.symbol})
                </option>
              ))}
            </select>
          </div>

          {/* Recent Transactions */}
          <div className="mb-6">
            <h4 className="text-xs text-gray-400 uppercase tracking-wide mb-3">
              Recent Transactions
            </h4>
            <div className="space-y-2">
              <div className="p-2 bg-gray-700 rounded">
                <div className="flex items-center justify-between mb-1">
                  <span className="text-xs text-gray-300">Send ETH</span>
                  <span className="text-xs text-green-400">Success</span>
                </div>
                <div className="text-xs text-gray-500">0.1 ETH • 2 hours ago</div>
              </div>
              <div className="p-2 bg-gray-700 rounded">
                <div className="flex items-center justify-between mb-1">
                  <span className="text-xs text-gray-300">Contract Deploy</span>
                  <span className="text-xs text-green-400">Success</span>
                </div>
                <div className="text-xs text-gray-500">Gas: 234,567 • 1 day ago</div>
              </div>
            </div>
          </div>

          {/* Disconnect Button */}
          <div className="pt-4 border-t border-gray-600">
            <button
              onClick={handleDisconnect}
              className="w-full p-2 bg-red-600 hover:bg-red-700 text-white rounded text-sm transition-colors"
            >
              Disconnect Wallet
            </button>
          </div>
        </>
      )}

      {/* Tools & Settings */}
      <div className="pt-4 border-t border-gray-600">
        <div className="space-y-2">
          <button className="w-full text-left text-xs text-gray-400 hover:text-gray-300 p-2 hover:bg-gray-700 rounded flex items-center space-x-2">
            <Settings className="w-3 h-3" />
            <span>Wallet Settings</span>
          </button>
          <button className="w-full text-left text-xs text-gray-400 hover:text-gray-300 p-2 hover:bg-gray-700 rounded flex items-center space-x-2">
            <ExternalLink className="w-3 h-3" />
            <span>Block Explorer</span>
          </button>
        </div>
      </div>
    </div>
  );
}