# Infrastructure Design - table-order-api

## Overview
table-order-api Unit의 AWS 인프라 설계입니다.

---

## 1. Infrastructure Summary

| Component | AWS Service | Specification |
|-----------|-------------|---------------|
| **Compute** | EKS Automode | Managed Kubernetes |
| **Database** | RDS PostgreSQL | db.t3.small |
| **Storage** | S3 | Standard |
| **Load Balancer** | ALB | Application Load Balancer |
| **SSL/TLS** | ACM | AWS Certificate Manager |
| **DNS** | Route 53 | (Optional) |
| **Logging** | CloudWatch Logs | 30일 보관 |
| **Monitoring** | CloudWatch Metrics | 기본 메트릭 |
| **Secrets** | K8s Secrets | Base64 인코딩 |

---

## 2. Architecture Diagram

```
                                    ┌─────────────────────────────────────┐
                                    │            Internet                 │
                                    └─────────────────┬───────────────────┘
                                                      │
                                                      ▼
                                    ┌─────────────────────────────────────┐
                                    │         Route 53 (DNS)              │
                                    │   api.tableorder.example.com        │
                                    └─────────────────┬───────────────────┘
                                                      │
                                                      ▼
                                    ┌─────────────────────────────────────┐
                                    │     ACM (SSL Certificate)           │
                                    │     *.tableorder.example.com        │
                                    └─────────────────┬───────────────────┘
                                                      │
                                                      ▼
┌─────────────────────────────────────────────────────────────────────────────────┐
│                                   AWS VPC                                       │
│  ┌───────────────────────────────────────────────────────────────────────────┐  │
│  │                         Public Subnets                                    │  │
│  │  ┌─────────────────────────────────────────────────────────────────────┐  │  │
│  │  │                    ALB (Application Load Balancer)                  │  │  │
│  │  │                                                                     │  │  │
│  │  │  ┌──────────────────┐    ┌──────────────────┐                      │  │  │
│  │  │  │ Target Group     │    │ Target Group     │                      │  │  │
│  │  │  │ /api/customer/*  │    │ /api/admin/*     │                      │  │  │
│  │  │  └────────┬─────────┘    └────────┬─────────┘                      │  │  │
│  │  │           │                       │                                 │  │  │
│  │  └───────────┼───────────────────────┼─────────────────────────────────┘  │  │
│  └──────────────┼───────────────────────┼────────────────────────────────────┘  │
│                 │                       │                                       │
│  ┌──────────────┼───────────────────────┼────────────────────────────────────┐  │
│  │              │    Private Subnets    │                                    │  │
│  │              │                       │                                    │  │
│  │              ▼                       ▼                                    │  │
│  │  ┌─────────────────────────────────────────────────────────────────────┐  │  │
│  │  │                      EKS Automode Cluster                           │  │  │
│  │  │  ┌───────────────────────────────────────────────────────────────┐  │  │  │
│  │  │  │                   Namespace: table-order                      │  │  │  │
│  │  │  │                                                               │  │  │  │
│  │  │  │  ┌─────────────────┐   ┌─────────────────┐                   │  │  │  │
│  │  │  │  │   Deployment    │   │    Service      │                   │  │  │  │
│  │  │  │  │ table-order-api │◀──│  ClusterIP      │                   │  │  │  │
│  │  │  │  │   replicas: 1   │   │  port: 8080     │                   │  │  │  │
│  │  │  │  └─────────────────┘   └─────────────────┘                   │  │  │  │
│  │  │  │                                                               │  │  │  │
│  │  │  │  ┌─────────────────┐   ┌─────────────────┐                   │  │  │  │
│  │  │  │  │   ConfigMap     │   │     Secret      │                   │  │  │  │
│  │  │  │  │  (app config)   │   │ (DB, JWT keys)  │                   │  │  │  │
│  │  │  │  └─────────────────┘   └─────────────────┘                   │  │  │  │
│  │  │  │                                                               │  │  │  │
│  │  │  └───────────────────────────────────────────────────────────────┘  │  │  │
│  │  └─────────────────────────────────────────────────────────────────────┘  │  │
│  │                                      │                                    │  │
│  │                                      ▼                                    │  │
│  │  ┌─────────────────────────────────────────────────────────────────────┐  │  │
│  │  │                        RDS PostgreSQL                               │  │  │
│  │  │                        db.t3.small                                  │  │  │
│  │  │                        Multi-AZ: No (MVP)                           │  │  │
│  │  │                        Encrypted: Yes                               │  │  │
│  │  └─────────────────────────────────────────────────────────────────────┘  │  │
│  │                                                                           │  │
│  └───────────────────────────────────────────────────────────────────────────┘  │
│                                                                                 │
└─────────────────────────────────────────────────────────────────────────────────┘
                                      │
                                      ▼
                        ┌─────────────────────────────┐
                        │          AWS S3             │
                        │   table-order-images        │
                        │   (Menu Images)             │
                        └─────────────────────────────┘
```

