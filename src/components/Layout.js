import Head from 'next/head';
import Navigation from './Navigation';
import { ProtectedRoute } from './ProtectedRoute';

export default function Layout({ children, title = 'Student Planner' }) {
  return (
    <ProtectedRoute>
      <Head>
        <title>{title}</title>
        <meta name="description" content="Your student planner dashboard" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="" />
        <link
          href="https://fonts.googleapis.com/css2?family=Lexend:wght@400;500;600;700&display=swap"
          rel="stylesheet"
        />
      </Head>

      <div className="min-h-screen bg-white" style={{ fontFamily: 'Lexend, sans-serif' }}>
        {children}
        <Navigation />
      </div>
    </ProtectedRoute>
  );
} 