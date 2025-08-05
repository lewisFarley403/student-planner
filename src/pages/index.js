import { useEffect, useState } from 'react';
import Head from 'next/head';
import Link from 'next/link';
import { ProtectedRoute } from '@/components/ProtectedRoute';
import Navigation from '@/components/Navigation';
import Layout from '@/components/Layout';
import Header from '@/components/Header';
import SectionTitle from '@/components/SectionTitle';
import StudyCard from '@/components/StudyCard';
import { CalendarIcon, ExperimentIcon } from '@/components/Icons';
import '@/styles/colors.css'; 
import { supabase } from '@/lib/supabaseClient';


export default function Home() {
  const [studyAllocations, setStudyAllocations] = useState([]);
  useEffect(() => {
    async function fetchStudyAllocations() {
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
        if (!response.ok) {
          throw new Error('Failed to fetch study allocations');
        }
        const data = await response.json();
        if (data.success) {
          setStudyAllocations(data.data);
        } else {
          console.error('Error fetching study allocations:', data.error);
        }
      } catch (error) {
        console.error('Error fetching study allocations:', error);
      }
    }
    fetchStudyAllocations();
  }, []);
  return (
    <Layout title="My Week">
      <Header title="My Week" />
      
      {/* Time Management Quest Card */}
      <div className="p-4">
        <div className="relative rounded-2xl overflow-hidden h-48">
          <img 
            src="https://cdn.usegalileo.ai/sdxl10/05009e48-75f9-4578-893f-56db9d4415f2.png"
            alt="Student studying"
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-b from-transparent to-black/50 p-6 flex flex-col justify-end">
            <h2 className="text-white text-2xl font-bold mb-2">Time Management Quest</h2>
            <p className="text-white text-sm">Achieve 30 hours of focused study this week to unlock rewards!</p>
          </div>
        </div>
      </div>

      {/* Study Goals */}
      <section className="p-4">
        <SectionTitle>Study Goals</SectionTitle>
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="font-semibold text-primary">ECM2434</h3>
              <p className="text-secondary text-sm">Study 10 hours</p>
            </div>
            <span className="text-primary font-bold">3</span>
          </div>
          <div className="flex items-center justify-between">
            <div>
              <h3 className="font-semibold text-primary">MTH1001</h3>
              <p className="text-secondary text-sm">Study 8 hours</p>
            </div>
            <span className="text-primary font-bold">4</span>
          </div>
          
          {/* Weekly Goal Progress */}
          <div>
            <div className="flex justify-between items-center mb-2">
              <span className="text-secondary">Weekly Goal</span>
              <span className="text-primary">60%</span>
            </div>
            <div className="h-2 bg-gray-200 rounded-full">
              <div className="h-full w-[60%] bg-primary rounded-full"></div>
            </div>
            <p className="text-secondary text-sm mt-1">30 hours</p>
          </div>
        </div>
      </section>

      {/* Weekly Chart */}
      <section className="p-4">
        <SectionTitle>Weekly Chart</SectionTitle>
        <div className="rounded-xl border border-custom p-6">
          <div className="mb-4">
            <h3 className="text-base font-medium text-primary">Weekly Hours Tracked</h3>
            <p className="text-[32px] font-bold text-primary leading-tight">12.3h</p>
            <div className="flex gap-1 items-center">
              <span className="text-secondary">Last Week</span>
              <span className="text-success font-medium">+30%</span>
            </div>
          </div>
          
          <div className="grid grid-cols-7 gap-6 h-[180px] items-end mt-6">
            {[
              { day: 'Mon', height: '40%' },
              { day: 'Tue', height: '30%' },
              { day: 'Wed', height: '40%' },
              { day: 'Thu', height: '70%' },
              { day: 'Fri', height: '50%' },
              { day: 'Sat', height: '20%' },
              { day: 'Sun', height: '100%' }
            ].map(({ day, height }) => (
              <div key={day} className="flex flex-col items-center w-full">
                <div 
                  className="w-full bg-custom-light border-t-2 border-custom"
                  style={{ height }}
                />
                <p className="text-secondary text-[13px] font-bold mt-2">{day}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Next Up */}
      <section className="p-4">
        <SectionTitle>Next Up</SectionTitle>
        <div className="space-y-4">
          <StudyCard 
            course="Calculus Assignment"
            time="Due Friday, April 26"
            icon={<CalendarIcon />}
          />
          <StudyCard 
            course="Physics Experiment"
            time="Due Monday, April 29"
            icon={<ExperimentIcon />}
          />
        </div>
      </section>
    </Layout>
  );
}
