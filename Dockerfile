# Étape de base : Node.js
FROM node:18

# Dossier de travail dans le conteneur
WORKDIR /app

# Copier les fichiers nécessaires
COPY package*.json ./
RUN npm install

# Copier le reste du code
COPY . .

# Exposer le port par défaut de Vite
EXPOSE 5173

# Lancer le serveur de développement
CMD ["npm", "run", "dev", "--", "--host"]
