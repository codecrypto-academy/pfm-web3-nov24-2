'use client';

import React, { useState, useEffect } from 'react';
import { useEthereum } from '../hooks/connectMetamask';

type MemberData = [
  string,  // name
  string,  // address
  number,  // role
  boolean  // isActive
];

const Members: React.FC = () => {
  const [ newMember, setNewMember ] = useState({
    name: "",     // Nuevo campo
    address: "",
    role: "",
    active: false
  });
  const [ members, setMembers ] = useState<MemberData[]>([]);
  const [ showSaveButton, setShowSaveButton ] = useState(false);
  const [ accounts, setAccounts ] = useState<string[]>([]);
  const { contract } : any = useEthereum();


  // Función para conectar con MetaMask y obtener cuentas
  const connectWallet = async () => {
    if (typeof window.ethereum !== 'undefined') {
      try {
        // Solicitar acceso a las cuentas
        const accountsList = await window.ethereum.request({ method: 'eth_requestAccounts' });
        setAccounts(accountsList);
        if (accountsList.length === 0) {
          console.error('Error there isn\'t any imported account in Metamask!');
        }
      } catch (error) {
        console.error('Error connecting to MetaMask:', error);
      }
    } else {
      console.error('MetaMask is not installed');
    }
  };

  // Llamar a connectWallet cuando el componente se monta
  useEffect(() => {
    connectWallet();
  }, []);

  useEffect(() => {

    const callgetAllListOfMembersMethod = async () => {
      if (contract) {
        try {
          const tx: MemberData[] = await contract.getAllListOfMembers();
          // Parsear la respuesta
          console.log('Members:', tx);
          setMembers(tx);
        } catch (error) {
          console.error('Error calling contract method:', error);
        }
      }
    };
    callgetAllListOfMembersMethod();

  }, [contract]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setNewMember((prev) => ({
      ...prev,
      [name]: name === "active" ? value === "true" : value
    }));
    setShowSaveButton(true);
  };

  const handleSave = async () => {
    console.info(`Name: ${newMember.name}, Address: ${newMember.address}, Role: ${newMember.role}, Active: ${newMember.active}`);
    if (contract) {
      try {
        await contract.addMember(newMember.name, newMember.address, Number(newMember.role));
      } catch (error) {
        console.error('Error calling contract method:', error);
      } finally {
        setNewMember({ name: "", address: "", role: "2", active: false });
        setShowSaveButton(false);
      }
    }
  };

  const handleRoleChange = async (name: string, memberAddress: string, role: number, isActive: boolean) => {
    if (contract) {
      try {
        await contract.addMember(name, memberAddress, role);
      } catch (error) {
        console.error('Error calling contract method:', error);
      }
    }
  };

  const handleToggleActive = async (name: string, memberAddress: string, role: number, isActive: boolean) => {
    if (contract) {
      try {
        await contract.addMember(name, memberAddress, role, isActive);
      } catch (error) {
        console.error('Error calling contract method:', error);
      }
    }
  };

  return (
    <div className="container mx-auto p-6 bg-white shadow-lg rounded-lg">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold text-gray-800">Gestión de Usuarios</h2>
      </div>

      {/* Formulario para nuevo miembro */}
      <div className="p-4 border-t border-gray-200">
        <h3 className="text-lg font-semibold text-gray-800 mb-4">Añadir Nuevo Miembro</h3>
        <div className="grid grid-cols-5 gap-4">
          <input
            type="text"
            name="name"
            placeholder="Nombre del miembro"
            value={newMember.name}
            onChange={handleInputChange}
            className="border border-gray-300 rounded-md px-3 py-2 w-full text-gray-700"
          />
          <select
            name="address"
            value={newMember.address}
            onChange={handleInputChange}
            className="border border-gray-300 rounded-md px-3 py-2 w-full whitespace-nowrap text-gray-700"
          >
            {accounts.map((account: string, index: number) => (
              <option key={index} value={account}>
                {account}
              </option>
            ))}
          </select>
          <select
            name="role"
            value={newMember.role}
            onChange={handleInputChange}
            className="border border-gray-300 rounded-md px-3 py-2 w-full whitespace-nowrap text-gray-700"
          >
            <option value="0">Admin</option>
            <option value="1">Transportista</option>
            <option value="2">Donante</option>
          </select>
          <div className="flex items-center space-x-4">
            <label className="flex items-center space-x-2">
              <input
                type="radio"
                name="active"
                value="true"
                checked={newMember.active === true}
                onChange={handleInputChange}
              />
              <span className="text-green-600 font-medium">Activo</span>
            </label>
            <label className="flex items-center space-x-2">
              <input
                type="radio"
                name="active"
                value="false"
                checked={newMember.active === false}
                onChange={handleInputChange}
              />
              <span className="text-red-600 font-medium">Inactivo</span>
            </label>
          </div>
        </div>
        {showSaveButton && (
          <button 
            onClick={handleSave}
            className="mt-4 px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white font-medium rounded-md"
          >
            Guardar
          </button>
        )}
      </div>

      <div className="p-4 border-t border-gray-200">
        <div className="overflow-x-auto">
          <table className="min-w-full bg-white border border-gray-200 rounded-lg">
            <thead className="bg-gray-200">
              <tr>
                <th className="px-6 py-3 text-left text-sm font-medium text-gray-600 uppercase tracking-wider">
                  Nombre
                </th>
                <th className="px-6 py-3 text-left text-sm font-medium text-gray-600 uppercase tracking-wider">
                  Address
                </th>
                <th className="px-6 py-3 text-left text-sm font-medium text-gray-600 uppercase tracking-wider">
                  Role
                </th>
                <th className="px-6 py-3 text-left text-sm font-medium text-gray-600 uppercase tracking-wider">
                  Estado
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {members.map((member: MemberData, index: number) => (
                <tr key={index} className={!member[3] ? 'bg-gray-100' : ''}>
                  <td className="px-6 py-4 whitespace-nowrap text-gray-700">
                    {member[0]}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-gray-700">
                    {member[1]}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <select
                      value={member[2]}
                      onChange={(e) => handleRoleChange(member[0], member[1], Number(e.target.value), member[3])}
                      className="border border-gray-300 rounded-md px-2 py-1 text-gray-700"
                    >
                      <option value="0">Admin</option>
                      <option value="1">Transportista</option>
                      <option value="2">Donante</option>
                    </select>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <button
                      onClick={() => handleToggleActive(member[0], member[1], member[2], !member[3])}
                      className={`px-4 py-2 rounded-md shadow-md ${
                        member[3] 
                          ? 'bg-red-500 hover:bg-red-600 text-white'
                          : 'bg-green-500 hover:bg-green-600 text-white'
                      }`}
                    >
                      {member[3] ? 'Desactivar' : 'Activar'}
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default Members; 