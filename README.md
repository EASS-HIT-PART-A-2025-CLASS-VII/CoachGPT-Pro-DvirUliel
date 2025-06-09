# 🏋️‍♂️ CoachGPT Pro – Backend

AI-powered workout planning system with **microservices architecture**, comprehensive testing, and Docker support.

---

## 🚀 Tech Stack

- **Backend:** Node.js, TypeScript, Express.js  
- **Database:** PostgreSQL + Redis cache
- **Architecture:** Microservices (Auth, Plan, Exercise, Health)  
- **Security:** JWT, bcrypt, helmet, CORS
- **Testing:** Jest + Docker integration tests
- **Containerization:** Docker + Docker Compose

---

## 🏗️ Architecture

```
┌─────────────────────────────────────────────┐
│            CoachGPT Pro Backend             │
├─────────────────────────────────────────────┤
│  🔐 Auth Service    │ 🏋️‍♀️ Plan Service      │
│  🧠 Exercise Service│ 🩺 Health Service    │
│  📊 Database Layer                          │
└─────────────────────────────────────────────┘
```

**Services:**
- **Auth Service**: User registration, login, JWT management
- **Plan Service**: AI workout generation, plan modification 
- **Exercise Service**: Exercise database, muscle group management
- **Health Service**: System health checks, Kubernetes probes

---

## 📁 Project Structure

```
/Backend
├── /src
│   ├── /controllers     # API route handlers  
│   ├── /db             # Database connection & queries
│   ├── /routes         # Express route definitions
│   └── /utils          # Helper functions & validation
├── /tests              # Unit tests (Auth, Health, Exercise, Plan)
├── server.ts           # Main application entry point
├── .env                # Environment variables (gitignored)
├── .env.docker         # Docker environment config (gitignored)
├── .env.test           # Test environment config (gitignored)
├── .dockerignore       # Docker ignore patterns
├── Dockerfile          # Container definition
├── docker-compose.yml  # Multi-container orchestration
├── test-docker.sh      # Docker connectivity tests
├── jest.config.js      # Jest testing configuration
├── tsconfig.json       # TypeScript configuration
├── package.json        # Dependencies & scripts
├── package-lock.json   # Dependency lock file
├── init.sql            # Database initialization
└── setup_database.sql  # Database schema setup
```

---

## 🧪 Testing & Quality

✅ **All Tests Passing**
- Unit Tests: 36 passing (Auth, Health, Exercise, Plan services)
- **`test-docker.sh`**: Docker connectivity & health checks
  - PostgreSQL connection validation
  - Redis cache verification
  - API endpoint health checks

```bash
npm test                # Run all tests
./test-docker.sh       # Docker integration tests
npm run test:coverage  # Coverage report
```

---

## 🌐 API Endpoints

| Service | Method | Endpoint | Description |
|---------|--------|----------|-------------|
| **🩺 Health** | GET | `/health` | System health with DB test |
| | GET | `/ready` | Kubernetes readiness probe |
| | GET | `/live` | Kubernetes liveness probe |
| **🔐 Auth** | POST | `/auth/register` | Register new user |
| | POST | `/auth/login` | User login with JWT |
| | DELETE | `/auth/delete/:userId` | Delete user account |
| **🏋️‍♀️ Plans** | POST | `/plan/generate` | Generate AI workout plan |
| | GET | `/plan/user/:userId` | Get user's latest plan |
| | GET | `/plan/:planId` | Get specific plan by ID |
| | PATCH | `/plan/:planId/swap-exercise` | Swap exercise in plan |
| | PATCH | `/plan/:planId/add-exercise` | Add exercise to plan |
| | PATCH | `/plan/:planId/delete-exercise` | Remove exercise from plan |
| | DELETE | `/plan/:planId/delete-plan` | Delete entire plan |
| | GET | `/plan/:planId/actions` | Get plan action history |
| **🧠 Exercises** | GET | `/exercises` | Get all available exercises |

### Example Request:
```http
POST /plan/generate
Authorization: Bearer {jwt_token}

{
  "userId": "d290f1ee-6c54-4b01-90e6-d701748f0851",
  "goal": "hypertrophy",
  "daysPerWeek": 4,
  "difficultyLevel": "intermediate"
}
```

---

## 🐳 Docker Quick Start

```bash
# Start all services
docker-compose up -d

# Run health checks
./test-docker.sh

# View logs
docker-compose logs -f backend
```

---

## 🔒 Security Features

- JWT authentication with secure tokens
- bcrypt password hashing (12 salt rounds)
- Rate limiting and CORS protection
- Input validation with UUID verification
- Helmet.js security headers

---

## 🚀 Getting Started

```bash
# Start Docker services from Project root (Backend + PostgreSQL + Redis)
docker-compose up -d

# Install dependencies
npm install

# Set up environment
cp .env.example .env

# Initialize database (ensure Docker DB is running)
npm run db:setup

# Run tests
npm test

# Start development
npm run dev
```

---

## ✅ Status

🟢 **Production Ready**
✅ **All unit tests passing**
- Docker integration verified  
- Security best practices implemented
- Comprehensive API documentation

**CoachGPT Pro backend is ready for production! 🚀**
