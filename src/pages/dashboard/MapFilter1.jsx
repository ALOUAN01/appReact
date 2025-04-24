import React, { useState, useEffect } from 'react';
import { ComposableMap, Geographies, Geography, Marker, ZoomableGroup } from 'react-simple-maps';
import { Typography } from "@material-tailwind/react";

// Liste des principales villes de France avec coordonnées (conservée)
const cityCoordinates = [
  { name: "Paris", coordinates: [2.3522, 48.8566] },
  { name: "Marseille", coordinates: [5.3698, 43.2965] },
  // ... les autres villes déjà dans votre code
];

// MapFilter Component amélioré style Google Maps
const MapFilter1 = ({ setSearchParams, searchParams, onCitySelect }) => {
  const topoJsonUrl = "/france-departements.geojson"; // Path to France GeoJSON
  const [mapError, setMapError] = useState(null);
  const [position, setPosition] = useState({ coordinates: [2.5, 46.5], zoom: 5 });
  const [hoverInfo, setHoverInfo] = useState(null);

  console.log("MapFilter rendered. Fetching GeoJSON from:", topoJsonUrl);

  const handleCityClick = (cityName) => {
    console.log("Ville sélectionnée :", cityName);
    setSearchParams((prev) => ({
      ...prev,
      currentCity: cityName,
    }));
    onCitySelect();

    // Find city coordinates and zoom to it
    const city = cityCoordinates.find(c => c.name === cityName);
    if (city) {
      setPosition({
        coordinates: city.coordinates,
        zoom: 8
      });
    }
  };

  const handleZoomIn = () => {
    if (position.zoom >= 10) return;
    setPosition(pos => ({ ...pos, zoom: pos.zoom * 1.2 }));
  };

  const handleZoomOut = () => {
    if (position.zoom <= 1) return;
    setPosition(pos => ({ ...pos, zoom: pos.zoom / 1.2 }));
  };

  const handleMoveEnd = (position) => {
    setPosition(position);
  };

  return (
    <div className="flex flex-col mt-4">
      <Typography variant="small" className="mb-2 font-medium">
        Select a City
      </Typography>
      {mapError ? (
        <Typography color="red" className="mt-2">
          {mapError}
        </Typography>
      ) : (
        <div className="relative rounded-lg overflow-hidden" 
             style={{ 
               border: "1px solid #ccc", 
               boxShadow: "0 2px 6px rgba(0,0,0,0.3)", 
               height: "500px" 
             }}>
          {/* Google Maps like UI controls */}
          <div className="absolute top-4 right-4 bg-white rounded shadow-md z-10">
            <button 
              onClick={handleZoomIn}
              className="block w-8 h-8 flex items-center justify-center border-b border-gray-200 hover:bg-gray-100"
              title="Zoom in"
            >
              <svg viewBox="0 0 24 24" width="18" height="18">
                <path fill="#666" d="M19 13h-6v6h-2v-6H5v-2h6V5h2v6h6v2z"/>
              </svg>
            </button>
            <button 
              onClick={handleZoomOut}
              className="block w-8 h-8 flex items-center justify-center hover:bg-gray-100"
              title="Zoom out"
            >
              <svg viewBox="0 0 24 24" width="18" height="18">
                <path fill="#666" d="M19 13H5v-2h14v2z"/>
              </svg>
            </button>
          </div>

          <ComposableMap
            projection="geoMercator"
            width={800}
            height={500}
            style={{ width: "100%", height: "100%" }}
          >
            <ZoomableGroup
              zoom={position.zoom}
              center={position.coordinates}
              onMoveEnd={handleMoveEnd}
              translateExtent={[
                [-100, -100],
                [1000, 600]
              ]}
            >
              <Geographies geography={topoJsonUrl}>
                {({ geographies }) => {
                  if (!geographies || geographies.length === 0) {
                    console.error("No geographies loaded. Check GeoJSON file at:", topoJsonUrl);
                    setMapError("Failed to load geographical data. Please check the console for details.");
                    return null;
                  }
                  return geographies.map((geo) => (
                    <Geography
                      key={geo.rsmKey}
                      geography={geo}
                      fill="#EAEAEC"
                      stroke="#D6D6DA"
                      strokeWidth={0.5}
                      style={{
                        default: { outline: "none" },
                        hover: { fill: "#F5F5F5", outline: "none" },
                        pressed: { fill: "#E0E0E0", outline: "none" },
                      }}
                      onMouseEnter={() => {
                        const { NOM_DEP } = geo.properties;
                        setHoverInfo({
                          name: NOM_DEP || "Unknown",
                          position: [0, 0] // Will be updated by the marker's position
                        });
                      }}
                      onMouseLeave={() => {
                        setHoverInfo(null);
                      }}
                    />
                  ));
                }}
              </Geographies>
              
              {cityCoordinates.map(({ name, coordinates }) => {
                // Check if this is the selected city
                const isSelected = searchParams.currentCity === name;
                return (
                  <Marker
                    key={name}
                    coordinates={coordinates}
                    onClick={() => handleCityClick(name)}
                  >
                    {/* Google Maps style marker */}
                    <g transform="translate(-12, -24)" style={{ cursor: "pointer" }}>
                      {isSelected ? (
                        // Selected marker (red pin)
                        <>
                          <path
                            d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7z"
                            fill="#DB4437"
                            stroke="#FFFFFF"
                            strokeWidth="1.5"
                          />
                          <circle cx="12" cy="9" r="3" fill="#FFFFFF" />
                        </>
                      ) : (
                        // Regular marker (teardrop shape)
                        <>
                          <path
                            d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7z"
                            fill="#4285F4"
                            stroke="#FFFFFF"
                            strokeWidth="1"
                          />
                          <circle cx="12" cy="9" r="2.5" fill="#FFFFFF" />
                        </>
                      )}
                    </g>
                    
                    {/* City name label */}
                    <text
                      textAnchor="middle"
                      y={-30}
                      style={{
                        fontFamily: "Roboto, Arial, sans-serif",
                        fontSize: isSelected ? "12px" : "10px",
                        fontWeight: isSelected ? "bold" : "normal",
                        fill: isSelected ? "#DB4437" : "#333333",
                        stroke: "#FFFFFF",
                        strokeWidth: "0.5px",
                        paintOrder: "stroke",
                        cursor: "pointer",
                      }}
                    >
                      {name}
                    </text>
                  </Marker>
                );
              })}

              {/* Display hover info tooltip */}
              {hoverInfo && (
                <g>
                  <rect
                    x={hoverInfo.position[0] - 60}
                    y={hoverInfo.position[1] - 40}
                    width="120"
                    height="30"
                    fill="white"
                    stroke="#ccc"
                    strokeWidth="1"
                    rx="4"
                    ry="4"
                    pointerEvents="none"
                  />
                  <text
                    x={hoverInfo.position[0]}
                    y={hoverInfo.position[1] - 20}
                    textAnchor="middle"
                    style={{
                      fontFamily: "Roboto, Arial, sans-serif",
                      fontSize: "12px",
                      fill: "#333",
                      pointerEvents: "none"
                    }}
                  >
                    {hoverInfo.name}
                  </text>
                </g>
              )}
            </ZoomableGroup>
          </ComposableMap>

          {/* Google Maps attribution */}
          <div className="absolute bottom-1 left-1 text-xs text-gray-600 bg-white bg-opacity-70 px-1 rounded">
            Map data © Your Attribution
          </div>
        </div>
      )}
      
      {/* Selected city info box */}
      {searchParams.currentCity && (
        <div className="mt-3 p-3 bg-blue-50 rounded-md border border-blue-100">
          <Typography variant="small" className="font-medium text-blue-800">
            Selected city: <span className="font-bold">{searchParams.currentCity}</span>
          </Typography>
          <Typography variant="small" className="text-blue-600">
            Click on a different city marker to change your selection
          </Typography>
        </div>
      )}
    </div>
  );
};

export default MapFilter1;