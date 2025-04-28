import {
  Card,
  CardHeader,
  CardBody,
  Typography,
  Button,
  Input,
  Select,
  Option,
  CardFooter,
  Tooltip,
  Checkbox,
  Slider,
} from "@material-tailwind/react";
import React, { useState, useEffect, useCallback, useMemo } from 'react';
import axios from 'axios';
import './UserSearchApp.css';
import { MapContainer, TileLayer, Marker, Popup, useMapEvents } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { GeoJSON } from 'react-leaflet';

// 1. Créer des icônes personnalisées (points rouges et bleus)
const redIcon = L.divIcon({
  className: 'custom-div-icon',
  html: `<div style="background-color: #ff0000; width: 12px; height: 12px; border-radius: 50%; border: 2px solid #fff; box-shadow: 0 0 4px rgba(0,0,0,0.5);"></div>`,
  iconSize: [16, 16],
  iconAnchor: [8, 8],
  popupAnchor: [0, -8]
});

const blueIcon = L.divIcon({
  className: 'custom-div-icon',
  html: `<div style="background-color: #2196F3; width: 12px; height: 12px; border-radius: 50%; border: 2px solid #fff; box-shadow: 0 0 4px rgba(0,0,0,0.5);"></div>`,
  iconSize: [16, 16],
  iconAnchor: [8, 8],
  popupAnchor: [0, -8]
});

L.Marker.prototype.options.icon = blueIcon;

// Cache pour les données protégées
const dataCache = new Map();

// Component for protected sensitive data with caching
const ProtectedData = ({ dataId, type }) => {
  const [isRevealed, setIsRevealed] = useState(false);
  const [data, setData] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  
  // Cache key
  const cacheKey = `${dataId}-${type}`;
  
  const handleToggleReveal = async () => {
    if (isRevealed) {
      setIsRevealed(false);
      return;
    }
    
    // Check cache first
    if (dataCache.has(cacheKey)) {
      setData(dataCache.get(cacheKey));
      setIsRevealed(true);
      
      // Auto-hide after 10 seconds
      setTimeout(() => {
        setIsRevealed(false);
      }, 10000);
      return;
    }
    
    try {
      setIsLoading(true);
      // Fetch the actual data from server when revealed
      const response = await axios.get(`http://localhost:8080/users/protectedData/${dataId}?type=${type}`);
      const responseData = response.data.value;
      
      // Store in cache
      dataCache.set(cacheKey, responseData);
      
      setData(responseData);
      setIsRevealed(true);
      
      // Auto-hide after 10 seconds
      setTimeout(() => {
        setIsRevealed(false);
      }, 10000);
    } catch (error) {
      console.error("Error fetching protected data:", error);
    } finally {
      setIsLoading(false);
    }
  };
  
  // Display placeholder based on data type
  const getPlaceholder = () => {
    switch(type) {
      case "email":
        return "••••@••••.•••";
      case "phone":
        return "••• ••• ••••";
      case "relationship":
        return "••••••";
      default:
        return "•••••••";
    }
  };
  
  return (
    <Tooltip content={isRevealed ? "Click to hide" : "Click to reveal"}>
      <span 
        onClick={handleToggleReveal} 
        className={`cursor-pointer transition-all duration-300 hover:bg-blue-gray-50 px-2 py-1 rounded ${isLoading ? 'opacity-50' : ''}`}
      >
        {isRevealed && data ? data : getPlaceholder()}
      </span>
    </Tooltip>
  );
};

