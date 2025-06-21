import React, { useState } from 'react';
import { useForm, SubmitHandler } from 'react-hook-form';
import { motion } from 'framer-motion';
import toast from 'react-hot-toast';
import { useAuth } from '../../hooks/useAuth';
import workoutService from '../../services/workoutService';
import { WorkoutPlan, PlanGenerationRequest } from '../../types/workout';
import { WORKOUT_CONFIG } from '../../utils/constants';
import Button from '../common/Button';
import LoadingSpinner from '../common/LoadingSpinner';

// Define form data interface
interface FormData {
  goal: string;
  daysPerWeek: number;
  difficultyLevel: string;
}

interface PlanGeneratorProps {
  onPlanGenerated: (plan: WorkoutPlan) => void;
  onCancel: () => void;
  isGenerating: boolean;
  setIsGenerating: (loading: boolean) => void;
}

const PlanGenerator: React.FC<PlanGeneratorProps> = ({
  onPlanGenerated,
  onCancel,
  isGenerating,
  setIsGenerating,
}) => {
  const { user } = useAuth();
  const [step, setStep] = useState(1);

  const {
    register,
    handleSubmit,
    formState: { errors },
    watch,
    setError,
    setValue,
  } = useForm<FormData>({
    defaultValues: {
      goal: 'general_fitness',
      daysPerWeek: 4, // Changed default to 4
      difficultyLevel: 'beginner',
    },
    mode: 'onChange'
  });

  const watchedValues = watch();

  const validateForm = (data: FormData): boolean => {
    const validGoals = ['strength', 'hypertrophy', 'endurance', 'weight_loss', 'general_fitness'];
    const validDifficulties = ['beginner', 'intermediate', 'advanced'];

    if (!validGoals.includes(data.goal)) {
      setError('goal', { message: 'Please select a valid fitness goal' });
      return false;
    }

    if (data.daysPerWeek < 1 || data.daysPerWeek > 7) {
      setError('daysPerWeek', { message: 'Training days must be between 1 and 7' });
      return false;
    }

    if (!validDifficulties.includes(data.difficultyLevel)) {
      setError('difficultyLevel', { message: 'Please select a valid difficulty level' });
      return false;
    }

    return true;
  };

  const onSubmit: SubmitHandler<FormData> = async (data) => {
    if (!user?.id) {
      toast.error('User not authenticated');
      return;
    }

    if (!validateForm(data)) {
      return;
    }

    // Create request data with proper typing
    const requestData: PlanGenerationRequest = {
      userId: user.id,
      goal: data.goal as PlanGenerationRequest['goal'],
      daysPerWeek: data.daysPerWeek,
      difficultyLevel: data.difficultyLevel as PlanGenerationRequest['difficultyLevel'],
    };

    try {
      setIsGenerating(true);
      
      // Safely check if validation method exists
      if (typeof workoutService.validatePlanRequest === 'function') {
        try {
          const validationErrors = workoutService.validatePlanRequest(requestData);
          if (validationErrors && validationErrors.length > 0) {
            toast.error(validationErrors[0]);
            return;
          }
        } catch (validationError) {
          console.warn('Validation method failed:', validationError);
          // Continue without validation if method fails
        }
      }

      const response = await workoutService.generatePlan(requestData);
      
      if (response?.plan) {
        onPlanGenerated(response.plan);
        toast.success('Workout plan generated successfully!');
      } else {
        throw new Error('Invalid response from server');
      }
    } catch (error: any) {
      const errorMessage = error?.response?.data?.message || error?.message || 'Failed to generate workout plan';
      toast.error(errorMessage);
      console.error('Plan generation error:', error);
    } finally {
      setIsGenerating(false);
    }
  };

  const nextStep = () => {
    if (step < 4) setStep(step + 1);
  };

  const prevStep = () => {
    if (step > 1) setStep(step - 1);
  };

  const canProceedFromStep = (currentStep: number): boolean => {
    switch (currentStep) {
      case 1:
        return !!watchedValues.goal;
      case 2:
        return !!watchedValues.daysPerWeek && watchedValues.daysPerWeek >= 1;
      case 3:
        return !!watchedValues.difficultyLevel;
      case 4:
        return !!watchedValues.goal && !!watchedValues.daysPerWeek && !!watchedValues.difficultyLevel;
      default:
        return false;
    }
  };

  const getTrainingTip = (days: number): string => {
    if (days <= 2) return "Great for beginners! Focus on full-body workouts.";
    if (days === 3) return "Perfect balance for most people. Allows good recovery time.";
    if (days === 4) return "Excellent frequency for serious progress and muscle growth.";
    if (days === 5) return "Advanced training frequency. Great for experienced athletes.";
    return "High frequency training - make sure you get adequate rest!";
  };

  // Handle day selection
  const handleDaySelection = (day: number) => {
    setValue('daysPerWeek', day);
  };

  return (
    <div className="max-w-2xl mx-auto">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-white rounded-xl shadow-lg border border-gray-200 overflow-hidden"
      >
        {/* Header */}
        <div className="bg-gradient-to-r from-blue-600 to-orange-500 px-6 py-8 text-white">
          <h2 className="text-2xl font-bold mb-2">Create Your Workout Plan</h2>
          <p className="text-blue-100">
            Tell us about your goals and we'll create a personalized 4-week program
          </p>
          
          {/* Progress Bar */}
          <div className="mt-6">
            <div className="flex items-center justify-between text-sm">
              <span>Step {step} of 4</span>
              <span>{Math.round((step / 4) * 100)}% Complete</span>
            </div>
            <div className="mt-2 bg-white bg-opacity-20 rounded-full h-2">
              <motion.div
                className="bg-white rounded-full h-2"
                initial={{ width: 0 }}
                animate={{ width: `${(step / 4) * 100}%` }}
                transition={{ duration: 0.3 }}
              />
            </div>
          </div>
        </div>

        {/* Form Content */}
        <form onSubmit={handleSubmit(onSubmit)} className="p-6">
          {/* Step 1: Fitness Goal */}
          {step === 1 && (
            <motion.div
              key="step1"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="space-y-6"
            >
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-4">
                  What's your primary fitness goal?
                </h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {WORKOUT_CONFIG.GOALS.map((goal) => (
                    <label
                      key={goal.value}
                      className={`relative cursor-pointer border-2 rounded-lg p-4 transition-all ${
                        watchedValues.goal === goal.value
                          ? 'border-blue-600 bg-blue-50 text-blue-600'
                          : 'border-gray-200 hover:border-gray-300'
                      }`}
                    >
                      <input
                        {...register('goal', { required: 'Please select a fitness goal' })}
                        type="radio"
                        value={goal.value}
                        className="sr-only"
                      />
                      <div className="flex items-center">
                        <span className="text-2xl mr-3">{goal.icon}</span>
                        <div>
                          <div className="font-medium">{goal.label}</div>
                          <div className="text-sm text-gray-500">{goal.description}</div>
                        </div>
                      </div>
                      {watchedValues.goal === goal.value && (
                        <div className="absolute top-2 right-2">
                          <svg className="w-5 h-5 text-blue-600" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                          </svg>
                        </div>
                      )}
                    </label>
                  ))}
                </div>
                {errors.goal && (
                  <p className="mt-2 text-sm text-red-600">{errors.goal.message}</p>
                )}
              </div>
            </motion.div>
          )}

          {/* Step 2: Training Frequency */}
          {step === 2 && (
            <motion.div
              key="step2"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="space-y-6"
            >
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-4">
                  How many days per week can you train?
                </h3>
                <div className="grid grid-cols-3 sm:grid-cols-4 gap-3">
                  {WORKOUT_CONFIG.DAYS_PER_WEEK.map((option) => (
                    <button
                      key={option.value}
                      type="button"
                      onClick={() => handleDaySelection(option.value)}
                      className={`relative border-2 rounded-lg p-4 text-center transition-all ${
                        watchedValues.daysPerWeek === option.value
                          ? 'border-blue-600 bg-blue-50 text-blue-600'
                          : 'border-gray-200 hover:border-gray-300'
                      }`}
                    >
                      <div className="font-semibold text-lg">{option.value}</div>
                      <div className="text-sm text-gray-500">
                        {option.value === 1 ? 'Day' : 'Days'}
                        {option.value === 4 && (
                          <div className="text-xs text-blue-600 font-medium mt-1">
                            (Recommended)
                          </div>
                        )}
                      </div>
                      {watchedValues.daysPerWeek === option.value && (
                        <div className="absolute -top-2 -right-2">
                          <div className="w-6 h-6 bg-blue-600 rounded-full flex items-center justify-center">
                            <svg className="w-4 h-4 text-white" fill="currentColor" viewBox="0 0 20 20">
                              <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                            </svg>
                          </div>
                        </div>
                      )}
                    </button>
                  ))}
                </div>
                
                {/* Hidden input for form validation */}
                <input
                  {...register('daysPerWeek', { 
                    required: 'Please select training frequency',
                    min: { value: 1, message: 'Must train at least 1 day per week' },
                    max: { value: 7, message: 'Cannot train more than 7 days per week' }
                  })}
                  type="hidden"
                  value={watchedValues.daysPerWeek}
                />
                
                {errors.daysPerWeek && (
                  <p className="mt-2 text-sm text-red-600">{errors.daysPerWeek.message}</p>
                )}
              </div>

              {/* Training tip based on selection */}
              {watchedValues.daysPerWeek && (
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                  <div className="flex">
                    <div className="flex-shrink-0">
                      <svg className="h-5 w-5 text-blue-400" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                      </svg>
                    </div>
                    <div className="ml-3">
                      <h4 className="text-sm font-medium text-blue-800">Training Tip</h4>
                      <p className="text-sm text-blue-700">
                        {getTrainingTip(watchedValues.daysPerWeek)}
                      </p>
                    </div>
                  </div>
                </div>
              )}

              {/* Auto advance to next step when days selected */}
              {watchedValues.daysPerWeek && (
                <div className="text-center">
                  <p className="text-sm text-gray-600 mb-4">
                    Perfect! You've selected {watchedValues.daysPerWeek} training days per week.
                  </p>
                </div>
              )}
            </motion.div>
          )}

          {/* Step 3: Difficulty Level */}
          {step === 3 && (
            <motion.div
              key="step3"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="space-y-6"
            >
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-4">
                  What's your current fitness level?
                </h3>
                <div className="space-y-3">
                  {WORKOUT_CONFIG.DIFFICULTY_LEVELS.map((level) => (
                    <label
                      key={level.value}
                      className={`relative cursor-pointer border-2 rounded-lg p-4 block transition-all ${
                        watchedValues.difficultyLevel === level.value
                          ? 'border-blue-600 bg-blue-50'
                          : 'border-gray-200 hover:border-gray-300'
                      }`}
                    >
                      <input
                        {...register('difficultyLevel', { required: 'Please select your difficulty level' })}
                        type="radio"
                        value={level.value}
                        className="sr-only"
                      />
                      <div className="flex items-center justify-between">
                        <div>
                          <div className={`font-medium text-lg ${
                            watchedValues.difficultyLevel === level.value ? 'text-blue-600' : 'text-gray-900'
                          }`}>
                            {level.label}
                          </div>
                          <div className="text-sm text-gray-500">{level.description}</div>
                        </div>
                        {watchedValues.difficultyLevel === level.value && (
                          <div className="flex-shrink-0">
                            <svg className="w-6 h-6 text-blue-600" fill="currentColor" viewBox="0 0 20 20">
                              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                            </svg>
                          </div>
                        )}
                      </div>
                    </label>
                  ))}
                </div>
                {errors.difficultyLevel && (
                  <p className="mt-2 text-sm text-red-600">{errors.difficultyLevel.message}</p>
                )}
              </div>
            </motion.div>
          )}

          {/* Step 4: Summary and Confirmation */}
          {step === 4 && (
            <motion.div
              key="step4"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="space-y-6"
            >
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-4">
                  Review Your Workout Plan
                </h3>
                
                {/* Plan Summary */}
                <div className="bg-gradient-to-r from-blue-50 to-orange-50 border border-blue-200 rounded-lg p-6">
                  <h4 className="font-semibold text-gray-900 mb-4 flex items-center">
                    <svg className="w-5 h-5 text-blue-600 mr-2" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M6 2a1 1 0 00-1 1v1H4a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V6a2 2 0 00-2-2h-1V3a1 1 0 10-2 0v1H7V3a1 1 0 00-1-1zm0 5a1 1 0 000 2h8a1 1 0 100-2H6z" clipRule="evenodd" />
                    </svg>
                    Your Personalized 4-Week Program
                  </h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-3">
                      <div className="flex items-center">
                        <span className="text-2xl mr-3">
                          {WORKOUT_CONFIG.GOALS.find(g => g.value === watchedValues.goal)?.icon}
                        </span>
                        <div>
                          <div className="font-medium text-gray-900">Primary Goal</div>
                          <div className="text-gray-600">
                            {WORKOUT_CONFIG.GOALS.find(g => g.value === watchedValues.goal)?.label}
                          </div>
                        </div>
                      </div>
                      
                      <div className="flex items-center">
                        <span className="text-2xl mr-3">📅</span>
                        <div>
                          <div className="font-medium text-gray-900">Training Frequency</div>
                          <div className="text-gray-600">
                            {watchedValues.daysPerWeek} days per week
                            {watchedValues.daysPerWeek === 4 && (
                              <span className="text-blue-600 font-medium"> (Recommended)</span>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                    
                    <div className="space-y-3">
                      <div className="flex items-center">
                        <span className="text-2xl mr-3">💪</span>
                        <div>
                          <div className="font-medium text-gray-900">Difficulty Level</div>
                          <div className="text-gray-600">
                            {WORKOUT_CONFIG.DIFFICULTY_LEVELS.find(d => d.value === watchedValues.difficultyLevel)?.label}
                          </div>
                        </div>
                      </div>
                      
                      <div className="flex items-center">
                        <span className="text-2xl mr-3">⏱️</span>
                        <div>
                          <div className="font-medium text-gray-900">Program Duration</div>
                          <div className="text-gray-600">4-week progressive plan</div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* What to Expect */}
                <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
                  <h5 className="font-medium text-gray-900 mb-2">What to expect:</h5>
                  <ul className="text-sm text-gray-600 space-y-1">
                    <li>• Customized exercises based on your goal and level</li>
                    <li>• Progressive difficulty increase each week</li>
                    <li>• Proper rest days for optimal recovery</li>
                    <li>• Exercise instructions and form tips</li>
                  </ul>
                </div>
              </div>
            </motion.div>
          )}

          {/* Navigation Buttons */}
          <div className="flex justify-between pt-6 border-t border-gray-200">
            <div>
              {step > 1 && (
                <Button
                  type="button"
                  variant="secondary"
                  onClick={prevStep}
                  disabled={isGenerating}
                >
                  Previous
                </Button>
              )}
            </div>

            <div className="flex space-x-3">
              <Button
                type="button"
                variant="ghost"
                onClick={onCancel}
                disabled={isGenerating}
              >
                Cancel
              </Button>

              {step < 4 ? (
                <Button
                  type="button"
                  variant="primary"
                  onClick={nextStep}
                  disabled={!canProceedFromStep(step)}
                >
                  Next
                </Button>
              ) : (
                <Button
                  type="submit"
                  variant="orange"
                  disabled={isGenerating || !canProceedFromStep(step)}
                  className="min-w-[120px]"
                >
                  {isGenerating ? (
                    <>
                      <LoadingSpinner size="small" className="mr-2" />
                      Generating...
                    </>
                  ) : (
                    'Generate Plan'
                  )}
                </Button>
              )}
            </div>
          </div>
        </form>
      </motion.div>
    </div>
  );
};

export default PlanGenerator;