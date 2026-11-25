# Deployment Architecture - table-order-api

## Overview
table-order-api Unit의 Kubernetes 배포 아키텍처입니다.

---

## 1. Kubernetes Resources

### 1.1 Resource Overview

```
table-order namespace
├── Deployment (table-order-api)
│   └── Pod (replicas: 1)
│       └── Container (table-order-api)
├── Service (table-order-api-svc)
├── ConfigMap (table-order-config)
├── Secret (table-order-secrets)
├── Ingress (table-order-ingress)
├── ServiceAccount (table-order-sa)
└── HorizontalPodAutoscaler (future)
```

---

## 2. Namespace

```yaml
# namespace.yaml
apiVersion: v1
kind: Namespace
metadata:
  name: table-order
  labels:
    app.kubernetes.io/name: table-order
    app.kubernetes.io/part-of: table-order-system
```

---

## 3. ConfigMap

```yaml
# configmap.yaml
apiVersion: v1
kind: ConfigMap
metadata:
  name: table-order-config
  namespace: table-order
data:
  SPRING_PROFILES_ACTIVE: "prod"
  SERVER_PORT: "8080"
  
  # Database (non-sensitive)
  SPRING_DATASOURCE_HIKARI_MAXIMUM_POOL_SIZE: "15"
  SPRING_DATASOURCE_HIKARI_MINIMUM_IDLE: "5"
  
  # JPA
  SPRING_JPA_HIBERNATE_DDL_AUTO: "validate"
  SPRING_JPA_SHOW_SQL: "false"
  
  # Logging
  LOGGING_LEVEL_ROOT: "INFO"
  LOGGING_LEVEL_COM_TABLEORDER: "INFO"
  
  # JWT
  JWT_EXPIRATION_HOURS: "16"
  
  # CORS
  CORS_ALLOWED_ORIGINS: "https://customer.tableorder.example.com,https://admin.tableorder.example.com"
```

---

## 4. Secret

```yaml
# secret.yaml (values must be base64 encoded)
apiVersion: v1
kind: Secret
metadata:
  name: table-order-secrets
  namespace: table-order
type: Opaque
data:
  # echo -n 'value' | base64
  DATABASE_URL: <base64-encoded-jdbc-url>
  DATABASE_USERNAME: <base64-encoded-username>
  DATABASE_PASSWORD: <base64-encoded-password>
  JWT_SECRET: <base64-encoded-256bit-secret>
```

---

## 5. ServiceAccount

```yaml
# serviceaccount.yaml
apiVersion: v1
kind: ServiceAccount
metadata:
  name: table-order-sa
  namespace: table-order
  annotations:
    # IRSA (IAM Roles for Service Accounts)
    eks.amazonaws.com/role-arn: arn:aws:iam::{account-id}:role/table-order-api-role
```

---

## 6. Deployment

```yaml
# deployment.yaml
apiVersion: apps/v1
kind: Deployment
metadata:
  name: table-order-api
  namespace: table-order
  labels:
    app: table-order-api
    version: v1
spec:
  replicas: 1
  selector:
    matchLabels:
      app: table-order-api
  template:
    metadata:
      labels:
        app: table-order-api
        version: v1
    spec:
      serviceAccountName: table-order-sa
      
      containers:
        - name: table-order-api
          image: {account-id}.dkr.ecr.ap-northeast-2.amazonaws.com/table-order-api:latest
          imagePullPolicy: Always
          
          ports:
            - name: http
              containerPort: 8080
              protocol: TCP
          
          envFrom:
            - configMapRef:
                name: table-order-config
          
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
          
          resources:
            requests:
              memory: "512Mi"
              cpu: "250m"
            limits:
              memory: "1Gi"
              cpu: "500m"
          
          livenessProbe:
            httpGet:
              path: /actuator/health/liveness
              port: http
            initialDelaySeconds: 60
            periodSeconds: 10
            failureThreshold: 3
          
          readinessProbe:
            httpGet:
              path: /actuator/health/readiness
              port: http
            initialDelaySeconds: 30
            periodSeconds: 5
            failureThreshold: 3
          
          lifecycle:
            preStop:
              exec:
                command: ["sh", "-c", "sleep 10"]
      
      terminationGracePeriodSeconds: 60
```

---

## 7. Service

```yaml
# service.yaml
apiVersion: v1
kind: Service
metadata:
  name: table-order-api-svc
  namespace: table-order
  labels:
    app: table-order-api
spec:
  type: ClusterIP
  ports:
    - name: http
      port: 8080
      targetPort: http
      protocol: TCP
  selector:
    app: table-order-api
```

---

## 8. Ingress (AWS ALB)

```yaml
# ingress.yaml
apiVersion: networking.k8s.io/v1
kind: Ingress
metadata:
  name: table-order-ingress
  namespace: table-order
  annotations:
    kubernetes.io/ingress.class: alb
    alb.ingress.kubernetes.io/scheme: internet-facing
    alb.ingress.kubernetes.io/target-type: ip
    alb.ingress.kubernetes.io/listen-ports: '[{"HTTP": 80}, {"HTTPS": 443}]'
    alb.ingress.kubernetes.io/ssl-redirect: "443"
    alb.ingress.kubernetes.io/certificate-arn: arn:aws:acm:ap-northeast-2:{account-id}:certificate/{cert-id}
    alb.ingress.kubernetes.io/ssl-policy: ELBSecurityPolicy-TLS13-1-2-2021-06
    alb.ingress.kubernetes.io/healthcheck-path: /actuator/health/readiness
    alb.ingress.kubernetes.io/healthcheck-interval-seconds: "30"
    alb.ingress.kubernetes.io/healthy-threshold-count: "2"
    alb.ingress.kubernetes.io/unhealthy-threshold-count: "3"
    # SSE 지원을 위한 타임아웃 설정
    alb.ingress.kubernetes.io/load-balancer-attributes: idle_timeout.timeout_seconds=3600
spec:
  rules:
    - host: api.tableorder.example.com
      http:
        paths:
          - path: /
            pathType: Prefix
            backend:
              service:
                name: table-order-api-svc
                port:
                  number: 8080
```

