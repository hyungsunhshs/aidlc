# Infrastructure Design Plan - table-order-api

## Overview
table-order-api Unit의 Infrastructure Design 계획입니다. 논리 컴포넌트를 AWS 인프라 서비스로 매핑합니다.

**Pre-determined (Requirements에서 결정됨):**
- Cloud Provider: AWS
- Container Orchestration: EKS Automode
- Database: PostgreSQL (RDS)
- Image Storage: S3
- Target Scale: 소규모 (1-50 테이블, 단일 매장)

---

## Part 1: Planning

### Step 1: Analyze Design Artifacts
- [x] Review functional design artifacts
- [x] Review NFR design artifacts  
- [x] Identify infrastructure mapping needs

### Step 2: Answer Infrastructure Questions

인프라 세부 사항에 대한 질문입니다.

---

#### Q1: RDS 인스턴스 타입

PostgreSQL RDS 인스턴스 크기를 선택해주세요.

**Options:**
- **A) db.t3.micro**: 최소 사양 (개발/테스트용, 프리티어)
- **B) db.t3.small**: 소규모 운영 (2 vCPU, 2GB RAM)
- **C) db.t3.medium**: 여유 있는 운영 (2 vCPU, 4GB RAM)

**Recommendation**: B) 50 테이블 MVP 운영에 적합

[Answer]: 

---

#### Q2: 로드 밸런서 타입

EKS 앞단 로드 밸런서를 선택해주세요.

**Options:**
- **A) ALB (Application LB)**: HTTP/HTTPS, 경로 기반 라우팅
- **B) NLB (Network LB)**: TCP/UDP, 고성능
- **C) ALB + API Gateway**: API 관리 기능 추가

**Recommendation**: A) REST API + SSE에 적합, 비용 효율적

[Answer]: 

---

#### Q3: SSL/TLS 인증서 관리

HTTPS 인증서를 어떻게 관리할까요?

**Options:**
- **A) ACM (AWS Certificate Manager)**: 무료, 자동 갱신
- **B) Let's Encrypt**: 무료, 수동 갱신 필요
- **C) 유료 인증서**: 별도 구매

**Recommendation**: A) AWS 환경에서 가장 간편

[Answer]: 

---

#### Q4: 로깅 및 모니터링

로그 수집 및 모니터링 방식을 선택해주세요.

**Options:**
- **A) CloudWatch only**: AWS 네이티브, 기본 메트릭 + 로그
- **B) CloudWatch + Prometheus/Grafana**: 상세 메트릭 대시보드
- **C) ELK Stack**: Elasticsearch 기반 로그 분석

**Recommendation**: A) MVP에서는 CloudWatch로 충분

[Answer]: 

---

#### Q5: 비밀 관리

JWT 시크릿, DB 패스워드 등 민감 정보 관리 방식을 선택해주세요.

**Options:**
- **A) K8s Secrets**: 기본, 별도 비용 없음
- **B) AWS Secrets Manager**: 자동 로테이션, 추가 비용
- **C) AWS Parameter Store**: 간단한 설정, 무료 (Standard)

**Recommendation**: A) MVP에서는 K8s Secrets로 충분, 추후 확장 가능

[Answer]: 

---

### Step 3: Generate Infrastructure Artifacts
- [x] Create infrastructure-design.md
- [x] Create deployment-architecture.md

---

## Part 2: Generation (After Answers)

### Step 4: Infrastructure Mapping
- [x] Compute: EKS Automode
- [x] Database: RDS PostgreSQL
- [x] Storage: S3
- [x] Networking: ALB, VPC

### Step 5: Deployment Architecture
- [x] K8s resource definitions
- [x] AWS service configuration
- [x] CI/CD considerations

### Step 6: Finalize and Validate
- [x] Review all artifacts
- [x] Ensure alignment with NFR requirements
- [x] Verify cost-effectiveness for MVP

---

## Notes
- MVP 단일 매장, 소규모 환경
- 비용 최적화 우선
- 확장 가능한 구조 유지

