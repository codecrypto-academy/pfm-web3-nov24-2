'use client';

import React, { useState } from 'react';

type Location = 'Paiporta' | 'Chiva' | 'Massanassa' | 'Catarroja';

type Donation = {
  description: string;
  image: string; // URL de la imagen
};

type Batch = {
  id: string;
  name: string;
  status: 'OPEN' | 'CLOSED' | 'IN_TRANSIT' | 'DELIVERY';
  currentHandler: string;
  donations: Donation[];
  destinationZone?: Location;
};

// Mock data con imágenes de ejemplo
const initialBatches: Batch[] = [
  {
    id: '1',
    name: 'Lote Alimentos #1',
    status: 'IN_TRANSIT',
    currentHandler: '0x1234...5678',
    donations: [
      {
        description: 'Comida',
        image: 'https://via.placeholder.com/400x300?text=Donacion+Alimentos'
      },
      {
        description: 'Productos de limpieza',
        image: 'https://via.placeholder.com/400x300?text=Productos+Limpieza'
      }
    ],
  },
  {
    id: '2',
    name: 'Lote Herramientas #2',
    status: 'IN_TRANSIT',
    currentHandler: '0x8765...4321',
    donations: [
      {
        description: 'Herramientas',
        image: 'https://via.placeholder.com/400x300?text=Herramientas'
      }
    ],
  },
];

const BatchDelivery: React.FC = () => {
  const [batches, setBatches] = useState<Batch[]>(initialBatches);
  const [showLocationModal, setShowLocationModal] = useState(false);
  const [showImageModal, setShowImageModal] = useState(false);
  const [selectedBatch, setSelectedBatch] = useState<string | null>(null);
  const [selectedLocation, setSelectedLocation] = useState<Location>('Paiporta');
  const [selectedImages, setSelectedImages] = useState<string[]>([]);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);

  const handleAssignToNGO = (batchId: string) => {
    setSelectedBatch(batchId);
    setShowLocationModal(true);
  };

  const handleValidateDelivery = (batch: Batch) => {
    setSelectedImages(batch.donations.map(d => d.image));
    setCurrentImageIndex(0);
    setShowImageModal(true);
  };

  const handleNextImage = () => {
    setCurrentImageIndex((prev) => (prev + 1) % selectedImages.length);
  };

  const handlePrevImage = () => {
    setCurrentImageIndex((prev) => (prev - 1 + selectedImages.length) % selectedImages.length);
  };

  return (
    <div className="container mx-auto p-6 bg-white shadow-lg rounded-lg">
      <h2 className="text-2xl font-bold text-gray-800 mb-6">Entrega de Lotes</h2>
      
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
                Transportista
              </th>
              <th className="px-6 py-3 text-left text-sm font-medium text-gray-600 uppercase tracking-wider">
                Acciones
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {batches.filter(batch => batch.status === 'IN_TRANSIT').map((batch) => (
              <tr key={batch.id}>
                <td className="px-6 py-4 whitespace-nowrap text-gray-700">
                  {batch.id}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-gray-700">
                  {batch.name}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-gray-700">
                  {batch.donations.map(d => d.description).join(', ')}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-gray-700">
                  {batch.status}
                </td>
                <td className="px-6 py-4 whitespace-nowrap font-mono text-sm text-gray-700">
                  {batch.currentHandler}
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="flex space-x-2">
                    <button
                      onClick={() => handleAssignToNGO(batch.id)}
                      className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md shadow-md"
                    >
                      Asignar a ONG
                    </button>
                    <button
                      onClick={() => handleValidateDelivery(batch)}
                      className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-md shadow-md flex items-center"
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" viewBox="0 0 20 20" fill="currentColor">
                        <path fillRule="evenodd" d="M4 3a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V5a2 2 0 00-2-2H4zm12 12H4l4-8 3 6 2-4 3 6z" clipRule="evenodd" />
                      </svg>
                      Validar Envío
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Modal de Imágenes */}
      {showImageModal && (
        <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-3xl w-full mx-4">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-xl font-bold text-gray-800">
                Validación de Envío - Imagen {currentImageIndex + 1} de {selectedImages.length}
              </h3>
              <button
                onClick={() => setShowImageModal(false)}
                className="text-gray-500 hover:text-gray-700"
              >
                <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            
            <div className="relative">
              <img
                src={selectedImages[currentImageIndex]}
                alt={`Imagen ${currentImageIndex + 1}`}
                className="w-full h-auto rounded-lg shadow-lg"
              />
              
              {selectedImages.length > 1 && (
                <>
                  <button
                    onClick={handlePrevImage}
                    className="absolute left-0 top-1/2 transform -translate-y-1/2 bg-black bg-opacity-50 text-white p-2 rounded-r-lg hover:bg-opacity-75"
                  >
                    <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                    </svg>
                  </button>
                  <button
                    onClick={handleNextImage}
                    className="absolute right-0 top-1/2 transform -translate-y-1/2 bg-black bg-opacity-50 text-white p-2 rounded-l-lg hover:bg-opacity-75"
                  >
                    <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                    </svg>
                  </button>
                </>
              )}
            </div>

            <div className="flex justify-end mt-4 space-x-2">
              <button
                onClick={() => setShowImageModal(false)}
                className="bg-gray-500 hover:bg-gray-600 text-white px-4 py-2 rounded-md shadow-md"
              >
                Cerrar
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal de Localización existente */}
      {showLocationModal && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 flex justify-center items-center">
          <div className="bg-white p-6 rounded-lg shadow-lg">
            <h3 className="text-lg font-bold mb-4">Seleccionar Localización</h3>
            <select
              value={selectedLocation}
              onChange={(e) => setSelectedLocation(e.target.value as Location)}
              className="border border-gray-300 rounded-md px-4 py-2 mb-4 w-full"
            >
              <option value="Paiporta">Paiporta</option>
              <option value="Chiva">Chiva</option>
              <option value="Massanassa">Massanassa</option>
              <option value="Catarroja">Catarroja</option>
            </select>
            <div className="flex justify-end">
              <button
                onClick={handleConfirmAssignment}
                className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-md shadow-md mr-2"
              >
                Confirmar
              </button>
              <button
                onClick={() => setShowLocationModal(false)}
                className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-md shadow-md"
              >
                Cancelar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default BatchDelivery; 