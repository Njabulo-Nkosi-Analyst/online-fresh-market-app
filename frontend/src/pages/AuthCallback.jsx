import { useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { supabase } from '@/lib/supabase'

const AuthCallback = () => {
  const navigate = useNavigate()

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      // Whether or not session exists, go home — AuthContext handles the rest
      navigate('/', { replace: true })
    })
  }, [navigate])

  return (
    <div className="flex items-center justify-center h-screen bg-[#0e0f0c]">
      <p className="text-[#a8a69c] text-sm animate-pulse">Signing you in…</p>
    </div>
  )
}

export default AuthCallback
