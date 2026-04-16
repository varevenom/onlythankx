'use client'

import Link from 'next/link'
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabase'

export default function SignupPage() {
  const router = useRouter()

  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState('')

  const handleSignup = async () => {
    if (!email.trim() || !password.trim()) {
      setMessage('Please enter email and password.')
      return
    }

    if (password.trim().length < 6) {
      setMessage('Password must be at least 6 characters.')
      return
    }

    setLoading(true)
    setMessage('')

    const { error } = await supabase.auth.signUp({
      email: email.trim(),
      password: password.trim(),
    })

    if (error) {
      setMessage(error.message)
      setLoading(false)
      return
    }

    setLoading(false)
    router.push('/onboarding')
  }

  return (
    <main className="min-h-screen bg-[#fff7f4] px-4 py-10">
      <div className="mx-auto max-w-md rounded-[32px] border border-orange-100 bg-white p-8 shadow-[0_20px_60px_rgba(255,140,90,0.10)]">
        <div className="mb-6 text-center">
          <img
            src="/logo.png"
            alt="OnlyThankx"
            className="mx-auto h-16 w-16 rounded-2xl object-cover ring-1 ring-orange-100"
          />
          <h1 className="mt-5 text-4xl font-semibold tracking-tight text-gray-900">
            Create account
          </h1>
          <p className="mt-3 text-lg text-gray-500">
            Join OnlyThankx and start sharing gratitude beautifully
          </p>
        </div>

        <div className="space-y-4">
          <input
            type="email"
            placeholder="Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full rounded-[22px] border border-orange-100 bg-[#fffaf8] px-4 py-4 text-base outline-none"
          />

          <input
            type="password"
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full rounded-[22px] border border-orange-100 bg-[#fffaf8] px-4 py-4 text-base outline-none"
          />

          {message && <p className="text-sm text-red-500">{message}</p>}

          <button
            type="button"
            onClick={handleSignup}
            disabled={loading}
            className="w-full rounded-full bg-[#ff8e66] px-6 py-4 text-base font-semibold text-white shadow-[0_14px_36px_rgba(255,140,90,0.22)] disabled:opacity-70"
          >
            {loading ? 'Creating...' : 'Sign Up'}
          </button>
        </div>

        <p className="mt-6 text-center text-sm text-gray-500">
          Already have an account?{' '}
          <Link href="/login" className="font-medium text-[#ff8e66]">
            Login
          </Link>
        </p>
      </div>
    </main>
  )
}