import {
  Card,
  CardHeader,
  CardBody,
  Typography,
  Input,
  Button,
} from "@material-tailwind/react";
import { useState } from "react";
import axios from "axios";

export function GMail() {
  // État pour les champs du formulaire
  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    domain: "",
  });
  
  // État pour les emails valides
  const [validEmails, setValidEmails] = useState([]);
  
  // État pour les erreurs
  const [error, setError] = useState(null);
  
  // État pour le chargement
  const [loading, setLoading] = useState(false);

  // Gestion des changements dans les champs du formulaire
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  // Gestion de la soumission du formulaire
  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    // Vérification des champs non vides
    if (!formData.firstName || !formData.lastName || !formData.domain) {
      setError("Tous les champs sont obligatoires.");
      setLoading(false);
      return;
    }

    try {
      const response = await axios.post("http://51.44.136.165:8081/api/ghostmail", formData);
      console.log("dataSended:", formData);
      // Récupérer uniquement les emails valides
      const emails = response.data.validEmails || [];
      console.log("Emails valides:", emails);
      console.log("ok");
      setValidEmails(emails);
    } catch (err) {
      setError("Error while searching for emails. Please try again.");
      console.error("Error:", err);
    } finally {
      setLoading(false);
    }
  };

  // Style dégradé
  const gradientStyle = { background: "linear-gradient(135deg, #2c3e50 0%, #4ca1af 100%)" };


  return (
    <div className="mt-12 mb-8 flex flex-col gap-8">
      <div className="flex flex-col items-center justify-center mb-4">
        <div className="flex items-center mb-4">
          {/* Logo de la marque - maintenant avec une icône de fantôme */}
          <div className="p-3 rounded-lg shadow-lg mr-4" style={gradientStyle}>
            <svg xmlns="http://www.w3.org/2000/svg" className="h-10 w-10 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9.75 3.104v5.714a2.25 2.25 0 01-.659 1.591L5 14.5M9.75 3.104c-.251.023-.501.05-.75.082m.75-.082a24.301 24.301 0 014.5 0m0 0v5.714c0 .597.237 1.17.659 1.591L19.8 15.3M14.25 3.104c.251.023.501.05.75.082M19.8 15.3l-1.57.393A9.065 9.065 0 0112 15a9.065 9.065 0 00-6.23-.693L5 14.5m14.8.8l1.402 1.402c1.232 1.232.65 3.318-1.067 3.611A48.309 48.309 0 0112 21c-2.773 0-5.491-.235-8.135-.687-1.718-.293-2.3-2.379-1.067-3.61L5 14.5" />
            </svg>
          </div>
          
          {/* Titre de l'application */}
          <div>
            <Typography variant="h2" className="font-bold mb-0" color="blue-gray">
              Ghost<span className="text-cyan-600"> Mail</span> Hunter
            </Typography>
          </div>
        </div>
        
        <Typography variant="lead" color="blue-gray" className="text-center max-lg opacity-80">
          Uncover hidden professional emails that no one else can find
        </Typography>
      </div>
      {/* Formulaire pour saisir les données */}
      <Card className="border border-blue-gray-100 shadow-md">
        <CardHeader 
          variant="gradient" 
          className="mb-4 p-6"
          style={gradientStyle}
        >
          <div className="flex items-center">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-white mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
            <Typography variant="h5" color="white" className="font-bold">
              Hunt Professional Emails
            </Typography>
          </div>
        </CardHeader>
        <CardBody className="px-6 py-4">
          <form onSubmit={handleSubmit} className="flex flex-col gap-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Input
                label="FirstName"
                name="firstName"
                value={formData.firstName}
                onChange={handleInputChange}
                placeholder="Prénom"
                color="cyan"
                required
                icon={
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-cyan-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                  </svg>
                }
              />
              <Input
                label="LastName"
                name="lastName"
                value={formData.lastName}
                onChange={handleInputChange}
                placeholder="Nom"
                color="cyan"
                required
                icon={
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-cyan-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                  </svg>
                }
              />
            </div>
            <Input
              label="Domain"
              name="domain"
              value={formData.domain}
              onChange={handleInputChange}
              placeholder="exemple.com"
              color="cyan"
              required
              icon={
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-cyan-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 01-9 9m9-9a9 9 0 00-9-9m9 9H3m9 9a9 9 0 01-9-9m9 9c1.657 0 3-4.03 3-9s-1.343-9-3-9m0 18c-1.657 0-3-4.03-3-9s1.343-9 3-9m-9 9a9 9 0 019-9" />
                </svg>
              }
            />
            <Button 
              type="submit" 
              disabled={loading} 
              className="mt-2"
              style={gradientStyle}
              fullWidth
              size="lg"
            >
              {loading ? (
                <div className="flex items-center justify-center gap-2">
                  <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Hunting Emails...
                </div>
              ) : (
                <div className="flex items-center justify-center gap-2">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 11.5V14m0-2.5v-6a1.5 1.5 0 113 0m-3 6a1.5 1.5 0 00-3 0v2a7.5 7.5 0 0015 0v-5a1.5 1.5 0 00-3 0m-6-3V11m0-5.5v-1a1.5 1.5 0 013 0v1m0 0V11m0-5.5a1.5 1.5 0 013 0v3m0 0V11" />
                  </svg>
                  Hunt Ghost Emails
                </div>
              )}
            </Button>
          </form>
          {error && (
            <div className="mt-4 p-3 bg-red-50 text-red-700 rounded-lg">
              <Typography color="red" className="text-sm">
                {error}
              </Typography>
            </div>
          )}
        </CardBody>
      </Card>

      {/* Liste simple des emails valides */}
      <Card className="border border-blue-gray-100 shadow-md">
        <CardHeader 
          variant="gradient" 
          className="mb-0 p-6"
          style={gradientStyle}
        >
          <div className="flex items-center">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-white mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
            </svg>
            <Typography variant="h5" color="white" className="font-bold">
              Discovered Emails
            </Typography>
          </div>
        </CardHeader>
        <CardBody className="px-6 py-4">
          {validEmails.length > 0 ? (
            <div className="flex flex-col gap-3">
              {validEmails.map((email, index) => (
                <div key={index} className="p-4 bg-gray-50 rounded-lg border border-gray-100 hover:bg-cyan-50 hover:border-cyan-100 transition-all flex items-center group">
                  <div className="p-2 rounded-full bg-cyan-100 mr-3 group-hover:bg-cyan-200 transition-all">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-cyan-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                    </svg>
                  </div>
                  <Typography className="text-base font-medium flex-grow">
                    {email}
                  </Typography>
                  <Button 
                    variant="text" 
                    size="sm" 
                    color="cyan" 
                    className="opacity-0 group-hover:opacity-100 transition-opacity"
                    onClick={() => navigator.clipboard.writeText(email)}
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 5H6a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2v-1M8 5a2 2 0 002 2h2a2 2 0 002-2M8 5a2 2 0 012-2h2a2 2 0 012 2m0 0h2a2 2 0 012 2v3m2 4H10m0 0l3-3m-3 3l3 3" />
                    </svg>
                  </Button>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-16">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-16 w-16 text-gray-300 mx-auto mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9.75 3.104v5.714a2.25 2.25 0 01-.659 1.591L5 14.5M9.75 3.104c-.251.023-.501.05-.75.082m.75-.082a24.301 24.301 0 014.5 0m0 0v5.714c0 .597.237 1.17.659 1.591L19.8 15.3M14.25 3.104c.251.023.501.05.75.082M19.8 15.3l-1.57.393A9.065 9.065 0 0112 15a9.065 9.065 0 00-6.23-.693L5 14.5m14.8.8l1.402 1.402c1.232 1.232.65 3.318-1.067 3.611A48.309 48.309 0 0112 21c-2.773 0-5.491-.235-8.135-.687-1.718-.293-2.3-2.379-1.067-3.61L5 14.5" />
              </svg>
              <Typography color="blue-gray" className="font-medium mb-2">
                No Ghost Emails Discovered Yet
              </Typography>
              <Typography color="blue-gray" className="text-sm text-blue-gray-500">
                Enter a person's name and company domain to start hunting hidden emails
              </Typography>
            </div>
          )}
        </CardBody>
      </Card>
    </div>
  );
}

export default GMail;