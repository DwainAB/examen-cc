# Journal des évolutions

Ce fichier suit le format [Keep a Changelog](https://keepachangelog.com/fr/1.1.0/).

## [Non publié]

### À faire

- Réserver un nom de domaine et configurer le DNS.
- Configurer un moniteur externe et des alertes.
- Générer la documentation avec JSDoc.
- Rétablir l'envoi des mails en ligne, le SMTP étant bloqué sur l'offre Hobby de Railway.
- Déplacer la gestion du stock dans le microservice `stock-management`.
- Migrer le frontend de `react-scripts` vers Vite.

## [1.0.0] - 2026-11-03

Première version mise en ligne, en préproduction et en production.

### Sécurité

- Prix et total des commandes calculés côté serveur, à partir de la base de données.
- Secrets, tokens et données personnelles retirés des logs.
- Validation des entrées avec Joi, y compris contre l'injection NoSQL.
- Suppression de commande réservée aux administrateurs.
- Gateway et microservices protégés par une clé interne.
- Ajout de `helmet` et limitation de CORS aux origines autorisées.
- Message de connexion unique, renvoyé avec un statut 401.
- Limitation des tentatives de connexion et d'inscription.
- Erreurs techniques masquées dans les réponses de l'API.
- JWT déplacé de `localStorage` vers un cookie `HttpOnly` et `SameSite=Strict`, `Secure` en production.
- Dépendances mises à jour, dont `nodemailer`.

### Ajouté

- Déploiement sur Railway, avec un environnement de préproduction et un de production.
- Dockerfile pour chaque service et `docker-compose` pour toute l'application.
- GitHub Actions : tests, build du frontend, construction des images et audit des dépendances.
- Tests automatisés du backend et du frontend.
- Journalisation structurée avec Winston et journal d'audit.
- Route de santé `/api/health`.
- Lien d'administration pour les administrateurs.

### Corrigé

- Stock vérifié et décrémenté à la commande.
- Gestion des erreurs de lecture et de mise à jour du statut.
- Suppression et validation de commande réellement implémentées.
- Refus des noms d'utilisateur en double (409).
- Commande qui n'attend plus l'envoi du mail pour répondre.
- Adresse de notification lue depuis `ORDER_NOTIFICATION_EMAIL`.
- Modes de livraison et de paiement initialisés avec les valeurs affichées.
- Session expirée gérée par le frontend.
- État du panier qui n'est plus modifié directement.
- Clé de la liste des produits et faute dans la route `shipping_payment`.
- Affichage des erreurs de commande et de la page d'administration, et redirection après une commande.
- Démarrage des services avec `node` au lieu de `nodemon`.
- Connexion en erreur 500 après l'ajout du journal d'audit : imports manquants ajoutés, avec des tests.

### Modifié

- `axios` remplacé par `fetch`.
- Application séparée du démarrage du serveur dans le backend.
- `nodemon` déplacé dans les dépendances de développement.

### Supprimé

- Code mort : `adminRoutes`, `adminController`, fichiers vides de la gateway, microservice `auth-gateway` vide et doublon `components/ProductList.js`.

### Problèmes connus

- 16 vulnérabilités hautes, 48 modérées et 11 faibles restent dans le frontend, sans faille critique.
- Les mails ne partent pas sur Railway.