// Liste des villes principales
const majorCities = [
  { name: "Paris", country: "France", position: [48.8566, 2.3522] },
  { name: "Marseille", country: "France", position: [43.2965, 5.3698] },
  { name: "Lyon", country: "France", position: [45.7640, 4.8357] },
  { name: "Toulouse", country: "France", position: [43.6047, 1.4442] },
  { name: "Nice", country: "France", position: [43.7102, 7.2620] },
  { name: "Nantes", country: "France", position: [47.2184, -1.5536] },
  { name: "Strasbourg", country: "France", position: [48.5734, 7.7521] },
  { name: "Montpellier", country: "France", position: [43.6110, 3.8767] },
  { name: "Bordeaux", country: "France", position: [44.8378, -0.5792] },
  { name: "Lille", country: "France", position: [50.6293, 3.0573] },
  { name: "Rennes", country: "France", position: [48.1173, -1.6778] },
  { name: "Reims", country: "France", position: [49.2583, 4.0317] },
  { name: "Le Havre", country: "France", position: [49.4944, 0.1079] },
  { name: "Saint-Étienne", country: "France", position: [45.4397, 4.3872] },
  { name: "Toulon", country: "France", position: [43.1242, 5.9280] },
  { name: "Grenoble", country: "France", position: [45.1885, 5.7245] },
  { name: "Dijon", country: "France", position: [47.3220, 5.0415] },
  { name: "Nîmes", country: "France", position: [43.8367, 4.3601] },
  { name: "Aix-en-Provence", country: "France", position: [43.5297, 5.4474] },
  { name: "Brest", country: "France", position: [48.3904, -4.4861] },
  { name: "Limoges", country: "France", position: [45.8336, 1.2611] },
  { name: "Clermont-Ferrand", country: "France", position: [45.7772, 3.0870] },
  { name: "Villeurbanne", country: "France", position: [45.7719, 4.8902] },
  { name: "Amiens", country: "France", position: [49.8941, 2.2958] },
  { name: "Metz", country: "France", position: [49.1193, 6.1757] },
  { name: "Besançon", country: "France", position: [47.2378, 6.0241] },
  { name: "Perpignan", country: "France", position: [42.6887, 2.8948] },
  { name: "Orléans", country: "France", position: [47.9029, 1.9093] },
  { name: "Caen", country: "France", position: [49.1829, -0.3707] },
  { name: "Mulhouse", country: "France", position: [47.7508, 7.3359] },
  { name: "Rouen", country: "France", position: [49.4432, 1.0993] },
  { name: "Nancy", country: "France", position: [48.6921, 6.1844] },
  { name: "Avignon", country: "France", position: [43.9493, 4.8055] },
  { name: "La Rochelle", country: "France", position: [46.1603, -1.1511] },
  { name: "Poitiers", country: "France", position: [46.5802, 0.3404] },
  { name: "Angers", country: "France", position: [47.4712, -0.5518] },
  { name: "Dunkerque", country: "France", position: [51.0344, 2.3768] },
  { name: "Calais", country: "France", position: [50.9513, 1.8587] },
  { name: "Valence", country: "France", position: [44.9334, 4.8924] },
  { name: "Chambéry", country: "France", position: [45.5646, 5.9178] },
  { name: "Vannes", country: "France", position: [47.6582, -2.7605] },
  { name: "Saint-Nazaire", country: "France", position: [47.2735, -2.2137] },
  { name: "Bayonne", country: "France", position: [43.4929, -1.4748] },
  { name: "Le Mans", country: "France", position: [48.0061, 0.1996] },
  { name: "Troyes", country: "France", position: [48.2973, 4.0744] },
  { name: "Lorient", country: "France", position: [47.7483, -3.3709] },
  { name: "Brive-la-Gaillarde", country: "France", position: [45.1596, 1.5333] },
  { name: "Évry", country: "France", position: [48.6322, 2.4407] },
  { name: "Saint-Denis", country: "France", position: [48.9362, 2.3574] },
  { name: "Annecy", country: "France", position: [45.8992, 6.1294] },
];

// Composant MapClickHandler
function MapClickHandler({ onLocationSelected }) {
  const [clickMarker, setClickMarker] = useState(null);
  const map = useMapEvents({
    click: async (e) => {
      const { lat, lng } = e.latlng;
      
      // Supprimer l'ancien marqueur s'il existe
      if (clickMarker) {
        map.removeLayer(clickMarker);
      }
      
      // Ajouter un nouveau marqueur à l'emplacement du clic
      const newMarker = L.marker([lat, lng], { icon: blueIcon }).addTo(map);
      setClickMarker(newMarker);
      
      try {
        // Géocodage inversé avec Nominatim
        const response = await axios.get(
          `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}&zoom=10&addressdetails=1`,
          {
            headers: {
              'User-Agent': 'UserSearchApp'
            }
          }
        );
        
        const city = response.data.address.city || 
                     response.data.address.town || 
                     response.data.address.village || 
                     response.data.address.county || 
                     'Unknown';
                     
        const country = response.data.address.country || 'Unknown';
        
        // Ajouter une popup au marqueur
        newMarker.bindPopup(`${city}, ${country}`).openPopup();
        
        // Appeler la fonction de callback avec les informations de la ville
        onLocationSelected({
          type: 'city',
          name: city,
          country: country,
        });
      } catch (error) {
        console.error("Error getting location data:", error);
      }
    }
  });

  return null;
}

