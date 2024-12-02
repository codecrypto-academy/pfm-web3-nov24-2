'use client';

import React, { useState } from 'react';
import GoogleMapComponent from './GoogleMapComponent';

type Donation = {
  id: string;
  description: string;
  address: string;
  timestamp: number;
  location: { lat: number; lng: number; };
};

type Batch = {
  id: string;
  name: string;
  donations: Donation[];
  destinationZone: string;
  status: string;
  currentHandler: string;
  locations: { lat: number; lng: number; }[];
};

const initialDonations: Donation[] = [
  { 
    id: '1', 
    description: 'Alimentos no perecederos', 
    address: '0x1234...5678', 
    timestamp: 1633024800,
    location: { lat: 39.4697, lng: -0.3774 } // Valencia
  },
  { 
    id: '2', 
    description: 'Productos de limpieza', 
    address: '0x8765...4321', 
    timestamp: 1633111200,
    location: { lat: 39.4553, lng: -0.3762 } // Cerca de Valencia
  },
  { 
    id: '3', 
    description: 'Material escolar', 
    address: '0x9876...1234', 
    timestamp: 1633197600,
    location: { lat: 39.4699, lng: -0.3776 } // Otra ubicación en Valencia
  },
];

const initialBatches: Batch[] = [
  {
    id: '1',
    name: 'Lote Escolar #1',
    donations: [initialDonations[2]],
    destinationZone: 'Paiporta',
    status: 'IN_TRANSIT',
    currentHandler: '0x1234...5678',
    locations: [
      { lat: 39.4699, lng: -0.3776 }, // Origen
      { lat: 39.4297, lng: -0.4173 }, // Punto intermedio
      { lat: 39.4256, lng: -0.4178 }  // Paiporta
    ]
  },
  {
    id: '2',
    name: 'Lote Alimentos #2',
    donations: [initialDonations[0], initialDonations[1]],
    destinationZone: 'Chiva',
    status: 'CLOSED',
    currentHandler: '0x8765...4321',
    locations: [
      { lat: 39.4697, lng: -0.3774 }, // Origen
      { lat: 39.4723, lng: -0.7183 }  // Chiva
    ]
  },
  {
    id: '3',
    name: 'Lote Mixto #3',
    donations: initialDonations,
    destinationZone: 'Massanassa',
    status: 'IN_TRANSIT',
    currentHandler: '0x9876...1234',
    locations: [
      { lat: 39.4697, lng: -0.3774 }, // Origen
      { lat: 39.4115, lng: -0.4023 }, // Punto intermedio
      { lat: 39.4084, lng: -0.4011 }  // Massanassa
    ]
  }
];

