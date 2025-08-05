import { Geist, Geist_Mono } from "next/font/google";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export default function About() {
  return (
    <div className="grid grid-rows-[20px_1fr_20px] items-center justify-items-center min-h-screen p-8 pb-20 gap-16 sm:p-20 font-[family-name:var(--font-geist-sans)]">
      <main className="flex flex-col gap-[32px] row-start-2 items-center max-w-2xl">
        <h1 className="text-4xl font-bold text-center">About Student Planner</h1>
        
        <div className="space-y-6 text-lg">
          <p>
            Student Planner is a modern, intuitive application designed to help students manage their academic life more effectively.
          </p>
          
          <p>
            Our mission is to provide students with a seamless way to organize their coursework, track assignments, and maintain a balanced academic schedule.
          </p>
          
          <div className="mt-8">
            <h2 className="text-2xl font-semibold mb-4">Features</h2>
            <ul className="list-disc list-inside space-y-2">
              <li>Task Management</li>
              <li>Course Organization</li>
              <li>Assignment Tracking</li>
              <li>Schedule Planning</li>
              <li>Progress Monitoring</li>
            </ul>
          </div>
        </div>
      </main>
    </div>
  );
} 