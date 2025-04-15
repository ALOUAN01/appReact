import {
  Card,
  CardHeader,
  CardBody,
  Typography,
  Avatar,
  Chip,
  Button,
  Input,
  Select,
  Option,
} from "@material-tailwind/react";
import React, { useState, useEffect } from 'react';
import axios from 'axios';
import './UserSearchApp.css';

export function Search() {
  const [searchParams, setSearchParams] = useState({
    firstName: '',
    lastName: '',
    email: '',
    currentCity: '',
    workplace: '',
    gender: '',
  });

  const [results, setResults] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [showAdvanced, setShowAdvanced] = useState(false);
  
  // Add debounce delay to avoid too many API calls
  const [typingTimeout, setTypingTimeout] = useState(null);

  // Search function that will be triggered on input change with debounce
  const performSearch = async () => {
    setIsLoading(true);
    setError(null);

    const filteredParams = Object.fromEntries(
      Object.entries(searchParams).filter(([_, value]) => value.trim() !== '')
    );

    // Only perform search if at least one field has a value
    if (Object.keys(filteredParams).length === 0) {
      setResults([]);
      setIsLoading(false);
      return;
    }

    try {
      const response = await axios.post('http://35.181.65.106:8080/users/searchByA', filteredParams);
      setResults(response.data);
    } catch (err) {
      setError("Une erreur est survenue lors de la recherche.");
      console.error("Search error:", err);
    } finally {
      setIsLoading(false);
    }
  };

  // Handle input change with debouncing
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    
    // Clear any existing timeout
    if (typingTimeout) {
      clearTimeout(typingTimeout);
    }
    
    setSearchParams({
      ...searchParams,
      [name]: value
    });
    
    // Set a new timeout to perform search
    const timeout = setTimeout(() => {
      performSearch();
    }, 500); // 500ms delay after typing stops
    
    setTypingTimeout(timeout);
  };

  // Handle select change
  const handleSelectChange = (value, name) => {
    setSearchParams({
      ...searchParams,
      [name]: value
    });
    
    // Clear any existing timeout
    if (typingTimeout) {
      clearTimeout(typingTimeout);
    }
    
    // Set a new timeout to perform search
    const timeout = setTimeout(() => {
      performSearch();
    }, 300); // 300ms delay for dropdown selections
    
    setTypingTimeout(timeout);
  };

  // Manual search can still be triggered by form submission
  const handleSubmit = (e) => {
    e.preventDefault();
    performSearch();
  };

  const clearSearch = () => {
    setSearchParams({
      firstName: '',
      lastName: '',
      email: '',
      currentCity: '',
      workplace: '',
      gender: '',
    });
    setResults([]);
  };

  // Function to get status chip based on user availability
  const getUserStatusChip = (user) => {
    // This is a placeholder - you can adjust the logic based on your actual data
    const isOnline = user.isActive || Math.random() > 0.5; // Random for demo purposes
    
    return (
      <Chip
        variant="gradient"
        color={isOnline ? "green" : "blue-gray"}
        value={isOnline ? "online" : "offline"}
        className="py-0.5 px-2 text-[11px] font-medium w-fit"
      />
    );
  };

  return (
    <div className="mt-12 mb-8 flex flex-col gap-12">
      <Card>
        <CardHeader variant="gradient" color="gray" className="mb-8 p-6">
          <Typography variant="h6" color="white">
            Search for Users
          </Typography>
        </CardHeader>
        <CardBody className="overflow-x-scroll px-6 pt-2 pb-6">
          <form onSubmit={handleSubmit}>
            {/* Basic search fields - 2 inputs per row */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
              {/* Row 1: First Name and Last Name */}
              <div className="flex flex-col">
                <Typography variant="small" className="mb-2 font-medium">
                  Prénom
                </Typography>
                <Input
                  type="text"
                  name="firstName"
                  value={searchParams.firstName}
                  onChange={handleInputChange}
                  placeholder="Prénom"
                  className="!border-t-blue-gray-200 focus:!border-t-gray-900"
                  labelProps={{
                    className: "before:content-none after:content-none",
                  }}
                />
              </div>
              
              <div className="flex flex-col">
                <Typography variant="small" className="mb-2 font-medium">
                  Nom
                </Typography>
                <Input
                  type="text"
                  name="lastName"
                  value={searchParams.lastName}
                  onChange={handleInputChange}
                  placeholder="Nom"
                  className="!border-t-blue-gray-200 focus:!border-t-gray-900"
                  labelProps={{
                    className: "before:content-none after:content-none",
                  }}
                />
              </div>

              {/* Row 2: City and Gender */}
              <div className="flex flex-col">
                <Typography variant="small" className="mb-2 font-medium">
                  Ville
                </Typography>
                <Input
                  type="text"
                  name="currentCity"
                  value={searchParams.currentCity}
                  onChange={handleInputChange}
                  placeholder="Ville"
                  className="!border-t-blue-gray-200 focus:!border-t-gray-900"
                  labelProps={{
                    className: "before:content-none after:content-none",
                  }}
                />
              </div>
              
              <div className="flex flex-col">
                <Typography variant="small" className="mb-2 font-medium">
                  Genre
                </Typography>
                <Select
                  name="gender"
                  value={searchParams.gender}
                  onChange={(value) => handleSelectChange(value, "gender")}
                  placeholder="Tous"
                >
                  <Option value="">Tous</Option>
                  <Option value="male">Homme</Option>
                  <Option value="female">Femme</Option>
                </Select>
              </div>
            </div>

            {/* Advanced search toggle button */}
            <div className="mb-4">
              <Button
                variant="text"
                color="blue-gray"
                className="flex items-center gap-2"
                onClick={() => setShowAdvanced(!showAdvanced)}
              >
                {showAdvanced ? 'Masquer la recherche avancée' : 'Afficher la recherche avancée'}
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

            {/* Advanced search fields */}
            {showAdvanced && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
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
                    Lieu de travail
                  </Typography>
                  <Input
                    type="text"
                    name="workplace"
                    value={searchParams.workplace}
                    onChange={handleInputChange}
                    placeholder="Lieu de travail"
                    className="!border-t-blue-gray-200 focus:!border-t-gray-900"
                    labelProps={{
                      className: "before:content-none after:content-none",
                    }}
                  />
                </div>
              </div>
            )}

            {/* Action buttons */}
            <div className="flex flex-wrap gap-4 mt-6">
              <Button type="submit" color="gray" disabled={isLoading}>
                {isLoading ? "Recherche en cours..." : "Rechercher"}
              </Button>
              <Button type="button" variant="outlined" color="red" onClick={clearSearch}>
                Effacer
              </Button>
            </div>

            {error && <div className="text-red-500 mt-4">{error}</div>}
          </form>
        </CardBody>
      </Card>

      {/* Results Table Card */}
      <Card>
        <CardHeader variant="gradient" color="gray" className="mb-8 p-6">
          <Typography variant="h6" color="white">
            Résultats de recherche ({results.length})
          </Typography>
        </CardHeader>
        <CardBody className="overflow-x-scroll px-0 pt-0 pb-2">
          {results.length > 0 ? (
            <table className="w-full min-w-[640px] table-auto">
              <thead>
                <tr>
                  {["Users", "Location", "Phone Number","Email", "Work Place","Relationship Status", "Home Location"].map((el) => (
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
                {results.map((user, index) => {
                  const className = `py-3 px-5 ${
                    index === results.length - 1
                      ? ""
                      : "border-b border-blue-gray-50"
                  }`;

                  return (
                    <tr key={user.userId || index}>
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
                        <Typography className="text-xs font-normal text-blue-gray-500">
                          {user.phoneNumber}
                        </Typography>
                      </td>
                      <td className={className}>
                        <Typography className="text-xs font-semibold text-blue-gray-600">
                          {user.email}
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
                          {user.relationshipStatus || "not specified"}
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
                })}
              </tbody>
            </table>
          ) : (
            !isLoading && (
              <div className="text-center py-4">
                <Typography color="blue-gray">Aucun résultat trouvé.</Typography>
              </div>
            )
          )}
          {isLoading && (
            <div className="text-center py-4">
              <Typography color="blue-gray">Chargement des résultats...</Typography>
            </div>
          )}
        </CardBody>
      </Card>
    </div>
  );
}

export default Search;