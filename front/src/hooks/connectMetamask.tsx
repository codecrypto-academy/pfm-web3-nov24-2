'use client';

import { useState, useEffect, createContext, useContext } from 'react';
import { ethers, BrowserProvider } from 'ethers';
import contractABI from '../../contracts/ProductBatch.json';

const EthereumContext = createContext<any>(null);

export function EthereumProvider({ children }: { children: React.ReactNode }) {
  const [account, setAccount] = useState<string | null>(null);
  const [contract, setContract] = useState<any>(null);

  const setupContract = async (newAccount: string) => {
    try {
      const provider = new BrowserProvider(window.ethereum);
      const signer = await provider.getSigner();
      const contractAddress = process.env.NEXT_PUBLIC_CONTRACT_ADDRESS;
      if (!contractAddress) {
        throw new Error('Contract address not found');
      }
      
      const contractInstance = new ethers.Contract(
        contractAddress,
        contractABI.abi,
        signer
      );
      setContract(contractInstance);
    } catch (error) {
      console.error('Error setting up contract:', error);
    }
  };

  const connectWallet = async () => {
    try {
      if (typeof window.ethereum !== 'undefined') {
        const accounts = await window.ethereum.request({
          method: 'eth_requestAccounts'
        });
        
        const newAccount = accounts[0];
        setAccount(newAccount);
        await setupContract(newAccount);
        return newAccount;
      } else {
        throw new Error('MetaMask no está instalado');
      }
    } catch (error) {
      console.error('Error al conectar con MetaMask:', error);
      throw error;
    }
  };

  // Escuchar cambios de cuenta y red
  useEffect(() => {
    if (window.ethereum) {
      // Manejar cambios de cuenta
      window.ethereum.on('accountsChanged', async (accounts: string[]) => {
        console.log('Account changed:', accounts[0]);
        if (accounts.length > 0) {
          setAccount(accounts[0]);
          await setupContract(accounts[0]);
        } else {
          setAccount(null);
          setContract(null);
        }
      });

      // Manejar cambios de red
      window.ethereum.on('chainChanged', () => {
        window.location.reload();
      });
    }

    // Cleanup de los event listeners
    return () => {
      if (window.ethereum) {
        window.ethereum.removeListener('accountsChanged', () => {});
        window.ethereum.removeListener('chainChanged', () => {});
      }
    };
  }, []);

  return (
    <EthereumContext.Provider value={{ 
      account, 
      contract, 
      connectWallet,
      isConnected: !!account 
    }}>
      {children}
    </EthereumContext.Provider>
  );
};

export const useEthereum = () => {
  const context = useContext(EthereumContext);
  if (!context) {
    throw new Error('useEthereum must be used within an EthereumProvider');
  }
  return context;
}; 