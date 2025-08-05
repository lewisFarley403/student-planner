import React, { useState, useEffect } from 'react';

// Simple modal structure, could be replaced with a library modal if available

export default function AddAllocationModal({ 
  isOpen, 
  onClose, 
  onSubmit, 
  initialDate,
  initialStartTime,
  goals, 
  goalsLoading, 
  goalsError 
}) {
  const [selectedGoal, setSelectedGoal] = useState('');
  const [date, setDate] = useState('');
  const [startTime, setStartTime] = useState('');
  const [endTime, setEndTime] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState(null);

  // Helper to format Date object to YYYY-MM-DD for date input
  const formatDateForInput = (dateObj) => {
    if (!dateObj) return '';
    const year = dateObj.getFullYear();
    const month = (dateObj.getMonth() + 1).toString().padStart(2, '0');
    const day = dateObj.getDate().toString().padStart(2, '0');
    return `${year}-${month}-${day}`;
  };

  // Helper to format time to HH:mm for time input
  const formatTimeForInput = (dateObj) => {
    if (!dateObj) return '';
    const hours = dateObj.getHours().toString().padStart(2, '0');
    const minutes = dateObj.getMinutes().toString().padStart(2, '0');
    return `${hours}:${minutes}`;
  };

  // Reset form and set initial values when modal opens
  useEffect(() => {
    if (isOpen) {
      setDate(formatDateForInput(initialDate || new Date()));
      setStartTime(initialStartTime ? formatTimeForInput(new Date(initialStartTime)) : '');
      setEndTime('');
      setSelectedGoal('');
      setSubmitError(null);
      setIsSubmitting(false);
    }
  }, [isOpen, initialDate, initialStartTime]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitError(null);

    // Basic Validation
    if (!selectedGoal) {
      setSubmitError('Please select a goal.');
      return;
    }
    if (!date) {
      setSubmitError('Please select a date.');
      return;
    }
    if (!startTime) {
      setSubmitError('Please select a start time.');
      return;
    }
    if (!endTime) {
      setSubmitError('Please select an end time.');
      return;
    }
    if (startTime >= endTime) {
      setSubmitError('End time must be after start time.');
      return;
    }

    setIsSubmitting(true);
    try {
      console.log(selectedGoal);
      // Call the onSubmit prop provided by the parent (calendar.js)
      console.log(selectedGoal);
      await onSubmit({ 
        module_title: selectedGoal, 
        date: date, 
        startTime: startTime, 
        endTime: endTime 
      });
      // If onSubmit succeeds, the parent should close the modal
      // We don't call onClose() here directly, parent controls it.
    } catch (error) {
      setSubmitError(error.message || 'Failed to add allocation. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!isOpen) return null;
  console.log(goals);
  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl p-6 w-full max-w-md text-gray-900">
        <h2 className="text-xl font-semibold mb-4 text-gray-800">Add Study Allocation</h2>
        
        <form onSubmit={handleSubmit}>
          <div className="mb-4">
            <label htmlFor="goal" className="block text-sm font-medium text-gray-700 mb-1">Goal/Module</label>
            {goalsLoading && <p className="text-sm text-gray-500">Loading goals...</p>}
            {goalsError && <p className="text-sm text-red-600">Error loading goals: {goalsError}</p>}
            {!goalsLoading && !goalsError && (
              <select
                id="goal"
                name="goal"
                value={selectedGoal}
                onChange={(e) => setSelectedGoal(Number(e.target.value))}
                required
                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-primary focus:border-primary sm:text-sm text-gray-900"
                disabled={isSubmitting}
              >
                <option value="" disabled>-- Select Goal --</option>
                {goals && goals.map((goal) => (
                  <option key={goal.ID} value={goal.ID} className="text-gray-900">{goal.title}</option>
                ))}
              </select>
            )}
          </div>

          <div className="mb-4">
            <label htmlFor="date" className="block text-sm font-medium text-gray-700 mb-1">Date</label>
            <input 
              type="date"
              id="date"
              name="date"
              value={date}
              onChange={(e) => setDate(e.target.value)}
              required
              className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-primary focus:border-primary sm:text-sm text-gray-900"
              disabled={isSubmitting}
            />
          </div>

          <div className="grid grid-cols-2 gap-4 mb-4">
            <div>
              <label htmlFor="startTime" className="block text-sm font-medium text-gray-700 mb-1">Start Time</label>
              <input 
                type="time"
                id="startTime"
                name="startTime"
                value={startTime}
                onChange={(e) => setStartTime(e.target.value)}
                required
                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-primary focus:border-primary sm:text-sm text-gray-900"
                disabled={isSubmitting}
              />
            </div>
            <div>
              <label htmlFor="endTime" className="block text-sm font-medium text-gray-700 mb-1">End Time</label>
              <input 
                type="time"
                id="endTime"
                name="endTime"
                value={endTime}
                onChange={(e) => setEndTime(e.target.value)}
                required
                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-primary focus:border-primary sm:text-sm text-gray-900"
                disabled={isSubmitting}
              />
            </div>
          </div>

          {submitError && (
            <div className="mb-4 p-3 bg-red-100 text-red-700 text-sm rounded-md">
              {submitError}
            </div>
          )}

          <div className="flex justify-end gap-3">
            <button
              type="button"
              onClick={onClose} // Use the onClose prop to close the modal
              disabled={isSubmitting}
              className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md shadow-sm hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500 disabled:opacity-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting || goalsLoading || !!goalsError}
              className="px-4 py-2 text-sm font-medium text-white bg-primary border border-transparent rounded-md shadow-sm hover:bg-primary-dark focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary disabled:opacity-50"
            >
              {isSubmitting ? 'Saving...' : 'Save Allocation'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
} 