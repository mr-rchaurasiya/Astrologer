# Containerization & Production Docker Deployment (Phase 11)

## 1. Overview
The platform provides production-optimized multi-stage Dockerfiles for both backend and frontend, as well as an orchestration file `docker-compose.production.yml`.

---

## 2. Architecture & Services

```
                              [Internet / HTTPS]
                                      |
                                      v
                             +-----------------+
                             |  Nginx Ingress  | (Port 80/443)
                             +--------+--------+
                                      |
                     +----------------+----------------+
                     |                                 |
                     v                                 v
            +-----------------+               +-----------------+
            |  Client (React) | (Port 80)     | Server (NodeJS) | (Port 5000)
            +-----------------+               +--------+--------+
                                                       |
                                      +----------------+----------------+
                                      |                                 |
                                      v                                 v
                             +-----------------+               +-----------------+
                             | MongoDB Cluster |               |  Redis Cluster  |
                             +-----------------+               +-----------------+
```

---

## 3. Quick Start (Production Cluster)
To build and launch the complete stack locally or on a cloud virtual machine:

```bash
docker-compose -f docker-compose.production.yml up --build -d
```

To view logs:
```bash
docker-compose -f docker-compose.production.yml logs -f server
```

To stop gracefully:
```bash
docker-compose -f docker-compose.production.yml down
```

---

## 4. Security Hardening
- Backend container runs as unprivileged user `nodejs` (UID 1001).
- Frontend container is served via Alpine-based Nginx with aggressive static caching headers.
- Container healthchecks ensure dependent services (MongoDB, Redis) are healthy before Express starts.
