'use client'

import { ChangeEvent, useEffect, useRef, useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { supabase } from '@/lib/supabase'

export default function ProfilePage() {
  const router = useRouter()
  const avatarInputRef = useRef<HTMLInputElement | null>(null)

  const [userId, setUserId] = useState('')
  const [username, setUsername] = useState('')
  const [avatarUrl, setAvatarUrl] = useState<string | null>(null)
  const [avatarFile, setAvatarFile] = useState<File | null>(null)
  const [avatarPreview, setAvatarPreview] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState('')

  useEffect(() => {
    loadProfile()
  }, [])

  useEffect(() => {
    return () => {
      if (avatarPreview) URL.revokeObjectURL(avatarPreview)
    }
  }, [avatarPreview])

  const loadProfile = async () => {
    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
      router.push('/login')
      return
    }

    setUserId(user.id)

    const { data } = await supabase
      .from('profiles')
      .select('username, avatar_url')
      .eq('id', user.id)
      .single()

    if (data?.username) setUsername(data.username)
    if (data?.avatar_url) setAvatarUrl(data.avatar_url)
  }

  const handleAvatarChange = (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0] || null

    if (avatarPreview) URL.revokeObjectURL(avatarPreview)

    setAvatarFile(file)

    if (file) {
      setAvatarPreview(URL.createObjectURL(file))
    } else {
      setAvatarPreview(null)
    }
  }

  const saveProfile = async () => {
    if (!userId || !username.trim()) return

    setLoading(true)
    setMessage('')

    let finalAvatarUrl = avatarUrl

    if (avatarFile) {
      const fileExt = avatarFile.name.split('.').pop()
      const fileName = `${userId}-${Date.now()}.${fileExt}`

      const { error: uploadError } = await supabase.storage
        .from('avatars')
        .upload(fileName, avatarFile)

      if (uploadError) {
        setMessage(`Avatar upload failed: ${uploadError.message}`)
        setLoading(false)
        return
      }

      const { data } = supabase.storage.from('avatars').getPublicUrl(fileName)
      finalAvatarUrl = data.publicUrl
    }

    const { error } = await supabase.from('profiles').upsert({
      id: userId,
      username: username.trim().toLowerCase(),
      avatar_url: finalAvatarUrl,
    })

    if (error) {
      setMessage(error.message)
      setLoading(false)
      return
    }

    setAvatarUrl(finalAvatarUrl || null)
    setAvatarFile(null)
    if (avatarInputRef.current) avatarInputRef.current.value = ''
    setMessage('Updated successfully 🚀')
    setLoading(false)
  }

  return (
    <main className="min-h-screen bg-[#fff8f2] px-4 py-10">
      <div className="mx-auto max-w-xl rounded-3xl bg-white p-8 shadow-sm">
        <div className="mb-6 flex items-center justify-between">
          <h1 className="text-2xl font-bold">Your Profile</h1>
          <Link href="/feed" className="text-sm text-orange-500">
            Back to Feed
          </Link>
        </div>

        <div className="mb-6 flex flex-col items-center gap-4">
          <img
            src={avatarPreview || avatarUrl || '/logo.png'}
            alt="Avatar"
            className="h-28 w-28 rounded-full border border-orange-200 object-cover"
          />

          <input
            ref={avatarInputRef}
            type="file"
            accept="image/*"
            onChange={handleAvatarChange}
            className="hidden"
          />

          <button
            type="button"
            onClick={() => avatarInputRef.current?.click()}
            className="rounded-full border px-4 py-2 text-sm"
          >
            Upload Profile Photo
          </button>
        </div>

        <input
          value={username}
          onChange={(e) => setUsername(e.target.value)}
          className="mb-4 w-full rounded-xl border p-3 outline-none"
          placeholder="Username"
        />

        <button
          onClick={saveProfile}
          disabled={loading}
          className="w-full rounded-xl bg-orange-500 py-3 font-semibold text-white disabled:opacity-70"
        >
          {loading ? 'Saving...' : 'Save'}
        </button>

        {message && <p className="mt-4 text-sm text-gray-600">{message}</p>}
      </div>
    </main>
  )
}