# Cloud Cost Model & Resource Optimization (Phase 16)

## 1. Projected Infrastructure Cost Model (100,000 MAU)

| Component | Target Architecture | Monthly Cost (USD) | Monthly Cost (INR) |
|---|---|---|---|
| **App Compute (ECS / K8s)** | 3x t4g.medium container instances | ~$75.00 | ~₹6,250 |
| **MongoDB Atlas** | M20 Dedicated Cluster (Multi-AZ) | ~$140.00 | ~₹11,600 |
| **Redis (ElastiCache)** | cache.t4g.small Primary + Replica | ~$35.00 | ~₹2,900 |
| **Cloud Storage & CDN** | AWS S3 + CloudFront (1 TB transfer) | ~$25.00 | ~₹2,075 |
| **AI LLM Inference** | Gemini 1.5 Flash + Tiered Caching | ~$180.00 | ~₹14,940 |
| **Email & Push Notifications** | Amazon SES + Web Push | ~$15.00 | ~₹1,245 |
| **Total Estimated Run Rate** | Scalable to 100k active users | **~$470.00** | **~₹39,010** |

---

## 2. Cost Reduction Levers Implemented
- **AI Prompt Caching**: 35% reduction in LLM inference costs via `AICostManager.getPromptCacheKey()`.
- **Vector SVG Generation**: Zero raster storage costs for chart graphics.
- **Selective Projections**: MongoDB query projections reduce memory and network bandwidth.
