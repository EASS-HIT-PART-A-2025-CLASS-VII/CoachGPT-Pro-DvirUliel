# 🏋️‍♂️ CoachGPT Pro – Full Stack AI Fitness Platform

AI-powered workout planning system with **microservices architecture**, real-time AI chat, and comprehensive Docker orchestration.

---

## 🚀 Tech Stack

- **Backend:** Node.js, TypeScript, Express.js  
- **Database:** PostgreSQL
- **AI Engine:** Ollama with llama3.2:3b model
- **Frontend:** React, TypeScript, Tailwind CSS
- **Architecture:** Microservices (Backend API, LLM Service, Frontend, PostgreSQL, Ollama)  
- **Security:** JWT, bcrypt, helmet, CORS, rate limiting
- **Testing:** Jest + Docker integration tests
- **Containerization:** Docker + Docker Compose

---

## 🏗️ Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                    CoachGPT Pro Platform                   │
├─────────────────────────────────────────────────────────────┤
│  🎯 Frontend (React)     │  🔧 Backend API Service          │
│  Port: 3001              │  Port: 5002                      │
│                          │  ├── 🔐 Auth Controller          │
│                          │  ├── 🏋️‍♀️ Plan Controller          │
│                          │  ├── 🧠 Exercise Controller       │
│                          │  └── 🩺 Health Controller        │
├─────────────────────────────────────────────────────────────┤
│  🤖 LLM Service          │  🧠 Ollama AI Engine             │
│  Port: 5003              │  Port: 11434                     │
│  ├── Chat API            │  ├── llama3.2:3b Model          │
│  ├── Streaming           │  ├── Model Management            │
│  ├── Singleton Pattern   │  └── Inference Engine            │
│  └── Health Checks       │                                  │
├─────────────────────────────────────────────────────────────┤
│  📊 PostgreSQL Database (Port: 5433)                       │
└─────────────────────────────────────────────────────────────┘
```

**Microservices:**
- **Backend API Service**: User management, workout plans, exercise database, health monitoring
- **LLM Service**: AI chat interface with streaming responses and Ollama integration
- **Frontend Service**: React TypeScript application with interactive UI and real-time features
- **Supporting Services**: PostgreSQL database, Ollama AI engine

---

## 🗄️ Backend Service & Database Integration

### **How Backend Works with PostgreSQL**
The Backend API service maintains a direct connection to PostgreSQL for all fitness data management:

```
Backend API ← → PostgreSQL Database
    ↓              ↓
Controllers    Data Tables
Routes         Indexing
Services       Relationships
```

### **Database Schema**
**Core Tables:**
- **Users**: Authentication and profile management (UUID-based)
- **Exercises**: Comprehensive exercise database (105+ exercises across 7 muscle groups)
- **Workout Plans**: Generated workout programs with JSONB plan data
- **Plan Actions**: Activity tracking for plan modifications (add/swap/remove)

### **Exercise Database Structure**
- **7 Muscle Groups**: Chest, Back, Legs, Shoulders, Core, Biceps, Triceps
- **3 Difficulty Levels**: Beginner, Intermediate, Advanced (15 exercises per muscle group)
- **Equipment Types**: Bodyweight, Dumbbell, Barbell, Machine, Cable, Band

### **Workout Plan Generation Logic**
**Progressive Overload System:**
```javascript
DIFFICULTY_CONFIG = {
  beginner: { sets: 3, reps: 10 },
  intermediate: { sets: 3, reps: 8 },
  advanced: { sets: 3, reps: 6 }
}

// Weekly progression:
Week 1: Base sets/reps
Week 2: +2 reps
Week 3: +1 set  
Week 4: +2 reps, +1 set
```

**Plan Structure:**
- **Program Duration**: 4-week cycles with progressive overload
- **Workout Days**: 1-7 days per week (4 recommended) based on user preference
- **Exercise Selection**: 5 exercises per day
  - 3 Primary muscle group exercises
  - 2 Secondary muscle group exercises
- **Muscle Split Logic**: Strategic pairing of complementary muscle groups
  - **Chest** (primary) + **Triceps** (secondary)
  - **Back** (primary) + **Biceps** (secondary)  
  - **Legs** (primary) + **Core** (secondary)
  - **Shoulders** (primary) + **Core** (secondary)
- **Smart Distribution**: Balanced muscle group targeting across the week

### **Plan Actions Tracking**
Real-time monitoring of user plan modifications:
- **Add Exercise**: Insert new exercises to existing workout days
- **Swap Exercise**: Replace exercises with suitable alternatives
- **Remove Exercise**: Delete exercises with automatic rebalancing
- **History Logging**: Complete audit trail of all plan changes

---

## 🤖 LLM Service & Ollama Integration

### **How It Works**
The LLM service acts as an intelligent middleware between your application and the Ollama AI engine:

```
Frontend → LLM Service → Ollama Engine → llama3.2:3b Model
    ↑          ↓             ↓              ↓
   User    Rate Limit    Model Load     AI Response
  Input    Validation   & Inference    Generation
