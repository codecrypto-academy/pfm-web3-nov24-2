'use client';

import React, { useState, useEffect } from 'react';
import { useEthereum } from '../hooks/connectMetamask';

interface BatchData {
  id: number;
  status: number;
  currentHandler: string;
  donations: string[];
  locations: Array<{
    latitude: string;
    longitude: string;
  }>;
}

enum DestinationZone { Paiporta, Chiva, Massanassa, Catarroja }
enum BatchStatus { OPEN, CLOSED, IN_TRANSIT, DELIVERY }

const Batches: React.FC = () => {
  const [batches, setBatches] = useState<BatchData[]>([]);
  const [newBatch, setNewBatch] = useState({
    originZone: ""
  });
  const [showCreateBatchButton, setCreateBatchButton] = useState(false);
  const { contract } = useEthereum();

  useEffect(() => {
    const fetchBatches = async () => {
      if (contract) {
        try {
          const result = await contract.getAllBatches();
          const formattedBatches = result.map((batch: any) => ({
            id: Number(batch.id),
            status: Number(batch.status),
            currentHandler: batch.currentHandler,
            donations: batch.donations || [],
            locations: batch.locations || []
          }));
          console.log('Formatted batches:', formattedBatches);
          setBatches(formattedBatches);
        } catch (error) {
          console.error('Error fetching batches:', error);
          setBatches([]);
        }
      }
    };

    fetchBatches();
  }, [contract]);

  const handleInputChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const { name, value } = e.target;
    setNewBatch(prev => ({
      ...prev,
      [name]: value
    }));
    setCreateBatchButton(value !== "");
  };

  const handleCreateBatch = async () => {
    if (contract && newBatch.originZone) {
      try {
        const [latitude, longitude] = newBatch.originZone.split(',');
        console.log(`Creating batch with coordinates: ${latitude}, ${longitude}`);
        await contract.createBatch(latitude.toString(), longitude.toString());
        
        // Recargar los lotes después de crear uno nuevo
        const updatedBatches = await contract.getAllBatches();
        setBatches(updatedBatches);
      } catch (error) {
        console.error('Error creating batch:', error);
      } finally {
        setNewBatch({ originZone: "" });
        setCreateBatchButton(false);
      }
    }
  };

  const handleCloseBatch = async (batchId: number) => {
    if (contract) {
      try {
        const tx = await contract.closeBatch(batchId);
        await tx.wait();
        console.log('Batch closed successfully');
        
        // Recargar los lotes después de cerrar uno
        const updatedBatches = await contract.getAllBatches();
        const formattedBatches = updatedBatches.map((batch: any) => ({
          id: Number(batch.id),
          status: Number(batch.status),
          currentHandler: batch.currentHandler,
          donations: batch.donations || [],
          locations: batch.locations || []
        }));
        setBatches(formattedBatches);
      } catch (error) {
        console.error('Error closing batch:', error);
      }
    }
  };

  const parseDonations = (donationsString: string) => {
    // Si no hay donaciones, retornar array vacío
    if (!donationsString) return [];

    // Dividir la cadena en donaciones individuales (cada 5 elementos forman una donación)
    const donationParts = donationsString.split(',').map(part => part.trim());
    const donations = [];

    for (let i = 0; i < donationParts.length; i += 5) {
      if (i + 4 < donationParts.length) {
        donations.push({
          donor: donationParts[i],
          description: donationParts[i + 1],
          timestamp: donationParts[i + 2],
          donationType: donationParts[i + 3],
          imageUrl: donationParts[i + 4]
        });
      }
    }
    return donations;
  };

  const getStatusColor = (status: number) => {
    switch (status) {
      case BatchStatus.OPEN:
        return 'bg-green-100 text-green-800';
      case BatchStatus.CLOSED:
        return 'bg-yellow-100 text-yellow-800';
      case BatchStatus.IN_TRANSIT:
        return 'bg-blue-100 text-blue-800';
      case BatchStatus.DELIVERY:
        return 'bg-purple-100 text-purple-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="container mx-auto p-6 bg-white shadow-lg rounded-lg">
      <h2 className="text-2xl font-bold text-gray-800 mb-4">Creación de Lote</h2>
      
      <div className="mb-6">
        <select
          name="originZone"
          value={newBatch.originZone}
          onChange={handleInputChange}
          className="border border-gray-300 rounded-md px-4 py-2 whitespace-nowrap text-gray-700"
        >
          <option value="">Seleccionar ubicación</option>
          <option value="40.367247556719214,-4.004330961733217">Madrid</option>
          <option value="41.386714427411036,2.171085424303542">Barcelona</option>
          <option value="39.47271644169512,-0.3745603598671224">Valencia</option>
        </select>

        {showCreateBatchButton && (
          <button
            onClick={handleCreateBatch}
            className="ml-4 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md shadow-md"
          >
            Crear Lote
          </button>
        )}
      </div>

      <div className="overflow-x-auto">
        <table className="min-w-full bg-white border border-gray-200">
          <thead className="bg-gray-200">
            <tr>
              <th className="px-6 py-3 text-left text-base font-semibold text-gray-800 uppercase">ID</th>
              <th className="px-6 py-3 text-left text-base font-semibold text-gray-800 uppercase">Estado</th>
              <th className="px-6 py-3 text-left text-base font-semibold text-gray-800 uppercase">Handler Actual</th>
              <th className="px-6 py-3 text-left text-base font-semibold text-gray-800 uppercase">Contenido</th>
              <th className="px-6 py-3 text-left text-base font-semibold text-gray-800 uppercase">Ubicaciones</th>
              <th className="px-6 py-3 text-left text-base font-semibold text-gray-800 uppercase">Acciones</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {batches.map((batch, index) => (
              <tr key={index} className="hover:bg-gray-50">
                <td className="px-6 py-4 text-base text-gray-900 font-medium">
                  #{batch.id.toString()}
                </td>
                <td className="px-6 py-4">
                  <span className={`px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(batch.status)}`}>
                    {BatchStatus[batch.status]}
                  </span>
                </td>
                <td className="px-6 py-4 text-base text-gray-900">
                  {`${batch.currentHandler.slice(0, 6)}...${batch.currentHandler.slice(-4)}`}
                </td>
                <td className="px-6 py-4">
                  <div className="max-w-xl overflow-x-auto">
                    <table className="min-w-full divide-y divide-gray-200 border rounded-lg">
                      <thead className="bg-gray-50">
                        <tr>
                          <th className="px-4 py-3 text-left text-sm font-semibold text-gray-800">Descripción</th>
                          <th className="px-4 py-3 text-left text-sm font-semibold text-gray-800">Tipo</th>
                          <th className="px-4 py-3 text-left text-sm font-semibold text-gray-800">Fecha</th>
                        </tr>
                      </thead>
                      <tbody className="bg-white divide-y divide-gray-200">
                        {parseDonations(batch.donations.toString()).map((donation: any, idx: number) => (
                          <tr key={idx} className="hover:bg-gray-50">
                            <td className="px-4 py-3 text-base text-gray-900">{donation.description}</td>
                            <td className="px-4 py-3">
                              <span className={`px-2 py-1 rounded-full text-sm font-medium ${
                                ['bg-blue-100 text-blue-800', 
                                 'bg-green-100 text-green-800', 
                                 'bg-yellow-100 text-yellow-800'][Number(donation.donationType)] || 'bg-gray-100 text-gray-800'
                              }`}>
                                {['Comida', 'Productos de limpieza', 'Herramientas'][Number(donation.donationType)] || 'Desconocido'}
                              </span>
                            </td>
                            <td className="px-4 py-3 text-base text-gray-900">
                              {new Date(Number(donation.timestamp) * 1000).toLocaleDateString()}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </td>
                <td className="px-6 py-4 text-base text-gray-900">
                  {Array.isArray(batch.locations) ? batch.locations.length : '0'}
                </td>
                <td className="px-6 py-4">
                  {batch.status === BatchStatus.OPEN && (
                    <button
                      onClick={() => handleCloseBatch(batch.id)}
                      className="bg-red-600 hover:bg-red-700 text-white px-6 py-3 text-base font-medium rounded-md shadow-md transition duration-200"
                    >
                      Cerrar Lote
                    </button>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default Batches;