---

## 9. HorizontalPodAutoscaler (Future)

```yaml
# hpa.yaml (MVP 이후 적용)
apiVersion: autoscaling/v2
kind: HorizontalPodAutoscaler
metadata:
  name: table-order-api-hpa
  namespace: table-order
spec:
  scaleTargetRef:
    apiVersion: apps/v1
    kind: Deployment
    name: table-order-api
  minReplicas: 1
  maxReplicas: 3
  metrics:
    - type: Resource
      resource:
        name: cpu
        target:
          type: Utilization
          averageUtilization: 70
    - type: Resource
      resource:
        name: memory
        target:
          type: Utilization
          averageUtilization: 80
```

---

## 10. Deployment Commands

### 10.1 Initial Setup

```bash
# 1. Namespace 생성
kubectl apply -f namespace.yaml

# 2. ConfigMap 생성
kubectl apply -f configmap.yaml

# 3. Secret 생성 (실제 값으로 대체)
kubectl apply -f secret.yaml

# 4. ServiceAccount 생성
kubectl apply -f serviceaccount.yaml

# 5. Deployment 생성
kubectl apply -f deployment.yaml

# 6. Service 생성
kubectl apply -f service.yaml

# 7. Ingress 생성
kubectl apply -f ingress.yaml
```

### 10.2 Useful Commands

```bash
# Pod 상태 확인
kubectl get pods -n table-order

# 로그 확인
kubectl logs -f deployment/table-order-api -n table-order

# Pod 재시작
kubectl rollout restart deployment/table-order-api -n table-order

# 배포 이력 확인
kubectl rollout history deployment/table-order-api -n table-order

# 롤백
kubectl rollout undo deployment/table-order-api -n table-order
```

---

## 11. CI/CD Pipeline (Conceptual)

```
┌──────────┐    ┌──────────┐    ┌──────────┐    ┌──────────┐    ┌──────────┐
│   Code   │───▶│  Build   │───▶│   Test   │───▶│   Push   │───▶│  Deploy  │
│  Commit  │    │ (Gradle) │    │ (JUnit)  │    │  (ECR)   │    │  (EKS)   │
└──────────┘    └──────────┘    └──────────┘    └──────────┘    └──────────┘
     │               │               │               │               │
     ▼               ▼               ▼               ▼               ▼
  GitHub         Docker          Unit +         Container        kubectl
  Push           Build           Integration    Image            apply
                                 Tests          Registry
```

### 11.1 Build Stage

```bash
# Gradle Build
./gradlew clean build -x test

# Docker Build
docker build -t table-order-api:${VERSION} .

# Tag for ECR
docker tag table-order-api:${VERSION} \
  ${AWS_ACCOUNT}.dkr.ecr.${REGION}.amazonaws.com/table-order-api:${VERSION}
```

### 11.2 Push Stage

```bash
# ECR Login
aws ecr get-login-password --region ${REGION} | \
  docker login --username AWS --password-stdin ${AWS_ACCOUNT}.dkr.ecr.${REGION}.amazonaws.com

# Push to ECR
docker push ${AWS_ACCOUNT}.dkr.ecr.${REGION}.amazonaws.com/table-order-api:${VERSION}
```

### 11.3 Deploy Stage

```bash
# Update image
kubectl set image deployment/table-order-api \
  table-order-api=${AWS_ACCOUNT}.dkr.ecr.${REGION}.amazonaws.com/table-order-api:${VERSION} \
  -n table-order

# Wait for rollout
kubectl rollout status deployment/table-order-api -n table-order
```

---

## 12. Environment Configuration

### 12.1 Development

```yaml
# 로컬 개발용 docker-compose.yml
version: '3.8'
services:
  postgres:
    image: postgres:15-alpine
    environment:
      POSTGRES_DB: tableorder
      POSTGRES_USER: postgres
      POSTGRES_PASSWORD: postgres
    ports:
      - "5432:5432"
  
  api:
    build: .
    ports:
      - "8080:8080"
    environment:
      SPRING_PROFILES_ACTIVE: local
      SPRING_DATASOURCE_URL: jdbc:postgresql://postgres:5432/tableorder
    depends_on:
      - postgres
```

### 12.2 Staging (Optional)

별도 EKS namespace 또는 별도 클러스터로 구성 가능.

### 12.3 Production

위 Kubernetes manifests 사용.

---

## 13. Deployment Checklist

### Pre-deployment

- [ ] ECR 리포지토리 생성
- [ ] RDS 인스턴스 생성 및 초기 스키마 적용
- [ ] S3 버킷 생성
- [ ] ACM 인증서 발급
- [ ] IAM Role 생성 (IRSA)
- [ ] VPC, Subnet, Security Group 구성

### Deployment

- [ ] Namespace 생성
- [ ] ConfigMap 적용
- [ ] Secret 적용 (실제 값)
- [ ] ServiceAccount 적용
- [ ] Deployment 적용
- [ ] Service 적용
- [ ] Ingress 적용
- [ ] ALB 생성 확인
- [ ] DNS 레코드 설정

### Post-deployment

- [ ] Health check 확인
- [ ] 로그 확인
- [ ] API 테스트
- [ ] SSL 인증서 확인
- [ ] CloudWatch 알람 설정