---

## 3. Compute: EKS Automode

### 3.1 Cluster Configuration

| Setting | Value |
|---------|-------|
| Kubernetes Version | 1.29+ |
| Node Management | Automode (Managed) |
| Node Type | Auto-provisioned |
| Availability | Single AZ (MVP) |

### 3.2 Namespace

```yaml
apiVersion: v1
kind: Namespace
metadata:
  name: table-order
  labels:
    app: table-order
    environment: production
```

### 3.3 Resource Limits

```yaml
# Pod Resource Requests/Limits
resources:
  requests:
    memory: "512Mi"
    cpu: "250m"
  limits:
    memory: "1Gi"
    cpu: "500m"
```

---

## 4. Database: RDS PostgreSQL

### 4.1 Instance Configuration

| Setting | Value |
|---------|-------|
| Engine | PostgreSQL 15 |
| Instance Class | db.t3.small |
| vCPU | 2 |
| Memory | 2 GB |
| Storage | 20 GB gp3 |
| Multi-AZ | No (MVP) |
| Encryption | Yes (AES-256) |
| Backup Retention | 7 days |

### 4.2 Network Configuration

| Setting | Value |
|---------|-------|
| VPC | Same as EKS |
| Subnet Group | Private Subnets |
| Security Group | Allow 5432 from EKS nodes only |
| Public Access | No |

### 4.3 Parameter Group

```
# 주요 파라미터
max_connections = 100
shared_buffers = 256MB
work_mem = 4MB
log_statement = 'ddl'
log_min_duration_statement = 1000  # 1초 이상 쿼리 로깅
```

---

## 5. Storage: S3

### 5.1 Bucket Configuration

| Setting | Value |
|---------|-------|
| Bucket Name | `table-order-images-{account-id}` |
| Region | ap-northeast-2 (서울) |
| Versioning | Disabled |
| Encryption | SSE-S3 |
| Public Access | Block All |

### 5.2 Bucket Policy

```json
{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Effect": "Allow",
      "Principal": {
        "AWS": "arn:aws:iam::{account-id}:role/table-order-api-role"
      },
      "Action": [
        "s3:GetObject",
        "s3:PutObject",
        "s3:DeleteObject"
      ],
      "Resource": "arn:aws:s3:::table-order-images-{account-id}/*"
    }
  ]
}
```

### 5.3 CORS Configuration

```json
[
  {
    "AllowedHeaders": ["*"],
    "AllowedMethods": ["GET"],
    "AllowedOrigins": [
      "https://customer.tableorder.example.com",
      "https://admin.tableorder.example.com"
    ],
    "ExposeHeaders": []
  }
]
```

---

## 6. Load Balancer: ALB

### 6.1 ALB Configuration

| Setting | Value |
|---------|-------|
| Type | Application Load Balancer |
| Scheme | Internet-facing |
| IP Type | IPv4 |
| Subnets | Public Subnets (2 AZ) |

### 6.2 Listener Configuration

| Listener | Action |
|----------|--------|
| HTTP:80 | Redirect to HTTPS:443 |
| HTTPS:443 | Forward to Target Group |

### 6.3 Target Group

| Setting | Value |
|---------|-------|
| Target Type | IP (Pods) |
| Protocol | HTTP |
| Port | 8080 |
| Health Check Path | /actuator/health/readiness |
| Health Check Interval | 30s |
| Healthy Threshold | 2 |
| Unhealthy Threshold | 3 |

### 6.4 SSL/TLS

| Setting | Value |
|---------|-------|
| Certificate | ACM |
| SSL Policy | ELBSecurityPolicy-TLS13-1-2-2021-06 |
| Minimum TLS | TLS 1.2 |

---

## 7. Networking: VPC

### 7.1 VPC Configuration

| Setting | Value |
|---------|-------|
| CIDR | 10.0.0.0/16 |
| DNS Hostnames | Enabled |
| DNS Resolution | Enabled |

### 7.2 Subnets

| Type | CIDR | AZ | Purpose |
|------|------|-------|---------|
| Public | 10.0.1.0/24 | ap-northeast-2a | ALB |
| Public | 10.0.2.0/24 | ap-northeast-2c | ALB |
| Private | 10.0.11.0/24 | ap-northeast-2a | EKS, RDS |
| Private | 10.0.12.0/24 | ap-northeast-2c | EKS, RDS |

