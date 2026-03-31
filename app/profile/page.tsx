'use client'

import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'

export default function ProfilePage() {
  const [username, setUsername] = useState('')
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState('')

  useEffect(() => {
    loadProfile()
  }, [])

  const loadProfile = async () => {
    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) return

    const { data } = await supabase
      .from('profiles')
      .select('username')
      .eq('id', user.id)
      .single()

    if (data) setUsername(data.username)
  }

  const updateProfile = async () => {
    setLoading(true)
    setMessage('')

    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) return

    const clean = username.trim().toLowerCase()

    const { error } = await supabase
      .from('profiles')
      .update({ username: clean })
      .eq('id', user.id)

    if (error) {
      setMessage(error.message)
    } else {
      setMessage('Updated successfully 🚀')
    }

    setLoading(false)
  }

  return (
    <main className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="bg-white p-8 rounded-xl shadow w-full max-w-md">
        <h1 className="text-xl font-bold mb-4">Your Profile</h1>

        <input
          value={username}
          onChange={(e) => setUsername(e.target.value)}
          className="w-full border p-3 rounded mb-4"
          placeholder="Username"
        />

        <button
          onClick={updateProfile}
          className="w-full bg-orange-500 text-white py-2 rounded"
        >
          {loading ? 'Saving...' : 'Save'}
        </button>

        {message && <p className="mt-3 text-sm">{message}</p>}
      </div>
    </main>
  )
}