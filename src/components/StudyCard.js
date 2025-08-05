import { useRouter } from 'next/router';

export default function StudyCard({ allocation, course, time, icon }) {
  console.log("StudyCard allocation:", allocation);
  if (!allocation) {
    console.error("No allocation data provided to StudyCard");
    return null; // Handle the case where allocation is not provided
  }
  const completed = allocation.completed;
  console.log(completed);
  const router = useRouter();

  const handleCompleteTask = () => {
    console.log(allocation);
    router.push({
      pathname: '/timer',
      query: {
        allocationId: allocation.id,
        startTime: allocation.start_time,
        endTime: allocation.end_time,
        title: allocation.timeGoal?.title || course,
      },
    });
  };

  return (
    <div className="bg-white rounded-lg shadow p-4 flex items-center justify-between mb-2">
      <div className="flex items-center">
        <div className="mr-4">{icon}</div>
        <div>
          <div className="font-bold text-lg text-[#111517]">{course}</div>
          <div className="text-sm text-[#647987]">{time}</div>
        </div>
      </div>
      <div>
        {completed ? (
          <span className="text-green-600 font-semibold">Completed ✔️</span>
        ) : (
          <button
            onClick={handleCompleteTask}
            className="px-3 py-1 bg-primary text-white rounded hover:bg-primary-dark text-sm font-medium"
          >
            <span style={{ color: 'red' }}>Complete</span>
          </button>
        )}
      </div>
    </div>
  );
}