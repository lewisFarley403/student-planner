import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import Layout from '@/components/Layout';
import Header from '@/components/Header';
import { supabase } from '@/lib/supabaseClient';

export default function Timer() {
  const router = useRouter();
  const { allocationId, startTime, endTime, title } = router.query;
  
  const [timeLeft, setTimeLeft] = useState(null);
  const [isComplete, setIsComplete] = useState(false);
  const [error, setError] = useState(null);
  const [description, setDescription] = useState('');
  const [isPomodoro, setIsPomodoro] = useState(false);
  const [pomodoroTime, setPomodoroTime] = useState(25 * 60); // 25 minutes in seconds
  const [isBreak, setIsBreak] = useState(false);
  const [canStart, setCanStart] = useState(false);
  const [hasStarted, setHasStarted] = useState(false);
  const [isOutsideTimeWindow, setIsOutsideTimeWindow] = useState(false);
  const [timerFinished, setTimerFinished] = useState(false);

  // Initial time window check - only runs once on mount
  useEffect(() => {
    if (!startTime) return;

    const checkTimeWindow = () => {
      const now = new Date();
      const start = new Date(startTime);
      const fiveMinutes = 5 * 60 * 1000; // 5 minutes in milliseconds
      
      const isWithinWindow = Math.abs(now - start) <= fiveMinutes;
      setCanStart(isWithinWindow);
      setIsOutsideTimeWindow(!isWithinWindow);
    };

    checkTimeWindow();
  }, [startTime]);

  // Pomodoro timer effect
  useEffect(() => {
    if (!isPomodoro || !canStart || isOutsideTimeWindow) return;

    setHasStarted(true);
    const timer = setInterval(() => {
      setPomodoroTime((prev) => {
        if (prev <= 0) {
          setIsBreak(!isBreak);
          return isBreak ? 25 * 60 : 5 * 60; // Switch between 25min work and 5min break
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [isPomodoro, isBreak, canStart, isOutsideTimeWindow]);

  // Study session timer effect
  useEffect(() => {
    if (isPomodoro || !startTime || !endTime || isOutsideTimeWindow) return;

    setHasStarted(true);
    const calculateTimeLeft = () => {
      const now = new Date();
      const end = new Date(endTime);
      const difference = end - now;

      if (difference <= 0) {
        setTimeLeft(0);
        setTimerFinished(true);
        return;
      }

      const hours = Math.floor(difference / (1000 * 60 * 60));
      const minutes = Math.floor((difference % (1000 * 60 * 60)) / (1000 * 60));
      const seconds = Math.floor((difference % (1000 * 60)) / 1000);

      setTimeLeft({ hours, minutes, seconds });
    };

    calculateTimeLeft();
    const timer = setInterval(calculateTimeLeft, 1000);

    return () => clearInterval(timer);
  }, [startTime, endTime, isPomodoro, isOutsideTimeWindow]);

  const handleCompletion = async () => {
    if (isComplete) return;
    
    try {
      const { data: { session }, error: sessionError } = await supabase.auth.getSession();
      if (sessionError) throw new Error(sessionError.message);
      if (!session) throw new Error('Authentication required. Please log in again.');

      const response = await fetch('/api/completestudyallocation', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${session.access_token}`
        },
        body: JSON.stringify({ 
          allocationId,
          description,
          completedWithPomodoro: isPomodoro
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to mark allocation as complete');
      }

      setIsComplete(true);
    } catch (error) {
      setError(error.message);
    }
  };

  const formatTime = (time) => {
    if (!time) return '00:00:00';
    if (isPomodoro) {
      const minutes = Math.floor(time / 60);
      const seconds = time % 60;
      return `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
    }
    const { hours, minutes, seconds } = time;
    return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
  };

  const togglePomodoro = () => {
    setIsPomodoro(!isPomodoro);
    setPomodoroTime(25 * 60);
    setIsBreak(false);
  };

  return (
    <Layout title="Study Timer - Student Planner">
      <Header title="Study Timer" />
      
      <div className="flex flex-col items-center justify-center min-h-[calc(100vh-64px)] bg-white p-4">
        <div className="text-center max-w-md w-full">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">{title}</h2>
          
          {isOutsideTimeWindow ? (
            <div className="text-yellow-500 mb-4">
              You can start this study session 5 minutes before or after the scheduled start time.
            </div>
          ) : error ? (
            <div className="text-red-500 mb-4">{error}</div>
          ) : isComplete ? (
            <div className="text-green-500 text-xl mb-4">Study session completed! 🎉</div>
          ) : timerFinished ? (
            <>
              <div className="text-4xl font-mono mb-4">00:00:00</div>
              <div className="mb-6">
                <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-2">
                  What did you study?
                </label>
                <textarea
                  id="description"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-primary focus:border-primary"
                  rows={4}
                  placeholder="Describe what you studied during this session..."
                />
              </div>
              <button
                onClick={handleCompletion}
                disabled={!description.trim()}
                className="px-4 py-2 text-sm font-medium text-white bg-primary rounded-md hover:bg-primary-dark focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Complete Session
              </button>
            </>
          ) : (
            <>
              <div className="text-4xl font-mono mb-4">
                {isPomodoro ? formatTime(pomodoroTime) : formatTime(timeLeft)}
              </div>
              
              {isPomodoro && (
                <div className="text-lg mb-4">
                  {isBreak ? 'Break Time' : 'Focus Time'}
                </div>
              )}

              <div className="mb-6">
                <button
                  onClick={togglePomodoro}
                  className={`px-4 py-2 text-sm font-medium rounded-md mr-2 ${
                    isPomodoro 
                      ? 'bg-gray-200 text-gray-700 hover:bg-gray-300' 
                      : 'bg-primary text-white hover:bg-primary-dark'
                  }`}
                >
                  {isPomodoro ? 'Switch to Study Timer' : 'Use Pomodoro Timer'}
                </button>
              </div>

              <div className="mb-6">
                <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-2">
                  What did you study?
                </label>
                <textarea
                  id="description"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-primary focus:border-primary"
                  rows={4}
                  placeholder="Describe what you studied during this session..."
                />
              </div>

              <button
                onClick={handleCompletion}
                disabled={!description.trim()}
                className="px-4 py-2 text-sm font-medium text-white bg-primary rounded-md hover:bg-primary-dark focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Complete Session
              </button>
            </>
          )}

          <button
            onClick={() => router.push('/calendar')}
            className="mt-4 px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500"
          >
            Return to Calendar
          </button>
        </div>
      </div>
    </Layout>
  );
}