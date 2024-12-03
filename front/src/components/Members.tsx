'use client';

import React, { useState, useEffect } from 'react';
import { useEthereum } from '../hooks/conectMetamask';

type MemberData = [
  string, // Address
  number, // Role
  boolean // Is active
];

const Members: React.FC = () => {
  const [ newMember, setNewMember ] = useState({
    address: "",
    role: "",
    active: false,
  });
  const [ members, setMembers ] = useState<MemberData[]>([]);
  const [ showSaveButton, setShowSaveButton ] = useState(false);
  const { contract } : any = useEthereum();

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
      [name]: name === "active" ? value === "true" : value,
    }));
    setShowSaveButton(true);
  };

  const handleSave = async () => {
    if (contract) {
      try {
        await contract.addMember(newMember.address, newMember.role, newMember.active);
        setNewMember({ address: "", role: "2", active: false });
        setShowSaveButton(false);
      } catch (error) {
        console.error('Error calling contract method:', error);
      }
    }
  };

  const handleRoleChange = async (memberAddress: string, role: number, isActive: boolean) => {
    if (contract) {
      try {
        await contract.addMember(memberAddress, role, isActive);
      } catch (error) {
        console.error('Error calling contract method:', error);
      }
    }
  };

  const handleToggleActive = async (memberAddress: string, role: number, isActive: boolean) => {
    if (contract) {
      try {
        await contract.addMember(memberAddress, role, isActive);
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
        <div className="grid grid-cols-3 gap-4">
          <input
            type="text"
            name="address"
            value={newMember.address}
            onChange={handleInputChange}
            placeholder="Address"
            className="border border-gray-300 rounded-md px-3 py-2 w-full whitespace-nowrap text-gray-700"
          />
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

      <div className="overflow-x-auto">
        <table className="min-w-full bg-white border border-gray-200 rounded-lg">
          <thead className="bg-gray-200">
            <tr>
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
            { members.map((member: MemberData, index: any) => (
              <tr key={index} className={!member[2] ? 'bg-gray-100' : ''}>
                <td className="px-6 py-4 whitespace-nowrap text-gray-700">
                  {member[0]}
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <select
                    value={member[1]}
                    onChange={(e: any) => handleRoleChange(member[0], e.target.value as number, member[2])}
                    className="border border-gray-300 rounded-md px-2 py-1 text-gray-700"
                  >
                    <option value="0">Admin</option>
                    <option value="1">Transportista</option>
                    <option value="2">Donante</option>
                  </select>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <button
                    onClick={() => handleToggleActive(member[0], member[1], !member[2])}
                    className={`px-4 py-2 rounded-md shadow-md ${
                      member[2] 
                        ? 'bg-red-500 hover:bg-red-600 text-white'
                        : 'bg-green-500 hover:bg-green-600 text-white'
                    }`}
                  >
                    {member[2] ? 'Desactivar' : 'Activar'}
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default Members; 