### 7.3 Security Groups

#### ALB Security Group
```
Inbound:
- 80/tcp from 0.0.0.0/0
- 443/tcp from 0.0.0.0/0

Outbound:
- All traffic to VPC CIDR
```

#### EKS Node Security Group
```
Inbound:
- 8080/tcp from ALB SG
- All traffic from self (node-to-node)

Outbound:
- All traffic (for external APIs, ECR, etc.)
```

#### RDS Security Group
```
Inbound:
- 5432/tcp from EKS Node SG

Outbound:
- None required
```

---

## 8. Logging & Monitoring: CloudWatch

### 8.1 Log Groups

| Log Group | Source | Retention |
|-----------|--------|-----------|
| `/aws/eks/table-order/application` | Application logs | 30 days |
| `/aws/rds/instance/table-order-db/postgresql` | RDS logs | 7 days |

### 8.2 Metrics

| Metric | Source | Alarm Threshold |
|--------|--------|-----------------|
| CPUUtilization | EKS Pod | > 80% |
| MemoryUtilization | EKS Pod | > 80% |
| DatabaseConnections | RDS | > 80 |
| FreeStorageSpace | RDS | < 2 GB |
| HTTPCode_Target_5XX_Count | ALB | > 10/min |

### 8.3 Container Insights

```yaml
# EKS Addon 활성화
aws eks create-addon \
  --cluster-name table-order-cluster \
  --addon-name amazon-cloudwatch-observability
```

---

## 9. Secrets Management: K8s Secrets

### 9.1 Secret Structure

```yaml
apiVersion: v1
kind: Secret
metadata:
  name: table-order-secrets
  namespace: table-order
type: Opaque
data:
  DATABASE_URL: <base64-encoded>
  DATABASE_USERNAME: <base64-encoded>
  DATABASE_PASSWORD: <base64-encoded>
  JWT_SECRET: <base64-encoded>
```

### 9.2 Secret Usage in Deployment

```yaml
env:
  - name: SPRING_DATASOURCE_URL
    valueFrom:
      secretKeyRef:
        name: table-order-secrets
        key: DATABASE_URL
  - name: SPRING_DATASOURCE_USERNAME
    valueFrom:
      secretKeyRef:
        name: table-order-secrets
        key: DATABASE_USERNAME
  - name: SPRING_DATASOURCE_PASSWORD
    valueFrom:
      secretKeyRef:
        name: table-order-secrets
        key: DATABASE_PASSWORD
  - name: JWT_SECRET
    valueFrom:
      secretKeyRef:
        name: table-order-secrets
        key: JWT_SECRET
```

---

## 10. IAM Roles

### 10.1 EKS Pod Role (IRSA)

```json
{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Effect": "Allow",
      "Action": [
        "s3:GetObject",
        "s3:PutObject",
        "s3:DeleteObject"
      ],
      "Resource": "arn:aws:s3:::table-order-images-*/*"
    },
    {
      "Effect": "Allow",
      "Action": [
        "logs:CreateLogStream",
        "logs:PutLogEvents"
      ],
      "Resource": "arn:aws:logs:*:*:log-group:/aws/eks/table-order/*"
    }
  ]
}
```

---

## 11. Cost Estimation (Monthly)

| Service | Specification | Estimated Cost |
|---------|--------------|----------------|
| EKS Cluster | 1 cluster | $73 |
| EKS Nodes | Auto (est. 1-2 nodes) | ~$30-60 |
| RDS | db.t3.small, 20GB | ~$30 |
| ALB | 1 ALB, low traffic | ~$20 |
| S3 | < 1GB | ~$1 |
| CloudWatch | Logs + Metrics | ~$10 |
| Data Transfer | Low traffic | ~$5 |
| **Total** | | **~$170-200/month** |

*Note: 실제 비용은 사용량에 따라 변동*

---

## 12. Future Scaling Considerations

MVP 이후 확장 시 고려사항:

| Area | Current | Future |
|------|---------|--------|
| **EKS Replicas** | 1 | HPA (2-5) |
| **RDS** | db.t3.small, Single-AZ | db.t3.medium, Multi-AZ |
| **RDS Read Replica** | None | 1 Read Replica |
| **Redis** | None | ElastiCache (SSE, Session) |
| **CDN** | None | CloudFront (Images) |
| **Secrets** | K8s Secrets | Secrets Manager |

