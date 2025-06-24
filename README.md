# 🏋️‍♂️ CoachGPT Pro – Full Stack Fitness Platform

[![Node.js](https://img.shields.io/badge/Node.js-18+-green.svg)](https://nodejs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.0+-blue.svg)](https://www.typescriptlang.org/)
[![React](https://img.shields.io/badge/React-18+-61DAFB.svg)](https://reactjs.org/)
[![PostgreSQL](https://img.shields.io/badge/PostgreSQL-15+-336791.svg)](https://www.postgresql.org/)
[![Docker](https://img.shields.io/badge/Docker-Compose-2496ED.svg)](https://www.docker.com/)
[![Tests](https://img.shields.io/badge/Tests-54%20Passing-brightgreen.svg)](#testing--quality)
[![License](https://img.shields.io/badge/License-MIT-yellow.svg)](LICENSE)

Professional workout planning system with **microservices architecture**, intelligent coaching assistant, and comprehensive Docker orchestration.

---

## 📺 Demo Video

Watch the complete platform walkthrough and see all features in action:

[![CoachGPT Pro Demo](https://img.youtube.com/vi/QXBf0hHZCNw/maxresdefault.jpg)](https://www.youtube.com/watch?v=QXBf0hHZCNw)

**[► View Full Demo on YouTube](https://www.youtube.com/watch?v=QXBf0hHZCNw)**

---

## 🚀 Quick Start

```bash
# Clone repository
git clone https://github.com/EASS-HIT-PART-A-2025-CLASS-VII/CoachGPT-Pro-DvirUliel.git
cd CoachGPT-Pro-DvirUliel

# Setup environment files (see Configuration section)
cp backend/.env
cp llm/.env  
cp frontend/.env

# Start all services
docker-compose up -d
```

**🌐 Access Points:**
- **Frontend:** http://localhost:3001
- **Backend API:** http://localhost:5002  
- **Coaching Service:** http://localhost:5003
- **Ollama Engine:** http://localhost:11434

---

## 🎯 Project Overview

### **What is CoachGPT Pro?**
A production-ready fitness platform built with modern microservices architecture, featuring intelligent workout planning, real-time AI coaching, and comprehensive progress tracking.

### **Key Achievements:**
- ✅ **54 Passing Tests** (36 Backend + 18 LLM Service)
- ✅ **5 Microservices** orchestrated with Docker
- ✅ **105+ Exercise Database** across 7 muscle groups
- ✅ **Real-time AI Chat** with Ollama integration
- ✅ **Progressive Overload** workout algorithms
- ✅ **Production Security** (JWT, Rate limiting, CORS)

---

## 🏗️ Architecture & Tech Stack

### **Technology Stack**
```
Frontend:     React 18 + TypeScript + Tailwind CSS
Backend:      Node.js + Express + TypeScript  
Database:     PostgreSQL 15
AI Engine:    Ollama (llama3.2:3b)
Deployment:   Docker + Docker Compose
Testing:      Jest + Integration Tests
Security:     JWT + bcrypt + Helmet + CORS
```

### **Microservices Architecture**
```
┌─────────────────────────────────────────────────────────────────────────────┐
│                            CoachGPT Pro Platform                            │
└─────────────────────────────────────────────────────────────────────────────┘

                           ┌─────────────────┐
                           │  React Frontend │
                           │  (TypeScript)   │
                           │  Port: 3001     │
                           └─────────┬───────┘
                                     │
                     ┌───────────────┼───────────────┐
                     │               │               │
                     ▼               │               ▼
           ┌─────────────────┐       │     ┌─────────────────┐
           │ Backend API     │       │     │   LLM Service   │
           │ Service         │       │     │   Port: 5003    │
           │ Port: 5002      │       │     │                 │
           └─────────┬───────┘       │     └─────────┬───────┘
                     │               │               │
                     ▼               │               ▼
           ┌─────────────────┐       │     ┌─────────────────┐
           │   PostgreSQL    │       │     │  Ollama Engine  │
           │   Database      │       │     │  llama3.2:3b    │
           │   Port: 5433    │       │     │  Port: 11434    │
           └─────────────────┘       │     └─────────────────┘
```

### **Service Responsibilities**
| Service | Purpose | Technology | Port |
|---------|---------|------------|------|
| **Frontend** | User Interface | React + TypeScript | 3001 |
| **Backend API** | Business Logic + Auth | Node.js + Express | 5002 |
| **LLM Service** | AI Chat Interface | Node.js + Ollama | 5003 |
| **PostgreSQL** | Data Persistence | PostgreSQL 15 | 5433 |
| **Ollama** | AI Model Engine | llama3.2:3b | 11434 |

---

## 🎯 Core Features

### **🏋️‍♀️ Smart Workout Planning**
- **Progressive Overload Algorithm**: 4-week cycles with automated progression
- **105+ Exercise Database**: 7 muscle groups × 3 difficulty levels
- **Equipment Flexibility**: Bodyweight, Dumbbell, Barbell, Machine, Cable, Band
- **Muscle Split Logic**: Strategic pairing (Chest+Triceps, Back+Biceps, etc.)

### **🤖 AI Coaching Assistant**
- **Real-time Chat**: Powered by Ollama llama3.2:3b model
- **Streaming Responses**: Server-sent events for instant feedback
- **Context-aware**: Understands fitness terminology and user goals
- **Rate Limited**: 10 requests/minute for optimal performance

### **📊 Progress Tracking**
- **Plan Modifications**: Add/Swap/Remove exercises with history
- **Exercise Library**: Advanced filtering and search capabilities
- **Visual Progress**: Week-by-week progression visualization

### **🔒 Enterprise Security**
- **JWT Authentication**: Secure token-based auth
- **Input Validation**: Joi schema validation
- **CORS Protection**: Configured origins and credentials
- **Rate Limiting**: Per-user request throttling
- **UUID-based**: Secure user identification

---

## 🧪 Testing & Quality

### **Test Coverage Overview**
```bash
✅ Backend API Tests:     36/36 passing
✅ Coaching Service:      18/18 passing  
✅ Frontend Components:   All passing
✅ Docker Integration:    test-docker.sh scripts verify connectivity
✅ Total Test Suite:      54 tests passing
```

### **Testing Strategy**
- **Unit Tests**: Individual service components
- **Integration Tests**: Cross-service communication
- **Docker Integration**: test-docker.sh scripts in backend and llm directories
- **Health Checks**: Service availability validation
- **Container Tests**: Container orchestration verification

### **Quality Metrics**
- **TypeScript Coverage**: 100% across all services
- **Error Handling**: Comprehensive try-catch blocks
- **Logging**: Structured logging with Winston
- **Code Organization**: Clean architecture patterns

---

## 🌐 API Documentation

### **Backend API Service (Port 5002)**
#### **Authentication Endpoints**
```http
POST /auth/register          # User registration
POST /auth/login             # User authentication  
DELETE /auth/delete/:userId  # Account deletion
```

#### **Workout Plan Endpoints**
```http
POST /plan/generate                    # Create workout plan
GET /plan/user/:userId                 # Get user's latest plan
GET /plan/:planId                      # Get specific plan
PATCH /plan/:planId/swap-exercise      # Swap exercise
PATCH /plan/:planId/add-exercise       # Add exercise
PATCH /plan/:planId/delete-exercise    # Remove exercise
DELETE /plan/:planId/delete-plan       # Delete plan
GET /plan/:planId/actions              # Plan history
```

#### **Exercise Database**
```http
GET /exercises              # All exercises with filtering
```

#### **Health Monitoring**
```http
GET /health                 # System health + DB test
GET /ready                  # Kubernetes readiness
GET /live                   # Kubernetes liveness
```

### **Coaching Service (Port 5003)**
#### **AI Chat Endpoints**
```http
POST /chat                  # AI chat response (JSON)
POST /chat/stream          # AI chat response (streaming)
GET /chat/models           # Available models
```

#### **Service Health**
```http
GET /health                # Service health
GET /health/detailed       # Comprehensive status
GET /health/dependencies   # Dependencies status
GET /health/metrics        # Performance metrics
GET /health/test          # AI generation test
```

---

## 🗄️ Database Schema

### **Core Tables**
```sql
-- Users table with UUID-based identification
CREATE TABLE users (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    email VARCHAR(255) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    name VARCHAR(255) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Comprehensive exercise database
CREATE TABLE exercises (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    muscle_group VARCHAR(50) NOT NULL,
    difficulty VARCHAR(20) NOT NULL,
    equipment VARCHAR(50) NOT NULL,
    instructions TEXT
);

-- Workout plans with JSONB data
CREATE TABLE workout_plans (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES users(id),
    name VARCHAR(255) NOT NULL,
    difficulty VARCHAR(20) NOT NULL,
    days_per_week INTEGER NOT NULL,
    plan_data JSONB NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Plan modification tracking
CREATE TABLE plan_actions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    plan_id UUID REFERENCES workout_plans(id),
    action_type VARCHAR(20) NOT NULL,
    details JSONB NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

### **Data Relationships**
- **Users → Plans**: One-to-many relationship
- **Plans → Actions**: Audit trail for modifications
- **Exercises**: Standalone library with categorization
- **JSONB Usage**: Flexible plan data storage

---

## 🐳 Docker Deployment

### **Container Orchestration**
```yaml
# docker-compose.yml structure
services:
  frontend:        # React application
  backend:         # API service
  llm-service:     # Coaching assistant
  postgres:        # Database
  ollama:          # AI engine
```

### **Development Commands**
```bash
# Start all services
docker-compose up -d

# View logs
docker-compose logs -f [service-name]

# Health checks
docker-compose ps

# Stop services
docker-compose down

# Clean rebuild
docker-compose down -v && docker-compose up -d --build
```

### **Production Readiness**
- ✅ Health checks for all services
- ✅ Persistent volumes for data
- ✅ Environment variable configuration
- ✅ Network isolation
- ✅ Resource limits defined

---

## ⚙️ Configuration

### **Environment Setup**
Each service uses dedicated environment configuration:

#### **Backend Configuration (.env)**
```env
NODE_ENV=production
PORT=5002
DB_HOST=postgres
DB_NAME=coachgpt
DB_USER=postgres
DB_PASSWORD=secure_password_here
JWT_SECRET=your_jwt_secret_here
CORS_ORIGIN=http://localhost:3001
POSTGRES_HOST_AUTH_METHOD=md5
```

#### **LLM Service Configuration (.env)**
```env
NODE_ENV=development
PORT=5003
OLLAMA_URL=http://localhost:11434
OLLAMA_MODEL=llama3.2:3b
DEFAULT_TEMPERATURE=0.7
DEFAULT_MAX_TOKENS=500
LLM_TIMEOUT=70000
RATE_LIMIT_MAX_REQUESTS=20
ALLOWED_ORIGINS=http://localhost:3001,http://localhost:5002
```

#### **Frontend Configuration (.env)**
```env
NODE_ENV=production
PORT=3001
REACT_APP_BACKEND_URL=http://localhost:5002
REACT_APP_LLM_URL=http://localhost:5003
TSC_COMPILE_ON_ERROR=true
GENERATE_SOURCEMAP=false
```

### **Security Configuration**
- 🔒 All sensitive data in environment variables
- 🛡️ No hardcoded secrets in codebase
- 🎯 Service isolation with dedicated configs
- 📝 Example files provided for setup

---

## 🚀 Getting Started

### **Prerequisites**
- Docker & Docker Compose
- Node.js 18+ (for development)
- Git

### **Installation Steps**

1. **Clone Repository**
   ```bash
   git clone https://github.com/EASS-HIT-PART-A-2025-CLASS-VII/CoachGPT-Pro-DvirUliel.git
   cd CoachGPT-Pro-DvirUliel
   ```

2. **Environment Setup**
   ```bash
   # Create environment files from examples
   cp backend/.env
   cp llm/.env
   cp frontend/.env
   
   # Edit passwords and secrets in .env files
   nano backend/.env  # Update DB_PASSWORD and JWT_SECRET
   ```

3. **Start Services**
   ```bash
   # Launch all services
   docker-compose up -d
   
   # Wait for Ollama model download (first run)
   docker-compose logs -f ollama
   ```

4. **Verify Installation**
   ```bash
   # Run integration tests
   cd backend && ./test-docker.sh
   cd ../llm && ./test-docker.sh
   
   # Check all services are running
   docker-compose ps
   ```

5. **Access Application**
   - Frontend: http://localhost:3001
   - Backend API: http://localhost:5002/health
   - Coaching Service: http://localhost:5003/health

### **Development Mode**
```bash
# Backend development
cd backend && npm install && npm run dev

# LLM service development  
cd llm && npm install && npm run dev

# Frontend development
cd frontend && npm install && npm start
```

---

## 🎯 Key Technical Achievements

### **Advanced Architecture Patterns**
- **Microservices**: Complete service separation with Docker
- **Singleton Pattern**: LLM service instance management  
- **MVC Pattern**: Clean backend code organization
- **Repository Pattern**: Database abstraction layer

### **Performance Optimizations**
- **Connection Pooling**: Efficient database connections
- **Response Caching**: Reduced API call overhead
- **Async Streams**: Real-time AI response delivery
- **Memory Management**: Proper resource cleanup

### **Production Features**
- **Health Monitoring**: Multi-level service checks
- **Graceful Shutdown**: Clean service termination
- **Error Boundaries**: Comprehensive error handling
- **Request Validation**: Input sanitization and validation

### **Security Implementation**
- **JWT Authentication**: Stateless token verification
- **Rate Limiting**: DDoS protection and resource management
- **CORS Configuration**: Cross-origin request security
- **Input Validation**: SQL injection and XSS prevention

---

## 📊 Project Statistics

### **Codebase Metrics**
- **Total Lines of Code**: ~8,000+ lines
- **TypeScript Coverage**: 100%
- **Services**: 5 microservices
- **API Endpoints**: 20+ RESTful endpoints
- **Database Tables**: 4 core tables
- **Test Cases**: 54 comprehensive tests

### **Features Implemented**
- ✅ User Authentication & Authorization
- ✅ Workout Plan Generation Algorithm
- ✅ Exercise Database Management
- ✅ Real-time AI Chat Interface
- ✅ Plan Modification Tracking
- ✅ Health Monitoring System
- ✅ Docker Orchestration
- ✅ Responsive Frontend UI

---

## 🔮 Future Enhancements

### **Planned Features**
- 📊 **Analytics Dashboard**: Progress tracking and insights
- 📱 **Mobile App**: React Native implementation
- 🔗 **Wearable Integration**: Fitness tracker connectivity
- 🎯 **Nutrition Tracking**: Meal planning and calorie counting
- 👥 **Social Features**: Community and sharing capabilities

### **Technical Roadmap**
- 🚀 **CI/CD Pipeline**: GitHub Actions implementation
- 📈 **Monitoring**: Prometheus + Grafana setup
- 🔒 **Advanced Security**: OAuth2 and 2FA
- ⚡ **Performance**: Redis caching layer
- 🌐 **Scalability**: Kubernetes deployment

---

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

---

## 👨‍💻 Developer

**Dvir Uliel**  
Full Stack Developer | AI Enthusiast

- 🎓 Student at HIT (Holon Institute of Technology)
- 💼 Course: Engineering of Advanced SW Solutions Part A
- 🚀 Focus: Microservices Architecture & AI Integration

---

## 🙏 Acknowledgments

- **Course Instructor**: Dr. Yossi Eliaz
- **Discord Community**: Collaborative learning and problem-solving support
- **Open Source Libraries**: Built on the shoulders of giants
- **Ollama Team**: Excellent local AI model deployment solution

---

**CoachGPT Pro - Where Technology Meets Fitness Excellence! 🚀**
