import {
  Card,
  CardHeader,
  CardBody,
  Typography,
  Chip,
  Button,
  Input,
  Select,
  Option,
  CardFooter,
  Tooltip,
} from "@material-tailwind/react";
import React, { useState, useEffect, useCallback, useMemo } from 'react';
import axios from 'axios';
import './UserSearchApp.css';

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
  });
  const [currentPage, setCurrentPage] = useState(0);
  const [resultsPerPage, setResultsPerPage] = useState(20); // Reduced from 1000 to 20
  const [results, setResults] = useState([]);
  const [nbr, setNBR] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [showAdvanced, setShowAdvanced] = useState(false);
  const [typingTimeout, setTypingTimeout] = useState(null);

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
      }, 800); // Increased debounce timeout

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
    });
    setResults([]);
    setNBR(0);
    setCurrentPage(0);
  }, []);

  // Memoize the displayed results to prevent unnecessary re-renders
  const displayedResults = useMemo(() => {
    return results.map((user, index) => {
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
              <ProtectedData dataId={user.userId} type="phone" />
            </Typography>
          </td>
          <td className={className}>
            <Typography className="text-xs font-semibold text-blue-gray-600">
              <ProtectedData dataId={user.userId} type="email" />
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
              <ProtectedData dataId={user.userId} type="relationship" />
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
              <>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
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
                      }} />
                  </div>
                </div>
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
                      }} />
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
                      }} />
                  </div>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
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
                      }} />
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
                      }} />
                  </div>
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
              </>
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
                  {["Users", "Location", "Phone Number", "Email", "Workplace", "Relationship Status", "Home Location"].map((el) => (
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