'use client';

import React, { useState } from 'react';
import { useEthereum } from '../hooks/connectMetamask';

const ConnectWallet: React.FC = () => {
  const [isConnected, setIsConnected] = useState(false);
  const { connectWallet, account } = useEthereum();

  const handleConnect = async () => {
    try {
      await connectWallet();
      setIsConnected(true);
    } catch (error) {
      console.error('Error connecting to wallet:', error);
    }
  };

  return (
    <div className="flex items-center gap-4">
      <button
        onClick={handleConnect}
        className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md shadow-md"
      >
        {isConnected ? 'Connected' : 'Connect Wallet'}
      </button>
      {account && (
        <span className="text-sm text-gray-600">
          {`${account.slice(0, 6)}...${account.slice(-4)}`}
        </span>
      )}
    </div>
  );
};

export default ConnectWallet; 