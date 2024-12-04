'use client';

import React from 'react';
import { useEthereum } from '../hooks/connectMetamask';

const WalletActions: React.FC = () => {
  const { connectWallet, account, isConnected } = useEthereum();

  const handleConnect = async () => {
    try {
      await connectWallet();
    } catch (error) {
      console.error('Error connecting to wallet:', error);
    }
  };

  const handleChangeAccount = async () => {
    try {
      await window.ethereum.request({
        method: 'wallet_requestPermissions',
        params: [{
          eth_accounts: {}
        }]
      });
    } catch (error) {
      console.error('Error changing account:', error);
    }
  };

  return (
    <div className="flex items-center gap-4">
      <button
        onClick={handleConnect}
        className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-md shadow-md transition-colors duration-200"
      >
        {isConnected ? 'Connected' : 'Connect Wallet'}
      </button>
      {isConnected && (
        <button
          onClick={handleChangeAccount}
          className="bg-purple-600 hover:bg-purple-700 text-white px-4 py-2 rounded-md shadow-md transition-colors duration-200"
        >
          Change Account
        </button>
      )}
      {account && (
        <span className="px-4 py-2 bg-gray-100 rounded-md text-sm text-gray-700 font-mono">
          {`${account.slice(0, 6)}...${account.slice(-4)}`}
        </span>
      )}
    </div>
  );
};

export default WalletActions; 