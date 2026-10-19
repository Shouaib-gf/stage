# Rapport de stage DevOps — SmartBus

**Périmètre :** phases 4 à 8 du cahier des charges SmartBus
**Environnement :** VM Ubuntu, Docker Compose, dépôt GitHub `Shouaib-gf/stage`, branche `devops`
**État de validation :** 19 octobre 2026

## 1. Périmètre et architecture existante

L’intervention poursuit l’application SmartBus fournie : une API Express qui sert également le build React existant, une base MongoDB, la documentation Swagger et une configuration Docker Compose. Aucun projet d’exemple n’a été créé. Les sources React autonomes et le code embarqué Raspberry Pi/OpenCV/Python ne faisaient pas partie du dépôt reçu.

La VM héberge l’application et les services de supervision. Nginx est le point d’entrée HTTPS; MongoDB garde son volume persistant existant. Les secrets, les données MongoDB et les sauvegardes restent sur la VM et ne sont pas inclus dans le dépôt Git.

## 2. Phase 4 — CI/CD, reverse proxy et sécurité

Le workflow GitHub Actions valide les changements sur un runner GitHub : installation reproductible, tests, analyse ESLint, audit npm complet et audit de production, puis construction de l’image Docker. Sur un push de la branche `devops`, le runner de la VM construit une image étiquetée par commit et remplace uniquement le service `web`. Il vérifie l’API, l’accueil et Swagger par HTTPS. Si un contrôle échoue, il restaure l’image précédente; aucun essai artificiel de rollback n’a été déclenché sur le service réel.

Le [run CI/CD final](https://github.com/Shouaib-gf/stage/actions/runs/39293952446) a réussi : validation et déploiement terminés en 1 min 3 s. L’image déployée passe son healthcheck Docker. Le workflow conserve MongoDB et les services de supervision pendant un déploiement backend.

Nginx redirige HTTP vers HTTPS, applique TLS 1.2/1.3, HSTS, des en-têtes de sécurité et une limitation des tentatives de connexion. Un certificat d’autorité locale est utilisé pour l’adresse privée de la VM; il est approuvé dans le magasin de certificats utilisateur Windows. Il faudra le renouveler si l’adresse IP change. UFW est actif : entrées refusées par défaut, SSH autorisé depuis le sous-réseau LAN et ports 80/443 ouverts.

Le JWT est signé avec le secret du fichier `.env` privé de la VM. MongoDB exige une authentification et n’a pas de port hôte publié. Les mutations de véhicules et d’arrêts sont protégées par JWT et par les rôles d’administration. Le build React existant appelle désormais l’API de cette VM; les journaux de navigateur ne consignent plus les identifiants ni les réponses contenant des jetons. L’ancienne route `useragences` attendue par l’interface a été conservée avec authentification et contrôle d’accès.

## 3. Phase 5 — monitoring et observabilité

Prometheus collecte quatre cibles, toutes `UP` lors de la vérification : Prometheus, node-exporter, cAdvisor et le backend SmartBus. Six règles d’alerte sont chargées : disponibilité du backend, CPU, mémoire disponible, espace disque, node-exporter et cAdvisor.

Grafana est servi sous `/grafana/`, conserve son authentification et provisionne le tableau de bord SmartBus Overview. Il contient les panneaux système (CPU, mémoire, disque et réseau), latence HTTP, disponibilité, alertes et séries métier.

Le backend écrit des événements techniques JSON limités à l’horodatage, au niveau, au service et au code d’événement. Logstash les transmet à Elasticsearch; Kibana est accessible par HTTPS avec authentification HTTP Basic. Une règle ILM supprime les index après sept jours. Le modèle fixe les répliques à zéro pour le cluster à un seul nœud. Elasticsearch n’a pas d’authentification dans ce déploiement de laboratoire : il reste sur le réseau Docker interne, sans port hôte publié; l’accès navigateur à Kibana est protégé par Nginx.

La VM dispose de 3,3 Gio de RAM et de 35 Go de disque. Après démarrage d’ELK, environ 4,2 Go de disque restent libres; il faut surveiller la capacité avant d’augmenter l’ingestion. Les limites mémoire des conteneurs, la rotation des journaux Docker et la rétention de sept jours bornent l’usage actuel.

Les métriques « bus connectés » et « élèves détectés » sont en place, mais les composants Raspberry Pi/OpenCV qui les alimenteraient n’ont pas été fournis. Elles restent donc à zéro jusqu’à l’intégration de véritables événements télémétriques.

## 4. Phase 6 — livrables

Le dépôt documente l’application existante, le démarrage Compose, les contrôles d’exploitation, la CI/CD et le rollback. Il contient aussi les tests automatisés, la configuration TLS publique de l’autorité locale, les règles Prometheus, le tableau Grafana, le pipeline Logstash, le guide utilisateur, le guide technique et ce rapport. Aucune nouvelle capture d’écran n’est incluse.

## 5. Phase 7 — technologies et limites de périmètre

L’environnement installé utilise GitHub Actions, Git, Docker Compose, Nginx, Node.js, Express, MongoDB, Prometheus, Grafana, Elasticsearch, Logstash et Kibana. Kubernetes/K3s n’a pas été déployé sur cette VM mono-hôte. Il n’était pas nécessaire à l’architecture Compose retenue. Le code Raspberry Pi 4, OpenCV/Python et les sources React séparées ne figuraient pas dans le dépôt reçu.

## 6. Phase 8 — résultats d’acceptation

| Contrôle | Résultat observé |
|---|---|
| Tests Node.js | 16 réussis, 0 échec |
| ESLint | réussi, aucune erreur |
| Audit npm | 0 vulnérabilité signalée |
| CI/CD GitHub Actions | validation et déploiement réussis, run #9 |
| Backend par HTTPS | `/health` HTTP 200, MongoDB `connected`; conteneur `healthy` |
| Application et Swagger | HTTP 200 |
| Authentification des routes métier | `/useragences` sans JWT répond HTTP 401 JSON; endpoint de session répond comme API Express |
| Prometheus | 4/4 cibles `UP`; 6 règles chargées; santé HTTPS HTTP 200 |
| Grafana | API HTTPS HTTP 200; tableau SmartBus Overview provisionné |
| ELK | cluster Elasticsearch `green`, Kibana HTTPS HTTP 200; index `smartbus-app-*` reçoit les événements de démarrage |
| Réseau | UFW actif; seuls Nginx 80/443 sont exposés aux clients; Grafana et Prometheus sont liés à localhost; MongoDB, Elasticsearch, cAdvisor et node-exporter ne publient pas de port hôte |
| Données et secrets | volume MongoDB, fichier `.env` et sauvegardes VM conservés; aucun secret ajouté au dépôt |

La correction de l’initialisation Super Admin attend la connexion MongoDB avant la recherche ou la création idempotente; le compte existant est conservé. La connexion Super Admin et une route protégée avaient été validées lors de l’intervention précédente, et les tests présents couvrent l’émission du JWT, les erreurs de mot de passe et l’ordre d’initialisation.

## 7. Exploitation

Le certificat public de l’autorité locale à importer dans le navigateur se trouve dans `docs/tls/SmartBus-Local-CA.crt`. Le fichier `.env` privé sur la VM contient les accès d’exploitation Grafana/Kibana et les variables d’application. Ne pas le copier dans Git. Les sauvegardes datées et les volumes Docker doivent être conservés; ne jamais utiliser `docker compose down -v` sur la VM.

Les procédures de maintenance sont décrites dans [le guide technique](technical-guide.md) et les accès fonctionnels dans [le guide utilisateur](user-guide.md).
