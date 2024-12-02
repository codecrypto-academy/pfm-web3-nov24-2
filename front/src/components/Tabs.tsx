'use client';

import React, { useState } from 'react';
import Donor from './Donor';
import Users from './User';
import Batches from './Batch';
import Transport from './Transport';
import Delivery from './BatchDelivery';

const Tabs: React.FC = () => {
  const [activeTab, setActiveTab] = useState<string>('Donaciones');

  const renderTabContent = () => {
    switch (activeTab) {
      case 'Donaciones':
        return <Donor />;
      case 'Usuarios':
        return <Users />;
      case 'Gestión de Lotes':
        return <Batches />;
      case 'Transporte':
        return <Transport />;
      case 'Entrega en destino':
        return <Delivery />;
      default:
        return null;
    }
  };

  return (
    <div className="p-4">
      <div className="flex space-x-4 border-b">
        {['Donaciones', 'Usuarios', 'Gestión de Lotes', 'Transporte', 'Entrega en destino'].map(tab => (
          <button
            key={tab}
            className={`py-2 px-4 rounded-t-lg transition-colors duration-300 ${
              activeTab === tab
                ? 'bg-blue-600 text-white border-b-2 border-blue-600'
                : 'bg-gray-200 text-gray-600 hover:bg-blue-100'
            }`}
            onClick={() => setActiveTab(tab)}
          >
            {tab}
          </button>
        ))}
      </div>
      <div className="mt-4">
        {renderTabContent()}
      </div>
    </div>
  );
};

export default Tabs; 