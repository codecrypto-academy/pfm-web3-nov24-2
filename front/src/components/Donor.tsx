'use client';

import React, { useState, useEffect } from 'react';
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

const Donor: React.FC = () => {
  const [ batches, setBatches ] = useState<BatchData[]>();
  const [ selectedBatch, setSelectedBatch ] = useState('');
  const [ newDonation, setNewDonation ] = useState({
    productDescription: "",
    batchId: ""
  });
  const [ donations, setDonations ] = useState<DonationData[]>([]);
  const [ showAddProductButton, setShowAddProductButton ] = useState(false);
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


  useEffect(() => {

    const callgetAllDonationsInAllBatches = async () => {
      if (contract) {
        try {
          const tx: DonationData[] = await contract.getAllDonationsInAllBatches();
          // Parsear la respuesta
          console.log('Donation data:', tx);
          setDonations(tx);
        } catch (error) {
          console.error('Error calling contract method:', error);
        }
      }
    };
    callgetAllDonationsInAllBatches();

  }, [contract]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setNewDonation({
      ...newDonation,
      [name]: value
    });
    setShowAddProductButton(true);
  };

  const handleAddProduct = async () => {
    console.log(`Batch ID: ${newDonation.batchId}, product description ${newDonation.productDescription}`);
    if (contract) {
      try {
        const tx: any = await contract.addDonation(newDonation.batchId, newDonation.productDescription);
      } catch (error) {
        console.error('Error calling contract method:', error);
      } finally {
        setNewDonation({productDescription: "", batchId: ""});
        setShowAddProductButton(false);
      }
    }
  }

  return (
    <div className="container mx-auto p-6 bg-white shadow-lg rounded-lg">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold text-gray-800">Donación de productos:</h2>
      </div>

      <div className="p-4 border-t border-gray-200">
        <h3 className="text-lg font-semibold text-gray-800 mb-4">Hacer donaciones:</h3>
        <div className="grid grid-cols-5 gap-4">
          <a className="text-gray-700">Producto del lote: </a>
          <input
            type="text"
            name="productDescription"
            value={newDonation.productDescription}
            onChange={handleInputChange}
            placeholder="Donación"
            className="border border-gray-300 rounded-md px-3 py-2 w-full whitespace-nowrap text-gray-700"
          />
          <a className="text-gray-700">ID del lote: </a>
          <select 
            name="batchId"
            value={newDonation.batchId}
            className="border border-gray-300 rounded-md px-3 py-2 w-full whitespace-nowrap text-gray-700"
            onMouseOver={handleInputChange}
          >
            {batches?.map((batch: BatchData, index: number) => (
              <option key={index} value={batch[0]}>
                {batch[0]}
              </option>
            ))}
          </select>
          {showAddProductButton && (
              <button 
                onClick={handleAddProduct}
                className="mt-4 px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white font-medium rounded-md"
              >
                Añadir producto
              </button>
          )}
        </div>
      </div>
      <div className="p-4 border-t border-gray-200">
        <div className="overflow-x-auto">
          <table className="min-w-full bg-white border border-gray-200 rounded-lg">
            <thead className="bg-gray-200">
              <tr>
                <th className="px-6 py-3 text-left text-sm font-medium text-gray-600 uppercase tracking-wider">
                  Address
                </th>
                <th className="px-6 py-3 text-left text-sm font-medium text-gray-600 uppercase tracking-wider">
                  Descripcion
                </th>
                <th className="px-6 py-3 text-left text-sm font-medium text-gray-600 uppercase tracking-wider">
                  Timestamp
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              { donations.map((donation: DonationData, index: any) => (
                <tr key={index}>
                  <td className="px-6 py-4 whitespace-nowrap text-gray-700">
                    {donation[0]}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-gray-700">
                    {donation[1]}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-gray-700">
                    {donation[2]}
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

export default Donor; 