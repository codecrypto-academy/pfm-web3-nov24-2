'use client';

import React, { useState, useEffect } from 'react';
import GoogleMapComponent from './GoogleMapComponent';
import { useEthereum } from '../hooks/conectMetamask';

type BatchData = [
  number, // id
  number, // DistributionZones destinationZone;
  number, // BatchStatus status;
  string, // currentHandler;
  [],     // Donation[] donations;
  []      // Location[] locations;
];

type DonationData = [
  string, // donor
  string, // description
  number // timestamp
]

enum DestinationZone { Paiporta, Chiva, Massanassa, Catarroja }
enum BatchStatus { OPEN, CLOSED, IN_TRANSIT, DELIVERY }
enum Donor { "Address", "Product", "Timestamp" }
const Batches: React.FC = () => {
  const [ batches, setBatches ] = useState<BatchData[]>([]);
  const [ donations, setDonations ] = useState<DonationData[]>([]);
  const [ currentBatch, setCurrentBatch ] = useState(false);
  const [ selectedBatchForMap, setSelectedBatchForMap ] = useState<BatchData | null>(null);
  const [ showCreateBatchButton, setCreateBatchButton ] = useState(false);
  const [ newBatch, setNewBatch] = useState({
    originZone: ""
  });
  const { contract } : any = useEthereum();


  useEffect(() => {

    const callgetAllBatchesMethod = async () => {
      if (contract) {
        try {
          const tx: BatchData[] = await contract.getAllBatches();
          // Parsear la respuesta
          console.log('Batches:', tx);
          setBatches(tx);
        } catch (error) {
          console.error('Error calling contract method:', error);
        }
      }
    };
    callgetAllBatchesMethod();

  }, [contract]);

  const handleCloseBatch = () => {
    if (currentBatch) {
      /*setBatches(batches.map(batch => 
        batch[0] === currentBatch ? { ...batch, status: 'CLOSED' } : batch
      ));*/
      setCurrentBatch(false);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setNewBatch((prev) => ({
      ...prev,
      [name]: value
    }));
    setCreateBatchButton(true);
  };

  const handleCreateBatch = async () => {
    
    if (contract) {
      try {
        const latitude: string = newBatch.originZone.split(",")[0];
        const longitude: string = newBatch.originZone.split(",")[1];
        console.info(`Latitude: ${latitude}, longitude ${longitude}`)
        await contract.createBatch(latitude, longitude);
      } catch (error) {
        console.error('Error calling contract method:', error);
      } finally {
        setNewBatch({ originZone: "" });
        setCreateBatchButton(false);
      }
    }
  }



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
          <option value="40.367247556719214,-4.004330961733217">Madrid</option>
          <option value="41.386714427411036,2.171085424303542">Barcelona</option>
          <option value="39.47271644169512,-0.3745603598671224">Valencia</option>
        </select>

        {showCreateBatchButton && (
          <button
            onClick={handleCreateBatch}
            className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md shadow-md"
          >
            Crear Lote
          </button> 
        )}

        {currentBatch && (
          <button
            onClick={handleCloseBatch}
            className="ml-4 bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-md shadow-md"
          >
            Cerrar Lote
          </button>
        )}
      </div>

      <div className="p-6 border-t border-gray-200">
        <div className="overflow-x-auto">
          <table className="min-w-full bg-white border border-gray-200 rounded-lg">
            <thead className="bg-gray-200">
              <tr>
                <th className="px-6 py-3 text-left text-sm font-medium text-gray-600 uppercase tracking-wider">
                  Batch ID
                </th>
                <th className="px-6 py-3 text-left text-sm font-medium text-gray-600 uppercase tracking-wider">
                  Destination Zone
                </th>
                <th className="px-6 py-3 text-left text-sm font-medium text-gray-600 uppercase tracking-wider">
                  Batch Status
                </th>
                <th className="px-6 py-3 text-left text-sm font-medium text-gray-600 uppercase tracking-wider">
                  Current handler address
                </th>
                <th className="px-6 py-3 text-left text-sm font-medium text-gray-600 uppercase tracking-wider">
                  Donation
                </th>
                <th className="px-6 py-3 text-left text-sm font-medium text-gray-600 uppercase tracking-wider">
                  Locations
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              { batches.map((batch: BatchData, index: number) => (
                <tr key={index}>
                  <td className="px-6 py-4 whitespace-nowrap text-gray-700">
                    {batch[0]}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-gray-700">
                    {DestinationZone[batch[1]]}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-gray-700">
                    {BatchStatus[batch[2]]}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-gray-700">
                    {batch[3]}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-gray-700">
                    {batch[4].toString().split(",").join("\n")}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-gray-700">
                    {batch[5].toString()}
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

export default Batches;