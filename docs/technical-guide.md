# SmartBus technical operations guide

## Phase 4 - containerization, CI/CD, reverse proxy, and security

- The existing Express service and bundled React frontend run in the `web` container. The bundle now calls the VM's HTTPS API and suppresses browser `console.log` output so authentication and user data are not written to developer consoles. MongoDB remains on its existing authenticated persistent volume.
- GitHub Actions validates pushes and pull requests with `npm ci`, the Node test suite, ESLint, a full dependency audit, and a Docker build. Pushes to `devops` deploy only `web` from the self-hosted VM runner. Health checks verify HTTPS readiness, homepage, and Swagger; the workflow restores the previous immutable image on a failed check.
- Nginx is the only externally published application service. It terminates TLS, redirects HTTP, supports Socket.IO upgrades, rate-limits authentication, and applies security headers. Grafana, Prometheus, Kibana, cAdvisor, node-exporter, Elasticsearch, and MongoDB have no public Docker port.
- The lab VM uses a local CA because its private IP cannot obtain a public ACME certificate. The CA certificate is distributed at `docs/tls/SmartBus-Local-CA.crt`; the CA private key remains on the VM outside the Nginx mounts. Regenerate the server certificate if the VM IP changes.
- UFW defaults to deny incoming traffic, permits SSH from the VM's LAN subnet, and permits HTTP/HTTPS on ports 80/443. Docker-published management ports bind only to loopback.
- Secrets live in the VM `.env` with mode 0600. `.env`, TLS keys, logs, database data, and backups are excluded from Git and the application build context.

## Phase 5 - monitoring and observability

Prometheus scrapes the backend, node-exporter, cAdvisor, and itself. Alert rules cover backend readiness, CPU, available memory, root disk space, node-exporter, and cAdvisor. Grafana provisions the Prometheus data source and SmartBus Overview dashboard from source-controlled files. The dashboard contains CPU, memory, disk, network, vehicle/bus metric, student-detection metric, response latency, service availability, and alert panels.

ELK runs as a memory-limited single-node stack. The backend writes only safe lifecycle event records (timestamp, level, service, event code) to a rotating log file; Logstash reads that file and indexes daily in Elasticsearch. An ILM policy deletes log indices after seven days. Kibana and Prometheus use HTTP Basic authentication at Nginx; Grafana retains its own account login. No log entry should contain credentials, request bodies, JWT values, or personal records.

The bus and student counters require real telemetry events. The repository contains no Raspberry Pi/OpenCV source or detection event endpoint, so their dashboard series remain zero until that upstream integration exists.

## Phase 6 - deliverables

The repository contains the existing web/API application, MongoDB Compose configuration, CI pipeline, tests, Dockerfile, Nginx/TLS configuration, Prometheus rules, Grafana dashboard, Logstash pipeline, technical and user guides, and internship report. Do not delete Docker volumes, `.env`, TLS private keys, or the dated backup directories.

## Phase 7 - technology inventory

This deployed repository uses GitHub Actions, Git, Docker Compose, Nginx, Node.js, Express, MongoDB, Prometheus, Grafana, Elasticsearch, Logstash, and Kibana. K3s/Kubernetes remains optional for the single-VM requirement and is not installed. Raspberry Pi 4, OpenCV/Python, and standalone React source were not included in the supplied backend repository; they remain external project components.

## Phase 8 - operational acceptance

Before accepting a release, confirm that the CI validation and deploy jobs pass, the backend is healthy through HTTPS, MongoDB data is unchanged, Prometheus targets are up, the dashboard loads, log events appear in Kibana, and only allowed ports are reachable. Review memory and disk after ELK starts; limits and seven-day retention keep the stack bounded on the VM.

### Routine checks

```sh
cd /home/shouaib/smartBusBackend
docker compose ps
docker stats --no-stream
curl -kfsS https://127.0.0.1/health
curl -kfsS https://127.0.0.1/prometheus/-/healthy
sudo ufw status verbose
```

The `-k` option is for local command-line checks before importing the local CA. Browser users should trust `SmartBus-Local-CA.crt`.
