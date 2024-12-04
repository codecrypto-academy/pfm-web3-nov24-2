'use client';

import React, { useState, useEffect } from 'react';
import { useEthereum } from '../hooks/connectMetamask';

type Location = 'Paiporta' | 'Chiva' | 'Massanassa' | 'Catarroja';

type Batch = {
  id: string;
  name: string;
  status: 'OPEN' | 'CLOSED' | 'IN_TRANSIT' | 'DELIVERY';
  currentHandler: string;
  donations: string[];
  destinationZone?: Location;
};

const statusMap: { [key: number]: string } = {
  0: 'OPEN',
  1: 'CLOSED',
  2: 'IN_TRANSIT',
  3: 'DELIVERY'
};

const Transport: React.FC = () => {
  const [batches, setBatches] = useState<Batch[]>([]);
  const [showTransportModal, setShowTransportModal] = useState(false);
  const [selectedBatch, setSelectedBatch] = useState<string | null>(null);
  const [selectedLocation, setSelectedLocation] = useState<Location>('Paiporta');
  const { contract } = useEthereum();

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'OPEN':
        return 'bg-green-100 text-green-800';
      case 'CLOSED':
        return 'bg-yellow-100 text-yellow-800';
      case 'IN_TRANSIT':
        return 'bg-blue-100 text-blue-800';
      case 'DELIVERY':
        return 'bg-purple-100 text-purple-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const fetchBatches = async () => {
    if (contract) {
      try {
        const result = await contract.getAllBatchesWithStatusClosedReadyForTransporter();
        console.log('Batches fetched:', result);

        if (result.length === 0) {
          setBatches([]);
          return;
        }
        
        if (Array.isArray(result) && result.every(batch => 
          batch && 
          typeof batch.id !== 'undefined' && 
          typeof batch.status !== 'undefined' &&
          typeof batch.currentHandler !== 'undefined'
        )) {
          setBatches(result);
        } else {
          console.warn('El resultado no tiene el formato esperado:', result);
          setBatches([]);
        }
      } catch (error) {
        console.error('Error fetching batches:', error);
        setBatches([]);
      }
    }
  };

  useEffect(() => {
    fetchBatches();
  }, [contract]);

  const handleAssignForTransport = (batchId: string) => {
    setSelectedBatch(batchId);
    setShowTransportModal(true);
  };

  const handleConfirmTransport = async () => {
    if (contract && selectedBatch) {
      try {
        const tx = await contract.claimBatchForTransporter(selectedBatch);
        await tx.wait();
        console.log('Batch claimed for transport successfully');
        await fetchBatches();
      } catch (error) {
        console.error('Error claiming batch for transport:', error);
      } finally {
        setShowTransportModal(false);
        setSelectedBatch(null);
      }
    }
  };

  return (
    <div className="container mx-auto p-6 bg-white shadow-lg rounded-lg">
      <h2 className="text-2xl font-bold text-gray-800 mb-6">Asignación para Transporte</h2>
      
      <div className="overflow-x-auto">
        <table className="min-w-full bg-white border border-gray-200 rounded-lg">
          <thead className="bg-[#B3E5FC]">
            <tr>
              <th className="px-6 py-3 text-left text-base font-semibold text-gray-800 uppercase">ID Lote</th>
              <th className="px-6 py-3 text-left text-base font-semibold text-gray-800 uppercase">Estado</th>
              <th className="px-6 py-3 text-left text-base font-semibold text-gray-800 uppercase">Handler Actual</th>
              <th className="px-6 py-3 text-left text-base font-semibold text-gray-800 uppercase">Contenido</th>
              <th className="px-6 py-3 text-left text-base font-semibold text-gray-800 uppercase">Acciones</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {batches.map((batch) => (
              <tr key={batch.id} className="hover:bg-gray-50">
                <td className="px-6 py-4 text-base text-gray-900 font-medium">
                  #{batch.id}
                </td>
                <td className="px-6 py-4">
                  <span className={`px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(statusMap[Number(batch.status)])}`}>
                    {statusMap[Number(batch.status)] || 'Desconocido'}
                  </span>
                </td>
                <td className="px-6 py-4 text-base text-gray-900">
                  {`${batch.currentHandler.slice(0, 6)}...${batch.currentHandler.slice(-4)}`}
                </td>
                <td className="px-6 py-4">
                  <div className="max-w-xl overflow-x-auto">
                    {Array.isArray(batch.donations) ? (
                      <span className="text-base text-gray-900">
                        {batch.donations.length} donaciones
                      </span>
                    ) : (
                      <span className="text-base text-gray-500">Sin donaciones</span>
                    )}
                  </div>
                </td>
                <td className="px-6 py-4">
                  <button
                    onClick={() => handleAssignForTransport(batch.id)}
                    className="bg-[#B3E5FC] hover:bg-blue-300 text-gray-800 px-6 py-3 text-base font-medium rounded-md shadow-md transition duration-200"
                  >
                    Asignar para Transporte
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {showTransportModal && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 flex justify-center items-center z-50">
          <div className="bg-white p-8 rounded-lg shadow-xl max-w-md w-full">
            <h3 className="text-xl font-bold text-gray-800 mb-6">Seleccionar Localización de Entrega</h3>
            <select
              value={selectedLocation}
              onChange={(e) => setSelectedLocation(e.target.value as Location)}
              className="border border-gray-300 rounded-md px-4 py-2 mb-6 w-full focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900"
            >
              <option value="Paiporta" className="text-gray-900">Paiporta</option>
              <option value="Chiva" className="text-gray-900">Chiva</option>
              <option value="Massanassa" className="text-gray-900">Massanassa</option>
              <option value="Catarroja" className="text-gray-900">Catarroja</option>
            </select>
            <div className="flex justify-end space-x-4">
              <button
                onClick={() => setShowTransportModal(false)}
                className="bg-gray-500 hover:bg-gray-600 text-white px-6 py-2 rounded-md shadow-md transition duration-200"
              >
                Cancelar
              </button>
              <button
                onClick={handleConfirmTransport}
                className="bg-green-600 hover:bg-green-700 text-white px-6 py-2 rounded-md shadow-md transition duration-200"
              >
                Confirmar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Transport; 