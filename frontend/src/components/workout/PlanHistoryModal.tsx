import React, { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Modal from '../common/Modal';
import Button from '../common/Button';
import LoadingSpinner from '../common/LoadingSpinner';
import workoutService from '../../services/workoutService';
import { PlanAction } from '../../types/workout';
import toast from 'react-hot-toast';

interface PlanHistoryModalProps {
  isOpen: boolean;
  onClose: () => void;
  planId: string;
  planGoal?: string;
}

const PlanHistoryModal: React.FC<PlanHistoryModalProps> = ({
  isOpen,
  onClose,
  planId,
  planGoal = 'workout'
}) => {
  const [actions, setActions] = useState<PlanAction[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Load plan actions
  const loadPlanActions = useCallback(async () => {
    if (!isOpen || !planId) return;

    setLoading(true);
    setError(null);
    
    try {
      const response = await workoutService.getPlanActions(planId);
      // Sort by newest first (descending order)
      const sortedActions = response.actions.sort((a, b) => 
        new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
      );
      setActions(sortedActions);
    } catch (error: any) {
      console.error('Failed to load plan actions:', error);
      const errorMessage = error.message || 'Failed to load plan history';
      setError(errorMessage);
      toast.error(errorMessage);
    } finally {
      setLoading(false);
    }
  }, [isOpen, planId]);

  useEffect(() => {
    if (isOpen) {
      loadPlanActions();
    }
  }, [isOpen, loadPlanActions]);

  // Get action icon
  const getActionIcon = (actionType: string): string => {
    switch (actionType) {
      case 'add': return '➕';
      case 'swap': return '🔄';
      case 'delete': return '🗑️';
      case 'generate': return '✨';
      default: return '📝';
    }
  };

  // Get action color
  const getActionColor = (actionType: string): string => {
    switch (actionType) {
      case 'add': return 'text-green-600 bg-green-50 border-green-200';
      case 'swap': return 'text-blue-600 bg-blue-50 border-blue-200';
      case 'delete': return 'text-red-600 bg-red-50 border-red-200';
      case 'generate': return 'text-purple-600 bg-purple-50 border-purple-200';
      default: return 'text-gray-600 bg-gray-50 border-gray-200';
    }
  };

  // Format action description
  const formatActionDescription = (action: PlanAction): string => {
    const weekText = action.week_number ? `Week ${action.week_number}` : '';
    const dayText = action.day_name ? ` - ${action.day_name}` : '';
    const locationText = weekText + dayText;

    switch (action.action_type) {
      case 'add':
        return `Added "${action.new_exercise}" ${locationText}`;
      
      case 'swap':
        return `Swapped "${action.old_exercise}" → "${action.new_exercise}" ${locationText}`;
      
      case 'delete':
        return `Removed "${action.old_exercise}" ${locationText}`;
      
      case 'generate':
        return `Generated new ${planGoal} workout plan`;
      
      default:
        return `Unknown action ${locationText}`;
    }
  };

  // Format relative time
  const formatRelativeTime = (dateString: string): string => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000);

    if (diffInSeconds < 60) {
      return 'Just now';
    } else if (diffInSeconds < 3600) {
      const minutes = Math.floor(diffInSeconds / 60);
      return `${minutes} minute${minutes !== 1 ? 's' : ''} ago`;
    } else if (diffInSeconds < 86400) {
      const hours = Math.floor(diffInSeconds / 3600);
      return `${hours} hour${hours !== 1 ? 's' : ''} ago`;
    } else if (diffInSeconds < 604800) {
      const days = Math.floor(diffInSeconds / 86400);
      return `${days} day${days !== 1 ? 's' : ''} ago`;
    } else {
      return date.toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
        year: date.getFullYear() !== now.getFullYear() ? 'numeric' : undefined
      });
    }
  };

  // Group actions by date
  const groupActionsByDate = (actions: PlanAction[]) => {
    const groups: { [key: string]: PlanAction[] } = {};
    
    actions.forEach(action => {
      const date = new Date(action.created_at);
      const today = new Date();
      const yesterday = new Date(today);
      yesterday.setDate(yesterday.getDate() - 1);
      
      let dateKey: string;
      if (date.toDateString() === today.toDateString()) {
        dateKey = 'Today';
      } else if (date.toDateString() === yesterday.toDateString()) {
        dateKey = 'Yesterday';
      } else {
        dateKey = date.toLocaleDateString('en-US', {
          weekday: 'long',
          month: 'short',
          day: 'numeric'
        });
      }
      
      if (!groups[dateKey]) {
        groups[dateKey] = [];
      }
      groups[dateKey].push(action);
    });
    
    return groups;
  };

  const actionGroups = groupActionsByDate(actions);

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Plan History" size="large">
      <div className="p-6">
        {/* Header Info */}
        <div className="mb-6 p-4 bg-gradient-to-r from-blue-50 to-purple-50 border border-blue-200 rounded-lg">
          <div className="flex items-center space-x-2 mb-2">
            <svg className="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <p className="text-sm font-medium text-blue-800">
              Workout Plan Activity
            </p>
          </div>
          <p className="text-xs text-blue-600">
            Track all changes made to your workout plan including exercises added, swapped, or removed.
          </p>
        </div>

        {/* Content */}
        <div className="max-h-96 overflow-y-auto">
          {loading ? (
            <div className="flex items-center justify-center py-8">
              <LoadingSpinner size="medium" />
              <span className="ml-2 text-gray-600">Loading plan history...</span>
            </div>
          ) : error ? (
            <div className="text-center py-8">
              <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-3">
                <svg className="w-6 h-6 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <p className="text-gray-600 mb-4">{error}</p>
              <Button variant="primary" size="small" onClick={loadPlanActions}>
                Try Again
              </Button>
            </div>
          ) : Object.keys(actionGroups).length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <p className="text-lg font-medium text-gray-900 mb-2">No activity yet</p>
              <p className="text-sm text-gray-500">
                Start making changes to your workout plan to see your activity history here.
              </p>
            </div>
          ) : (
            <div className="space-y-6">
              <AnimatePresence>
                {Object.entries(actionGroups).map(([dateKey, dateActions]) => (
                  <motion.div
                    key={dateKey}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="space-y-3"
                  >
                    {/* Date Header */}
                    <div className="flex items-center space-x-3">
                      <h4 className="text-sm font-semibold text-gray-900">{dateKey}</h4>
                      <div className="flex-1 h-px bg-gray-200"></div>
                      <span className="text-xs text-gray-500">
                        {dateActions.length} action{dateActions.length !== 1 ? 's' : ''}
                      </span>
                    </div>

                    {/* Actions for this date */}
                    <div className="space-y-2">
                      {dateActions.map((action) => (
                        <motion.div
                          key={action.id}
                          initial={{ opacity: 0, x: -10 }}
                          animate={{ opacity: 1, x: 0 }}
                          className={`flex items-start space-x-3 p-3 rounded-lg border ${getActionColor(action.action_type)}`}
                        >
                          {/* Action Icon */}
                          <div className="flex-shrink-0 w-8 h-8 rounded-full bg-white border-2 border-current flex items-center justify-center">
                            <span className="text-lg" role="img" aria-label={`${action.action_type} action`}>
                              {getActionIcon(action.action_type)}
                            </span>
                          </div>

                          {/* Action Details */}
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-medium text-gray-900">
                              {formatActionDescription(action)}
                            </p>
                            <div className="flex items-center space-x-2 mt-1">
                              <p className="text-xs text-gray-500">
                                {formatRelativeTime(action.created_at)}
                              </p>
                              {action.week_number && (
                                <>
                                  <span className="text-gray-300">•</span>
                                  <span className="text-xs text-gray-500">
                                    Week {action.week_number}
                                  </span>
                                </>
                              )}
                              {action.day_name && (
                                <>
                                  <span className="text-gray-300">•</span>
                                  <span className="text-xs text-gray-500">
                                    {action.day_name}
                                  </span>
                                </>
                              )}
                            </div>

                            {/* Exercise details for swap actions */}
                            {action.action_type === 'swap' && action.old_exercise && action.new_exercise && (
                              <div className="mt-2 p-2 bg-white bg-opacity-70 rounded border">
                                <div className="flex items-center text-xs text-gray-600">
                                  <span className="font-medium">From:</span>
                                  <span className="ml-1 text-gray-800">{action.old_exercise}</span>
                                </div>
                                <div className="flex items-center text-xs text-gray-600 mt-0.5">
                                  <span className="font-medium">To:</span>
                                  <span className="ml-1 text-gray-800">{action.new_exercise}</span>
                                </div>
                              </div>
                            )}
                          </div>

                          {/* Action Type Badge */}
                          <div className="flex-shrink-0">
                            <span className={`px-2 py-1 text-xs font-medium rounded-full capitalize bg-white border`}>
                              {action.action_type}
                            </span>
                          </div>
                        </motion.div>
                      ))}
                    </div>
                  </motion.div>
                ))}
              </AnimatePresence>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="mt-6 pt-4 border-t border-gray-200 flex justify-between items-center">
          <div className="text-sm text-gray-500">
            {actions.length > 0 && (
              <span>{actions.length} total action{actions.length !== 1 ? 's' : ''}</span>
            )}
          </div>
          <div className="flex space-x-3">
            {actions.length > 0 && (
              <Button
                variant="ghost"
                size="small"
                onClick={loadPlanActions}
                disabled={loading}
              >
                {loading ? (
                  <>
                    <LoadingSpinner size="small" className="mr-1" />
                    Refreshing...
                  </>
                ) : (
                  <>
                    <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                    </svg>
                    Refresh
                  </>
                )}
              </Button>
            )}
            <Button variant="secondary" onClick={onClose}>
              Close
            </Button>
          </div>
        </div>
      </div>
    </Modal>
  );
};

export default PlanHistoryModal;