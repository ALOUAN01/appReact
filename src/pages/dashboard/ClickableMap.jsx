import React, { useState, useEffect, useCallback } from 'react';
import { MapContainer, TileLayer, Marker, Popup, useMapEvents } from 'react-leaflet';
import axios from 'axios';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

// Correction des icônes Leaflet dans React
import icon from 'leaflet/dist/images/marker-icon.png';
import iconShadow from 'leaflet/dist/images/marker-shadow.png';

let DefaultIcon = L.icon({
  iconUrl: icon,
  shadowUrl: iconShadow,
  iconSize: [25, 41],
  iconAnchor: [12, 41]
});

L.Marker.prototype.options.icon = DefaultIcon;

// Composant qui détecte les clics sur la carte
function MapClickHandler({ onCitySelected }) {
  const map = useMapEvents({
    click: async (e) => {
      const { lat, lng } = e.latlng;
      try {
        // Utilisation de Nominatim pour le géocodage inversé (gratuit mais avec des limites d'utilisation)
        const response = await axios.get(
          `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}&zoom=10&addressdetails=1`,
          {
            headers: {
              'User-Agent': 'YourAppName' // Important pour Nominatim
            }
          }
        );
        
        const city = response.data.address.city || 
                     response.data.address.town || 
                     response.data.address.village || 
                     response.data.address.county || 
                     'Unknown';
                     
        const country = response.data.address.country || 'Unknown';
        
        // Appeler la fonction de callback avec les informations de la ville
        onCitySelected(city, country);
      } catch (error) {
        console.error("Error getting location data:", error);
      }
    }
  });

  return null;
}

// Liste des villes principales (optionnel)
const majorCities = [
  { name: "Paris", country: "France", position: [48.8566, 2.3522] },
  { name: "London", country: "United Kingdom", position: [51.5074, -0.1278] },
  { name: "New York", country: "USA", position: [40.7128, -74.0060] },
  { name: "Tokyo", country: "Japan", position: [35.6762, 139.6503] },
  { name: "Sydney", country: "Australia", position: [-33.8688, 151.2093] }
];

// Composant principal de la carte
export function MapSearch({ onCitySelected }) {
  const [selectedCity, setSelectedCity] = useState(null);
  
  // Gestion du clic sur un marqueur prédéfini
  const handleMarkerClick = useCallback((city, country) => {
    setSelectedCity({ name: city, country: country });
    onCitySelected(city, country);
  }, [onCitySelected]);

  return (
    <div className="map-container" style={{ height: '400px', width: '100%', marginBottom: '20px' }}>
      <MapContainer 
        center={[20, 0]} 
        zoom={2} 
        scrollWheelZoom={true} 
        style={{ height: '100%', width: '100%' }}
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        
        {/* Marqueurs pour les villes principales */}
        {majorCities.map((city) => (
          <Marker 
            key={city.name} 
            position={city.position}
            eventHandlers={{
              click: () => handleMarkerClick(city.name, city.country),
            }}
          >
            <Popup>
              {city.name}, {city.country}
            </Popup>
          </Marker>
        ))}
        
        {/* Gestionnaire de clics pour le géocodage inversé */}
        <MapClickHandler onCitySelected={onCitySelected} />
      </MapContainer>
      
      {selectedCity && (
        <div className="mt-2 px-4 py-2 bg-blue-gray-50 rounded">
          <p>Selected city: <strong>{selectedCity.name}</strong>, {selectedCity.country}</p>
        </div>
      )}
    </div>
  );
}