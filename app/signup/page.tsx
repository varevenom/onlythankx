'use client'

import { useState } from 'react'
import { supabase } from '@/lib/supabase'
import { useRouter } from 'next/navigation'

export default function SignupPage() {
  const router = useRouter()
  const [username, setUsername] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [message, setMessage] = useState('')

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError('')
    setMessage('')

    const cleanUsername = username.trim().toLowerCase()

    if (!cleanUsername) {
      setError('Username is required.')
      setLoading(false)
      return
    }

    const { data: existingProfile } = await supabase
      .from('profiles')
      .select('id')
      .eq('username', cleanUsername)
      .maybeSingle()

    if (existingProfile) {
      setError('That username is already taken.')
      setLoading(false)
      return
    }

    const { data, error } = await supabase.auth.signUp({
      email,
      password,
    })

    if (error) {
      setError(error.message)
      setLoading(false)
      return
    }

    const user = data.user

    if (user) {
      const { error: profileError } = await supabase.from('profiles').insert([
        {
          id: user.id,
          username: cleanUsername,
        },
      ])

      if (profileError) {
        setError(profileError.message)
        setLoading(false)
        return
      }
    }

    setMessage('Account created. Check your email if confirmation is enabled.')
    setLoading(false)
    router.push('/login')
  }

  return (
    <main className="min-h-screen flex items-center justify-center bg-gray-50 px-6">
      <div className="w-full max-w-md rounded-2xl bg-white p-8 shadow">
        <div className="mb-6 flex justify-center">
          <img src="/logo.png" alt="OnlyThankx" className="h-12" />
        </div>

        <h1 className="mb-2 text-center text-2xl font-bold">Create account</h1>

        <p className="mb-6 text-center text-gray-500">
          Join OnlyThankx and start sharing gratitude
        </p>

        {error && <p className="mb-4 text-sm text-red-500">{error}</p>}
        {message && <p className="mb-4 text-sm text-green-600">{message}</p>}

        <form onSubmit={handleSignup} className="space-y-4">
          <input
            type="text"
            placeholder="Username"
            className="w-full rounded-lg border px-4 py-3"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            required
          />

          <input
            type="email"
            placeholder="Email"
            className="w-full rounded-lg border px-4 py-3"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />

          <input
            type="password"
            placeholder="Password"
            className="w-full rounded-lg border px-4 py-3"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />

          <button
            type="submit"
            className="w-full rounded-lg bg-orange-500 py-3 text-white"
          >
            {loading ? 'Signing up...' : 'Sign Up'}
          </button>
        </form>

        <p className="mt-6 text-center text-sm text-gray-500">
          Already have an account?{' '}
          <a href="/login" className="text-orange-500">
            Login
          </a>
        </p>
      </div>
    </main>
  )
}