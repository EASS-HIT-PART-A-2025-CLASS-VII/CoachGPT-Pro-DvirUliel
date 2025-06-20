import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import toast from 'react-hot-toast';
import exerciseService from '../services/exerciseService';
import { ExerciseDetails, ExerciseFilters } from '../types/exercise';
import LoadingSpinner from '../components/common/LoadingSpinner';
import ExerciseGrid from '../components/exercises/ExerciseGrid';
import ExerciseFilter from '../components/exercises/ExerciseFilter';

const ExerciseLibraryPage: React.FC = () => {
  const [exercises, setExercises] = useState<ExerciseDetails[]>([]);
  const [filteredExercises, setFilteredExercises] = useState<ExerciseDetails[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [filters, setFilters] = useState<ExerciseFilters>({});

  // Fetch exercises on mount
  useEffect(() => {
    const fetchExercises = async () => {
      try {
        setIsLoading(true);
        const response = await exerciseService.getAllExercises();
        setExercises(response.exercises);
        setFilteredExercises(response.exercises);
      } catch (error: any) {
        toast.error(error.message);
      } finally {
        setIsLoading(false);
      }
    };

    fetchExercises();
  }, []);

  // Apply filters when filters change
  useEffect(() => {
    let filtered = [...exercises];

    if (filters.muscleGroup) {
      filtered = filtered.filter(exercise => 
        exercise.muscle_group.toLowerCase() === filters.muscleGroup?.toLowerCase()
      );
    }

    if (filters.difficulty) {
      filtered = filtered.filter(exercise => 
        exercise.difficulty === filters.difficulty
      );
    }

    if (filters.search) {
      const searchTerm = filters.search.toLowerCase();
      filtered = filtered.filter(exercise =>
        exercise.name.toLowerCase().includes(searchTerm) ||
        exercise.description?.toLowerCase().includes(searchTerm)
      );
    }

    setFilteredExercises(filtered);
  }, [exercises, filters]);

  const handleFilterChange = (newFilters: ExerciseFilters) => {
    setFilters(newFilters);
  };

  const clearFilters = () => {
    setFilters({});
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <LoadingSpinner size="large" />
          <p className="mt-4 text-gray-600">Loading exercise library...</p>
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
            >
              <h1 className="text-3xl font-bold text-gray-900">Exercise Library</h1>
              <p className="mt-2 text-gray-600">
                Discover {exercises.length} exercises to enhance your workout routine
              </p>
            </motion.div>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex flex-col lg:flex-row gap-8">
          {/* Sidebar - Filters */}
          <div className="w-full lg:w-64 flex-shrink-0">
            <ExerciseFilter
              filters={filters}
              onFilterChange={handleFilterChange}
              onClearFilters={clearFilters}
              exerciseCount={filteredExercises.length}
              totalCount={exercises.length}
            />
          </div>

          {/* Main Content - Exercise Grid */}
          <div className="flex-1">
            {filteredExercises.length === 0 ? (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="text-center py-12"
              >
                <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <span className="text-2xl">🔍</span>
                </div>
                <h3 className="text-lg font-medium text-gray-900 mb-2">
                  No exercises found
                </h3>
                <p className="text-gray-600 mb-4">
                  Try adjusting your filters to see more results
                </p>
                <button
                  onClick={clearFilters}
                  className="btn-primary"
                >
                  Clear Filters
                </button>
              </motion.div>
            ) : (
              <ExerciseGrid exercises={filteredExercises} />
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ExerciseLibraryPage;