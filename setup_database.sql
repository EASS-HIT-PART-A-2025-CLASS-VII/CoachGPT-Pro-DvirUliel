-- Create all tables for CoachGPT Pro

-- Users table
CREATE TABLE users (
    id UUID PRIMARY KEY,
    name TEXT NOT NULL,
    email TEXT UNIQUE NOT NULL,
    password TEXT NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Exercises table
CREATE TABLE exercises (
    id SERIAL PRIMARY KEY,
    name TEXT NOT NULL,
    muscle_group TEXT NOT NULL,
    equipment TEXT NOT NULL,
    difficulty TEXT NOT NULL CHECK (difficulty IN ('beginner', 'intermediate', 'advanced')),
    substitute_for TEXT[] DEFAULT '{}'
);

-- Workout plans table
CREATE TABLE workout_plans (
    id SERIAL PRIMARY KEY,
    user_id UUID NOT NULL,
    goal TEXT NOT NULL,
    days_per_week INT,
    plan_data JSONB,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Plan action table
CREATE TABLE plan_action (
    id SERIAL PRIMARY KEY,
    plan_id INT NOT NULL,
    action_type TEXT NOT NULL, -- 'swap', 'add', 'delete'
    old_exercise TEXT, -- for swap or delete
    new_exercise TEXT, -- for swap or add
    week_number INT, -- optional, for tracking
    day_name TEXT, -- which day was changed
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Insert exercise data

-- CHEST exercises
INSERT INTO exercises (name, muscle_group, equipment, difficulty, substitute_for) VALUES
('Push-Up', 'chest', 'bodyweight', 'beginner', ARRAY['Bench Press']),
('Incline Push-Up', 'chest', 'bodyweight', 'beginner', ARRAY['Incline Bench Press']),
('Chest Fly Machine', 'chest', 'machine', 'beginner', ARRAY['Dumbbell Fly']),
('Resistance Band Press', 'chest', 'band', 'beginner', ARRAY['Push-Up']),
('Kneeling Cable Fly', 'chest', 'cable', 'beginner', ARRAY['Dumbbell Fly']),
('Dumbbell Bench Press', 'chest', 'dumbbell', 'intermediate', ARRAY['Bench Press']),
('Incline Dumbbell Press', 'chest', 'dumbbell', 'intermediate', ARRAY['Incline Bench Press']),
('Dumbbell Fly', 'chest', 'dumbbell', 'intermediate', ARRAY['Chest Fly Machine']),
('Barbell Bench Press', 'chest', 'barbell', 'intermediate', ARRAY['Push-Up']),
('Incline Barbell Bench Press', 'chest', 'barbell', 'intermediate', ARRAY['Incline Push-Up']),
('Clap Push-Up', 'chest', 'bodyweight', 'advanced', ARRAY['Push-Up']),
('Ring Push-Up', 'chest', 'bodyweight', 'advanced', ARRAY['Push-Up']),
('Weighted Dip', 'chest', 'bodyweight', 'advanced', ARRAY['Dips']),
('One-Arm Push-Up', 'chest', 'bodyweight', 'advanced', ARRAY['Push-Up']),
('Barbell Guillotine Press', 'chest', 'barbell', 'advanced', ARRAY['Bench Press']);

-- BACK exercises
INSERT INTO exercises (name, muscle_group, equipment, difficulty, substitute_for) VALUES
('Lat Pulldown', 'back', 'machine', 'beginner', ARRAY['Pull-Up']),
('Seated Row Machine', 'back', 'machine', 'beginner', ARRAY['Barbell Row']),
('Resistance Band Row', 'back', 'band', 'beginner', ARRAY['Barbell Row']),
('Superman Hold', 'back', 'bodyweight', 'beginner', ARRAY['Lat Pulldown']),
('Bird Dog', 'back', 'bodyweight', 'beginner', ARRAY['Seated Row']),
('Pull-Up', 'back', 'bodyweight', 'intermediate', ARRAY['Lat Pulldown']),
('Chin-Up', 'back', 'bodyweight', 'intermediate', ARRAY['Lat Pulldown']),
('Barbell Row', 'back', 'barbell', 'intermediate', ARRAY['Seated Row']),
('Dumbbell Row', 'back', 'dumbbell', 'intermediate', ARRAY['Barbell Row']),
('Chest-Supported Row', 'back', 'machine', 'intermediate', ARRAY['Barbell Row']),
('Weighted Pull-Up', 'back', 'bodyweight', 'advanced', ARRAY['Pull-Up']),
('Deficit Deadlift', 'back', 'barbell', 'advanced', ARRAY['Romanian Deadlift']),
('Pendlay Row', 'back', 'barbell', 'advanced', ARRAY['Barbell Row']),
('T-Bar Row', 'back', 'barbell', 'advanced', ARRAY['Dumbbell Row']),
('Rope Face Pull', 'back', 'cable', 'advanced', ARRAY['Lat Pulldown']);

-- LEGS exercises
INSERT INTO exercises (name, muscle_group, equipment, difficulty, substitute_for) VALUES
('Bodyweight Squat', 'legs', 'bodyweight', 'beginner', ARRAY['Barbell Squat']),
('Goblet Squat', 'legs', 'dumbbell', 'beginner', ARRAY['Barbell Squat']),
('Walking Lunge', 'legs', 'bodyweight', 'beginner', ARRAY['Leg Press']),
('Step-Up', 'legs', 'bodyweight', 'beginner', ARRAY['Bulgarian Split Squat']),
('Leg Curl Machine', 'legs', 'machine', 'beginner', ARRAY['Romanian Deadlift']),
('Barbell Squat', 'legs', 'barbell', 'intermediate', ARRAY['Bodyweight Squat']),
('Leg Press', 'legs', 'machine', 'intermediate', ARRAY['Barbell Squat']),
('Romanian Deadlift', 'legs', 'barbell', 'intermediate', ARRAY['Leg Curl Machine']),
('Bulgarian Split Squat', 'legs', 'dumbbell', 'intermediate', ARRAY['Walking Lunge']),
('Dumbbell Lunge', 'legs', 'dumbbell', 'intermediate', ARRAY['Goblet Squat']),
('Pistol Squat', 'legs', 'bodyweight', 'advanced', ARRAY['Goblet Squat']),
('Barbell Front Squat', 'legs', 'barbell', 'advanced', ARRAY['Barbell Squat']),
('Sumo Deadlift', 'legs', 'barbell', 'advanced', ARRAY['Romanian Deadlift']),
('Walking Barbell Lunge', 'legs', 'barbell', 'advanced', ARRAY['Walking Lunge']),
('Trap Bar Deadlift', 'legs', 'barbell', 'advanced', ARRAY['Romanian Deadlift']);

-- SHOULDERS exercises
INSERT INTO exercises (name, muscle_group, equipment, difficulty, substitute_for) VALUES
('Dumbbell Shoulder Press', 'shoulders', 'dumbbell', 'beginner', ARRAY['Overhead Press']),
('Lateral Raise', 'shoulders', 'dumbbell', 'beginner', ARRAY['Front Raise']),
('Front Raise', 'shoulders', 'dumbbell', 'beginner', ARRAY['Lateral Raise']),
('Shoulder Press Machine', 'shoulders', 'machine', 'beginner', ARRAY['Overhead Press']),
('Band Lateral Raise', 'shoulders', 'band', 'beginner', ARRAY['Lateral Raise']),
('Overhead Press', 'shoulders', 'barbell', 'intermediate', ARRAY['Dumbbell Press']),
('Cable Lateral Raise', 'shoulders', 'cable', 'intermediate', ARRAY['Lateral Raise']),
('Arnold Press', 'shoulders', 'dumbbell', 'intermediate', ARRAY['Shoulder Press']),
('Front Plate Raise', 'shoulders', 'weight plate', 'intermediate', ARRAY['Front Raise']),
('Reverse Fly', 'shoulders', 'dumbbell', 'intermediate', ARRAY['Lateral Raise']),
('Handstand Push-Up', 'shoulders', 'bodyweight', 'advanced', ARRAY['Overhead Press']),
('Snatch-Grip Push Press', 'shoulders', 'barbell', 'advanced', ARRAY['Dumbbell Press']),
('Barbell Overhead Press', 'shoulders', 'barbell', 'advanced', ARRAY['Dumbbell Press']),
('Push Press', 'shoulders', 'barbell', 'advanced', ARRAY['Overhead Press']),
('Ring Pike Push-Up', 'shoulders', 'bodyweight', 'advanced', ARRAY['Handstand Push-Up']);

-- CORE exercises
INSERT INTO exercises (name, muscle_group, equipment, difficulty, substitute_for) VALUES
('Plank', 'core', 'bodyweight', 'beginner', ARRAY[]::text[]),
('Side Plank', 'core', 'bodyweight', 'beginner', ARRAY['Plank']),
('Crunch', 'core', 'bodyweight', 'beginner', ARRAY[]::text[]),
('Kneeling Cable Crunch', 'core', 'cable', 'beginner', ARRAY['Crunch']),
('Bird Dog Hold', 'core', 'bodyweight', 'beginner', ARRAY['Plank']),
('Russian Twist', 'core', 'bodyweight', 'intermediate', ARRAY['Crunch']),
('Leg Raises', 'core', 'bodyweight', 'intermediate', ARRAY['Crunch']),
('Cable Woodchopper', 'core', 'cable', 'intermediate', ARRAY['Russian Twist']),
('Weighted Sit-Up', 'core', 'weight plate', 'intermediate', ARRAY['Crunch']),
('Hanging Leg Raise', 'core', 'bodyweight', 'intermediate', ARRAY['Leg Raises']),
('Dragon Flag', 'core', 'bodyweight', 'advanced', ARRAY['Leg Raises']),
('Hollow Body Hold', 'core', 'bodyweight', 'advanced', ARRAY['Plank']),
('Weighted Russian Twist', 'core', 'bodyweight', 'advanced', ARRAY['Russian Twist']),
('Cable Oblique Twist', 'core', 'cable', 'advanced', ARRAY['Russian Twist']),
('Windshield Wipers', 'core', 'bodyweight', 'advanced', ARRAY['Side Plank']);

-- BICEPS exercises
INSERT INTO exercises (name, muscle_group, equipment, difficulty, substitute_for) VALUES
('Bicep Curl', 'biceps', 'dumbbell', 'beginner', ARRAY[]::text[]),
('Resistance Band Curl', 'biceps', 'band', 'beginner', ARRAY['Bicep Curl']),
('EZ Bar Curl', 'biceps', 'barbell', 'beginner', ARRAY['Barbell Curl']),
('Seated Dumbbell Curl', 'biceps', 'dumbbell', 'beginner', ARRAY['Bicep Curl']),
('Concentration Curl', 'biceps', 'dumbbell', 'beginner', ARRAY['Bicep Curl']),
('Barbell Curl', 'biceps', 'barbell', 'intermediate', ARRAY['Dumbbell Curl']),
('Cable Curl', 'biceps', 'machine', 'intermediate', ARRAY['Barbell Curl']),
('Incline Dumbbell Curl', 'biceps', 'dumbbell', 'intermediate', ARRAY['Dumbbell Curl']),
('Preacher Curl', 'biceps', 'machine', 'intermediate', ARRAY['Bicep Curl']),
('Zottman Curl', 'biceps', 'dumbbell', 'intermediate', ARRAY['Bicep Curl']),
('Spider Curl', 'biceps', 'dumbbell', 'advanced', ARRAY['Barbell Curl']),
('Cable Hammer Curl', 'biceps', 'cable', 'advanced', ARRAY['Barbell Curl']),
('21s Curl', 'biceps', 'barbell', 'advanced', ARRAY['Barbell Curl']),
('Incline Cable Curl', 'biceps', 'cable', 'advanced', ARRAY['Barbell Curl']),
('Bayesian Curl', 'biceps', 'cable', 'advanced', ARRAY['Barbell Curl']);

-- TRICEPS exercises
INSERT INTO exercises (name, muscle_group, equipment, difficulty, substitute_for) VALUES
('Tricep Pushdown', 'triceps', 'machine', 'beginner', ARRAY['Dips']),
('Bench Dip', 'triceps', 'bodyweight', 'beginner', ARRAY['Tricep Pushdown']),
('Resistance Band Kickback', 'triceps', 'band', 'beginner', ARRAY['Overhead Dumbbell Extension']),
('Lying Dumbbell Extension', 'triceps', 'dumbbell', 'beginner', ARRAY['Tricep Pushdown']),
('Diamond Push-Up', 'triceps', 'bodyweight', 'beginner', ARRAY['Tricep Pushdown']),
('Overhead Dumbbell Extension', 'triceps', 'dumbbell', 'intermediate', ARRAY['Tricep Pushdown']),
('Overhead Cable Extension', 'triceps', 'machine', 'intermediate', ARRAY['Overhead Dumbbell Extension']),
('Rope Pushdown', 'triceps', 'cable', 'intermediate', ARRAY['Tricep Pushdown']),
('Skullcrusher', 'triceps', 'barbell', 'intermediate', ARRAY['Overhead Dumbbell Extension']),
('Triceps Kickback', 'triceps', 'dumbbell', 'intermediate', ARRAY['Overhead Dumbbell Extension']),
('Close-Grip Bench Press', 'triceps', 'barbell', 'advanced', ARRAY['Tricep Pushdown']),
('Ring Tricep Dip', 'triceps', 'bodyweight', 'advanced', ARRAY['Tricep Dips']),
('Barbell Skullcrusher', 'triceps', 'barbell', 'advanced', ARRAY['Overhead Extension']),
('Dumbbell JM Press', 'triceps', 'dumbbell', 'advanced', ARRAY['Skullcrusher']),
('Overhead Kettlebell Extension', 'triceps', 'kettlebell', 'advanced', ARRAY['Overhead Dumbbell Extension']);

-- Create indexes for better performance
CREATE INDEX idx_exercises_muscle_group ON exercises(muscle_group);
CREATE INDEX idx_exercises_difficulty ON exercises(difficulty);
CREATE INDEX idx_exercises_equipment ON exercises(equipment);
CREATE INDEX idx_workout_plans_user_id ON workout_plans(user_id);
CREATE INDEX idx_plan_action_plan_id ON plan_action(plan_id);
