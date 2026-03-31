'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabase'

export default function SignupPage() {
  const router = useRouter()

  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState('')

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setMessage('')

    const { data, error } = await supabase.auth.signUp({
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
      const defaultUsername = email.split('@')[0].toLowerCase()

      await supabase.from('profiles').upsert({
        id: userId,
        username: defaultUsername,
        avatar_url: null,
      })
    }

    setLoading(false)
    setMessage('Account created. Check your email if confirmation is enabled.')
    router.push('/login')
  }

  return (
    <main className="flex min-h-screen items-center justify-center bg-[#fff8f2] px-4">
      <div className="w-full max-w-md rounded-3xl bg-white p-8 shadow-sm">
        <div className="mb-6 text-center">
          <img src="/logo.png" alt="OnlyThankx" className="mx-auto h-14 w-14 rounded-2xl" />
          <h1 className="mt-4 text-4xl font-bold">Create account</h1>
          <p className="mt-2 text-gray-500">Join OnlyThankx and start sharing gratitude</p>
        </div>

        <form onSubmit={handleSignup} className="space-y-4">
          <input
            type="email"
            placeholder="Email"
            className="w-full rounded-xl border px-4 py-3 outline-none"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />

          <input
            type="password"
            placeholder="Password"
            className="w-full rounded-xl border px-4 py-3 outline-none"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />

          {message && <p className="text-sm text-gray-600">{message}</p>}

          <button
            type="submit"
            disabled={loading}
            className="w-full rounded-xl bg-orange-500 py-3 font-semibold text-white disabled:opacity-70"
          >
            {loading ? 'Creating...' : 'Sign Up'}
          </button>
        </form>

        <p className="mt-6 text-center text-sm text-gray-500">
          Already have an account?{' '}
          <Link href="/login" className="text-orange-500">
            Login
          </Link>
        </p>
      </div>
    </main>
  )
}