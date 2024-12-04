'use client';

import React, { useState, useEffect } from 'react';
import { useEthereum } from '../hooks/connectMetamask';

interface Donation {
  donor: string;
  description: string;
  timestamp: number;
  donationType: number; // 0: Food, 1: CleaningSupplies, 2: Tools
  imageUrl: string;
}

const Donor: React.FC = () => {
  const [newDonation, setNewDonation] = useState({
    description: "",
    donationType: 0,
    imageUrl: ""
  });
  const [donations, setDonations] = useState<Donation[]>([]);
  const [selectedBatchId, setSelectedBatchId] = useState<string>("");
  const [selectedDonationId, setSelectedDonationId] = useState<string>("");
  const { contract } = useEthereum();

  const fetchDonations = async () => {
    if (contract) {
      try {
        const result = await contract.getAllDonations();
        console.log('Donations:', result);
        setDonations(result);
      } catch (error) {
        console.error('Error fetching donations:', error);
      }
    }
  };

  useEffect(() => {
    fetchDonations();
  }, [contract]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setNewDonation(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleCreateDonation = async () => {
    if (contract) {
      try {
        const tx = await contract.createDonation(
          newDonation.description,
          newDonation.donationType,
          newDonation.imageUrl
        );
        await tx.wait();
        
        await fetchDonations();
      } catch (error) {
        console.error('Error creating donation:', error);
      } finally {
        setNewDonation({
          description: "",
          donationType: 0,
          imageUrl: ""
        });
      }
    }
  };

  const handleAddDonationToBatch = async () => {
    if (!contract || !selectedBatchId || !selectedDonationId) {
      console.error('Please select both batch and donation');
      return;
    }

    try {
      const tx = await contract.addDonationToBatch(
        selectedBatchId,
        selectedDonationId
      );
      await tx.wait();
      console.log('Donation added to batch successfully');
      
      // Limpiar selecciones después de añadir
      setSelectedBatchId("");
      setSelectedDonationId("");
      
      // Recargar donaciones
      await fetchDonations();
    } catch (error) {
      console.error('Error adding donation to batch:', error);
    }
  };

  return (
    <div className="container mx-auto p-6 bg-white shadow-lg rounded-lg">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold text-gray-800">Donación de productos</h2>
      </div>

      <div className="p-4 border-t border-gray-200">
        <h3 className="text-lg font-semibold text-gray-800 mb-4">Hacer donaciones:</h3>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-gray-700">Descripción:</label>
            <input
              type="text"
              name="description"
              value={newDonation.description}
              onChange={handleInputChange}
              className="border border-gray-300 rounded-md px-3 py-2 w-full text-gray-900"
            />
          </div>

          <div>
            <label className="block text-gray-700">Tipo de donación:</label>
            <select
              name="donationType"
              value={newDonation.donationType}
              onChange={handleInputChange}
              className="border border-gray-300 rounded-md px-3 py-2 w-full text-gray-900"
            >
              <option value={0}>Comida</option>
              <option value={1}>Productos de limpieza</option>
              <option value={2}>Herramientas</option>
            </select>
          </div>

          <div>
            <label className="block text-gray-700">URL de la imagen:</label>
            <input
              type="text"
              name="imageUrl"
              value={newDonation.imageUrl}
              onChange={handleInputChange}
              className="border border-gray-300 rounded-md px-3 py-2 w-full text-gray-900"
            />
          </div>
        </div>

        <button
          onClick={handleCreateDonation}
          className="mt-4 px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white font-medium rounded-md"
        >
          Crear Donación
        </button>
      </div>

      <div className="p-4 border-t border-gray-200">
        <h3 className="text-lg font-semibold text-gray-800 mb-4">Donaciones realizadas:</h3>
        <div className="overflow-x-auto">
          <table className="min-w-full bg-white border border-gray-200">
            <thead className="bg-gray-200">
              <tr>
                <th className="px-6 py-3 text-left text-sm font-medium text-gray-600">ID</th>
                <th className="px-6 py-3 text-left text-sm font-medium text-gray-600">Donante</th>
                <th className="px-6 py-3 text-left text-sm font-medium text-gray-600">Descripción</th>
                <th className="px-6 py-3 text-left text-sm font-medium text-gray-600">Tipo</th>
                <th className="px-6 py-3 text-left text-sm font-medium text-gray-600">Fecha</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {donations.map((donation, index) => (
                <tr key={index}>
                  <td className="px-6 py-4 whitespace-nowrap text-gray-700">
                    {index + 1}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-gray-700">
                    {`${donation.donor.slice(0, 6)}...${donation.donor.slice(-4)}`}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-gray-700">
                    {donation.description}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-gray-700">
                    {['Comida', 'Productos de limpieza', 'Herramientas'][donation.donationType]}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-gray-700">
                    {new Date(Number(donation.timestamp) * 1000).toLocaleString()}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <div className="p-4 border-t border-gray-200">
        <h3 className="text-lg font-semibold text-gray-800 mb-4">Asignar donación a lote:</h3>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-gray-700">ID del Lote:</label>
            <input
              type="number"
              value={selectedBatchId}
              onChange={(e) => setSelectedBatchId(e.target.value)}
              className="border border-gray-300 rounded-md px-3 py-2 w-full text-gray-900"
            />
          </div>
          <div>
            <label className="block text-gray-700">ID de la Donación:</label>
            <input
              type="number"
              value={selectedDonationId}
              onChange={(e) => setSelectedDonationId(e.target.value)}
              className="border border-gray-300 rounded-md px-3 py-2 w-full text-gray-900"
            />
          </div>
        </div>
        <button
          onClick={handleAddDonationToBatch}
          className="mt-4 px-4 py-2 bg-green-500 hover:bg-green-600 text-white font-medium rounded-md"
        >
          Añadir Donación al Lote
        </button>
      </div>
    </div>
  );
};

export default Donor; 