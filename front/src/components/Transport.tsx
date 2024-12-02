'use client';

import React, { useState } from 'react';

type Location = 'Paiporta' | 'Chiva' | 'Massanassa' | 'Catarroja';

type Batch = {
  id: string;
  name: string;
  status: 'OPEN' | 'CLOSED' | 'IN_TRANSIT' | 'DELIVERY';
  currentHandler: string;
  donations: string[];
  destinationZone?: Location;
};

// Mock data
const initialBatches: Batch[] = [
  {
    id: '1',
    name: 'Lote Alimentos #1',
    status: 'CLOSED',
    currentHandler: '0x1234...5678',
    donations: ['Comida', 'Productos de limpieza'],
  },
  {
    id: '2',
    name: 'Lote Herramientas #2',
    status: 'CLOSED',
    currentHandler: '0x8765...4321',
    donations: ['Herramientas'],
  },
];

const Transport: React.FC = () => {
  const [batches, setBatches] = useState<Batch[]>(initialBatches);
  const [showTransportModal, setShowTransportModal] = useState(false);
  const [selectedBatch, setSelectedBatch] = useState<string | null>(null);
  const [selectedLocation, setSelectedLocation] = useState<Location>('Paiporta');

  const handleAssignForTransport = (batchId: string) => {
    setSelectedBatch(batchId);
    setShowTransportModal(true);
  };

  const handleConfirmTransport = () => {
    if (selectedBatch && selectedLocation) {
      setBatches(batches.map(batch => 
        batch.id === selectedBatch
          ? { ...batch, status: 'IN_TRANSIT', destinationZone: selectedLocation }
          : batch
      ));
      setShowTransportModal(false);
      setSelectedBatch(null);
    }
  };

  return (
    <div className="container mx-auto p-6 bg-white shadow-lg rounded-lg">
      <h2 className="text-2xl font-bold text-gray-800 mb-6">Asignación para Transporte</h2>
      
      <div className="overflow-x-auto">
        <table className="min-w-full bg-white border border-gray-200 rounded-lg">
          <thead className="bg-gray-200">
            <tr>
              <th className="px-6 py-3 text-left text-sm font-medium text-gray-600 uppercase tracking-wider">
                ID Lote
              </th>
              <th className="px-6 py-3 text-left text-sm font-medium text-gray-600 uppercase tracking-wider">
                Nombre
              </th>
              <th className="px-6 py-3 text-left text-sm font-medium text-gray-600 uppercase tracking-wider">
                Contenido
              </th>
              <th className="px-6 py-3 text-left text-sm font-medium text-gray-600 uppercase tracking-wider">
                Estado
              </th>
              <th className="px-6 py-3 text-left text-sm font-medium text-gray-600 uppercase tracking-wider">
                Responsable Actual
              </th>
              <th className="px-6 py-3 text-left text-sm font-medium text-gray-600 uppercase tracking-wider">
                Acciones
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {batches.filter(batch => batch.status === 'CLOSED').map((batch) => (
              <tr key={batch.id}>
                <td className="px-6 py-4 whitespace-nowrap text-gray-700">
                  {batch.id}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-gray-700">
                  {batch.name}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-gray-700">
                  {batch.donations.join(', ')}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-gray-700">
                  <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-yellow-100 text-yellow-800">
                    {batch.status}
                  </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap font-mono text-sm text-gray-700">
                  {batch.currentHandler}
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <button
                    onClick={() => handleAssignForTransport(batch.id)}
                    className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md shadow-md transition duration-200 ease-in-out transform hover:-translate-y-1"
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
              className="border border-gray-300 rounded-md px-4 py-2 mb-6 w-full focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="Paiporta">Paiporta</option>
              <option value="Chiva">Chiva</option>
              <option value="Massanassa">Massanassa</option>
              <option value="Catarroja">Catarroja</option>
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