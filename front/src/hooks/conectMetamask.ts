'use client';

import { useEffect, useState } from 'react';
import { ethers } from 'ethers';
import abi from '../../contracts/ProductBatch.sol/ProductBatch.json';

export const useEthereum = () => {
  const [account, setAccount] = useState(null);
  const [provider, setProvider] = useState(null);
  const [signer, setSigner] = useState(null);
  const [contract, setContract] = useState(null);
  
  useEffect(() => {
    async function initialize() {
      if (typeof window.ethereum !== 'undefined') {
        try {
          const accounts = await window.ethereum.request({ method: 'eth_requestAccounts' });
          setAccount(accounts[0]);

          const newProvider = new ethers.BrowserProvider(window.ethereum);
          setProvider(newProvider);

          const newSigner = await newProvider.getSigner();
          setSigner(newSigner);

          const contractAdress: any = process.env.NEXT_PUBLIC_CONTRACT_ADDRESS;
          const contractInstance = new ethers.Contract(
            contractAdress,
            abi.abi,
            newSigner
          );
          setContract(contractInstance);

          window.ethereum.on('accountsChanged', (accounts) => {
            setAccount(accounts[0]);
          });
        } catch (error) {
          console.error("Error requesting accounts", error);
        }
      } else {
        console.error("MetaMask not detected");
      }
    }

    initialize();
  }, []);
  return { contract };
};