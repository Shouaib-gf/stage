# Guide utilisateur SmartBus

## Acceder a la plateforme

Ouvrir `https://192.168.43.129/`. Le certificat est signe par l'autorite locale SmartBus. Importer le fichier `docs/tls/SmartBus-Local-CA.crt` dans les certificats racine de l'utilisateur Windows pour eviter l'avertissement du navigateur. Cette adresse est valable tant que la VM garde la meme adresse IP.

Les identifiants de l'application sont les comptes SmartBus existants. Utiliser l'adresse courriel et le mot de passe deja associes au compte; aucun compte MongoDB ni secret JWT ne doit etre saisi dans le navigateur. Le role Super Admin donne acces aux fonctions d'administration. Les roles admin et parent gardent les droits definis par l'application.

## API et supervision

- `/api-docs/` : documentation des routes API.
- `/health` : etat de l'API et connexion MongoDB.
- `/grafana/` : tableaux de bord. Se connecter avec le compte admin Grafana; le mot de passe initial genere se trouve dans le fichier `.env` prive de la VM.
- `/prometheus/` : cibles, requetes et alertes. La fenetre d'authentification HTTP utilise le compte Kibana stocke dans le `.env` prive.
- `/kibana/` : recherche des evenements techniques SmartBus, avec le meme compte HTTP Basic. Choisir la data view `smartbus-app-*` apres la premiere indexation et un intervalle de temps recent.

Les compteurs de bus connectes et de detections eleves n'augmentent qu'a reception des evenements correspondants. Le depot fourni ne contient pas le logiciel Raspberry Pi/OpenCV qui produit ces evenements.

## Diagnostic rapide

1. Si l'application n'est pas accessible, verifier que la VM est allumee et que l'adresse IP n'a pas change.
2. Si le navigateur signale un certificat inconnu, importer le certificat CA local fourni. Ne pas transmettre la cle privee du serveur ou de l'autorite CA.
3. Si une page de supervision est inaccessible, verifier les conteneurs et l'etat du reverse proxy.
4. Si le tableau affiche `No data`, verifier la cible SmartBus dans Prometheus et produire des evenements depuis l'application. Une valeur zero peut simplement signifier qu'aucun bus ou evenement de detection n'a ete recu.
5. Ne pas supprimer les volumes Docker, le `.env`, les sauvegardes ou les donnees MongoDB pendant un redemarrage.
