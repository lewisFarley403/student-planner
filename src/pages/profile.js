import Head from 'next/head';
import Link from 'next/link';

export default function Profile() {
  return (
    <>
      <Head>
        <title>Profile - Student Planner</title>
        <meta name="description" content="View and manage your student planner profile" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="" />
        <link
          href="https://fonts.googleapis.com/css2?family=Lexend:wght@400;500;700;900&family=Noto+Sans:wght@400;500;700;900&display=swap"
          rel="stylesheet"
        />
      </Head>

      <div className="relative flex size-full min-h-screen flex-col bg-white justify-between group/design-root overflow-x-hidden" style={{ fontFamily: 'Lexend, "Noto Sans", sans-serif' }}>
        <div>
          {/* Header */}
          <div className="flex flex-col gap-2 bg-white p-4 pb-2">
            <div className="flex items-center h-12 justify-between">
              <Link href="/" className="text-[#111517] flex size-12 shrink-0 items-center">
                <svg xmlns="http://www.w3.org/2000/svg" width="24px" height="24px" fill="currentColor" viewBox="0 0 256 256">
                  <path d="M224,128a8,8,0,0,1-8,8H40a8,8,0,0,1,0-16H216A8,8,0,0,1,224,128ZM40,72H216a8,8,0,0,0,0-16H40a8,8,0,0,0,0,16ZM216,184H40a8,8,0,0,0,0,16H216a8,8,0,0,0,0-16Z" />
                </svg>
              </Link>
            </div>
            <p className="text-[#111517] tracking-light text-[28px] font-bold leading-tight">Profile</p>
          </div>

          {/* Profile Section */}
          <div className="flex flex-col items-center p-4">
            <div
              className="bg-center bg-no-repeat aspect-square bg-cover rounded-full size-24 mb-4"
              style={{ backgroundImage: 'url("https://cdn.usegalileo.ai/sdxl10/05009e48-75f9-4578-893f-56db9d4415f2.png")' }}
            />
            <h2 className="text-[#111517] text-2xl font-bold mb-2">John Doe</h2>
            <p className="text-[#647987] text-base mb-6">Level 2 Student</p>
          </div>

          {/* Stats Section */}
          <div className="p-4">
            <h3 className="text-[#111517] text-xl font-bold mb-4">Your Progress</h3>
            <div className="flex flex-wrap gap-4">
              <div className="flex min-w-[158px] flex-1 flex-col gap-2 rounded-xl p-6 border border-[#dce1e5]">
                <p className="text-[#111517] text-base font-medium leading-normal">Total Study Hours</p>
                <p className="text-[#111517] tracking-light text-2xl font-bold leading-tight">156</p>
              </div>
              <div className="flex min-w-[158px] flex-1 flex-col gap-2 rounded-xl p-6 border border-[#dce1e5]">
                <p className="text-[#111517] text-base font-medium leading-normal">Current Streak</p>
                <p className="text-[#111517] tracking-light text-2xl font-bold leading-tight">4 days</p>
              </div>
              <div className="flex min-w-[158px] flex-1 flex-col gap-2 rounded-xl p-6 border border-[#dce1e5]">
                <p className="text-[#111517] text-base font-medium leading-normal">Achievements</p>
                <p className="text-[#111517] tracking-light text-2xl font-bold leading-tight">8</p>
              </div>
            </div>
          </div>

          {/* Settings Section */}
          <div className="p-4">
            <h3 className="text-[#111517] text-xl font-bold mb-4">Settings</h3>
            <div className="space-y-4">
              <button className="w-full flex items-center justify-between p-4 rounded-xl border border-[#dce1e5] hover:bg-[#f0f3f4] transition-colors">
                <span className="text-[#111517] font-medium">Notification Settings</span>
                <svg xmlns="http://www.w3.org/2000/svg" width="24px" height="24px" fill="currentColor" viewBox="0 0 256 256">
                  <path d="M184.49,136.49l-80,80a12,12,0,0,1-17,0l-40-40a12,12,0,0,1,17-17L96,183l71.51-71.51a12,12,0,0,1,17,17Z" />
                </svg>
              </button>
              <button className="w-full flex items-center justify-between p-4 rounded-xl border border-[#dce1e5] hover:bg-[#f0f3f4] transition-colors">
                <span className="text-[#111517] font-medium">Study Goals</span>
                <svg xmlns="http://www.w3.org/2000/svg" width="24px" height="24px" fill="currentColor" viewBox="0 0 256 256">
                  <path d="M184.49,136.49l-80,80a12,12,0,0,1-17,0l-40-40a12,12,0,0,1,17-17L96,183l71.51-71.51a12,12,0,0,1,17,17Z" />
                </svg>
              </button>
              <button className="w-full flex items-center justify-between p-4 rounded-xl border border-[#dce1e5] hover:bg-[#f0f3f4] transition-colors">
                <span className="text-[#111517] font-medium">Privacy Settings</span>
                <svg xmlns="http://www.w3.org/2000/svg" width="24px" height="24px" fill="currentColor" viewBox="0 0 256 256">
                  <path d="M184.49,136.49l-80,80a12,12,0,0,1-17,0l-40-40a12,12,0,0,1,17-17L96,183l71.51-71.51a12,12,0,0,1,17,17Z" />
                </svg>
              </button>
              <button className="w-full flex items-center justify-between p-4 rounded-xl border border-[#dce1e5] hover:bg-[#f0f3f4] transition-colors">
                <span className="text-[#111517] font-medium">Help & Support</span>
                <svg xmlns="http://www.w3.org/2000/svg" width="24px" height="24px" fill="currentColor" viewBox="0 0 256 256">
                  <path d="M184.49,136.49l-80,80a12,12,0,0,1-17,0l-40-40a12,12,0,0,1,17-17L96,183l71.51-71.51a12,12,0,0,1,17,17Z" />
                </svg>
              </button>
            </div>
          </div>
        </div>

        {/* Navigation */}
        <div>
          <div className="flex gap-2 border-t border-[#f0f3f4] bg-white px-4 pb-3 pt-2">
            <Link 
              href="/"
              className="flex flex-1 flex-col items-center justify-end gap-1 rounded-full text-[#647987]"
            >
              <div className="flex h-8 items-center justify-center">
                <svg xmlns="http://www.w3.org/2000/svg" width="24px" height="24px" fill="currentColor" viewBox="0 0 256 256">
                  <path d="M224,115.55V208a16,16,0,0,1-16,16H168a16,16,0,0,1-16-16V168a8,8,0,0,0-8-8H112a8,8,0,0,0-8,8v40a16,16,0,0,1-16,16H48a16,16,0,0,1-16-16V115.55a16,16,0,0,1,5.17-11.78l80-75.48.11-.11a16,16,0,0,1,21.53,0,1.14,1.14,0,0,0,.11.11l80,75.48A16,16,0,0,1,224,115.55Z" />
                </svg>
              </div>
            </Link>
            <Link 
              href="/timer"
              className="flex flex-1 flex-col items-center justify-end gap-1 rounded-full text-[#647987]"
            >
              <div className="flex h-8 items-center justify-center">
                <svg xmlns="http://www.w3.org/2000/svg" width="24px" height="24px" fill="currentColor" viewBox="0 0 256 256">
                  <path d="M128,24A104,104,0,1,0,232,128,104.11,104.11,0,0,0,128,24Zm0,192a88,88,0,1,1,88-88A88.1,88.1,0,0,1,128,216Zm64-88a8,8,0,0,1-8,8H128a8,8,0,0,1-8-8V72a8,8,0,0,1,16,0v48h48A8,8,0,0,1,192,128Z" />
                </svg>
              </div>
            </Link>
            <div className="flex flex-1 flex-col items-center justify-end gap-1 rounded-full text-[#111517]">
              <div className="flex h-8 items-center justify-center">
                <svg xmlns="http://www.w3.org/2000/svg" width="24px" height="24px" fill="currentColor" viewBox="0 0 256 256">
                  <path d="M230.92,212c-15.23-26.33-38.7-45.21-66.09-54.16a72,72,0,1,0-73.66,0C63.78,166.78,40.31,185.66,25.08,212a8,8,0,1,0,13.85,8c18.84-32.56,52.14-52,89.07-52s70.23,19.44,89.07,52a8,8,0,1,0,13.85-8ZM72,96a56,56,0,1,1,56,56A56.06,56.06,0,0,1,72,96Z" />
                </svg>
              </div>
            </div>
          </div>
          <div className="h-5 bg-white" />
        </div>
      </div>
    </>
  );
} 