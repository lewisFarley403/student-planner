import { useState, useEffect } from 'react';
import Layout from '@/components/Layout';
import Header from '@/components/Header';
import SectionTitle from '@/components/SectionTitle';
import StudyCard from '@/components/StudyCard';
import { ArrowIcon, BoxIcon } from '@/components/Icons';
import AddAllocationModal from '@/components/AddAllocationModal';
import DayView from '@/components/DayView';
import { supabase } from '@/lib/supabaseClient';
import '@/styles/colors.css'; 
import StudyCardList from '@/components/StudyCardList';
export default function Calendar() {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedView, setSelectedView] = useState('week');
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [studyAllocations, setStudyAllocations] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [initialStartTime, setInitialStartTime] = useState(null);

  // State for goals dropdown
  const [timeGoals, setTimeGoals] = useState([]);
  const [goalsLoading, setGoalsLoading] = useState(false);
  const [goalsError, setGoalsError] = useState(null);

  // Get the first day of the current month
  const getFirstDayOfMonth = (date) => {
    return new Date(date.getFullYear(), date.getMonth(), 1);
  };

  // Get the number of days in a month
  const getDaysInMonth = (date) => {
    return new Date(date.getFullYear(), date.getMonth() + 1, 0).getDate();
  };

  // Get month name
  const getMonthName = (date) => {
    return new Intl.DateTimeFormat('en-US', { month: 'short' }).format(date);
  };

  // Generate calendar days for a month
  const generateCalendarDays = (date) => {
    const firstDay = getFirstDayOfMonth(date);
    const daysInMonth = getDaysInMonth(date);
    const startingDay = firstDay.getDay(); // 0 = Sunday
    
    const days = [];
    // Add empty spaces for days before the first day of the month
    for (let i = 0; i < startingDay; i++) {
      days.push(null);
    }
    
    // Add the days of the month
    for (let i = 1; i <= daysInMonth; i++) {
      days.push(i);
    }
    
    return days;
  };

  // Get next month's date
  const getNextMonth = (date) => {
    return new Date(date.getFullYear(), date.getMonth() + 1);
  };

  // Check if a date is today
  const isToday = (day, monthDate) => {
    const today = new Date();
    return day === today.getDate() && 
           monthDate.getMonth() === today.getMonth() && 
           monthDate.getFullYear() === today.getFullYear();
  };



  const currentMonthDays = generateCalendarDays(currentDate);
  const nextMonth = getNextMonth(currentDate);
  const nextMonthDays = generateCalendarDays(nextMonth);

  // Function to format a Date object to 'YYYY-MM-DD'
  const formatDateForAPI = (date) => {
    if (!date) return ''; // Return empty string if date is null/undefined
    const year = date.getFullYear();
    // Month is 0-indexed, so add 1 and pad with 0 if needed
    const month = (date.getMonth() + 1).toString().padStart(2, '0'); 
    const day = date.getDate().toString().padStart(2, '0');
    return `${year}-${month}-${day}`;
  };

  // Fetch study allocations - this will now run on initial load because selectedDate is set
  const fetchStudyAllocations = async () => {
    if (!selectedDate) { 
      setStudyAllocations([]); 
      return; 
    }

    try {
      setLoading(true);
      setError(null);
      // Removed setStudyAllocations([]) here - let it show previous day's briefly if needed? Or keep it? 
      // Let's keep it for now to ensure a clean loading state.
      setStudyAllocations([]); 

      const { data: { session } } = await supabase.auth.getSession();
      
      if (!session) {
        // Consider redirecting to login or showing a message
        throw new Error('No authenticated session');
      }

      const dateParam = formatDateForAPI(selectedDate); 
      const apiUrl = `/api/getstudyallocations?date=${dateParam}`;

      console.log("Fetching from API URL:", apiUrl); 

      const response = await fetch(apiUrl, { 
        headers: {
          'Authorization': `Bearer ${session.access_token}`
        },
      });

      const responseData = await response.json();
      console.log('Response data:', responseData); 

      if (!response.ok) {
        throw new Error(`Failed to fetch study allocations: ${responseData.error || 'Unknown error'}`);
      }

      setStudyAllocations(responseData.data || []); 
    } catch (err) {
      setError(err.message);
      console.error('Error fetching study allocations:', err);
      setStudyAllocations([]); 
    } finally {
      setLoading(false);
    }
  };

  // This useEffect will now run on initial mount because selectedDate is initialized
  useEffect(() => {
    fetchStudyAllocations(); 
  }, [selectedDate]); // Dependency array is correct

  // Fetch time goals when the modal is about to open
  useEffect(() => {
    const fetchGoals = async () => {
      console.log("Fetching time goals...");
      // Only fetch if modal is opening and goals aren't loaded
      if (isAddModalOpen && timeGoals.length === 0) { 
        setGoalsLoading(true);
        setGoalsError(null);
        try {
          const { data: { session }, error: sessionError } = await supabase.auth.getSession();
          if (sessionError || !session) {
            throw new Error(sessionError?.message || 'No authenticated session');
          }

          const response = await fetch('/api/gettimegoals', {
            headers: {
              'Authorization': `Bearer ${session.access_token}`
            }
          });

          const result = await response.json();

          if (!response.ok || !result.success) {
            throw new Error(result.error || 'Failed to fetch time goals');
          }
          console.log('Fetched time goals:');
          console.log(result.data); // Log the fetched data
          setTimeGoals(result.data || []);
        } catch (err) {
          console.error('Error fetching time goals:', err);
          setGoalsError(err.message);
        } finally {
          setGoalsLoading(false);
        }
      }
    };

    fetchGoals();
  }, [isAddModalOpen]); // Rerun when isAddModalOpen changes

  // --- Function to handle submission from the modal --- 
  const handleAddNewAllocation = async (allocationData) => {
    console.log("Attempting to submit new allocation:", allocationData);
    // No need for isSubmitting state here, modal handles its own internal state
    
    try {
      const { data: { session }, error: sessionError } = await supabase.auth.getSession();
      if (sessionError) throw new Error(sessionError.message);
      if (!session) throw new Error('Authentication required. Please log in again.');

      const response = await fetch('/api/addstudyallocation', {
        method: 'POST', 
        headers: {
          'Authorization': `Bearer ${session.access_token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(allocationData) // Send data received from modal
      });
      
      const result = await response.json();

      if (!response.ok || !result.success) {
        // If API returns an error, throw it so the modal can display it
        console.error("API Error response:", result);
        throw new Error(result.error || 'Failed to save allocation. Please check details and try again.');
      }

      // --- Success --- 
      console.log("Allocation added successfully:", result.data);
      setIsAddModalOpen(false); // Close modal
      fetchStudyAllocations(); // Refresh the list for the currently selected date
      // TODO: Optionally show a success message (e.g., using a toast library)
      // alert('Study allocation added successfully!'); // Simple alert for now

    } catch (error) {
      console.error("Error submitting allocation:", error);
      // IMPORTANT: Rethrow the error. The modal component's handleSubmit 
      // has a catch block that will use this error message to update its 
      // own submitError state, displaying the error to the user within the modal.
      throw error; 
    }
    // No finally block needed here to set loading state, as modal handles it
  };

  const renderWeekView = () => (
    <>
      <div className="flex flex-wrap items-center justify-center gap-6 p-4">
        {/* Current Month Calendar */}
        <div className="flex min-w-72 max-w-[336px] flex-1 flex-col gap-0.5">
          <div className="flex items-center p-1 justify-between">
            <button onClick={() => setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1))}>
              <div className="text-[#111517] flex size-10 items-center justify-center">
                <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" fill="currentColor" viewBox="0 0 256 256">
                  <path d="M165.66,202.34a8,8,0,0,1-11.32,11.32l-80-80a8,8,0,0,1,0-11.32l80-80a8,8,0,0,1,11.32,11.32L91.31,128Z" />
                </svg>
              </div>
            </button>
            <p className="text-[#111517] text-base font-bold leading-tight flex-1 text-center pr-10">
              {getMonthName(currentDate)} {currentDate.getFullYear()}
            </p>
            <button onClick={() => setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1))} className="md:hidden">
              <div className="text-[#111517] flex size-10 items-center justify-center">
                <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" fill="currentColor" viewBox="0 0 256 256">
                  <path d="M181.66,133.66l-80,80a8,8,0,0,1-11.32-11.32L164.69,128,90.34,53.66a8,8,0,0,1,11.32-11.32l80,80A8,8,0,0,1,181.66,133.66Z" />
                </svg>
              </div>
            </button>
          </div>

          <div className="grid grid-cols-7">
            {['S', 'M', 'T', 'W', 'T', 'F', 'S'].map((day, index) => (
              <p key={index} className="text-[#111517] text-[13px] font-bold leading-normal tracking-[0.015em] flex h-12 w-full items-center justify-center pb-0.5">
                {day}
              </p>
            ))}

            {currentMonthDays.map((day, index) => (
              <button
                key={index}
                onClick={() => day && setSelectedDate(new Date(currentDate.getFullYear(), currentDate.getMonth(), day))}
                className={`h-12 w-full ${
                  day === null ? 'invisible' : 'hover:bg-[#f0f3f4] active:bg-[#e4e9ec] transition-colors'
                } ${
                  selectedDate && day === selectedDate.getDate() && currentDate.getMonth() === selectedDate.getMonth() && currentDate.getFullYear() === selectedDate.getFullYear() ? 'bg-[#f0f3f4]' : '' 
                } text-sm font-medium leading-normal text-[#111517] rounded-lg`}
              >
                <div className={`flex size-full items-center justify-center rounded-full ${
                  isToday(day, currentDate) ? 'bg-primary text-white hover:bg-primary-dark' : ''
                }`}>
                  {day}
                </div>
              </button>
            ))}
          </div>
        </div>

        {/* Next Month Calendar - Hidden on mobile */}
        <div className="hidden md:flex min-w-72 max-w-[336px] flex-1 flex-col gap-0.5">
          <div className="flex items-center p-1 justify-between">
            <p className="text-[#111517] text-base font-bold leading-tight flex-1 text-center pl-10">
              {getMonthName(nextMonth)} {nextMonth.getFullYear()}
            </p>
            <button onClick={() => setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1))}>
              <div className="text-[#111517] flex size-10 items-center justify-center">
                <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" fill="currentColor" viewBox="0 0 256 256">
                  <path d="M181.66,133.66l-80,80a8,8,0,0,1-11.32-11.32L164.69,128,90.34,53.66a8,8,0,0,1,11.32-11.32l80,80A8,8,0,0,1,181.66,133.66Z" />
                </svg>
              </div>
            </button>
          </div>

          <div className="grid grid-cols-7">
            {['S', 'M', 'T', 'W', 'T', 'F', 'S'].map((day, index) => (
              <p key={index} className="text-[#111517] text-[13px] font-bold leading-normal tracking-[0.015em] flex h-12 w-full items-center justify-center pb-0.5">
                {day}
              </p>
            ))}

            {nextMonthDays.map((day, index) => (
              <button
                key={index}
                onClick={() => day && setSelectedDate(new Date(nextMonth.getFullYear(), nextMonth.getMonth(), day))}
                className={`h-12 w-full ${
                  day === null ? 'invisible' : 'hover:bg-[#f0f3f4] active:bg-[#e4e9ec] transition-colors'
                } ${
                  selectedDate && day === selectedDate.getDate() && nextMonth.getMonth() === selectedDate.getMonth() && nextMonth.getFullYear() === selectedDate.getFullYear() ? 'bg-[#f0f3f4]' : '' 
                } text-sm font-medium leading-normal text-[#111517] rounded-lg`}
              >
                <div className={`flex size-full items-center justify-center rounded-full ${
                  isToday(day, nextMonth) ? 'bg-primary text-white hover:bg-primary-dark' : ''
                }`}>
                  {day}
                </div>
              </button>
            ))}
          </div>
        </div>
      </div>

      <SectionTitle>Study Allocations</SectionTitle>
      
      {loading && (
        <div className="p-4 text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900 mx-auto"></div>
        </div>
      )}
      
      {error && (
        <div className="p-4 text-red-500 text-center">
          {error}
        </div>
      )}

      {!loading && !error && studyAllocations.length === 0 && (
        <div className="p-4 text-center text-gray-500">
          No study allocations for this date
        </div>
      )}

      {/* <div className="px-4">
        {!loading && !error && studyAllocations.map((allocation) => (
          <StudyCard 
            key={allocation.id}
            allocation={allocation}
            course={allocation.timeGoal.title}
            time={`${new Date(allocation.start_time).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} - ${new Date(allocation.end_time).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`}
            icon={<ArrowIcon />}
            completed={allocation.completed}
          />
        ))}
      </div> */}
      <StudyCardList 
        loading={loading} 
        error={error} 
        studyAllocations={studyAllocations}
      />
    </>
  );
  function handleAddStudyEvent(start_time) {
    setIsAddModalOpen(true);
    setSelectedDate(new Date(start_time));
    setInitialStartTime(start_time);
  }

  return (
    <Layout title="Calendar - Student Planner">
      <Header title="Calendar" />
      
      <div className="relative flex flex-col h-[calc(100vh-64px)] bg-white overflow-hidden" style={{ fontFamily: 'Lexend, "Noto Sans", sans-serif' }}>
        <div className="flex-none">
          <div className="flex items-center bg-white p-4 pb-2 justify-between">
            <div className="text-[#111517] flex size-12 shrink-0 items-center">
              <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" fill="currentColor" viewBox="0 0 256 256">
                <path d="M208,32H184V24a8,8,0,0,0-16,0v8H88V24a8,8,0,0,0-16,0v8H48A16,16,0,0,0,32,48V208a16,16,0,0,0,16,16H208a16,16,0,0,0,16-16V48A16,16,0,0,0,208,32ZM72,48v8a8,8,0,0,0,16,0V48h80v8a8,8,0,0,0,16,0V48h24V80H48V48ZM208,208H48V96H208V208Z" />
              </svg>
            </div>
          </div>

          <div className="pb-3">
            <div className="flex border-b border-[#dce1e5] px-4 gap-8">
              <button
                className={`flex flex-col items-center justify-center border-b-[3px] pb-[13px] pt-4 ${
                  selectedView === 'day'
                    ? 'border-b-primary text-primary'
                    : 'border-b-transparent text-[#647987]'
                }`}
                onClick={() => setSelectedView('day')}
              >
                <p className="text-sm font-bold leading-normal tracking-[0.015em]">Day</p>
              </button>
              <button
                className={`flex flex-col items-center justify-center border-b-[3px] pb-[13px] pt-4 ${
                  selectedView === 'week'
                    ? 'border-b-primary text-primary'
                    : 'border-b-transparent text-[#647987]'
                }`}
                onClick={() => setSelectedView('week')}
              >
                <p className="text-sm font-bold leading-normal tracking-[0.015em]">Week</p>
              </button>
            </div>
          </div>
        </div>

        <div className="flex-1 min-h-0">
          {selectedView === 'day' ? (
            <DayView
              selectedDate={selectedDate}
              studyAllocations={studyAllocations}
              onDateChange={setSelectedDate}
              loading={loading}
              error={error}
              onAddStudyEvent={handleAddStudyEvent}
            />
          ) : (
            <div className="h-full overflow-y-auto">
              {renderWeekView()}
            </div>
          )}
        </div>

        {/* Render the Modal */}
        <AddAllocationModal
          isOpen={isAddModalOpen}
          onClose={() => {
            setIsAddModalOpen(false);
            setInitialStartTime(null);
          }}
          onSubmit={handleAddNewAllocation}
          initialDate={selectedDate || new Date()}
          initialStartTime={initialStartTime}
          goals={timeGoals}
          goalsLoading={goalsLoading}
          goalsError={goalsError}
        />

        {/* FAB */}
        <button
          onClick={() => setIsAddModalOpen(true)}
          className="fixed bottom-20 right-6 bg-primary text-white rounded-full p-4 shadow-lg hover:bg-primary-dark focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 transition-colors z-40"
          aria-label="Add study allocation"
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
          </svg>
        </button>
      </div>
    </Layout>
  );
} 