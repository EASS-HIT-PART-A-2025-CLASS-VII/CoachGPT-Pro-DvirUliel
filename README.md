# 🏋️‍♂️ CoachGPT Pro – Backend

The backend for **CoachGPT Pro**, a full-stack AI workout planning system.  
This Node.js + TypeScript server handles user authentication, workout generation, exercise management, and history tracking using a microservices-style architecture.

---

## 🚀 Tech Stack

- **Backend:** Node.js, TypeScript, Express.js  
- **Database:** PostgreSQL  
- **Architecture:** Microservices (Auth, Plan, Exercise)  
- **Security:** JWT, bcrypt, helmet, CORS

---

## 📁 Project Structure

```
/Backend
  /controllers
  /routes
  /services
  /utils
  .env.example
  server.ts
```

---

## 📦 Features

### ✅ Authentication
- `POST /auth/register` – Register a user  
- `POST /auth/login` – Login and receive JWT  
- `DELETE /auth/delete/:userId` – Delete user  

### 🏋️‍♀️ Workout Plans
- `POST /plan/generate` – Generate 4-week plan  
- `GET /plan/user/:userId` – Get latest plan for user  
- `GET /plan/:planId` – Get plan by ID  
- `PATCH /plan/:planId/swap-exercise` – Swap an exercise  
- `PATCH /plan/:planId/add-exercise` – Add exercise to plan  
- `PATCH /plan/:planId/delete-exercise` – Remove exercise from plan  
- `DELETE /plan/:planId/delete-plan` – Delete plan  
- `GET /plan/:planId/actions` – Get action history  

### 🧠 Exercises
- `GET /exercises` – Retrieve all available exercises  

---

## 🧪 Full CRUD + Utility Request Examples

Each request below uses a valid UUID format:
`d290f1ee-6c54-4b01-90e6-d701748f0851`

---

### 🔐 AUTHENTICATION ROUTES

#### ✅ Register a user  
`POST /auth/register`
```json
{
  "name": "John Doe",
  "email": "john@example.com",
  "password": "123456"
}
```

#### ✅ Login  
`POST /auth/login`
```json
{
  "email": "john@example.com",
  "password": "123456"
}
```

#### ❌ Delete user  
`DELETE /auth/delete/d290f1ee-6c54-4b01-90e6-d701748f0851`

---

### 🧠 EXERCISES ROUTES

#### ✅ Get all exercises  
`GET /exercises`

---

### 🏋️‍♂️ WORKOUT PLAN ROUTES

#### 🆕 Generate a 4-week plan  
`POST /plan/generate`
```json
{
  "userId": "d290f1ee-6c54-4b01-90e6-d701748f0851",
  "goal": "hypertrophy",
  "daysPerWeek": 4,
  "difficultyLevel": "intermediate"
}
```

#### 📥 Get latest plan by user ID  
`GET /plan/user/d290f1ee-6c54-4b01-90e6-d701748f0851`

#### 📥 Get plan by plan ID  
`GET /plan/f47ac10b-58cc-4372-a567-0e02b2c3d479`

#### 🔁 Swap exercise (in specific week or full program)  
`PATCH /plan/f47ac10b-58cc-4372-a567-0e02b2c3d479/swap-exercise`
```json
{
  "currentExercise": "Push-Up",
  "newExercise": "Incline Push-Up",
  "weekNumber": 2
}
```

#### ➕ Add new exercise to a plan  
`PATCH /plan/f47ac10b-58cc-4372-a567-0e02b2c3d479/add-exercise`
```json
{
  "weekNumber": 2,
  "muscleGroup": "chest",
  "newExercise": "Cable Crossover"
}
```

#### ➖ Delete exercise from a plan  
`PATCH /plan/f47ac10b-58cc-4372-a567-0e02b2c3d479/delete-exercise`
```json
{
  "weekNumber": 2,
  "muscleGroup": "chest",
  "exerciseToDelete": "Push-Up"
}
```

#### ❌ Delete entire plan  
`DELETE /plan/f47ac10b-58cc-4372-a567-0e02b2c3d479/delete-plan`

#### 📜 Get action history for a plan  
`GET /plan/f47ac10b-58cc-4372-a567-0e02b2c3d479/actions`

---

✅ All UUIDs follow your validation:
```ts
export const isValidUUID = (uuid: string): boolean => {
  return /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/.test(uuid);
};
```

Use Postman, Thunder Client, or fetch from frontend to test each route.

---

## 🔒 Security Practices

- ✅ JWT tokens for auth  
- ✅ Password hashing with `bcrypt`  
- ✅ CORS + Helmet for security headers  
- ✅ `.env` for secret management (see `.env.example`)  

---

## 📌 Future Improvements

- Protect routes with authentication middleware  
- Add pagination to plan and exercise results  
- Build admin dashboard for managing exercises  

---

## ✅ Final Note

CoachGPT Pro backend is complete and ready for production 🚀  
Pull requests and contributions are welcome!
