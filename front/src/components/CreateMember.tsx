'use client';

import React, { useState } from 'react';
import { useEthereum } from '../hooks/conectMetamask';

const CreateMember: React.FC = () => {
  const [inputAddress, setInputAddress] = useState<string>('');
  const [inputRole, setInputRole] = useState<string>('');

  const { contract } : any = useEthereum();
  
  const handleInputAddress = (event: React.ChangeEvent<HTMLInputElement>) => {
    setInputAddress(event.target.value);
  };

  const handleInputRole = (event: React.ChangeEvent<HTMLInputElement>) => {
    setInputRole(event.target.value);
  };

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    try {

      // Llamar al método addMember del contrato
      const tx = await contract.addMember(inputAddress, inputRole);
      await tx.wait(); // Esperar a que la transacción sea minada

    } catch (error) {
      console.error('Error interacting with contract:', error);
    }
  };

  return (
    <div>
      <form onSubmit={handleSubmit}>
        <input type="text" value={inputAddress} onChange={handleInputAddress} placeholder="Enter address in 0x... format" />
        <br />
        <input type="text" value={inputRole} onChange={handleInputRole} placeholder="Enter role [ADMIN, TRANSPORTER or DONOR]" />
        <br />
        <button type="submit">Submit</button>
      </form>
    </div>
  );
};

export default CreateMember;
