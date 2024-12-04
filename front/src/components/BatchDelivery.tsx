'use client';

import React, { useState, useEffect } from 'react';
import { useEthereum } from '../hooks/connectMetamask';

type Location = 'Paiporta' | 'Chiva' | 'Massanassa' | 'Catarroja';

type Donation = {
  donor: string;
  description: string;
  timestamp: number;
  donationType: number;
  imageUrl: string;
};

const BatchDelivery: React.FC = () => {
  const [batches, setBatches] = useState<any[]>([]);
  const [showDonationsModal, setShowDonationsModal] = useState(false);
  const [selectedBatchDonations, setSelectedBatchDonations] = useState<Donation[]>([]);
  const { contract } = useEthereum();

  const fetchBatches = async () => {
    if (contract) {
      try {
        const result = await contract.getAllBatchesInTransitAndDelivery();
        console.log('Batches fetched:', result);
        setBatches(Array.isArray(result) ? result : []);
      } catch (error) {
        console.error('Error fetching batches:', error);
        setBatches([]);
      }
    }
  };

  useEffect(() => {
    fetchBatches();
  }, [contract]);

  const handleVerifyBatch = async (batchId: string) => {
    if (contract) {
      try {
        const tx = await contract.claimBatchForDelivery(batchId);
        await tx.wait();
        console.log('Batch claimed for delivery successfully');
        await fetchBatches();
      } catch (error) {
        console.error('Error claiming batch for delivery:', error);
      }
    }
  };

  const handleShowDonations = async (batchId: string) => {
    if (contract) {
      try {
        const batch = await contract.getBatch(batchId);
        const donations: Donation[] = [];
        
        for (let i = 0; i < batch.donations.length; i++) {
          const donation = await contract.getDonation(batchId, i);
          donations.push(donation);
        }
        
        setSelectedBatchDonations(donations);
        setShowDonationsModal(true);
      } catch (error) {
        console.error('Error fetching donations:', error);
      }
    }
  };

  const getDonationType = (type: number) => {
    switch (type) {
      case 0:
        return 'Comida';
      case 1:
        return 'Ropa';
      case 2:
        return 'Productos de Limpieza';
      default:
        return 'Otro';
    }
  };

  const statusMap: { [key: number]: string } = {
    0: 'OPEN',
    1: 'CLOSED',
    2: 'IN_TRANSIT',
    3: 'DELIVERY'
  };

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

  return (
    <div className="container mx-auto p-6 bg-white shadow-lg rounded-lg">
      <h2 className="text-2xl font-bold text-gray-800 mb-6">Entrega de Lotes</h2>
      
      {batches.length === 0 ? (
        <div className="text-center py-8">
          <p className="text-gray-500 text-lg">No hay lotes disponibles en este momento</p>
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="min-w-full bg-white border border-gray-200 rounded-lg">
            <thead className="bg-[#B3E5FC]">
              <tr>
                <th className="px-6 py-3 text-left text-sm font-medium text-gray-800 uppercase tracking-wider">
                  ID Lote
                </th>
                <th className="px-6 py-3 text-left text-sm font-medium text-gray-800 uppercase tracking-wider">
                  Estado
                </th>
                <th className="px-6 py-3 text-left text-sm font-medium text-gray-800 uppercase tracking-wider">
                  Handler Actual
                </th>
                <th className="px-6 py-3 text-left text-sm font-medium text-gray-800 uppercase tracking-wider">
                  Acciones
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {batches.map((batch) => (
                <tr key={batch.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap text-gray-700">
                    #{batch.id.toString()}
                  </td>
                  <td className="px-6 py-4">
                    <span className={`px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(statusMap[Number(batch.status)])}`}>
                      {statusMap[Number(batch.status)] || 'Desconocido'}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap font-mono text-sm text-gray-700">
                    {`${batch.currentHandler.slice(0, 6)}...${batch.currentHandler.slice(-4)}`}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex space-x-2">
                      <button
                        onClick={() => handleVerifyBatch(batch.id)}
                        className="bg-[#B3E5FC] hover:bg-blue-300 text-gray-800 px-4 py-2 rounded-md shadow-md"
                      >
                        Verificar Lote
                      </button>
                      <button
                        onClick={() => handleShowDonations(batch.id)}
                        className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-md shadow-md"
                      >
                        Validar Lote
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Donations Modal */}
      {showDonationsModal && selectedBatchDonations && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 flex justify-center items-center z-50">
          <div className="bg-white p-8 rounded-lg shadow-xl max-w-4xl w-full max-h-[80vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-xl font-bold text-gray-800">
                {selectedBatchDonations.length === 0 
                  ? "No hay donaciones en este lote" 
                  : "Donaciones del Lote"}
              </h3>
              <button
                onClick={() => setShowDonationsModal(false)}
                className="text-gray-500 hover:text-gray-700"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            
            {selectedBatchDonations.length === 0 ? (
              <p className="text-center text-gray-500 py-4">
                Este lote no contiene donaciones
              </p>
            ) : (
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-[#B3E5FC]">
                    <tr>
                      <th className="px-6 py-3 text-left text-sm font-medium text-gray-800">Donante</th>
                      <th className="px-6 py-3 text-left text-sm font-medium text-gray-800">Descripción</th>
                      <th className="px-6 py-3 text-left text-sm font-medium text-gray-800">Tipo</th>
                      <th className="px-6 py-3 text-left text-sm font-medium text-gray-800">Imagen</th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {selectedBatchDonations.map((donation, index) => (
                      <tr key={index} className="hover:bg-gray-50">
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">
                          {`${donation.donor.slice(0, 6)}...${donation.donor.slice(-4)}`}
                        </td>
                        <td className="px-6 py-4 text-sm text-gray-700">
                          {donation.description}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">
                          {getDonationType(donation.donationType)}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <img 
                            src={donation.imageUrl} 
                            alt="Donation" 
                            className="h-20 w-20 object-cover rounded-lg hover:scale-150 transition-transform duration-200"
                          />
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default BatchDelivery; 