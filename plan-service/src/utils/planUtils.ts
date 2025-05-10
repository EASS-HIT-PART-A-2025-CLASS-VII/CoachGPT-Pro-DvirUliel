// ✅ Check if a string is a valid UUID
export const isValidUUID = (uuid: string): boolean => {
    return /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/.test(uuid);
  };
  
// ✅ Find a week inside planData
export const findWeek = (planData: any, weekNumber: number) => {
return planData.weeks.find((week: any) => week.week === weekNumber);
};

// ✅ Find a day by muscle group (title includes muscle group)
export const findDayByMuscleGroup = (week: any, muscleGroup: string) => {
return week.days.find((day: any) =>
    day.day.toLowerCase().includes(muscleGroup.toLowerCase())
);
};

// ✅ Check if an exercise exists in a day
export const exerciseExistsInDay = (day: any, exerciseName: string): boolean => {
return day.exercises.some((exercise: any) => 
    (typeof exercise === 'string' ? exercise : exercise.name).toLowerCase() === exerciseName.toLowerCase()
);
};

// ✅ Add an exercise to a day
export const addExerciseToDay = (day: any, newExercise: string) => {
    day.exercises.push({
      name: newExercise,
      sets: 3,
      reps: 10
    });
  };

// ✅ Delete an exercise from a day
export const deleteExerciseFromDay = (day: any, exerciseToDelete: string) => {
    const index = day.exercises.findIndex((ex: any) => 
      (typeof ex === 'string' ? ex : ex.name).toLowerCase() === exerciseToDelete.toLowerCase()
    );
  
    if (index !== -1) {
      day.exercises.splice(index, 1);
      return true; // ✅ Exercise was deleted
    }
  
    return false; // ❌ Exercise not found
  };