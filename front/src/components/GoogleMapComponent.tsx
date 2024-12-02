'use client';

import { GoogleMap, Marker, Polyline, useLoadScript } from '@react-google-maps/api';

interface Props {
  locations: { lat: number; lng: number; }[];
  batchName: string;
}

const containerStyle = {
  width: '100%',
  height: '500px',
  borderRadius: '0.5rem'
};

const GoogleMapComponent: React.FC<Props> = ({ locations, batchName }) => {
  const { isLoaded } = useLoadScript({
    googleMapsApiKey: process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY!,
  });

  if (!isLoaded) return (
    <div className="flex justify-center items-center h-[500px] bg-gray-100 rounded-lg">
      <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
    </div>
  );

  const center = locations[0];

  return (
    <GoogleMap
      mapContainerStyle={containerStyle}
      center={center}
      zoom={13}
      options={{
        mapTypeControl: false,
        streetViewControl: false,
        fullscreenControl: true,
        zoomControl: true,
        styles: [
          {
            featureType: "poi",
            elementType: "labels",
            stylers: [{ visibility: "off" }]
          }
        ]
      }}
    >
      {/* Marcadores para cada punto */}
      {locations.map((location, index) => (
        <Marker
          key={index}
          position={location}
          label={index === 0 ? 'O' : index === locations.length - 1 ? 'D' : `${index}`}
        />
      ))}

      {/* Línea que conecta los puntos */}
      <Polyline
        path={locations}
        options={{
          strokeColor: '#2563eb',
          strokeOpacity: 1,
          strokeWeight: 3,
        }}
      />
    </GoogleMap>
  );
};

export default GoogleMapComponent;