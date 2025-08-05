import { useAuth } from '@/context/AuthContext'
import { useRouter } from 'next/router'
import { useEffect } from 'react'

export function ProtectedRoute({ children }) {
  const { user, loading } = useAuth()
  const router = useRouter()

  useEffect(() => {
    if (!loading && !user) {
      router.push('/login')
    }
  }, [user, loading, router])

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#f0f3f4]" style={{ fontFamily: 'Lexend, "Noto Sans", sans-serif' }}>
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-[#111517]" />
      </div>
    )
  }

  return user ? children : null
} 