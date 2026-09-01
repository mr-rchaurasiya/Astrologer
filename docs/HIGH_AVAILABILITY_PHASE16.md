# High Availability & Zero-Downtime Deployment (Phase 16)

## 1. High Availability Probes

### 1.1 Liveness Probe (`GET /api/v1/health/liveness`)
- Returns `HTTP 200 { "status": "alive" }` if the process event loop is responsive.
- Used by orchestrators (Kubernetes / Docker Swarm) to detect deadlocks and restart stuck containers.

### 1.2 Readiness Probe (`GET /api/v1/health/readiness` / `/ready`)
- Returns `HTTP 200` only if:
  1. Database connection is active.
  2. Cache provider is operational or safely falling back.
  3. Worker pool is active and not currently draining.
- Used by load balancers to route traffic exclusively to healthy, fully-initialized instances.

---

## 2. Rolling Deployment Protocol
1. New container instances are started with the updated container image.
2. Load balancer polls `/api/v1/health/readiness` until 200 OK is returned.
3. Traffic is shifted to new instances incrementally.
4. Old instances receive `SIGTERM`, drain remaining active connections, and shut down cleanly.