```

### **Key Features**
- **Singleton Design Pattern**: Single LLMService instance across the application
- **Model**: `llama3.2:3b` - Optimized for fitness coaching conversations
- **Streaming Responses**: Real-time AI chat with server-sent events
- **Rate Limiting**: 10 requests per minute per user
- **Health Monitoring**: Comprehensive health checks for both LLM service and Ollama
- **Automatic Initialization**: Model warm-up and readiness validation

### **Ollama Service**
- **Container**: `ollama/ollama:latest`
- **Model Storage**: Persistent volume for model data
- **API**: RESTful interface for model management
- **Health Checks**: Model availability validation
- **Configuration**: Supports model pulling and switching

---

## 🎯 Frontend Service & User Interface

### **How Frontend Integrates with Services**
The Frontend service orchestrates all backend functionality through a modern React TypeScript application:

```
Frontend (React + TypeScript) ← → Backend API Service ← → PostgreSQL
         ↓                              
    Tailwind CSS                  
    Interactive UI                
         ↓
         ← → LLM Service ← → Ollama AI
             Streaming Chat
```

### **Frontend Technology Stack**
- **Framework**: React 18 with TypeScript for type-safe development
- **Styling**: Tailwind CSS for responsive, utility-first design
- **UI Components**: Custom component library with consistent design system
- **State Management**: React hooks and context for real-time state synchronization
- **Real-time Features**: Server-sent events for streaming AI responses
- **Responsive Design**: Mobile-first approach with desktop optimization

### **Application Pages & Features**

#### **🏠 Home Dashboard**
- **Welcome Interface**: Personalized greeting with user profile integration
- **Quick Actions**: Direct access to workout plan generation and AI coach
- **Platform Statistics**: Live metrics (125+ exercises, unlimited plans, 24/7 support)
- **Feature Cards**: Interactive navigation to all major platform sections
- **Progress Overview**: Visual summary of user's fitness journey

#### **🏋️‍♀️ Workout Plan Management**
- **Plan Generation**: Smart workout creation with difficulty and schedule selection
- **4-Week Program View**: Progressive overload visualization with week-by-week progression
- **Exercise Details**: Individual exercise cards with sets, reps, difficulty, and muscle groups
- **Plan Modification**: Real-time exercise swapping, adding, and removal with instant updates
- **History Tracking**: Complete audit trail of all plan modifications through modal interface

#### **🤖 AI Fitness Coach**
- **Real-time Chat**: Streaming AI responses powered by llama3.2:3b model
- **Conversation Interface**: Modern chat UI with message history and typing indicators
- **Quick Suggestions**: Pre-built fitness questions for instant advice
- **Online Status**: Live connection indicator to LLM service
- **Personalized Guidance**: Context-aware fitness coaching and form guidance

#### **🧠 Exercise Library**
- **Comprehensive Database**: 105+ exercises across 7 muscle groups
- **Advanced Filtering**: Multi-criteria search by muscle group, difficulty, and equipment
- **Exercise Cards**: Detailed information with difficulty badges and muscle targeting
- **Smart Search**: Real-time filtering with instant results
- **Equipment Categorization**: Filter by bodyweight, dumbbell, barbell, machine, cable, band

#### **📊 Plan Archive** *(Coming Soon)*
- **Historical Plans**: View and manage past workout programs
- **Plan Duplication**: Copy successful routines for future use
- **Progress Analytics**: Performance tracking and journey visualization
- **Data Export**: Download workout history and progress reports

### **User Experience Features**
- **Responsive Design**: Seamless experience across desktop, tablet, and mobile devices
- **Real-time Updates**: Instant synchronization of plan changes and AI responses
- **Intuitive Navigation**: Clean sidebar navigation with active state indicators
- **Loading States**: Smooth loading animations and progress indicators
- **Error Handling**: User-friendly error messages with recovery suggestions
- **Accessibility**: WCAG-compliant design with keyboard navigation support

### **State Management & Data Flow**
- **API Integration**: RESTful communication with Backend API service
- **WebSocket Connections**: Real-time streaming for AI chat functionality
- **Local State**: Efficient React hooks for component-level state management
- **Global Context**: User authentication and session management
- **Error Boundaries**: Graceful error handling and recovery mechanisms

---

## 🏗️ Code Architecture

### **Backend API Service**
Organized with Express.js MVC pattern containing controllers for Auth, Plan, Exercise, and Health management with PostgreSQL integration.

### **LLM Service Structure**
Built with clean architecture principles:
- **Controllers**: Handle HTTP requests for chat and health endpoints
- **Routes**: Define API endpoints with proper middleware integration
- **Services**: Implement core business logic with Singleton pattern for LLM operations
- **Middlewares**: Provide validation, rate limiting, error handling, and logging
- **Tests**: Comprehensive unit testing covering all service functionality

All source code is organized in `/src` directories with dedicated `/tests` folders for each service.

---

## 🧪 Testing & Quality

✅ **All Tests Passing**
- **Backend Tests**: 36 of 36 passing (Auth, Health, Exercise, Plan services)
- **LLM Service Tests**: 18 of 18 passing (Chat functionality, health checks, streaming)
- **Frontend Tests**: React components tested
- **Docker Integration**: `test-docker.sh` validates all service connectivity
  - PostgreSQL connection validation
  - Ollama model availability checks
  - API endpoint health verification

```bash
# Backend tests
cd backend && npm test

