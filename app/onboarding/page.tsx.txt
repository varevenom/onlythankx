'use client'

import { ChangeEvent, useEffect, useRef, useState } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabase'

export default function OnboardingPage() {
  const router = useRouter()
  const avatarInputRef = useRef<HTMLInputElement | null>(null)

  const [step, setStep] = useState(1)
  const [userId, setUserId] = useState('')
  const [email, setEmail] = useState('')
  const [username, setUsername] = useState('')
  const [bio, setBio] = useState('')
  const [avatarUrl, setAvatarUrl] = useState<string | null>(null)
  const [avatarFile, setAvatarFile] = useState<File | null>(null)
  const [avatarPreview, setAvatarPreview] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [message, setMessage] = useState('')

  useEffect(() => {
    const init = async () => {
      const {
        data: { user },
      } = await supabase.auth.getUser()

      if (!user) {
        router.push('/login')
        return
      }

      setUserId(user.id)
      setEmail(user.email || '')

      const { data } = await supabase
        .from('profiles')
        .select('username, bio, avatar_url, onboarding_completed')
        .eq('id', user.id)
        .single()

      if (data?.onboarding_completed) {
        router.push('/feed')
        return
      }

      setUsername(data?.username || user.email?.split('@')[0] || '')
      setBio(data?.bio || '')
      setAvatarUrl(data?.avatar_url || null)
      setLoading(false)
    }

    init()

    return () => {
      if (avatarPreview) URL.revokeObjectURL(avatarPreview)
    }
  }, [router, avatarPreview])

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

  const uploadAvatarIfNeeded = async () => {
    if (!avatarFile || !userId) return avatarUrl

    const ext = avatarFile.name.split('.').pop()
    const fileName = `avatars/${userId}-${Date.now()}.${ext}`

    const { error: uploadError } = await supabase.storage
      .from('posts')
      .upload(fileName, avatarFile)

    if (uploadError) {
      throw new Error(uploadError.message)
    }

    const { data } = supabase.storage.from('posts').getPublicUrl(fileName)
    return data.publicUrl
  }

  const saveStepOne = async () => {
    if (!username.trim()) {
      setMessage('Please choose a username.')
      return
    }

    setSaving(true)
    setMessage('')

    try {
      await supabase.from('profiles').upsert({
        id: userId,
        username: username.trim().toLowerCase(),
      })

      setStep(2)
    } catch {
      setMessage('Could not save username.')
    }

    setSaving(false)
  }

  const finishOnboarding = async () => {
    setSaving(true)
    setMessage('')

    try {
      const finalAvatarUrl = await uploadAvatarIfNeeded()

      const { error } = await supabase.from('profiles').upsert({
        id: userId,
        username: username.trim().toLowerCase(),
        bio: bio.trim(),
        avatar_url: finalAvatarUrl,
        onboarding_completed: true,
      })

      if (error) {
        setMessage(error.message)
        setSaving(false)
        return
      }

      router.push('/feed')
    } catch (err) {
      const errorMessage =
        err instanceof Error ? err.message : 'Could not finish onboarding.'
      setMessage(errorMessage)
      setSaving(false)
    }
  }

  if (loading) {
    return (
      <main className="min-h-screen bg-[#fff7f4] px-4 py-10">
        <div className="mx-auto max-w-2xl rounded-[32px] border border-orange-100 bg-white p-8 shadow-[0_20px_60px_rgba(255,140,90,0.08)]">
          <p className="text-gray-500">Preparing your welcome flow...</p>
        </div>
      </main>
    )
  }

  return (
    <main className="min-h-screen bg-[#fff7f4] px-4 py-8 text-gray-900">
      <div className="mx-auto max-w-3xl">
        <div className="mb-6 flex items-center gap-3">
          <img
            src="/logo.png"
            alt="OnlyThankx"
            className="h-12 w-12 rounded-2xl object-cover ring-1 ring-orange-100"
          />
          <div>
            <h1 className="text-xl font-semibold tracking-tight">OnlyThankx</h1>
            <p className="text-sm text-gray-500">Let’s shape your grateful corner</p>
          </div>
        </div>

        <div className="mb-6 flex items-center gap-2">
          <div
            className={`h-2 flex-1 rounded-full ${
              step >= 1 ? 'bg-[#ff8e66]' : 'bg-orange-100'
            }`}
          />
          <div
            className={`h-2 flex-1 rounded-full ${
              step >= 2 ? 'bg-[#ff8e66]' : 'bg-orange-100'
            }`}
          />
        </div>

        {step === 1 && (
          <section className="rounded-[34px] border border-orange-100 bg-white p-8 shadow-[0_20px_60px_rgba(255,140,90,0.10)]">
            <p className="mb-3 inline-flex rounded-full border border-orange-100 bg-[#fffaf8] px-3 py-1 text-sm text-gray-600">
              Step 1 of 2
            </p>

            <h2 className="text-4xl font-semibold tracking-tight">
              Welcome to OnlyThankx ✨
            </h2>

            <p className="mt-4 max-w-2xl text-lg leading-8 text-gray-500">
              Let’s start with your name here. This is how people will recognize
              your grateful vibe.
            </p>

            <div className="mt-8 rounded-[28px] border border-orange-100 bg-[#fffaf8] p-5">
              <label className="mb-2 block text-sm font-medium text-gray-600">
                Username
              </label>
              <input
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="yourname"
                className="w-full rounded-[22px] border border-orange-100 bg-white px-4 py-4 text-base outline-none"
              />

              <p className="mt-3 text-sm text-gray-500">
                Signed in as <span className="font-medium">{email}</span>
              </p>
            </div>

            {message && <p className="mt-4 text-sm text-red-500">{message}</p>}

            <div className="mt-8 flex justify-end">
              <button
                type="button"
                onClick={saveStepOne}
                disabled={saving}
                className="rounded-full bg-[#ff8e66] px-6 py-3 text-base font-semibold text-white shadow-[0_14px_36px_rgba(255,140,90,0.22)] disabled:opacity-70"
              >
                {saving ? 'Saving...' : 'Continue'}
              </button>
            </div>
          </section>
        )}

        {step === 2 && (
          <section className="rounded-[34px] border border-orange-100 bg-white p-8 shadow-[0_20px_60px_rgba(255,140,90,0.10)]">
            <p className="mb-3 inline-flex rounded-full border border-orange-100 bg-[#fffaf8] px-3 py-1 text-sm text-gray-600">
              Step 2 of 2
            </p>

            <h2 className="text-4xl font-semibold tracking-tight">
              Make it feel like you
            </h2>

            <p className="mt-4 max-w-2xl text-lg leading-8 text-gray-500">
              Add a little profile touch. A calm bio, a face, a vibe. Enough to make
              your space feel real.
            </p>

            <input
              ref={avatarInputRef}
              type="file"
              accept="image/*"
              onChange={handleAvatarChange}
              className="hidden"
            />

            <div className="mt-8 grid gap-6 md:grid-cols-[220px_1fr]">
              <div className="rounded-[28px] border border-orange-100 bg-[#fffaf8] p-5 text-center">
                <img
                  src={avatarPreview || avatarUrl || '/logo.png'}
                  alt="avatar"
                  className="mx-auto h-28 w-28 rounded-full object-cover ring-4 ring-orange-100"
                />

                <button
                  type="button"
                  onClick={() => avatarInputRef.current?.click()}
                  className="mt-4 rounded-full border border-orange-100 bg-white px-4 py-2 text-sm font-medium text-gray-700"
                >
                  📷 Change Avatar
                </button>
              </div>

              <div className="rounded-[28px] border border-orange-100 bg-[#fffaf8] p-5">
                <label className="mb-2 block text-sm font-medium text-gray-600">
                  Bio
                </label>
                <textarea
                  value={bio}
                  onChange={(e) => setBio(e.target.value)}
                  placeholder="I’m here for softer moments, warm thoughts, and gratitude..."
                  className="min-h-[160px] w-full rounded-[22px] border border-orange-100 bg-white px-4 py-4 text-base outline-none"
                />
              </div>
            </div>

            {message && <p className="mt-4 text-sm text-red-500">{message}</p>}

            <div className="mt-8 flex flex-wrap items-center justify-between gap-3">
              <button
                type="button"
                onClick={() => setStep(1)}
                className="rounded-full border border-orange-100 bg-white px-5 py-3 font-medium text-gray-700"
              >
                Back
              </button>

              <button
                type="button"
                onClick={finishOnboarding}
                disabled={saving}
                className="rounded-full bg-[#ff8e66] px-6 py-3 text-base font-semibold text-white shadow-[0_14px_36px_rgba(255,140,90,0.22)] disabled:opacity-70"
              >
                {saving ? 'Finishing...' : 'Enter OnlyThankx'}
              </button>
            </div>
          </section>
        )}
      </div>
    </main>
  )
}