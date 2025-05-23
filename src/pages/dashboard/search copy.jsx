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
  const [nbr, setNBR] = useState(null);
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
  
    // Log the filtered parameters to ensure they match Postman
    console.log("Request Body (filteredParams):", filteredParams);
  
    // Only perform search if at least one field has a value
    if (Object.keys(filteredParams).length === 0) {
      setResults([]);
      setIsLoading(false);
      return;
    }
  
    try {
      // Make a POST request with explicit Content-Type
      const response = await axios.post(
        'http://localhost:8080/users/searchByA04',
        filteredParams,
        {
          params: {
            page: 0,
            size: 1000,
            sortBy: '_score',
            direction: 'desc',
          },
          headers: {
            'Content-Type': 'application/json', // Explicitly set Content-Type
          },
        }
      );
  
      // Log the response for debugging
      console.log("API Response:", response.data);
  
      // Extract results (adjust based on actual response structure)
      setResults(response.data.page?.content || response.data.content || []);
      setNBR(response.data.page?.totalElements || response.data.totalResults || 0);
    } catch (err) {
      setError("An error occurred during the search. Please try again.");
      console.error("Search error:", err);
      if (err.response) {
        console.error("Error Response Details:", err.response.data);
      }
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
        <CardHeader variant="gradient" color="red" className="mb-8 p-6">
          <Typography variant="h5" color="white">
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

              {/* Row 2: City and Gender */}
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
                  placeholder="Tous"
                >
                  <Option value="">All</Option>
                  <Option value="male">Male</Option>
                  <Option value="female">Famale</Option>
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
                  WorkPlace
                  </Typography>
                  <Input
                    type="text"
                    name="WorkPlace"
                    value={searchParams.workplace}
                    onChange={handleInputChange}
                    placeholder="workplace"
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
                {isLoading ? "Searching......" : "Search"}
              </Button>
              <Button type="button" variant="outlined" color="red" onClick={clearSearch}>
                Clear
              </Button>
            </div>

            {error && <div className="text-red-500 mt-4">{error}</div>}
          </form>
        </CardBody>
      </Card>

      {/* Results Table Card */}
      <Card>
        <CardHeader variant="gradient" color="red" className="mb-8 p-6">
          <Typography variant="h5" color="white">
          Search Results
        
          <div className="text-sm text-white text-right">
      <span className="px-2 py-0.5 rounded-full bg-white text-red-500 font-bold shadow-sm ml-2">
        {nbr} results
      </span>
      <span className="px-2 py-0.5 rounded-full bg-white text-red-500 font-bold shadow-sm ml-2">
        {results.length} shown
      </span>
    </div>
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
                <Typography color="blue-gray ">No results found.</Typography>
              </div>
            )
          )}
          {isLoading && (
            <div className="text-center py-4">
              <Typography color="blue-gray">Loading the results...</Typography>
            </div>
          )}
        </CardBody>
      </Card>
    </div>
  );
}

export default Search;