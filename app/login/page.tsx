'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabase'

export default function LoginPage() {
  const router = useRouter()

  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState('')

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setMessage('')

    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    })

    if (error) {
      setMessage(error.message)
      setLoading(false)
      return
    }

    const userId = data.user?.id

    if (userId) {
      const { data: profile } = await supabase
        .from('profiles')
        .select('onboarding_completed')
        .eq('id', userId)
        .single()

      if (!profile?.onboarding_completed) {
        setLoading(false)
        router.push('/onboarding')
        return
      }
    }

    setLoading(false)
    router.push('/feed')
  }

  return (
    <main className="flex min-h-screen items-center justify-center bg-[#fff7f4] px-4">
      <div className="w-full max-w-md rounded-[32px] bg-white p-8 shadow-[0_20px_60px_rgba(255,140,90,0.10)]">
        <div className="mb-6 text-center">
          <img
            src="/logo.png"
            alt="OnlyThankx"
            className="mx-auto h-14 w-14 rounded-2xl"
          />
          <h1 className="mt-4 text-4xl font-semibold tracking-tight">Welcome back</h1>
          <p className="mt-2 text-gray-500">Login to your OnlyThankx account</p>
        </div>

        <form onSubmit={handleLogin} className="space-y-4">
          <input
            type="email"
            placeholder="Email"
            className="w-full rounded-[22px] border border-orange-100 bg-[#fffaf8] px-4 py-4 outline-none"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />

          <input
            type="password"
            placeholder="Password"
            className="w-full rounded-[22px] border border-orange-100 bg-[#fffaf8] px-4 py-4 outline-none"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />

          {message && <p className="text-sm text-red-500">{message}</p>}

          <button
            type="submit"
            disabled={loading}
            className="w-full rounded-full bg-[#ff8e66] py-3 font-semibold text-white shadow-[0_14px_36px_rgba(255,140,90,0.22)] disabled:opacity-70"
          >
            {loading ? 'Logging in...' : 'Login'}
          </button>
        </form>

        <p className="mt-6 text-center text-sm text-gray-500">
          Don&apos;t have an account?{' '}
          <Link href="/signup" className="text-orange-500">
            Sign up
          </Link>
        </p>
      </div>
    </main>
  )
}