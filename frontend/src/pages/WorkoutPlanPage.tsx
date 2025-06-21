import React, { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import toast from 'react-hot-toast';
import { useAuth } from '../hooks/useAuth';
import workoutService from '../services/workoutService';
import { WorkoutPlan } from '../types/workout';

// Components
import PlanGenerator from '../components/workout/PlanGenerator';
import WorkoutWeek from '../components/workout/WorkoutWeek';
import LoadingSpinner from '../components/common/LoadingSpinner';
import Button from '../components/common/Button';
import Modal from '../components/common/Modal';
import PlanHistoryModal from '../components/workout/PlanHistoryModal';

const WorkoutPlanPage: React.FC = () => {
  const { user } = useAuth();
  const [currentPlan, setCurrentPlan] = useState<WorkoutPlan | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [showGenerator, setShowGenerator] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [showHistoryModal, setShowHistoryModal] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Fetch user's current plan
  const fetchUserPlan = useCallback(async () => {
    if (!user?.id) {
      setIsLoading(false);
      return;
    }

    try {
      setIsLoading(true);
      setError(null);
      
      console.log('🔍 Fetching plan for user:', user.id);
      const plan = await workoutService.getUserPlan(user.id);
      
      console.log('📋 Raw plan from API:', plan);
      
      // Validate plan structure
      if (!plan || !plan.plan_data || !plan.plan_data.weeks) {
        console.error('❌ Invalid plan structure received:', plan);
        setError('Invalid workout plan data received');
        return;
      }
      
      console.log('✅ Plan structure validated:', {
        id: plan.id,
        goal: plan.goal,
        days_per_week: plan.days_per_week,
        weeks_count: plan.plan_data.weeks?.length || 0
      });
      
      setCurrentPlan(plan);
    } catch (error: any) {
      console.error('🚨 Error fetching plan:', error);
      
      // Handle "no plan found" gracefully - this is expected for new users
      const errorMessage = error?.response?.data?.error || 
                          error?.response?.data?.message || 
                          error?.message || 
                          'Failed to load workout plan';
      
      if (errorMessage.toLowerCase().includes('no workout plan found') || 
          errorMessage.toLowerCase().includes('not found') ||
          error?.response?.status === 404) {
        console.log('ℹ️ No plan found for user - showing welcome state');
        setCurrentPlan(null);
        setError(null);
      } else {
        console.error('❌ Real error occurred:', errorMessage);
        setError(errorMessage);
        toast.error(errorMessage);
      }
    } finally {
      setIsLoading(false);
    }
  }, [user]);

  useEffect(() => {
    fetchUserPlan();
  }, [fetchUserPlan]);

  // Handle plan generation completion
  const handlePlanGenerated = useCallback((newPlan: WorkoutPlan) => {
    console.log('🎉 New plan generated:', newPlan);
    setCurrentPlan(newPlan);
    setShowGenerator(false);
    setError(null);
    toast.success('New workout plan generated successfully!');
  }, []);

  // Handle plan updates (from exercise add/swap/delete operations)
  const handlePlanUpdated = useCallback((updatedPlan: WorkoutPlan) => {
    console.log('🔄 Plan updated:', updatedPlan);
    
    // Validate the updated plan structure
    if (!updatedPlan || !updatedPlan.plan_data || !updatedPlan.plan_data.weeks) {
      console.error('❌ Invalid updated plan structure:', updatedPlan);
      toast.error('Invalid plan update received');
      return;
    }
    
    setCurrentPlan(updatedPlan);
    console.log('✅ Plan state updated successfully');
  }, []);

  const handleDeletePlan = useCallback(async () => {
    if (!currentPlan?.id) return;

    try {
      setIsDeleting(true);
      console.log('🗑️ Deleting plan:', currentPlan.id);
      
      await workoutService.deletePlan(currentPlan.id);
      setCurrentPlan(null);
      setShowDeleteModal(false);
      toast.success('Workout plan deleted successfully');
      
      console.log('✅ Plan deleted successfully');
    } catch (error: any) {
      const errorMessage = error?.response?.data?.error || 
                          error?.response?.data?.message || 
                          error?.message || 
                          'Failed to delete workout plan';
      toast.error(errorMessage);
      console.error('🚨 Delete plan error:', error);
    } finally {
      setIsDeleting(false);
    }
  }, [currentPlan]);

  const handleRetry = useCallback(() => {
    setError(null);
    fetchUserPlan();
  }, [fetchUserPlan]);

  // Updated to show history modal instead of toast
  const showHistoryFeature = useCallback(() => {
    if (!currentPlan?.id) {
      toast.error('No workout plan available to view history');
      return;
    }
    setShowHistoryModal(true);
  }, [currentPlan]);

  // Calculate plan statistics with null safety
  const planStats = currentPlan?.plan_data?.weeks ? {
    totalWeeks: currentPlan.plan_data.weeks.length,
    totalWorkouts: currentPlan.plan_data.weeks.reduce((total, week) => 
      total + (week.days?.length || 0), 0),
    totalExercises: currentPlan.plan_data.weeks.reduce((total, week) => 
      total + (week.days?.reduce((dayTotal, day) => 
        dayTotal + (day.exercises?.length || 0), 0) || 0), 0),
  } : null;

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <LoadingSpinner size="large" />
          <p className="mt-4 text-gray-600">Loading your workout plan...</p>
        </div>
      </div>
    );
  }

  if (error && !currentPlan) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center max-w-md mx-auto p-6">
          <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg className="w-8 h-8 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <h2 className="text-xl font-semibold text-gray-900 mb-2">Something went wrong</h2>
          <p className="text-gray-600 mb-6">{error}</p>
          <div className="space-x-3">
            <Button variant="primary" onClick={handleRetry}>
              Try Again
            </Button>
            <Button variant="secondary" onClick={() => setShowGenerator(true)}>
              Create New Plan
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="py-6">
            <motion.div
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              className="flex flex-col sm:flex-row sm:items-center sm:justify-between"
            >
              <div>
                <h1 className="text-3xl font-bold text-gray-900">
                  Your Workout Plan
                </h1>
                <p className="mt-2 text-gray-600">
                  {currentPlan 
                    ? `${currentPlan.goal.charAt(0).toUpperCase() + currentPlan.goal.slice(1)} • ${currentPlan.days_per_week} days/week`
                    : 'Create your personalized fitness journey'
                  }
                </p>
              </div>

              {/* Action buttons when user has a plan */}
              <div className="mt-4 sm:mt-0 flex flex-wrap gap-3">
                {currentPlan && (
                  <>
                    <Button
                      variant="secondary"
                      onClick={showHistoryFeature}
                      className="flex items-center space-x-2"
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                      <span>View History</span>
                    </Button>
                    <Button
                      variant="danger"
                      onClick={() => setShowDeleteModal(true)}
                      disabled={isDeleting}
                    >
                      Delete Plan
                    </Button>
                  </>
                )}
              </div>
            </motion.div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <AnimatePresence mode="wait">
          {!currentPlan && !showGenerator ? (
            // No Plan - Show Welcome State
            <motion.div
              key="welcome"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="text-center py-12"
            >
              <div className="max-w-md mx-auto">
                <div className="w-24 h-24 bg-gradient-to-r from-blue-600 to-orange-500 rounded-full flex items-center justify-center mx-auto mb-8">
                  <span className="text-3xl text-white">🏋️</span>
                </div>
                
                <h2 className="text-2xl font-bold text-gray-900 mb-4">
                  Ready to Start Your Fitness Journey?
                </h2>
                
                <p className="text-gray-600 mb-8">
                  Let our AI create a personalized workout plan tailored to your goals, 
                  fitness level, and schedule. Get started in just a few clicks!
                </p>

                <Button
                  variant="primary"
                  size="large"
                  onClick={() => setShowGenerator(true)}
                  className="w-full sm:w-auto"
                >
                  Create Your First Plan
                </Button>

                <div className="mt-8 grid grid-cols-1 sm:grid-cols-3 gap-4 text-center">
                  <div className="p-4">
                    <div className="text-2xl mb-2">🎯</div>
                    <h3 className="font-semibold text-gray-900">Goal-Oriented</h3>
                    <p className="text-sm text-gray-600">Plans tailored to your specific fitness goals</p>
                  </div>
                  <div className="p-4">
                    <div className="text-2xl mb-2">📈</div>
                    <h3 className="font-semibold text-gray-900">Progressive</h3>
                    <p className="text-sm text-gray-600">Workouts that adapt and grow with you</p>
                  </div>
                  <div className="p-4">
                    <div className="text-2xl mb-2">⚡</div>
                    <h3 className="font-semibold text-gray-900">Flexible</h3>
                    <p className="text-sm text-gray-600">Easily modify exercises to fit your needs</p>
                  </div>
                </div>
              </div>
            </motion.div>
          ) : showGenerator ? (
            // Plan Generator
            <motion.div
              key="generator"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
            >
              <PlanGenerator
                onPlanGenerated={handlePlanGenerated}
                onCancel={() => setShowGenerator(false)}
                isGenerating={isGenerating}
                setIsGenerating={setIsGenerating}
              />
            </motion.div>
          ) : currentPlan ? (
            // Current Plan Display - FIXED DATA FLOW
            <motion.div
              key="plan"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="space-y-8"
            >
              {/* Plan Info Card */}
              <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between">
                  <div className="flex-1">
                    <h3 className="text-lg font-semibold text-gray-900">
                      {currentPlan.goal.charAt(0).toUpperCase() + currentPlan.goal.slice(1)} Program
                    </h3>
                    <p className="text-gray-600 mt-1">
                      {currentPlan.days_per_week} days per week • {planStats?.totalWeeks || 4}-week program
                    </p>
                    <p className="text-sm text-gray-500 mt-1">
                      Created on {new Date(currentPlan.created_at).toLocaleDateString()}
                    </p>
                  </div>
                  
                  <div className="mt-4 lg:mt-0 flex items-center space-x-6">
                    <div className="text-center">
                      <div className="text-2xl font-bold text-blue-600">
                        {planStats?.totalWeeks || 0}
                      </div>
                      <div className="text-xs text-gray-500">Weeks</div>
                    </div>
                    <div className="text-center">
                      <div className="text-2xl font-bold text-orange-500">
                        {currentPlan.days_per_week}
                      </div>
                      <div className="text-xs text-gray-500">Days/Week</div>
                    </div>
                    <div className="text-center">
                      <div className="text-2xl font-bold text-green-600">
                        {planStats?.totalExercises || 0}
                      </div>
                      <div className="text-xs text-gray-500">Exercises</div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Workout Weeks - FIXED RENDERING */}
              <div className="space-y-6">
                {currentPlan.plan_data?.weeks && currentPlan.plan_data.weeks.length > 0 ? (
                  currentPlan.plan_data.weeks.map((week, index) => {
                    console.log(`🔄 Rendering week ${week.week || index + 1}:`, week);
                    
                    return (
                      <WorkoutWeek
                        key={`week-${week.week || index}`}
                        week={week}
                        planId={currentPlan.id}
                        fullPlan={currentPlan}
                        onPlanUpdated={handlePlanUpdated}
                      />
                    );
                  })
                ) : (
                  <div className="text-center py-8 text-gray-500 bg-white rounded-lg border">
                    <svg className="w-12 h-12 mx-auto mb-3 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012 2v2M7 7h10" />
                    </svg>
                    <p className="text-lg font-medium text-gray-900 mb-2">No workout weeks found</p>
                    <p className="text-sm text-gray-500">There seems to be an issue with your plan data.</p>
                    <Button 
                      variant="primary" 
                      onClick={() => setShowGenerator(true)}
                      className="mt-4"
                    >
                      Generate New Plan
                    </Button>
                  </div>
                )}
              </div>
            </motion.div>
          ) : null}
        </AnimatePresence>
      </div>

      {/* Delete Confirmation Modal */}
      <Modal
        isOpen={showDeleteModal}
        onClose={() => setShowDeleteModal(false)}
        title="Delete Workout Plan"
      >
        <div className="p-6">
          <div className="flex items-center mb-4">
            <div className="w-10 h-10 bg-red-100 rounded-full flex items-center justify-center mr-3">
              <svg className="w-5 h-5 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
              </svg>
            </div>
            <div>
              <h3 className="text-lg font-medium text-gray-900">Are you sure?</h3>
              <p className="text-sm text-gray-500">This action cannot be undone.</p>
            </div>
          </div>
          
          <p className="text-gray-600 mb-6">
            This will permanently delete your current workout plan including all exercises, 
            progress, and customizations. You'll need to create a new plan to continue training.
          </p>
          
          <div className="flex justify-end space-x-3">
            <Button
              variant="secondary"
              onClick={() => setShowDeleteModal(false)}
              disabled={isDeleting}
            >
              Cancel
            </Button>
            <Button
              variant="danger"
              onClick={handleDeletePlan}
              disabled={isDeleting}
              className="min-w-[100px]"
            >
              {isDeleting ? (
                <>
                  <LoadingSpinner size="small" className="mr-2" />
                  Deleting...
                </>
              ) : (
                'Delete Plan'
              )}
            </Button>
          </div>
        </div>
      </Modal>

      {/* Plan History Modal */}
      <PlanHistoryModal
        isOpen={showHistoryModal}
        onClose={() => setShowHistoryModal(false)}
        planId={currentPlan?.id || ''}
        planGoal={currentPlan?.goal}
      />
    </div>
  );
};

export default WorkoutPlanPage;