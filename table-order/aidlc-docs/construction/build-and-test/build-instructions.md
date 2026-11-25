# Build Instructions

## Prerequisites

### System Requirements
- **OS**: macOS, Linux, or Windows (with WSL2)
- **Memory**: 4GB+ RAM
- **Disk Space**: 2GB+ free

### Required Tools

| Tool | Version | Purpose |
|------|---------|---------|
| Java JDK | 17+ | Backend API |
| Gradle | 8.x (wrapper included) | Backend build |
| Node.js | 18+ | Frontend apps |
| npm | 9+ | Frontend package management |
| Docker | 24+ | Database & Services |
| PostgreSQL | 15+ | Database (or via Docker) |

### Environment Variables

```bash
# Backend (table-order-api)
export DATABASE_URL=jdbc:postgresql://localhost:5432/tableorder
export DATABASE_USERNAME=postgres
export DATABASE_PASSWORD=postgres
export JWT_SECRET=your-256-bit-secret-key-for-jwt-signing

# Frontend (customer-ordering-app)
export VITE_API_BASE_URL=http://localhost:8080/api

# Frontend (store-management-app)
export VITE_API_BASE_URL=http://localhost:8080/api
```

---

## Build Steps

### 1. Start Database (Using Docker)

```bash
# Start PostgreSQL container
docker run -d \
  --name tableorder-db \
  -e POSTGRES_DB=tableorder \
  -e POSTGRES_USER=postgres \
  -e POSTGRES_PASSWORD=postgres \
  -p 5432:5432 \
  postgres:15-alpine

# Wait for database to be ready
sleep 5

# Verify database is running
docker ps | grep tableorder-db
```

### 2. Build Backend (table-order-api)

```bash
cd table-order-api

# Build (skipping tests for initial build)
./gradlew build -x test

# Or build with tests
./gradlew build

# Expected output: BUILD SUCCESSFUL
```

**Build Artifacts:**
- `table-order-api/build/libs/table-order-api-0.0.1-SNAPSHOT.jar`

### 3. Build Frontend - Customer App (customer-ordering-app)

```bash
cd customer-ordering-app

# Install dependencies
npm install

# Build for production
npm run build

# Expected output: ✓ built in XXXms
```

**Build Artifacts:**
- `customer-ordering-app/dist/` (static files)

### 4. Build Frontend - Store Management App (store-management-app)

```bash
cd store-management-app

# Install dependencies
npm install

# Build for production
npm run build

# Expected output: ✓ built in XXXms
```

**Build Artifacts:**
- `store-management-app/dist/` (static files)

---

## Full Build Script

Create and run this script from the project root:

```bash
#!/bin/bash
set -e

echo "🔨 Building Table Order Service..."

# Backend
echo "📦 Building table-order-api..."
cd table-order-api
./gradlew build -x test
cd ..

# Customer App
echo "📦 Building customer-ordering-app..."
cd customer-ordering-app
npm install
npm run build
cd ..

# Store Management App
echo "📦 Building store-management-app..."
cd store-management-app
npm install
npm run build
cd ..

echo "✅ All builds completed successfully!"
```

---

## Verify Build Success

### Backend
```bash
# Check JAR file exists
ls -la table-order-api/build/libs/*.jar

# Verify JAR is executable
java -jar table-order-api/build/libs/table-order-api-0.0.1-SNAPSHOT.jar --help
```

### Frontend
```bash
# Check dist directories
ls -la customer-ordering-app/dist/
ls -la store-management-app/dist/

# Verify index.html exists
cat customer-ordering-app/dist/index.html | head -5
cat store-management-app/dist/index.html | head -5
```

---

## Troubleshooting

### Gradle Build Fails with "Java version not supported"
- **Cause**: Wrong Java version
- **Solution**: 
  ```bash
  # Check Java version
  java -version
  
  # Install Java 17 (macOS)
  brew install openjdk@17
  export JAVA_HOME=/opt/homebrew/opt/openjdk@17
  ```

### npm install Fails with "EACCES permission denied"
- **Cause**: npm cache permission issue
- **Solution**:
  ```bash
  sudo chown -R $(whoami) ~/.npm
  npm cache clean --force
  npm install
  ```

### Flyway Migration Fails
- **Cause**: Database not running or wrong credentials
- **Solution**:
  ```bash
  # Check database connection
  psql -h localhost -U postgres -d tableorder -c "SELECT 1"
  
  # Verify environment variables
  echo $DATABASE_URL
  ```

### TypeScript Build Errors
- **Cause**: Type mismatches or missing dependencies
- **Solution**:
  ```bash
  # Clean and rebuild
  rm -rf node_modules
  npm install
  npm run build
  ```
