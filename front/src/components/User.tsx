'use client';

import React, { useState } from 'react';

type User = {
  id: string;
  name: string;
  role: 'ADMIN' | 'TRANSPORTER' | 'DONOR';
  address: string;
  isActive: boolean;
};

// Mock data - Reemplazar con datos reales del smart contract
const initialUsers: User[] = [
  { id: '1', name: 'John Doe', role: 'ADMIN', address: '0x1234...5678', isActive: true },
  { id: '2', name: 'Jane Smith', role: 'TRANSPORTER', address: '0x8765...4321', isActive: true },
  { id: '3', name: 'Bob Wilson', role: 'DONOR', address: '0x9876...1234', isActive: false },
];

const Users: React.FC = () => {
  const [users, setUsers] = useState<User[]>(initialUsers);
  const [hasChanges, setHasChanges] = useState(false);

  const handleRoleChange = (userId: string, newRole: User['role']) => {
    setUsers(users.map(user => 
      user.id === userId ? { ...user, role: newRole } : user
    ));
    setHasChanges(true);
  };

  const handleToggleActive = (userId: string) => {
    setUsers(users.map(user =>
      user.id === userId ? { ...user, isActive: !user.isActive } : user
    ));
    setHasChanges(true);
  };

  const handleSaveChanges = async () => {
    try {
      // Aquí iría la lógica para guardar en el smart contract
      console.log('Saving changes:', users);
      setHasChanges(false);
      alert('Cambios guardados correctamente');
    } catch (error) {
      console.error('Error saving changes:', error);
      alert('Error al guardar los cambios');
    }
  };

  return (
    <div className="container mx-auto p-6 bg-white shadow-lg rounded-lg">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold text-gray-800">Gestión de Usuarios</h2>
        {hasChanges && (
          <button
            onClick={handleSaveChanges}
            className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md shadow-md"
          >
            Guardar Cambios
          </button>
        )}
      </div>
      
      <div className="overflow-x-auto">
        <table className="min-w-full bg-white border border-gray-200 rounded-lg">
          <thead className="bg-gray-200">
            <tr>
              <th className="px-6 py-3 text-left text-sm font-medium text-gray-600 uppercase tracking-wider">
                Nombre
              </th>
              <th className="px-6 py-3 text-left text-sm font-medium text-gray-600 uppercase tracking-wider">
                Role
              </th>
              <th className="px-6 py-3 text-left text-sm font-medium text-gray-600 uppercase tracking-wider">
                Address
              </th>
              <th className="px-6 py-3 text-left text-sm font-medium text-gray-600 uppercase tracking-wider">
                Estado
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {users.map((user) => (
              <tr key={user.id} className={!user.isActive ? 'bg-gray-100' : ''}>
                <td className="px-6 py-4 whitespace-nowrap text-gray-700">
                  {user.name}
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <select
                    value={user.role}
                    onChange={(e) => handleRoleChange(user.id, e.target.value as User['role'])}
                    className="border border-gray-300 rounded-md px-2 py-1 text-gray-700"
                  >
                    <option value="ADMIN">Admin</option>
                    <option value="TRANSPORTER">Transportista</option>
                    <option value="DONOR">Donante</option>
                  </select>
                </td>
                <td className="px-6 py-4 whitespace-nowrap font-mono text-sm text-gray-700">
                  {user.address}
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <button
                    onClick={() => handleToggleActive(user.id)}
                    className={`px-4 py-2 rounded-md shadow-md ${
                      user.isActive 
                        ? 'bg-red-500 hover:bg-red-600 text-white'
                        : 'bg-green-500 hover:bg-green-600 text-white'
                    }`}
                  >
                    {user.isActive ? 'Desactivar' : 'Activar'}
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

export default Users; 