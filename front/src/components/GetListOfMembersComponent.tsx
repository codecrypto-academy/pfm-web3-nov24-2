'use client';

import React, { useState, useEffect } from 'react';
import { useEthereum } from '../hooks/conectMetamask';

const GetListOfMembersComponent: React.FC = () => {
  const [data, setData] = useState<string>('');
  const { contract } : any = useEthereum();
  
  const callgetAllListOfMembersMethod = async () => {
  
    try {
      const tx = await contract.getAllListOfMembers();
      tx.wait();
      console.log('Result:', tx.address);
      setData(tx);
    } catch (error) {
      console.error('Error calling contract method:', error);
    }
  
  };

  return (
    <div onClick={callgetAllListOfMembersMethod}>
      <h1>List of members: {data ? data : "Loading..."}</h1>
    </div>
  );
};

export default GetListOfMembersComponent;