const Batches: React.FC = () => {
  const [donations, setDonations] = useState<Donation[]>(initialDonations);
  const [selectedDonations, setSelectedDonations] = useState<Set<string>>(new Set());
  const [batches, setBatches] = useState<Batch[]>(initialBatches);
  const [batchName, setBatchName] = useState<string>('');
  const [currentBatch, setCurrentBatch] = useState<Batch | null>(null);
  const [selectedBatchForMap, setSelectedBatchForMap] = useState<Batch | null>(null);

  const handleDonationSelect = (donationId: string) => {
    setSelectedDonations(prev => {
      const newSet = new Set(prev);
      if (newSet.has(donationId)) {
        newSet.delete(donationId);
      } else {
        newSet.add(donationId);
      }
      return newSet;
    });
  };

  const handleCreateBatch = () => {
    if (!batchName) {
      alert('Por favor, ingrese un nombre para el lote');
      return;
    }
    const selectedDonationsList = donations.filter(donation => selectedDonations.has(donation.id));
    const newBatch: Batch = {
      id: Math.random().toString(36).substr(2, 9),
      name: batchName,
      donations: selectedDonationsList,
      destinationZone: 'Paiporta',
      status: 'OPEN',
      currentHandler: '0x1234...5678',
      locations: selectedDonationsList.length > 0 
        ? [selectedDonationsList[0].location]
        : [{ lat: 39.4697, lng: -0.3774 }] // Valencia como ubicación por defecto
    };
    setBatches([...batches, newBatch]);
    setCurrentBatch(newBatch);
    setBatchName('');
    setSelectedDonations(new Set());
  };

  const handleCloseBatch = () => {
    if (currentBatch) {
      setBatches(batches.map(batch => 
        batch.id === currentBatch.id ? { ...batch, status: 'CLOSED' } : batch
      ));
      setCurrentBatch(null);
    }
  };

  return (
    <div className="container mx-auto p-6 bg-white shadow-lg rounded-lg">
      <h2 className="text-2xl font-bold text-gray-800 mb-4">Creación de Lote</h2>
      
      <div className="mb-6">
        <input
          type="text"
          placeholder="Nombre del lote"
          value={batchName}
          onChange={(e) => setBatchName(e.target.value)}
          className="border border-gray-300 rounded-md px-4 py-2 w-full mb-4"
        />
        <button
          onClick={handleCreateBatch}
          className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md shadow-md"
        >
          Crear Lote
        </button>
        {currentBatch && (
          <button
            onClick={handleCloseBatch}
            className="ml-4 bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-md shadow-md"
          >
            Cerrar Lote
          </button>
        )}
      </div>

      <div className="overflow-x-auto mb-6">
        <h3 className="text-xl font-bold text-gray-800 mb-2">Donaciones</h3>
        <table className="min-w-full bg-white border border-gray-200 rounded-lg">
          <thead className="bg-gray-200">
            <tr>
              <th className="px-6 py-3 text-left text-sm font-medium text-gray-600 uppercase tracking-wider">
                Seleccionar
              </th>
              <th className="px-6 py-3 text-left text-sm font-medium text-gray-600 uppercase tracking-wider">
                Descripción
              </th>
              <th className="px-6 py-3 text-left text-sm font-medium text-gray-600 uppercase tracking-wider">
                Address
              </th>
              <th className="px-6 py-3 text-left text-sm font-medium text-gray-600 uppercase tracking-wider">
                Timestamp
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {donations.map((donation) => (
              <tr key={donation.id}>
                <td className="px-6 py-4 whitespace-nowrap">
                  <input
                    type="checkbox"
                    checked={selectedDonations.has(donation.id)}
                    onChange={() => handleDonationSelect(donation.id)}
                  />
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-gray-700">
                  {donation.description}
                </td>
                <td className="px-6 py-4 whitespace-nowrap font-mono text-sm text-gray-700">
                  {donation.address}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-gray-700">
                  {new Date(donation.timestamp * 1000).toLocaleString()}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="overflow-x-auto">
        <h3 className="text-xl font-bold text-gray-800 mb-2">Lotes</h3>
        <table className="min-w-full bg-white border border-gray-200 rounded-lg">
          <thead className="bg-gray-200">
            <tr>
              <th className="px-6 py-3 text-left text-sm font-medium text-gray-600 uppercase tracking-wider">
                Nombre
              </th>
              <th className="px-6 py-3 text-left text-sm font-medium text-gray-600 uppercase tracking-wider">
                Donaciones
              </th>
              <th className="px-6 py-3 text-left text-sm font-medium text-gray-600 uppercase tracking-wider">
                Zona de Destino
              </th>
              <th className="px-6 py-3 text-left text-sm font-medium text-gray-600 uppercase tracking-wider">
                Estado
              </th>
              <th className="px-6 py-3 text-left text-sm font-medium text-gray-600 uppercase tracking-wider">
                Encargado Actual
              </th>
              <th className="px-6 py-3 text-left text-sm font-medium text-gray-600 uppercase tracking-wider">
                Acciones
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {batches.map((batch) => (
              <tr key={batch.id}>
                <td className="px-6 py-4 whitespace-nowrap text-gray-700">
                  {batch.name}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-gray-700">
                  {batch.donations.map(d => d.description).join(', ')}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-gray-700">
                  {batch.destinationZone}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-gray-700">
                  {batch.status}
                </td>
                <td className="px-6 py-4 whitespace-nowrap font-mono text-sm text-gray-700">
                  {batch.currentHandler}
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <button
                    onClick={() => setSelectedBatchForMap(batch)}
                    className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-md shadow-md"
                  >
                    Visualizar Trayecto
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {selectedBatchForMap && (
        <div className="mt-6 p-4 border border-gray-300 rounded-lg shadow-md">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-xl font-bold text-gray-800">
              Trayecto del Lote: {selectedBatchForMap.name}
            </h3>
            <button
              onClick={() => setSelectedBatchForMap(null)}
              className="text-gray-500 hover:text-gray-700"
            >
              <span className="sr-only">Cerrar</span>
              <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
          <GoogleMapComponent 
            locations={selectedBatchForMap.locations}
            batchName={selectedBatchForMap.name}
          />
        </div>
      )}
    </div>
  );
};

export default Batches; 