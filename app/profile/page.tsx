'use client'

import { ChangeEvent, useEffect, useMemo, useRef, useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabase'

type Profile = {
  id: string
  username: string
  avatar_url: string | null
  bio: string | null
}

type Post = {
  id: string
  user_id: string
  content: string
  image_url: string | null
  created_at: string
}

export default function ProfilePage() {
  const router = useRouter()
  const avatarInputRef = useRef<HTMLInputElement | null>(null)

  const [userId, setUserId] = useState<string>('')
  const [email, setEmail] = useState<string>('')
  const [username, setUsername] = useState('')
  const [bio, setBio] = useState('')
  const [avatarUrl, setAvatarUrl] = useState<string | null>(null)
  const [avatarFile, setAvatarFile] = useState<File | null>(null)
  const [avatarPreview, setAvatarPreview] = useState<string | null>(null)
  const [posts, setPosts] = useState<Post[]>([])
  const [loadingProfile, setLoadingProfile] = useState(true)
  const [savingProfile, setSavingProfile] = useState(false)
  const [message, setMessage] = useState('')
  const [deleteLoadingId, setDeleteLoadingId] = useState<string>('')

  const stats = useMemo(() => {
    const imagePosts = posts.filter((post) => !!post.image_url).length
    return {
      posts: posts.length,
      photos: imagePosts,
    }
  }, [posts])

  useEffect(() => {
    let channel: ReturnType<typeof supabase.channel> | null = null

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

      await loadProfile(user.id)
      await loadMyPosts(user.id)

      channel = supabase
        .channel('profile-posts-live')
        .on(
          'postgres_changes',
          {
            event: '*',
            schema: 'public',
            table: 'posts',
            filter: `user_id=eq.${user.id}`,
          },
          async () => {
            await loadMyPosts(user.id)
          }
        )
        .subscribe()
    }

    init()

    return () => {
      if (channel) supabase.removeChannel(channel)
      if (avatarPreview) URL.revokeObjectURL(avatarPreview)
    }
  }, [])

  const loadProfile = async (id: string) => {
    setLoadingProfile(true)
    setMessage('')

    const { data, error } = await supabase
      .from('profiles')
      .select('id, username, avatar_url, bio')
      .eq('id', id)
      .single()

    if (error) {
      setMessage(`Could not load profile: ${error.message}`)
      setLoadingProfile(false)
      return
    }

    setUsername(data?.username || '')
    setBio(data?.bio || '')
    setAvatarUrl(data?.avatar_url || null)
    setLoadingProfile(false)
  }

  const loadMyPosts = async (id: string) => {
    const { data, error } = await supabase
      .from('posts')
      .select('id, user_id, content, image_url, created_at')
      .eq('user_id', id)
      .order('created_at', { ascending: false })

    if (!error && data) {
      setPosts(data)
    }
  }

  const handleAvatarChange = (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0] || null

    if (avatarPreview) URL.revokeObjectURL(avatarPreview)

    setAvatarFile(file)

    if (file) {
      setAvatarPreview(URL.createObjectURL(file))
      setMessage('')
    } else {
      setAvatarPreview(null)
    }
  }

  const clearAvatarSelection = () => {
    if (avatarPreview) URL.revokeObjectURL(avatarPreview)
    setAvatarFile(null)
    setAvatarPreview(null)
    if (avatarInputRef.current) avatarInputRef.current.value = ''
  }

  const handleSaveProfile = async () => {
    if (!userId) return

    setSavingProfile(true)
    setMessage('')

    let finalAvatarUrl = avatarUrl

    if (avatarFile) {
      const ext = avatarFile.name.split('.').pop()
      const fileName = `${userId}-${Date.now()}.${ext}`

      const { error: uploadError } = await supabase.storage
        .from('posts')
        .upload(`avatars/${fileName}`, avatarFile)

      if (uploadError) {
        setMessage(`Avatar upload failed: ${uploadError.message}`)
        setSavingProfile(false)
        return
      }

      const { data } = supabase.storage
        .from('posts')
        .getPublicUrl(`avatars/${fileName}`)

      finalAvatarUrl = data.publicUrl
    }

    const { error } = await supabase.from('profiles').upsert({
      id: userId,
      username: username.trim() || 'yourname',
      avatar_url: finalAvatarUrl,
      bio: bio.trim(),
    })

    if (error) {
      setMessage(`Could not save profile: ${error.message}`)
      setSavingProfile(false)
      return
    }

    setAvatarUrl(finalAvatarUrl)
    clearAvatarSelection()
    setMessage('Profile updated beautifully ✨')
    setSavingProfile(false)
  }

  const handleDeletePost = async (post: Post) => {
    const ok = window.confirm('Delete this post?')
    if (!ok) return

    setDeleteLoadingId(post.id)

    const { error } = await supabase.from('posts').delete().eq('id', post.id)

    if (error) {
      alert(`Failed to delete post: ${error.message}`)
      setDeleteLoadingId('')
      return
    }

    if (post.image_url) {
      try {
        const url = new URL(post.image_url)
        const pathParts = url.pathname.split('/storage/v1/object/public/posts/')
        if (pathParts[1]) {
          await supabase.storage.from('posts').remove([pathParts[1]])
        }
      } catch {
      }
    }

    await loadMyPosts(userId)
    setDeleteLoadingId('')
  }

  const handleLogout = async () => {
    await supabase.auth.signOut()
    router.push('/login')
  }

  if (loadingProfile) {
    return (
      <main className="min-h-screen bg-[#fff7f4]">
        <div className="mx-auto max-w-4xl px-4 py-10">
          <div className="rounded-[32px] border border-orange-100 bg-white p-8 shadow-[0_10px_30px_rgba(255,140,90,0.08)]">
            <p className="text-gray-500">Loading your profile...</p>
          </div>
        </div>
      </main>
    )
  }

  return (
    <main className="min-h-screen bg-[#fff7f4] text-gray-900">
      <header className="sticky top-0 z-20 border-b border-orange-100/80 bg-white/80 backdrop-blur-xl">
        <div className="mx-auto flex max-w-4xl items-center justify-between px-4 py-3">
          <div className="flex items-center gap-3">
            <img
              src={avatarPreview || avatarUrl || '/logo.png'}
              alt="OnlyThankx"
              className="h-11 w-11 rounded-2xl object-cover ring-1 ring-orange-100"
            />
            <div>
              <h1 className="text-lg font-semibold tracking-tight">OnlyThankx</h1>
              <p className="text-xs text-gray-500">Your grateful corner</p>
            </div>
          </div>

          <div className="flex items-center gap-4 text-sm">
            <Link href="/" className="text-gray-500 transition hover:text-gray-900">
              Home
            </Link>
            <Link href="/feed" className="text-gray-500 transition hover:text-gray-900">
              Feed
            </Link>
            <button
              onClick={handleLogout}
              className="rounded-full bg-[#ff8e66] px-4 py-2 font-medium text-white shadow-sm transition hover:scale-[1.02]"
            >
              Logout
            </button>
          </div>
        </div>
      </header>

      <section className="mx-auto grid max-w-4xl gap-6 px-4 py-6 md:grid-cols-[340px_1fr]">
        <div className="space-y-6">
          <div className="rounded-[32px] border border-orange-100 bg-white p-6 shadow-[0_10px_30px_rgba(255,140,90,0.08)]">
            <div className="flex flex-col items-center text-center">
              <div className="relative">
                <img
                  src={avatarPreview || avatarUrl || '/logo.png'}
                  alt="avatar"
                  className="h-28 w-28 rounded-full object-cover ring-4 ring-orange-100"
                />
              </div>

              <h2 className="mt-4 text-2xl font-semibold tracking-tight">
                @{username || 'yourname'}
              </h2>

              <p className="mt-1 max-w-[260px] text-sm leading-6 text-gray-500">
                {bio?.trim() || 'Add a little gratitude-flavored bio ✨'}
              </p>

              <div className="mt-5 grid w-full grid-cols-2 gap-3">
                <div className="rounded-[22px] bg-[#fff8f5] p-4">
                  <p className="text-2xl font-semibold tracking-tight">{stats.posts}</p>
                  <p className="text-sm text-gray-500">Posts</p>
                </div>
                <div className="rounded-[22px] bg-[#fff8f5] p-4">
                  <p className="text-2xl font-semibold tracking-tight">{stats.photos}</p>
                  <p className="text-sm text-gray-500">Photos</p>
                </div>
              </div>

              <p className="mt-4 text-xs text-gray-400">{email}</p>
            </div>
          </div>

          <div className="rounded-[32px] border border-orange-100 bg-white p-6 shadow-[0_10px_30px_rgba(255,140,90,0.08)]">
            <h3 className="mb-4 text-lg font-semibold tracking-tight">Edit profile</h3>

            <input
              ref={avatarInputRef}
              type="file"
              accept="image/*"
              onChange={handleAvatarChange}
              className="hidden"
            />

            <div className="space-y-4">
              <div>
                <label className="mb-2 block text-sm font-medium text-gray-600">
                  Username
                </label>
                <input
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  placeholder="yourname"
                  className="w-full rounded-[20px] border border-orange-100 bg-[#fffaf8] px-4 py-3 outline-none"
                />
              </div>

              <div>
                <label className="mb-2 block text-sm font-medium text-gray-600">
                  Bio
                </label>
                <textarea
                  value={bio}
                  onChange={(e) => setBio(e.target.value)}
                  placeholder="Tell the world a little about your grateful vibe..."
                  className="min-h-[110px] w-full rounded-[20px] border border-orange-100 bg-[#fffaf8] px-4 py-3 outline-none"
                />
              </div>

              <div className="flex flex-wrap gap-2">
                <button
                  type="button"
                  onClick={() => avatarInputRef.current?.click()}
                  className="rounded-full border border-orange-100 bg-white px-4 py-2 text-sm font-medium text-gray-700 transition hover:-translate-y-[1px] hover:shadow-sm"
                >
                  📷 Change Avatar
                </button>

                {avatarFile && (
                  <button
                    type="button"
                    onClick={clearAvatarSelection}
                    className="rounded-full border border-red-200 px-4 py-2 text-sm text-red-500 transition hover:bg-red-50"
                  >
                    Remove Selection
                  </button>
                )}
              </div>

              {message && <p className="text-sm text-gray-500">{message}</p>}

              <button
                type="button"
                onClick={handleSaveProfile}
                disabled={savingProfile}
                className="w-full rounded-full bg-[#ff8e66] px-5 py-3 font-semibold text-white shadow-sm transition hover:scale-[1.01] disabled:opacity-70"
              >
                {savingProfile ? 'Saving...' : 'Save Profile'}
              </button>
            </div>
          </div>
        </div>

        <div className="rounded-[32px] border border-orange-100 bg-white p-6 shadow-[0_10px_30px_rgba(255,140,90,0.08)]">
          <div className="mb-5 flex items-center justify-between gap-3">
            <div>
              <h3 className="text-xl font-semibold tracking-tight">Your posts</h3>
              <p className="text-sm text-gray-500">
                Your grateful trail, all in one place.
              </p>
            </div>

            <Link
              href="/feed"
              className="rounded-full bg-[#fff4ef] px-4 py-2 text-sm font-medium text-gray-700 transition hover:-translate-y-[1px]"
            >
              Go to Feed
            </Link>
          </div>

          {posts.length === 0 ? (
            <div className="rounded-[26px] border border-orange-100 bg-[#fffaf8] p-6">
              <p className="text-gray-500">No posts yet. Your first grateful spark is waiting ✨</p>
            </div>
          ) : (
            <div className="space-y-4">
              {posts.map((post) => (
                <article
                  key={post.id}
                  className="overflow-hidden rounded-[26px] border border-orange-100 bg-[#fffdfc]"
                >
                  <div className="p-5">
                    <p className="mb-3 text-xs text-gray-400">
                      {new Date(post.created_at).toLocaleString()}
                    </p>

                    {post.content && (
                      <p className="whitespace-pre-wrap text-[15px] leading-7 text-gray-700">
                        {post.content}
                      </p>
                    )}
                  </div>

                  {post.image_url && (
                    <div className="border-y border-orange-100 bg-[#fffaf8]">
                      <img
                        src={post.image_url}
                        alt="post"
                        className="max-h-[580px] w-full object-contain"
                      />
                    </div>
                  )}

                  <div className="flex flex-wrap items-center gap-2 p-5">
                    <Link
                      href={`/post/${post.id}`}
                      className="rounded-full bg-white px-4 py-2 text-sm font-medium text-gray-700 ring-1 ring-orange-100 transition hover:-translate-y-[1px]"
                    >
                      Open
                    </Link>

                    <button
                      type="button"
                      onClick={() => handleDeletePost(post)}
                      disabled={deleteLoadingId === post.id}
                      className="rounded-full bg-red-50 px-4 py-2 text-sm font-medium text-red-500 transition hover:-translate-y-[1px] disabled:opacity-70"
                    >
                      {deleteLoadingId === post.id ? 'Deleting...' : 'Delete'}
                    </button>
                  </div>
                </article>
              ))}
            </div>
          )}
        </div>
      </section>
    </main>
  )
}