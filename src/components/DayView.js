import { useState } from 'react';
import StudyCard from './StudyCard';
import { ArrowIcon } from './Icons';
const hour_splits = 12 // we should split each hour into 5 minute blocks, this helps with snapping
export default function DayView({ 
  selectedDate, 
  studyAllocations, 
  onDateChange,
  loading,
  error,
  onAddStudyEvent
}) {
  // Constants
  const TIMELINE_HEIGHT = 24 * 60*2; // 1px per minute, so 1440px tall

  // Format the date for display
  const formatDate = (date) => {
    return new Intl.DateTimeFormat('en-US', {
      weekday: 'long',
      month: 'long',
      day: 'numeric',
      year: 'numeric'
    }).format(date);
  };

  // Navigation
  const getPreviousDay = () => {
    const newDate = new Date(selectedDate);
    newDate.setDate(newDate.getDate() - 1);
    onDateChange(newDate);
  };
  const getNextDay = () => {
    const newDate = new Date(selectedDate);
    newDate.setDate(newDate.getDate() + 1);
    onDateChange(newDate);
  };

  // Helper: get minutes since midnight
  const getMinutes = (dateString) => {
    const d = new Date(dateString);
    return d.getHours() * 60 + d.getMinutes();
  };
  
  // Render hour lines and labels
  const hourLines = Array.from({ length: 25 }, (_, i) => (
    <div
      key={i}
      className="absolute left-0 w-full border-t border-gray-200"
      style={{ top: `${i * 60 * 2}px`, display: 'flex', flexDirection: 'column' }} // 2px per minute
    >
        {Array.from({ length: hour_splits }, (_, i) => (
            <div
                key={i}
                className = "findme"
                // className="absolute left-0 w-full border-t border-gray-200" 
                // 2px per minute
            >
                
            </div>
        ))}
    </div>
  ));

  const hourLabels = Array.from({ length: 25 }, (_, i) => (
    <div
      key={i}
      className="absolute left-0 w-12 text-xs text-gray-400 text-right pr-2"
      style={{ top: `${i * 60 * 2 - 8}px` }} // -8px to vertically center label on line
    >
      {i.toString().padStart(2, '0')}:00
    </div>
  ));
  const handleDoubleClick = (e) => {
    // Get the click position relative to the timeline container
    const rect = e.currentTarget.getBoundingClientRect();
    const clickY = e.clientY - rect.top;
    
    // Calculate the time based on the click position
    // Since we have 2px per minute, we divide by 2 to get minutes
    const minutesSinceMidnight = Math.floor(clickY / 2);
    
    // Convert minutes to hours and minutes
    const hours = Math.floor(minutesSinceMidnight / 60);
    const minutes = minutesSinceMidnight % 60;
    
    // Create a new date object for the selected time
    const clickedTime = new Date(selectedDate);
    clickedTime.setHours(hours, minutes, 0, 0);
    
    // Round to nearest 30 minutes
    const roundedTime = new Date(clickedTime);
    const currentMinutes = roundedTime.getMinutes();
    const roundedMinutes = Math.round(currentMinutes / 30) * 30;
    roundedTime.setMinutes(roundedMinutes);
    
    // Call the onAddStudyEvent prop with the rounded time
    if (onAddStudyEvent) {
      onAddStudyEvent(roundedTime);
    }
  };
  return (
    <div className="flex flex-col h-full">
      {/* Date Navigation Header */}
      <div className="flex-none flex items-center p-4 justify-between border-b border-[#dce1e5]">
        <button onClick={getPreviousDay}>
          <div className="text-[#111517] flex size-10 items-center justify-center">
            <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" fill="currentColor" viewBox="0 0 256 256">
              <path d="M165.66,202.34a8,8,0,0,1-11.32,11.32l-80-80a8,8,0,0,1,0-11.32l80-80a8,8,0,0,1,11.32,11.32L91.31,128Z" />
            </svg>
          </div>
        </button>
        <h2 className="text-[#111517] text-lg font-bold">
          {formatDate(selectedDate)}
        </h2>
        <button onClick={getNextDay}>
          <div className="text-[#111517] flex size-10 items-center justify-center">
            <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" fill="currentColor" viewBox="0 0 256 256">
              <path d="M181.66,133.66l-80,80a8,8,0,0,1-11.32-11.32L164.69,128,90.34,53.66a8,8,0,0,1,11.32-11.32l80,80A8,8,0,0,1,181.66,133.66Z" />
            </svg>
          </div>
        </button>
      </div>

      {/* Timeline */}
      <div className="flex-1 relative overflow-y-auto">
        <div 
          className="relative mx-auto" 
          style={{ height: TIMELINE_HEIGHT, width: '100%' }}
          onDoubleClick={handleDoubleClick}
        >
          {/* Hour labels */}
          <div className="absolute top-0 left-0 w-12 h-full pointer-events-none z-20">
            {hourLabels}
          </div>
          {/* Hour lines */}
          <div className="absolute top-0 left-12 right-0 h-full z-10">
            {hourLines}
          </div>
          {/* Allocations */}
          <div className="absolute top-0 left-12 right-4 h-full z-30">
            {studyAllocations.map((allocation) => {
              const start = getMinutes(allocation.start_time) * 2;
              const end = getMinutes(allocation.end_time) * 2;
              const top = start;
            //   const height = Math.max(end - start, 30);
            const height = end - start;
            console.log(allocation);
              return (
                <div
                  key={allocation.id}
                  className="absolute right-0 left-0 px-1"
                  style={{
                    top: `${top}px`,
                    height: `${height}px`,
                    backgroundColor: allocation.timeGoal.module_colour,
                  }}
                >
                
                  <StudyCard
                    course={allocation.timeGoal.title}
                    time={`${new Date(allocation.start_time).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} - ${new Date(allocation.end_time).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`}
                    icon={<ArrowIcon />}
                    onComplete={() => handleCompleteTask(allocation)}
                    completed={allocation.completed}
                    allocation={allocation}
                  />
                </div>
              );
            })}
          </div>
        </div>
        {loading && (
          <div className="p-4 text-center absolute top-0 left-0 right-0">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900 mx-auto"></div>
          </div>
        )}
        {error && (
          <div className="p-4 text-red-500 text-center absolute top-0 left-0 right-0">
            {error}
          </div>
        )}
        {!loading && !error && studyAllocations.length === 0 && (
          <div className="p-4 text-center text-gray-500 absolute top-0 left-0 right-0">
            No study allocations for this date
          </div>
        )}
      </div>
    </div>
  );
} 