// Composant MapSearch modifié
function MapSearch({ onLocationSelected }) {
  const [selectedLocation, setSelectedLocation] = useState(null);
  const [showDepartments, setShowDepartments] = useState(false);
  const [departmentsData, setDepartmentsData] = useState(null);
  const [mapStyle, setMapStyle] = useState('standard');
  
  // Chargement des données GeoJSON des départements français
  useEffect(() => {
    if (showDepartments && !departmentsData) {
      fetch('https://raw.githubusercontent.com/gregoiredavid/france-geojson/master/departements-version-simplifiee.geojson')
        .then(response => response.json())
        .then(data => {
          setDepartmentsData(data);
        })
        .catch(error => {
          console.error("Erreur lors du chargement des départements:", error);
        });
    }
  }, [showDepartments, departmentsData]);
  
  // Palette de couleurs pour les départements
  const colorPalette = [
    '#FF5733', '#33FF57', '#3357FF', '#F033FF', '#FF33A8',
    '#33FFF3', '#F3FF33', '#FF8133', '#8133FF', '#33FF81',
    '#FF3333', '#33FFFF', '#FFFF33', '#FF33FF', '#33FF33',
    '#5733FF', '#FF5733', '#33FF57', '#3357FF', '#F033FF',
    '#FF33A8', '#33FFF3', '#F3FF33', '#FF8133', '#8133FF',
    '#33FF81', '#FF3333', '#33FFFF', '#FFFF33', '#FF33FF',
    '#33FF33', '#5733FF', '#FF5733', '#33FF57', '#3357FF',
    '#F033FF', '#FF33A8', '#33FFF3', '#F3FF33', '#FF8133',
    '#8133FF', '#33FF81', '#FF3333', '#33FFFF', '#FFFF33',
    '#FF33FF', '#33FF33', '#5733FF', '#FF5733', '#33FF57',
    '#3357FF', '#F033FF', '#FF33A8', '#33FFF3', '#F3FF33',
    '#FF8133', '#8133FF', '#33FF81', '#FF3333', '#33FFFF',
    '#FFFF33', '#FF33FF', '#33FF33', '#5733FF', '#FF5733',
    '#33FF57', '#3357FF', '#F033FF', '#FF33A8', '#33FFF3',
    '#F3FF33', '#FF8133', '#8133FF', '#33FF81', '#FF3333',
    '#33FFFF', '#FFFF33', '#FF33FF', '#33FF33', '#5733FF',
    '#FF5733', '#33FF57', '#3357FF', '#F033FF', '#FF33A8',
    '#33FFF3', '#F3FF33', '#FF8133', '#8133FF', '#33FF81',
    '#FF3333', '#33FFFF', '#FFFF33', '#FF33FF', '#33FF33'
  ];

  // Style pour chaque département avec couleur unique
  const getDepartmentStyle = (feature) => {
    const deptCode = feature.properties.code;
    const colorIndex = parseInt(deptCode, 10) % colorPalette.length;
    
    return {
      weight: 1.5,
      opacity: 0.8,
      color: '#333',
      fillOpacity: 0.3,
      fillColor: colorPalette[colorIndex]
    };
  };

  // Fonction appelée pour chaque feature (département)
  const onEachDepartment = (feature, layer) => {
    if (feature.properties) {
      const deptName = feature.properties.nom;
      const deptCode = feature.properties.code;
      
      layer.bindPopup(`
        <div style="text-align: center;">
          <strong>${deptName}</strong><br>
          Département ${deptCode}
        </div>
      `);
      
      layer.bindTooltip(`${deptName} (${deptCode})`, {
        permanent: false,
        direction: 'center',
        className: 'department-label'
      });
      
      layer.on({
        mouseover: (e) => {
          const layer = e.target;
          layer.setStyle({
            weight: 3,
            fillOpacity: 0.5
          });
          layer.bringToFront();
        },
        mouseout: (e) => {
          const layer = e.target;
          layer.setStyle({
            weight: 1.5,
            fillOpacity: 0.3
          });
        },
        click: (e) => {
          setSelectedLocation({
            type: 'department',
            name: deptName,
            code: deptCode,
          });
          onLocationSelected({
            type: 'department',
            name: deptName,
            code: deptCode,
          });
        }
      });
    }
  };
  
  // Gestion du clic sur un marqueur prédéfini
  const handleMarkerClick = useCallback((city, country) => {
    setSelectedLocation({
      type: 'city',
      name: city,
      country: country,
    });
    onLocationSelected({
      type: 'city',
      name: city,
      country: country,
    });
  }, [onLocationSelected]);

  // Gestion du changement de style de carte
  const handleMapStyleChange = (e) => {
    setMapStyle(e.target.value);
  };

  // URL des différentes tuiles selon le style choisi
  const getTileUrl = () => {
    switch(mapStyle) {
      case 'topo':
        return 'https://{s}.tile.opentopomap.org/{z}/{x}/{y}.png';
      case 'satellite':
        return 'https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}';
      default:
        return 'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png';
    }
  };

  // Attribution selon le style
  const getTileAttribution = () => {
    switch(mapStyle) {
      case 'topo':
        return '© <a href="https://opentopomap.org">OpenTopoMap</a>';
      case 'satellite':
        return '© <a href="https://www.arcgis.com">Esri</a>';
      default:
        return '© <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors';
    }
  };

  // Contrôle de l'opacité des départements
  const [deptOpacity, setDeptOpacity] = useState(0.3);
  const handleOpacityChange = (e) => {
    setDeptOpacity(parseFloat(e.target.value));
  };

  return (
    <div className="map-container" style={{ height: '550px', width: '100%' }}>
      <div className="mb-2 flex flex-wrap justify-between items-center">
        <div className="flex items-center mb-2">
          <label htmlFor="mapStyle" className="mr-2">Style de carte:</label>
          <select 
            id="mapStyle" 
            value={mapStyle} 
            onChange={handleMapStyleChange}
          >
            <option value="standard">Standard</option>
            <option value="topo">Topographique</option>
            <option value="satellite">Satellite</option>
          </select>
        </div>
        
        <div className="flex items-center mb-2">
          <Checkbox
            id="showDepartments"
            checked={showDepartments}
            onChange={() => setShowDepartments(!showDepartments)}
          />
          <label htmlFor="showDepartments" className="mr-4">Afficher les départements</label>
          
          {showDepartments && (
            <div className="flex items-center">
              <label htmlFor="deptOpacity" className="mr-2">Opacité:</label>
              <Slider
                id="deptOpacity"
                value={deptOpacity}
                onChange={handleOpacityChange}
                min={0}
                max={1}
                step={0.1}
              />
            </div>
          )}
        </div>
      </div>
      
      <MapContainer 
        center={[46.71109, 1.7191036]}
        zoom={5}
        scrollWheelZoom={true} 
        style={{ height: '100%', width: '100%' }}
        minZoom={5}
        maxBounds={[[40.5, -5.5], [52, 9.5]]}
      >
        <TileLayer
          attribution={getTileAttribution()}
          url={getTileUrl()}
        />
        
        {showDepartments && departmentsData && (
          <GeoJSON 
            key={`departments-${deptOpacity}`}
            data={departmentsData} 
            style={(feature) => {
              const baseStyle = getDepartmentStyle(feature);
              return {
                ...baseStyle,
                fillOpacity: deptOpacity
              };
            }}
            onEachFeature={onEachDepartment}
          />
        )}
        
        {majorCities.map((city) => (
          <Marker 
            key={city.name} 
            position={city.position}
            icon={redIcon}
            eventHandlers={{
              click: () => handleMarkerClick(city.name, city.country),
            }}
          >
            <Popup>
              {city.name}, {city.country}
            </Popup>
          </Marker>
        ))}
        
        <MapClickHandler onLocationSelected={onLocationSelected} />
      </MapContainer>
      
      {selectedLocation && (
        <div className="mt-2 px-4 py-2 bg-blue-gray-50 rounded">
          <p>
            {selectedLocation.type === 'department' 
              ? `Département sélectionné: ${selectedLocation.name} (${selectedLocation.code})`
              : `Ville sélectionnée: ${selectedLocation.name}, ${selectedLocation.country}`}
          </p>
        </div>
      )}
      
      <div className="mt-2 flex items-center text-sm">
        <div className="flex items-center mr-4">
          <div style={{ width: 12, height: 12, borderRadius: '50%', backgroundColor: '#ff0000', marginRight: 4 }}></div>
          <span>Villes principales</span>
        </div>
        <div className="flex items-center">
          <div style={{ width: 12, height: 12, borderRadius: '50%', backgroundColor: '#2196F3', marginRight: 4 }}></div>
          <span>Ville sélectionnée par clic</span>
        </div>
      </div>
    </div>
  );
}

