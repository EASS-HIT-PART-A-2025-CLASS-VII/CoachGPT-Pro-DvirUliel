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
cp backend/.env && cp llm/.env && cp frontend/.env

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
| **Frontend** | User Interface & UX | React + TypeScript | 3001 |
| **Backend API** | Business Logic + Auth | Node.js + Express | 5002 |
| **LLM Service** | AI Chat Interface | Node.js + Ollama | 5003 |
| **PostgreSQL** | Data Persistence | PostgreSQL 15 | 5433 |
| **Ollama** | AI Model Engine | llama3.2:3b | 11434 |

---

## 🎨 Frontend Application

### **React TypeScript Interface**
- **Pages**: Dashboard, Home, Workout Planning, AI Coach, Exercise Library, Plan Archive
- **State Management**: React hooks with Context API for real-time synchronization
- **Real-time Features**: Server-sent events for AI chat streaming
- **Responsive Design**: Mobile-first with Tailwind CSS
- **UX Features**: Loading states, error handling, instant plan modifications

### **User Experience**
- **Interactive Plan Management**: Add/swap/remove exercises with live updates
- **AI Chat Interface**: Streaming responses with typing indicators
- **Exercise Library**: Advanced filtering by muscle group, difficulty, equipment
- **Progress Tracking**: Visual plan progression and modification history

---

## 🗄️ Backend & Database Integration

### **Backend Architecture**
- **MVC Pattern**: Clean Controllers, Services, and Routes organization
- **Progressive Overload Algorithm**: 4-week cycles with automated progression
- **Exercise Database**: 105+ exercises across 7 muscle groups with smart categorization
- **Plan Management**: Real-time modifications with complete audit trail

### **Database Design**
```sql
-- Core schema with UUID security and JSONB flexibility
users (id, email, password_hash, name, created_at)
exercises (id, name, muscle_group, difficulty, equipment, instructions)  
workout_plans (id, user_id, name, difficulty, days_per_week, plan_data, created_at)
plan_actions (id, plan_id, action_type, details, created_at)
```

### **Key Features**
- **Progressive Overload**: Week 1 (base) → Week 2 (+2 reps) → Week 3 (+1 set) → Week 4 (peak)
- **Muscle Split Logic**: Strategic pairing (Chest+Triceps, Back+Biceps, Legs+Core)
- **Plan Modifications**: Add/Swap/Remove with intelligent rebalancing
- **Security**: JWT authentication, bcrypt hashing, input validation

---

## 🤖 LLM Service & AI Integration

### **Ollama Integration**
- **Singleton Architecture**: Single LLMService instance with model warm-up
- **Streaming Responses**: Real-time AI chat using Server-Sent Events
- **Model**: llama3.2:3b optimized for fitness coaching conversations
- **Rate Limiting**: 10 requests/minute with comprehensive health monitoring

### **AI Features**
- **Context-aware**: Understands fitness terminology and user goals
- **Health Checks**: Multi-level monitoring (service, Ollama, model availability)
- **Error Handling**: Robust timeout handling and graceful degradation
- **Container**: ollama/ollama:latest with persistent model storage

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

### **Quality Metrics**
- **TypeScript Coverage**: 100% across all services
- **Error Handling**: Comprehensive try-catch blocks
- **Code Organization**: Clean architecture patterns
- **Health Monitoring**: Multi-level service checks

---

---

## 🌐 API Endpoints

### **🔧 Backend API Service (Port 5002)**
| Method | Endpoint | Description |
|--------|----------|-------------|
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

### **🤖 LLM Service (Port 5003)**
| Method | Endpoint | Description |
|--------|----------|-------------|
| **💬 Chat** | POST | `/chat` | AI chat response (JSON) |
| | POST | `/chat/stream` | AI chat response (streaming) |
| | GET | `/chat/models` | Available Ollama models |
| **🩺 Health** | GET | `/health` | LLM service health |
| | GET | `/health/detailed` | Comprehensive status |
| | GET | `/health/ready` | Readiness probe |
| | GET | `/health/live` | Liveness probe |
| | GET | `/health/dependencies` | Service dependencies status |
| | GET | `/health/metrics` | Performance metrics |
| | GET | `/health/test` | AI generation test |

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

### **Quick Commands**
```bash
# Start all services
docker-compose up -d

# View logs
docker-compose logs -f [service-name]

# Health checks
docker-compose ps

# Clean rebuild
docker-compose down -v && docker-compose up -d --build
```

---

## ⚙️ Configuration

### **Environment Files Structure**
Each service uses its own `.env` file for configuration:

```
/CoachGPT-Pro
├── /backend/.env          # Backend + PostgreSQL config
├── /llm/.env              # LLM service config  
├── /frontend/.env         # Frontend config
└── docker-compose.yml     # Orchestration
```

### **Backend Service Environment**
```env
# backend/.env
NODE_ENV=production
PORT=5002
DB_HOST=postgres
DB_NAME=your_database_name
DB_USER=your_db_user
DB_PASSWORD=your_secure_password
JWT_SECRET=your_jwt_secret_here
CORS_ORIGIN=http://localhost:3001
POSTGRES_HOST_AUTH_METHOD=md5
```

### **LLM Service Environment**
```env
# llm/.env
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

### **Frontend Service Environment**
```env
# frontend/.env
NODE_ENV=production
PORT=3001
REACT_APP_BACKEND_URL=http://localhost:5002
REACT_APP_LLM_URL=http://localhost:5003
TSC_COMPILE_ON_ERROR=true
GENERATE_SOURCEMAP=false
```

### **Docker Configuration**
```env
# Docker automatically loads each service's .env file
# No shared secrets in docker-compose.yml
# All sensitive data isolated in service-specific .env files
```

### **Security Notes**
- 🔒 All `.env` files are git-ignored
- 🛡️ No hardcoded secrets in docker-compose.yml
- 🎯 Each service manages its own configuration
- 📝 Use `.env.example` files for development setup

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
   cp backend/.env && cp llm/.env && cp frontend/.env
   
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
   - LLM Service: http://localhost:5003/health

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

### **Technical Roadmap**
- 🚀 **CI/CD Pipeline**: GitHub Actions implementation
- 📈 **Monitoring**: Prometheus + Grafana setup
- 🔒 **Advanced Security**: OAuth2 and 2FA
- ⚡ **Performance**: Redis caching layer

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
