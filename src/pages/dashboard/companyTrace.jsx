  import {
    Card,
    CardHeader,
    CardBody,
    Typography,
    Chip,
    Input,
    Button,
  } from "@material-tailwind/react";
  import { useState } from "react";
  import axios from "axios";
  
  export function CompanyTrace() {
    // État pour le domaine saisi
    const [domain, setDomain] = useState("");
    // État pour la réponse de l'API
    const [responseData, setResponseData] = useState({
      results: [],
      validEmails: [],
    });
    // État pour les erreurs
    const [error, setError] = useState(null);
    // État pour le chargement
    const [loading, setLoading] = useState(false);
  
    // Gestion de la soumission du formulaire
    const handleSubmit = async (e) => {
      e.preventDefault();
      setLoading(true);
      setError(null);
  
      // Vérification que le domaine n'est pas vide
      if (!domain.trim()) {
        setError("Le domaine est obligatoire.");
        setLoading(false);
        return;
      }
  
      // Validation simple du format du domaine
      const domainRegex = /^[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
      if (!domainRegex.test(domain)) {
        setError("Veuillez entrer un domaine valide (ex. example.com).");
        setLoading(false);
        return;
      }
  
      try {
        const response = await axios.get(`http://51.44.136.165:8081/api/verify/${encodeURIComponent(domain)}`);
        setResponseData(response.data);
      } catch (err) {
        setError(err.response?.data?.message || "Erreur lors de la vérification du domaine.");
      } finally {
        setLoading(false);
      }
    };
  
    return (
      <div className="mt-12 mb-8 flex flex-col gap-12">
        {/* Formulaire pour saisir le domaine */}
        <Card>
          <CardHeader variant="gradient" color="gray" className="mb-8 p-6">
            <Typography variant="h6" color="white">
              Vérification de Domaine
            </Typography>
          </CardHeader>
          <CardBody className="px-6">
            <form onSubmit={handleSubmit} className="flex flex-col gap-4">
              <Input
                label="Domaine"
                value={domain}
                onChange={(e) => setDomain(e.target.value)}
                placeholder="Entrez le domaine (ex. example.com)"
                required
              />
              <Button type="submit" color="blue" disabled={loading}>
                {loading ? "Vérification en cours..." : "Vérifier le Domaine"}
              </Button>
            </form>
            {error && (
              <Typography color="red" className="mt-4">
                {error}
              </Typography>
            )}
          </CardBody>
        </Card>
  
        {/* Table pour afficher les résultats */}
        <Card>
          <CardHeader variant="gradient" color="gray" className="mb-8 p-6">
            <Typography variant="h6" color="white">
              Résultats de la Vérification
            </Typography>
          </CardHeader>
          <CardBody className="overflow-x-scroll px-0 pt-0 pb-2">
            <table className="w-full min-w-[640px] table-auto">
              <thead>
                <tr>
                  {["Email", "Statut", "Raison"].map((el) => (
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
                {responseData.results.length > 0 ? (
                  responseData.results.map(({ email, valid, reason }, index) => (
                    <tr key={email}>
                      <td className={`py-3 px-5 ${index === responseData.results.length - 1 ? "" : "border-b border-blue-gray-50"}`}>
                        <Typography
                          variant="small"
                          color="blue-gray"
                          className="font-semibold"
                        >
                          {email}
                        </Typography>
                      </td>
                      <td className={`py-3 px-5 ${index === responseData.results.length - 1 ? "" : "border-b border-blue-gray-50"}`}>
                        <Chip
                          variant="gradient"
                          color={valid ? "green" : "red"}
                          value={valid ? "Valide" : "Invalide"}
                          className="py-0.5 px-2 text-[11px] font-medium w-fit"
                        />
                      </td>
                      <td className={`py-3 px-5 ${index === responseData.results.length - 1 ? "" : "border-b border-blue-gray-50"}`}>
                        <Typography
                          variant="small"
                          color="blue-gray"
                          className="text-xs font-normal"
                        >
                          {reason}
                        </Typography>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={3} className="py-3 px-5 text-center">
                      <Typography
                        variant="small"
                        color="blue-gray"
                        className="font-normal"
                      >
                        Aucun résultat de vérification.
                      </Typography>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
            {/* Afficher les emails valides */}
            {responseData.validEmails.length > 0 && (
              <div className="mt-4 px-5">
                <Typography variant="small" color="blue-gray" className="font-bold">
                  Emails Valides :
                </Typography>
                {responseData.validEmails.map((email, index) => (
                  <Typography
                    key={index}
                    variant="small"
                    color="blue-gray"
                    className="text-xs"
                  >
                    - {email}
                  </Typography>
                ))}
              </div>
            )}
          </CardBody>
        </Card>
      </div>
    );
  }
  
  export default CompanyTrace;