export function Search() {
  const [searchParams, setSearchParams] = useState({
    firstName: '',
    lastName: '',
    email: '',
    currentCity: '',
    workplace: '',
    gender: '',
    relationshipStatus: '',
    phoneNumber: '',
    hometownCity: '',
    hometownCountry: '',
    currentCountry: '',
    currentDepartment: '',
  });
  const [currentPage, setCurrentPage] = useState(0);
  const [resultsPerPage, setResultsPerPage] = useState(20);
  const [results, setResults] = useState([]);
  const [nbr, setNBR] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [showAdvanced, setShowAdvanced] = useState(false);
  const [typingTimeout, setTypingTimeout] = useState(null);
  const [showMap, setShowMap] = useState(true);

  // Memoized function to check if search params are valid
  const hasValidSearchParams = useMemo(() => {
    const filteredParams = Object.entries(searchParams).filter(
      ([_, value]) => typeof value === 'string' && value.trim() !== ''
    );
    return filteredParams.length > 0;
  }, [searchParams]);

  // Modified search function with memoization
  const performSearch = useCallback(async () => {
    if (!hasValidSearchParams) {
      setResults([]);
      setNBR(0);
      return;
    }

    setIsLoading(true);
    setError(null);

    const filteredParams = Object.fromEntries(
      Object.entries(searchParams).filter(([_, value]) => 
        typeof value === 'string' && value.trim() !== ''
      )
    );

    try {
      const response = await axios.post(
        'http://localhost:8080/users/searchByA04',
        filteredParams,
        {
          params: {
            page: currentPage,
            size: resultsPerPage,
            sortBy: '_score',
            direction: 'desc',
            protectSensitiveData: true,
          },
          headers: {
            'Content-Type': 'application/json',
          },
        }
      );

      setResults(response.data.page?.content || response.data.content || []);
      setNBR(response.data.page?.totalElements || response.data.totalResults || 0);
    } catch (err) {
      setError("Une erreur s'est produite pendant la recherche. Veuillez réessayer.");
      console.error("Search error:", err);
    } finally {
      setIsLoading(false);
    }
  }, [searchParams, currentPage, resultsPerPage, hasValidSearchParams]);

  // Trigger search when currentPage changes
  useEffect(() => {
    if (hasValidSearchParams) {
      performSearch();
    }
  }, [currentPage, performSearch, hasValidSearchParams]);

  // Function to go to the next page
  const goToNextPage = useCallback(() => {
    if ((currentPage + 1) * resultsPerPage < nbr) {
      setCurrentPage(currentPage + 1);
    }
  }, [currentPage, resultsPerPage, nbr]);

  // Function to go to the previous page
  const goToPreviousPage = useCallback(() => {
    if (currentPage > 0) {
      setCurrentPage(currentPage - 1);
    }
  }, [currentPage]);

  // Handle input change with improved debouncing
  const handleInputChange = useCallback((e) => {
    const { name, value } = e.target;

    if (typingTimeout) {
      clearTimeout(typingTimeout);
    }

    setSearchParams(prev => ({
      ...prev,
      [name]: value,
    }));

    // Only search if the value is empty or has at least 2 characters
    if (value === '' || value.length >= 2) {
      const timeout = setTimeout(() => {
        setCurrentPage(0); // Reset to first page on new search
        performSearch();
      }, 800);

      setTypingTimeout(timeout);
    }
  }, [typingTimeout, performSearch]);

  // Handle select change
  const handleSelectChange = useCallback((value, name) => {
    setSearchParams(prev => ({
      ...prev,
      [name]: value,
    }));

    if (typingTimeout) {
      clearTimeout(typingTimeout);
    }

    const timeout = setTimeout(() => {
      setCurrentPage(0); // Reset to first page on new search
      performSearch();
    }, 500);

    setTypingTimeout(timeout);
  }, [typingTimeout, performSearch]);

  // Manual search on form submission
  const handleSubmit = useCallback((e) => {
    e.preventDefault();
    setCurrentPage(0); // Reset to first page on manual search
    performSearch();
  }, [performSearch]);

  const clearSearch = useCallback(() => {
    setSearchParams({
      firstName: '',
      lastName: '',
      email: '',
      currentCity: '',
      workplace: '',
      gender: '',
      relationshipStatus: '',
      phoneNumber: '',
      hometownCity: '',
      hometownCountry: '',
      currentCountry: '',
      currentDepartment: '',
    });
    setResults([]);
    setNBR(0);
    setCurrentPage(0);
  }, []);

  // Fonction pour gérer la sélection de ville ou de département depuis la carte
  const handleLocationSelected = useCallback((location) => {
    setSearchParams(prev => {
      const newParams = {
        ...prev,
        currentCity: location.type === 'city' ? location.name : '',
        currentCountry: location.type === 'city' ? location.country : prev.currentCountry,
        currentDepartment: location.type === 'department' ? location.name : '',
      };
      
      setCurrentPage(0);
      
      setTimeout(async () => {
        setIsLoading(true);
        setError(null);
  
        const filteredParams = Object.fromEntries(
          Object.entries(newParams).filter(([_, value]) => 
            typeof value === 'string' && value.trim() !== ''
          )
        );
  
        try {
          const response = await axios.post(
            'http://localhost:8080/users/searchByA04',
            filteredParams,
            {
              params: {
                page: 0,
                size: resultsPerPage,
                sortBy: '_score',
                direction: 'desc',
                protectSensitiveData: true,
              },
              headers: {
                'Content-Type': 'application/json',
              },
            }
          );
  
          setResults(response.data.page?.content || response.data.content || []);
          setNBR(response.data.page?.totalElements || response.data.totalResults || 0);
        } catch (err) {
          setError("Une erreur s'est produite pendant la recherche. Veuillez réessayer.");
          console.error("Search error:", err);
        } finally {
          setIsLoading(false);
        }
      }, 100);
      
      return newParams;
    });
  }, [resultsPerPage]);

  // Memoize the displayed results to prevent unnecessary re-renders
  const displayedResults = useMemo(() => {
    return results.map((user, index) => {
      const className = `py-3 px-5 ${
        index === results.length - 1
          ? ""
          : "border-b border-blue-gray-50"
      }`;

      return (
        <tr key={user.idS || index}>
          <td className={className}>
            <div className="flex items-center gap-4">
              <div>
                <Typography
                  variant="small"
                  color="blue-gray"
                  className="font-semibold"
                >
                  {user.firstName} {user.lastName} 
                </Typography>
                <Typography className="text-xs font-normal text-blue-gray-500">
                  {user.gender === 'male' ? 'male' : user.gender === 'female' ? 'female' : user.gender}
                </Typography>
              </div>
            </div>
          </td>
          <td className={className}>
            <Typography className="text-xs font-semibold text-blue-gray-600">
              {user.currentCity}
            </Typography>
            <Typography className="text-xs font-normal text-blue-gray-500">
              {user.currentCountry}
            </Typography>
          </td>
          <td className={className}>
            <Typography className="text-xs font-semibold text-blue-gray-600">
              {user.currentDepartment || "not specified"}
            </Typography>
          </td>
          <td className={className}>
            <Typography className="text-xs font-normal text-blue-gray-500">
              <ProtectedData dataId={user.idS} type="phone" />
            </Typography>
          </td>
          <td className={className}>
            <Typography className="text-xs font-semibold text-blue-gray-600">
              <ProtectedData dataId={user.idS} type="email" />
            </Typography>
          </td>
          <td className={className}>
            <Typography className="text-xs font-semibold text-blue-gray-600">
              {user.workplace || "not specified"}
            </Typography>
            <Typography className="text-xs font-normal text-blue-gray-500">
              {user.jobTitle || ""}
            </Typography>
          </td>
          <td className={className}>
            <Typography className="text-xs font-semibold text-blue-gray-600">
              <ProtectedData dataId={user.idS} type="relationship" />
            </Typography>
          </td>
          <td className={className}>
            <Typography className="text-xs font-semibold text-blue-gray-600">
              {user.hometownCity}
            </Typography>
            <Typography className="text-xs font-normal text-blue-gray-500">
              {user.hometownCountry}
            </Typography>
          </td>
        </tr>
      );
    });
  }, [results]);

  // Calculate total pages
  const totalPages = useMemo(() => Math.ceil(nbr / resultsPerPage) || 1, [nbr, resultsPerPage]);

  return (
    <div className="mt-12 mb-8 flex flex-col gap-12">
      <Card>
        <CardHeader className="mb-8 p-6" style={{ background: "linear-gradient(135deg, #f15f79 0%, #b24592 100%)" }}>
          <Typography variant="h5" color="white">
            Search for Users
          </Typography>
        </CardHeader>
        <CardBody className="overflow-x-scroll px-6 pt-2 pb-6">
          <div className="mb-6">
            <div className="flex justify-between items-center mb-4">
              <Typography variant="h6">
                Search by Location
              </Typography>
              <Button
                variant="text"
                color="blue-gray"
                className="flex items-center gap-2"
                onClick={() => setShowMap(!showMap)}
              >
                {showMap ? 'Hide map' : 'Show map'}
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                  strokeWidth={2}
                  stroke="currentColor"
                  className={`h-4 w-4 transition-transform ${showMap ? "rotate-180" : ""}`}
                >
                  <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 8.25l-7.5 7.5-7.5-7.5" />
                </svg>
              </Button>
            </div>
            
            {showMap && (
              <div style={{ marginBottom: '150px' }}>
                <Typography variant="small" className="text-gray-600 mb-4">
                  Click on the map to select a city, a predefined marker, or a department
                </Typography>
                <MapSearch onLocationSelected={handleLocationSelected} />
              </div>
            )}
          </div>
          
          <form onSubmit={handleSubmit}>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
              <div className="flex flex-col">
                <Typography variant="small" className="mb-2 font-medium">
                  First Name
                </Typography>
                <Input
                  type="text"
                  name="firstName"
                  value={searchParams.firstName}
                  onChange={handleInputChange}
                  placeholder="First Name"
                  className="!border-t-blue-gray-200 focus:!border-t-gray-900"
                  labelProps={{
                    className: "before:content-none after:content-none",
                  }}
                />
              </div>
              <div className="flex flex-col">
                <Typography variant="small" className="mb-2 font-medium">
                  Last Name
                </Typography>
                <Input
                  type="text"
                  name="lastName"
                  value={searchParams.lastName}
                  onChange={handleInputChange}
                  placeholder="Last Name"
                  className="!border-t-blue-gray-200 focus:!border-t-gray-900"
                  labelProps={{
                    className: "before:content-none after:content-none",
                  }}
                />
              </div>
              <div className="flex flex-col">
                <Typography variant="small" className="mb-2 font-medium">
                  City
                </Typography>
                <Input
                  type="text"
                  name="currentCity"
                  value={searchParams.currentCity}
                  onChange={handleInputChange}
                  placeholder="City"
                  className="!border-t-blue-gray-200 focus:!border-t-gray-900"
                  labelProps={{
                    className: "before:content-none after:content-none",
                  }}
                />
              </div>
              <div className="flex flex-col">
                <Typography variant="small" className="mb-2 font-medium">
                  Gender
                </Typography>
                <Select
                  name="gender"
                  value={searchParams.gender}
                  onChange={(value) => handleSelectChange(value, "gender")}
                  placeholder="All"
                >
                  <Option value="">All</Option>
                  <Option value="male">Male</Option>
                  <Option value="female">Female</Option>
                </Select>
              </div>
            </div>

            <div className="mb-4">
              <Button
                variant="text"
                color="blue-gray"
                className="flex items-center gap-2"
                onClick={() => setShowAdvanced(!showAdvanced)}
              >
                {showAdvanced ? 'Hide advanced search' : 'Show advanced search'}
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                  strokeWidth={2}
                  stroke="currentColor"
                  className={`h-4 w-4 transition-transform ${showAdvanced ? "rotate-180" : ""}`}
                >
                  <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 8.25l-7.5 7.5-7.5-7.5" />
                </svg>
              </Button>
            </div>

            {showAdvanced && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                <div className="flex flex-col">
                  <Typography variant="small" className="mb-2 font-medium">
                    Department
                  </Typography>
                  <Input
                    type="text"
                    name="currentDepartment"
                    value={searchParams.currentDepartment}
                    onChange={handleInputChange}
                    placeholder="Department"
                    className="!border-t-blue-gray-200 focus:!border-t-gray-900"
                    labelProps={{
                      className: "before:content-none after:content-none",
                    }}
                  />
                </div>
                <div className="flex flex-col">
                  <Typography variant="small" className="mb-2 font-medium">
                    Relationship Status
                  </Typography>
                  <Select
                    name="relationshipStatus"
                    value={searchParams.relationshipStatus}
                    onChange={(value) => handleSelectChange(value, "relationshipStatus")}
                    placeholder="All"
                  >
                    <Option value="">All</Option>
                    <Option value="Married">Married</Option>
                    <Option value="In a relationship">In a relationship</Option>
                    <Option value="Single">Single</Option>
                    <Option value="Engaged">Engaged</Option>
                  </Select>
                </div>
                <div className="flex flex-col">
                  <Typography variant="small" className="mb-2 font-medium">
                    Workplace
                  </Typography>
                  <Input
                    type="text"
                    name="workplace"
                    value={searchParams.workplace}
                    onChange={handleInputChange}
                    placeholder="Workplace"
                    className="!border-t-blue-gray-200 focus:!border-t-gray-900"
                    labelProps={{
                      className: "before:content-none after:content-none",
                    }}
                  />
                </div>
                <div className="flex flex-col">
                  <Typography variant="small" className="mb-2 font-medium">
                    Email
                  </Typography>
                  <Input
                    type="email"
                    name="email"
                    value={searchParams.email}
                    onChange={handleInputChange}
                    placeholder="Email"
                    className="!border-t-blue-gray-200 focus:!border-t-gray-900"
                    labelProps={{
                      className: "before:content-none after:content-none",
                    }}
                  />
                </div>
                <div className="flex flex-col">
                  <Typography variant="small" className="mb-2 font-medium">
                    Phone Number
                  </Typography>
                  <Input
                    type="text"
                    name="phoneNumber"
                    value={searchParams.phoneNumber}
                    onChange={handleInputChange}
                    placeholder="Phone Number"
                    className="!border-t-blue-gray-200 focus:!border-t-gray-900"
                    labelProps={{
                      className: "before:content-none after:content-none",
                    }}
                  />
                </div>
                <div className="flex flex-col">
                  <Typography variant="small" className="mb-2 font-medium">
                    HomeTown Country
                  </Typography>
                  <Input
                    type="text"
                    name="hometownCountry"
                    value={searchParams.hometownCountry}
                    onChange={handleInputChange}
                    placeholder="HomeTown Country"
                    className="!border-t-blue-gray-200 focus:!border-t-gray-900"
                    labelProps={{
                      className: "before:content-none after:content-none",
                    }}
                  />
                </div>
                <div className="flex flex-col">
                  <Typography variant="small" className="mb-2 font-medium">
                    HomeTown City
                  </Typography>
                  <Input
                    type="text"
                    name="hometownCity"
                    value={searchParams.hometownCity}
                    onChange={handleInputChange}
                    placeholder="HomeTown City"
                    className="!border-t-blue-gray-200 focus:!border-t-gray-900"
                    labelProps={{
                      className: "before:content-none after:content-none",
                    }}
                  />
                </div>
                <div className="flex flex-col mt-4">
                  <Typography variant="small" className="mb-2 font-medium">
                    Results per page
                  </Typography>
                  <Select
                    name="resultsPerPage"
                    value={resultsPerPage.toString()}
                    onChange={(value) => {
                      setResultsPerPage(Number(value));
                      setCurrentPage(0);
                    }}
                  >
                    <Option value="10">10</Option>
                    <Option value="20">20</Option>
                    <Option value="50">50</Option>
                    <Option value="100">100</Option>
                  </Select>
                </div>
              </div>
            )}

            <div className="flex flex-wrap gap-4 mt-6">
              <Button type="submit" color="gray" disabled={isLoading}>
                {isLoading ? "Searching..." : "Search"}
              </Button>
              <Button type="button" variant="outlined" color="red" onClick={clearSearch}>
                Clear
              </Button>
            </div>

            {error && <div className="text-red-500 mt-4">{error}</div>}
          </form>
        </CardBody>
      </Card>

      <Card>
        <CardHeader
          className="mb-8 p-6"
          style={{ background: "linear-gradient(135deg, #f15f79 0%, #b24592 100%)" }}
        >
          <div className="flex justify-between items-center">
            <Typography variant="h5" color="white">
              Search Results
            </Typography>
            <div className="flex items-center gap-2 text-sm text-white">
              <span className="px-2 py-0.5 rounded-full bg-white text-red-500 font-bold shadow-sm">
                {nbr} results
              </span>
              <span className="px-2 py-0.5 rounded-full bg-white text-red-500 font-bold shadow-sm">
                {results.length} shown
              </span>
            </div>
          </div>
        </CardHeader>
        <CardBody className="overflow-x-scroll px-0 pt-0 pb-2">
          {results.length > 0 ? (
            <table className="w-full min-w-[640px] table-auto">
              <thead>
                <tr>
                  {["Users", "Location","Department","Phone Number", "Email", "Workplace", "Relationship Status", "Home Location"].map((el) => (
                    <th
                      key={el}
                      className="border-b border-blue-gray-50 py-3 px-5 text-left"
                    >
                      <Typography
                        variant="small"
                        className="text-[11px] font-bold uppercase text-blue-gray-400"
                      >
                        {el}
                      </Typography>
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {displayedResults}
              </tbody>
            </table>
          ) : (
            !isLoading && (
              <div className="text-center py-4">
                <Typography color="blue-gray">No results found.</Typography>
              </div>
            )
          )}
          {isLoading && (
            <div className="text-center py-4">
              <Typography color="blue-gray">Loading the results...</Typography>
            </div>
          )}
        </CardBody>
        <CardFooter className="flex items-center justify-between border-t border-blue-gray-50 p-4">
          <div className="flex justify-between items-center w-full">
            <Button
              onClick={goToPreviousPage}
              disabled={currentPage === 0 || isLoading}
              color="gray"
              size="sm"
            >
              Previous
            </Button>
            <div className="text-sm text-gray-600">
              Page {currentPage + 1} of {totalPages}
            </div>
            <Button
              onClick={goToNextPage}
              disabled={(currentPage + 1) * resultsPerPage >= nbr || !nbr || isLoading}
              color="gray"
              size="sm"
            >
              Next
            </Button>
          </div>
        </CardFooter>
      </Card>
    </div>
  );
}

export default Search;