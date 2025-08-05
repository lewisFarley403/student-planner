import StudyCard from "./StudyCard";
import { ArrowIcon, BoxIcon } from '@/components/Icons';

function StudyCardList({loading, error, studyAllocations}) {
return(
    <>
    <div className="px-4">
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
    </div>
    </>
)

}
export default StudyCardList;