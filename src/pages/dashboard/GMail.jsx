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

export function GMail() {
  // État pour les champs du formulaire
  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    domain: "",
  });
  // État pour la réponse de l'API
  const [responseData, setResponseData] = useState({
    progress: [],
    validEmails: [],
    elapsedTime: 0,
  });
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

    // Vérification des champs non vides (côté client)
    if (!formData.firstName || !formData.lastName || !formData.domain) {
      setError("Tous les champs sont obligatoires.");
      setLoading(false);
      return;
    }

    try {
      const response = await axios.post("http://51.44.136.165:8081/api/ghostmail", formData);
      setResponseData(response.data);
    } catch (err) {
      setError(
        err.response?.data?.progress?.[0] ||
          "Erreur lors de l'appel à l'API. Vérifiez les données saisies."
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="mt-12 mb-8 flex flex-col gap-12">
      {/* Formulaire pour saisir les données */}
      <Card>
        <CardHeader variant="gradient" color="gray" className="mb-8 p-6">
          <Typography variant="h6" color="white">
            Vérification des Emails
          </Typography>
        </CardHeader>
        <CardBody className="px-6">
          <form onSubmit={handleSubmit} className="flex flex-col gap-4">
            <Input
              label="Prénom"
              name="firstName"
              value={formData.firstName}
              onChange={handleInputChange}
              placeholder="Entrez le prénom"
              required
            />
            <Input
              label="Nom de famille"
              name="lastName"
              value={formData.lastName}
              onChange={handleInputChange}
              placeholder="Entrez le nom de famille"
              required
            />
            <Input
              label="Domaine"
              name="domain"
              value={formData.domain}
              onChange={handleInputChange}
              placeholder="Entrez le domaine (ex. example.com)"
              required
            />
            <Button type="submit" color="blue" disabled={loading}>
              {loading ? "Vérification en cours..." : "Vérifier les Emails"}
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
                {["Email Valide", "Statut", "Temps Écoulé (ms)"].map((el) => (
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
              {responseData.validEmails.length > 0 ? (
                responseData.validEmails.map((email, index) => (
                  <tr key={email}>
                    <td className="py-3 px-5 border-b border-blue-gray-50">
                      <Typography
                        variant="small"
                        color="blue-gray"
                        className="font-semibold"
                      >
                        {email}
                      </Typography>
                    </td>
                    <td className="py-3 px-5 border-b border-blue-gray-50">
                      <Chip
                        variant="gradient"
                        color="green"
                        value="Valide"
                        className="py-0.5 px-2 text-[11px] font-medium w-fit"
                      />
                    </td>
                    <td className="py-3 px-5 border-b border-blue-gray-50">
                      <Typography
                        variant="small"
                        className="text-xs font-semibold text-blue-gray-600"
                      >
                        {index === 0 ? responseData.elapsedTime : "-"}
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
                      Aucun email valide trouvé.
                    </Typography>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
          {/* Afficher les messages de progression */}
          {responseData.progress.length > 0 && (
            <div className="mt-4 px-5">
              <Typography variant="small" color="blue-gray" className="font-bold">
                Progression :
              </Typography>
              {responseData.progress.map((msg, index) => (
                <Typography
                  key={index}
                  variant="small"
                  color="blue-gray"
                  className="text-xs"
                >
                  - {msg}
                </Typography>
              ))}
            </div>
          )}
        </CardBody>
      </Card>
    </div>
  );
}

export default GMail;