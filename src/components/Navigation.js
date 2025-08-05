import Link from 'next/link';
import { useRouter } from 'next/router';

export default function Navigation() {
  const router = useRouter();
  const currentPath = router.pathname;

  const getLinkClassName = (path) => {
    return `flex flex-col items-center justify-center p-2 rounded-lg transition-colors duration-150 ${
      currentPath === path 
        ? 'text-primary font-medium'
        : 'text-secondary hover:text-primary'
    }`;
  };

  return (
    <nav className="fixed bottom-0 sticky md:top-0 left-0 right-0 bg-white border-t md:border-t-0 md:border-b border-gray-200 z-10">
      <div className="flex justify-around items-center p-4">
        <Link href="/" className={getLinkClassName('/')}>
          <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" fill="currentColor" viewBox="0 0 256 256">
            <path d="M218.83,103.77l-80-75.48a1.14,1.14,0,0,1-.11-.11,16,16,0,0,0-21.53,0l-.11.11L37.17,103.77A16,16,0,0,0,32,115.55V208a16,16,0,0,0,16,16H208a16,16,0,0,0,16-16V115.55A16,16,0,0,0,218.83,103.77ZM208,208H48V115.55l80-75.48,80,75.48Z" />
          </svg>
          <span className="text-xs md:text-sm mt-1 md:mt-0">Home</span>
        </Link>
        <Link href="/calendar" className={getLinkClassName('/calendar')}>
          <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" fill="currentColor" viewBox="0 0 256 256">
            <path d="M208,32H184V24a8,8,0,0,0-16,0v8H88V24a8,8,0,0,0-16,0v8H48A16,16,0,0,0,32,48V208a16,16,0,0,0,16,16H208a16,16,0,0,0,16-16V48A16,16,0,0,0,208,32ZM72,48v8a8,8,0,0,0,16,0V48h80v8a8,8,0,0,0,16,0V48h24V80H48V48ZM208,208H48V96H208V208Z" />
          </svg>
          <span className="text-xs md:text-sm mt-1 md:mt-0">Calendar</span>
        </Link>
        <Link href="/profile" className={getLinkClassName('/profile')}>
          <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" fill="currentColor" viewBox="0 0 256 256">
            <path d="M128,24A104,104,0,1,0,232,128,104.11,104.11,0,0,0,128,24ZM74.08,197.5a64,64,0,0,1,107.84,0,87.83,87.83,0,0,1-107.84,0ZM96,120a32,32,0,1,1,32,32A32,32,0,0,1,96,120Zm97.76,66.41a79.66,79.66,0,0,0-36.06-28.75,48,48,0,1,0-59.4,0,79.66,79.66,0,0,0-36.06,28.75,88,88,0,1,1,131.52,0Z" />
          </svg>
          <span className="text-xs md:text-sm mt-1 md:mt-0">Profile</span>
        </Link>
        <Link href="/timer" className={getLinkClassName('/timer')}>
          <svg xmlns="http://www.w3.org/2000/svg" width="24px" height="24px" fill="currentColor" viewBox="0 0 256 256">
            <path d="M128,24A104,104,0,1,0,232,128,104.11,104.11,0,0,0,128,24Zm0,192a88,88,0,1,1,88-88A88.1,88.1,0,0,1,128,216Zm64-88a8,8,0,0,1-8,8H128a8,8,0,0,1-8-8V72a8,8,0,0,1,16,0v48h48A8,8,0,0,1,192,128Z" />
          </svg>
          <span className="text-xs md:text-sm mt-1 md:mt-0">Timer</span>
        </Link>
      </div>
    </nav>
  );
} 