import React, { useState } from 'react';

const Donor: React.FC = () => {
  const [selectedProducts, setSelectedProducts] = useState<string[]>([]);
  const [metadata, setMetadata] = useState<string>('');
  const [image, setImage] = useState<File | null>(null);

  const handleProductSelection = (product: string) => {
    setSelectedProducts(prev => 
      prev.includes(product) ? prev.filter(p => p !== product) : [...prev, product]
    );
  };

  const handleImageUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (event.target.files) {
      setImage(event.target.files[0]);
    }
  };

  const handleSubmit = () => {
    // Simulate generating a link
    const link = `https://example.com/donation/${Math.random().toString(36).substr(2, 9)}`;
    alert(`Donation link: ${link}`);
  };

  return (
    <div className="container mx-auto p-6 bg-white shadow-lg rounded-lg">
      <h2 className="text-2xl font-bold text-gray-800 mb-6">Donaciones</h2>
      <div className="mb-6">
        <h3 className="font-semibold text-lg text-gray-700 mb-2">Seleccionar Productos:</h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {['Comida', 'Productos de limpieza', 'Herramientas'].map(product => (
            <label key={product} className="flex items-center space-x-2">
              <input
                type="checkbox"
                checked={selectedProducts.includes(product)}
                onChange={() => handleProductSelection(product)}
                className="form-checkbox h-5 w-5 text-blue-600"
              />
              <span className="text-gray-700">{product}</span>
            </label>
          ))}
        </div>
      </div>
      <div className="mb-6">
        <input
          type="text"
          placeholder="Ingrese metadatos"
          value={metadata}
          onChange={(e) => setMetadata(e.target.value)}
          className="border border-gray-300 rounded-md px-4 py-2 w-full focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
      </div>
      <div className="mb-6">
        <input 
          type="file" 
          onChange={handleImageUpload} 
          className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
        />
      </div>
      <button 
        onClick={handleSubmit} 
        className="bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 px-4 rounded-md shadow-md transition duration-300"
      >
        Generar Enlace
      </button>
    </div>
  );
};

export default Donor; 