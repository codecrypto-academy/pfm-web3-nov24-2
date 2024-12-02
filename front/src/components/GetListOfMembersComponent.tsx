'use client';

import React, { useState, useEffect } from 'react';
import { useEthereum } from '../hooks/conectMetamask';

const GetListOfMembersComponent: React.FC = () => {
  const [data, setData] = useState<string>('');
  const { contract } : any = useEthereum();
  
  useEffect(() => {
    const callgetAllListOfMembersMethod = async () => {
      if (contract) {
        try {
          const tx = await contract.getAllListOfMembers();
          tx.wait();
          console.log('Result:', tx);
          setData(tx);
        } catch (error) {
          console.error('Error calling contract method:', error);
        }
      }
    };
    callgetAllListOfMembersMethod();
  }, []); 
  return (
    <div>
      <h1>List of members: {data ? data : "Loading..."}</h1>
    </div>
  );
};

export default GetListOfMembersComponent;
