'use client';

import { GoogleMap, Marker, useLoadScript } from '@react-google-maps/api';

const containerStyle = {
  width: '50%',
  height: '500px',
};

// Coordenadas del lote (modifica con las coordenadas reales)
const loteCenter = {
  lat: 40.416721, // Latitud del lote
  lng: -3.70239 // Longitud del lote
};

const GoogleMapComponent = () => {
  const { isLoaded } = useLoadScript({
    googleMapsApiKey: process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY!,
  });

  if (!isLoaded) return <p>Cargando mapa...</p>;

  return (
    <GoogleMap
      mapContainerStyle={containerStyle}
      center={loteCenter}
      zoom={15} // Nivel de zoom ajustado para el lote
    >
      {/* Marcador para señalar la ubicación del lote */}
      <Marker position={loteCenter} />
    </GoogleMap>
  );
};

export default GoogleMapComponent;