# LLM service tests  
cd llm && npm test

# Frontend tests
cd frontend && npm test

# Docker integration tests
# Backend + PostgreSQL
cd backend && ./test-docker.sh
# LLM Service + Ollama  
cd llm && ./test-docker.sh

# Coverage reports
npm run test:coverage
```

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

## ⚙️ Configuration

### **Backend Service Environment**
```env
NODE_ENV=production
PORT=5002
DB_HOST=postgres
DB_NAME=coachgpt
JWT_SECRET=your_secret_key
```

### **LLM Service Environment**
```env
NODE_ENV=production
PORT=5003
OLLAMA_URL=http://ollama:11434
OLLAMA_MODEL=llama3.2:3b
DEFAULT_TEMPERATURE=0.7
DEFAULT_MAX_TOKENS=200
LLM_TIMEOUT=70000
RATE_LIMIT_MAX_REQUESTS=10
```

### **Frontend Service Environment**
```env
NODE_ENV=production
PORT=3001
REACT_APP_BACKEND_URL=http://localhost:5002
REACT_APP_LLM_URL=http://localhost:5003
TSC_COMPILE_ON_ERROR=true
GENERATE_SOURCEMAP=false
```

### **Ollama Configuration**
```env
OLLAMA_HOST=0.0.0.0:11434
OLLAMA_ORIGINS=*
```

---

## 🔒 Security Features

- **JWT Authentication**: Secure token-based auth for backend API
- **Rate Limiting**: 10 requests/minute per user for LLM service
- **Input Validation**: Joi schema validation for all endpoints
- **CORS Protection**: Configured origins and credentials
- **Helmet.js**: Security headers for all services
- **UUID Validation**: Strict user ID format enforcement

---

## 🚀 Getting Started

```bash
# 1. Clone and navigate to project
git clone <repository>
cd CoachGPT-Pro

# 2. Start all services with Docker
docker-compose up -d

# 3. Wait for Ollama to download model (first run only)
docker-compose logs -f ollama

# 4. Verify all services are healthy
# Backend + PostgreSQL
cd backend && ./test-docker.sh
# LLM Service + Ollama  
cd llm && ./test-docker.sh

# 5. Access the application
# Frontend: http://localhost:3001
# Backend API: http://localhost:5002
# LLM Service: http://localhost:5003
# Ollama: http://localhost:11434
```

### **Development Setup**
```bash
# Backend development
cd backend
npm install
npm run dev

# LLM service development  
cd llm
npm install
npm run dev

# Frontend development
cd frontend
npm install
npm start
```

---

## 🎯 Key Technical Features

### **LLM Service Architecture**
- **Singleton Pattern**: Single LLMService instance with proper initialization
- **Async Streaming**: Real-time AI responses using Node.js streams
- **Health Monitoring**: Multi-level health checks (service, Ollama, model)
- **Error Handling**: Comprehensive error middleware with proper HTTP codes
- **Request Validation**: Joi schema validation for chat requests

### **Ollama Integration**
- **Model Management**: Automatic model pulling and initialization
- **Health Checks**: Continuous monitoring of Ollama service availability
- **Model Warm-up**: Pre-loading for faster first responses
- **Timeout Handling**: Configurable timeouts for inference requests

### **Performance Optimizations**
- **Connection Pooling**: Efficient HTTP connections to Ollama
- **Response Caching**: Health check caching to reduce API calls
- **Memory Management**: Proper cleanup and resource management
- **Graceful Shutdown**: Clean service termination handling

---

## ✅ Status

🟢 **Production Ready**
- ✅ All backend unit tests passing (36 tests)
- ✅ LLM service tests passing (18 tests)
- ✅ Frontend React components tested
- ✅ Docker multi-service orchestration working
- ✅ Ollama AI engine operational with llama3.2:3b
- ✅ Security best practices implemented
- ✅ Comprehensive health monitoring
- ✅ Real-time streaming AI responses

**CoachGPT Pro platform is ready for production deployment! 🚀**