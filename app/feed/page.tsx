'use client'

import { ChangeEvent, useEffect, useMemo, useRef, useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabase'

type Profile = {
  id?: string
  username: string
  avatar_url?: string | null
}

type Post = {
  id: string
  user_id: string
  content: string
  image_url: string | null
  created_at: string
  profiles: Profile | null
}

type Comment = {
  id: string
  user_id: string
  post_id: string
  content: string
  created_at: string
  profiles: Profile | null
}

const prompts = [
  'What made today lighter?',
  'Who deserves a thank you today?',
  'What small win are you grateful for?',
  'What felt beautiful today?',
]

export default function FeedPage() {
  const router = useRouter()
  const fileInputRef = useRef<HTMLInputElement | null>(null)
  const postAnchorRef = useRef<HTMLDivElement | null>(null)

  const [content, setContent] = useState('')
  const [image, setImage] = useState<File | null>(null)
  const [imagePreview, setImagePreview] = useState<string | null>(null)
  const [posts, setPosts] = useState<Post[]>([])
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState('')
  const [myUsername, setMyUsername] = useState('yourname')
  const [myAvatar, setMyAvatar] = useState<string | null>(null)
  const [promptIndex, setPromptIndex] = useState(0)

  const currentPrompt = useMemo(() => prompts[promptIndex], [promptIndex])

  useEffect(() => {
    const timer = setInterval(() => {
      setPromptIndex((prev) => (prev + 1) % prompts.length)
    }, 3500)

    return () => clearInterval(timer)
  }, [])

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

      await fetchMyProfile(user.id)
      await fetchPosts()

      channel = supabase
        .channel('realtime-posts-sexy')
        .on(
          'postgres_changes',
          {
            event: '*',
            schema: 'public',
            table: 'posts',
          },
          async () => {
            await fetchPosts()
          }
        )
        .subscribe()
    }

    init()

    return () => {
      if (channel) supabase.removeChannel(channel)
      if (imagePreview) URL.revokeObjectURL(imagePreview)
    }
  }, [])

  const fetchMyProfile = async (userId: string) => {
    const { data } = await supabase
      .from('profiles')
      .select('id, username, avatar_url')
      .eq('id', userId)
      .single()

    if (data) {
      setMyUsername(data.username || 'yourname')
      setMyAvatar(data.avatar_url || null)
    }
  }

  const fetchPosts = async () => {
    setMessage('')

    const { data: postsData, error } = await supabase
      .from('posts')
      .select('*')
      .order('created_at', { ascending: false })

    if (error) {
      setMessage(`Could not load posts: ${error.message}`)
      return
    }

    if (!postsData || postsData.length === 0) {
      setPosts([])
      return
    }

    const userIds = [...new Set(postsData.map((post) => post.user_id).filter(Boolean))]

    const { data: profilesData } = await supabase
      .from('profiles')
      .select('id, username, avatar_url')
      .in('id', userIds)

    const merged: Post[] = postsData.map((post) => ({
      ...post,
      profiles:
        profilesData?.find((profile) => profile.id === post.user_id) || {
          username: 'user',
          avatar_url: null,
        },
    }))

    setPosts(merged)
  }

  const handleImageChange = (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0] || null

    if (imagePreview) URL.revokeObjectURL(imagePreview)

    setImage(file)

    if (file) {
      setImagePreview(URL.createObjectURL(file))
      setMessage('')
    } else {
      setImagePreview(null)
    }
  }

  const clearSelectedImage = () => {
    if (imagePreview) URL.revokeObjectURL(imagePreview)
    setImage(null)
    setImagePreview(null)
    if (fileInputRef.current) fileInputRef.current.value = ''
  }

  const handlePost = async () => {
    if (!content.trim() && !image) return

    setLoading(true)
    setMessage('')

    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
      router.push('/login')
      return
    }

    let imageUrl: string | null = null

    if (image) {
      const fileExt = image.name.split('.').pop()
      const fileName = `${user.id}-${Date.now()}.${fileExt}`

      const { error: uploadError } = await supabase.storage
        .from('posts')
        .upload(fileName, image)

      if (uploadError) {
        setMessage(`Image upload failed: ${uploadError.message}`)
        setLoading(false)
        return
      }

      const { data } = supabase.storage.from('posts').getPublicUrl(fileName)
      imageUrl = data.publicUrl
    }

    const { error } = await supabase.from('posts').insert([
      {
        user_id: user.id,
        content: content.trim(),
        image_url: imageUrl,
      },
    ])

    if (error) {
      setMessage(`Post failed: ${error.message}`)
      setLoading(false)
      return
    }

    setContent('')
    clearSelectedImage()
    setMessage('Posted beautifully ✨')
    setLoading(false)

    await fetchPosts()

    setTimeout(() => {
      postAnchorRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' })
    }, 250)
  }

  const handleLogout = async () => {
    await supabase.auth.signOut()
    router.push('/login')
  }

  return (
    <main className="min-h-screen bg-[#fff7f4] text-gray-900">
      <header className="sticky top-0 z-20 border-b border-orange-100/80 bg-white/80 backdrop-blur-xl">
        <div className="mx-auto flex max-w-3xl items-center justify-between px-4 py-3">
          <div className="flex items-center gap-3">
            <img
              src={myAvatar || '/logo.png'}
              alt="OnlyThankx"
              className="h-11 w-11 rounded-2xl object-cover ring-1 ring-orange-100"
            />
            <div>
              <h1 className="text-lg font-semibold tracking-tight">OnlyThankx</h1>
              <p className="text-xs text-gray-500">Share gratitude beautifully</p>
            </div>
          </div>

          <div className="hidden items-center gap-4 text-sm md:flex">
            <Link href="/" className="text-gray-500 transition hover:text-gray-900">
              Home
            </Link>
            <Link href="/profile" className="text-gray-500 transition hover:text-gray-900">
              Profile
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

      <section className="mx-auto max-w-3xl px-4 py-6 pb-28 md:pb-6">
        <div className="mb-6 rounded-[30px] border border-orange-100 bg-white p-4 shadow-[0_10px_30px_rgba(255,140,90,0.08)]">
          <div className="mb-4 flex items-center gap-3">
            <img
              src={myAvatar || '/logo.png'}
              alt="profile"
              className="h-12 w-12 rounded-full object-cover ring-2 ring-orange-100"
            />
            <div>
              <p className="font-semibold tracking-tight">@{myUsername}</p>
              <p className="text-sm text-gray-500">What are you thankful for today?</p>
            </div>
          </div>

          <div className="rounded-[24px] border border-orange-100 bg-[#fffaf8] p-3">
            <textarea
              placeholder={currentPrompt}
              className="min-h-[120px] w-full resize-none bg-transparent px-2 py-2 text-[15px] leading-7 text-gray-800 outline-none placeholder:text-gray-400"
              value={content}
              onChange={(e) => setContent(e.target.value)}
            />

            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              onChange={handleImageChange}
              className="hidden"
            />

            {imagePreview && (
              <div className="mt-2 overflow-hidden rounded-[24px] border border-orange-100 bg-white">
                <img
                  src={imagePreview}
                  alt="Preview"
                  className="max-h-[460px] w-full object-contain"
                />
                <div className="flex items-center justify-between px-4 py-3">
                  <p className="truncate text-sm text-gray-500">
                    Selected: <span className="font-medium text-gray-700">{image?.name}</span>
                  </p>
                  <button
                    type="button"
                    onClick={clearSelectedImage}
                    className="rounded-full border border-red-200 px-3 py-1.5 text-sm text-red-500 transition hover:bg-red-50"
                  >
                    Remove
                  </button>
                </div>
              </div>
            )}
          </div>

          {message && <p className="mt-3 px-1 text-sm text-gray-500">{message}</p>}

          <div className="mt-4 flex flex-wrap items-center justify-between gap-3">
            <div className="flex flex-wrap gap-2">
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="rounded-full border border-orange-100 bg-white px-4 py-2 text-sm font-medium text-gray-700 transition hover:-translate-y-[1px] hover:shadow-sm"
              >
                📷 Add Photo
              </button>

              <button
                type="button"
                className="rounded-full border border-orange-100 bg-white px-4 py-2 text-sm font-medium text-gray-400"
              >
                🎥 Add Video
              </button>
            </div>

            <button
              type="button"
              onClick={handlePost}
              disabled={loading}
              className="rounded-full bg-[#ff8e66] px-5 py-2.5 font-semibold text-white shadow-sm transition hover:scale-[1.02] disabled:opacity-70"
            >
              {loading ? 'Posting...' : 'Post Thanks'}
            </button>
          </div>
        </div>

        <div ref={postAnchorRef} className="space-y-5">
          {posts.length === 0 ? (
            <div className="rounded-[28px] border border-orange-100 bg-white p-6 shadow-[0_10px_30px_rgba(255,140,90,0.06)]">
              <p className="text-gray-500">Be the first spark on OnlyThankx ✨</p>
            </div>
          ) : (
            posts.map((post) => (
              <SexyPostCard key={post.id} post={post} onPostDeleted={fetchPosts} />
            ))
          )}
        </div>
      </section>

      <div className="fixed bottom-0 left-0 right-0 z-50 border-t border-orange-100 bg-white/90 px-3 py-2 backdrop-blur-xl md:hidden">
        <div className="mx-auto grid max-w-md grid-cols-4 gap-2">
          <Link
            href="/"
            className="rounded-2xl px-3 py-2 text-center text-xs font-medium text-gray-700 transition hover:bg-orange-50"
          >
            🏠
            <div className="mt-1">Home</div>
          </Link>
          <Link
            href="/feed"
            className="rounded-2xl bg-orange-50 px-3 py-2 text-center text-xs font-semibold text-gray-900"
          >
            🧡
            <div className="mt-1">Feed</div>
          </Link>
          <Link
            href="/profile"
            className="rounded-2xl px-3 py-2 text-center text-xs font-medium text-gray-700 transition hover:bg-orange-50"
          >
            👤
            <div className="mt-1">Profile</div>
          </Link>
          <button
            type="button"
            onClick={handleLogout}
            className="rounded-2xl px-3 py-2 text-center text-xs font-medium text-gray-700 transition hover:bg-orange-50"
          >
            🚪
            <div className="mt-1">Logout</div>
          </button>
        </div>
      </div>
    </main>
  )
}

function SexyPostCard({
  post,
  onPostDeleted,
}: {
  post: Post
  onPostDeleted: () => Promise<void>
}) {
  const [thanksCount, setThanksCount] = useState(0)
  const [hasThanked, setHasThanked] = useState(false)
  const [comments, setComments] = useState<Comment[]>([])
  const [showComments, setShowComments] = useState(false)
  const [commentText, setCommentText] = useState('')
  const [commentLoading, setCommentLoading] = useState(false)
  const [shareMessage, setShareMessage] = useState('')
  const [deleteLoading, setDeleteLoading] = useState(false)

  useEffect(() => {
    let channel: ReturnType<typeof supabase.channel> | null = null

    const init = async () => {
      await fetchThanks()
      await fetchComments()

      channel = supabase
        .channel(`post-live-${post.id}`)
        .on(
          'postgres_changes',
          {
            event: '*',
            schema: 'public',
            table: 'comments',
            filter: `post_id=eq.${post.id}`,
          },
          async () => {
            await fetchComments()
          }
        )
        .on(
          'postgres_changes',
          {
            event: '*',
            schema: 'public',
            table: 'thanks',
            filter: `post_id=eq.${post.id}`,
          },
          async () => {
            await fetchThanks()
          }
        )
        .subscribe()
    }

    init()

    return () => {
      if (channel) supabase.removeChannel(channel)
    }
  }, [post.id])

  const fetchThanks = async () => {
    const { count } = await supabase
      .from('thanks')
      .select('*', { count: 'exact', head: true })
      .eq('post_id', post.id)

    setThanksCount(count || 0)

    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) return

    const { data } = await supabase
      .from('thanks')
      .select('id')
      .eq('post_id', post.id)
      .eq('user_id', user.id)
      .maybeSingle()

    setHasThanked(!!data)
  }

  const fetchComments = async () => {
    const { data: commentsData, error } = await supabase
      .from('comments')
      .select('*')
      .eq('post_id', post.id)
      .order('created_at', { ascending: true })

    if (error || !commentsData) return

    if (commentsData.length === 0) {
      setComments([])
      return
    }

    const userIds = [
      ...new Set(commentsData.map((comment) => comment.user_id).filter(Boolean)),
    ]

    const { data: profilesData } = await supabase
      .from('profiles')
      .select('id, username, avatar_url')
      .in('id', userIds)

    const merged: Comment[] = commentsData.map((comment) => ({
      ...comment,
      profiles:
        profilesData?.find((profile) => profile.id === comment.user_id) || {
          username: 'user',
          avatar_url: null,
        },
    }))

    setComments(merged)
  }

  const handleThanks = async () => {
    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user || hasThanked) return

    const { error } = await supabase.from('thanks').insert([
      {
        user_id: user.id,
        post_id: post.id,
      },
    ])

    if (!error) {
      setHasThanked(true)
      setThanksCount((prev) => prev + 1)
    }
  }

  const handleComment = async () => {
    if (!commentText.trim()) return

    setCommentLoading(true)

    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
      setCommentLoading(false)
      return
    }

    const { error } = await supabase.from('comments').insert([
      {
        user_id: user.id,
        post_id: post.id,
        content: commentText.trim(),
      },
    ])

    if (!error) {
      setCommentText('')
      setShowComments(true)
      await fetchComments()
    }

    setCommentLoading(false)
  }

  const handleShare = async () => {
    const postUrl =
      typeof window !== 'undefined'
        ? `${window.location.origin}/post/${post.id}`
        : ''

    try {
      if (navigator.share) {
        await navigator.share({
          title: 'OnlyThankx Post',
          text: 'A grateful post on OnlyThankx',
          url: postUrl,
        })
        setShareMessage('Shared ✨')
      } else {
        await navigator.clipboard.writeText(postUrl)
        setShareMessage('Link copied ✨')
      }
    } catch {
      try {
        await navigator.clipboard.writeText(postUrl)
        setShareMessage('Link copied ✨')
      } catch {
        setShareMessage('Could not share')
      }
    }

    setTimeout(() => setShareMessage(''), 2000)
  }

  const handleDelete = async () => {
    const ok = window.confirm('Delete this post?')
    if (!ok) return

    setDeleteLoading(true)

    const { error } = await supabase.from('posts').delete().eq('id', post.id)

    if (error) {
      alert(`Failed to delete post: ${error.message}`)
      setDeleteLoading(false)
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
        // ignore cleanup errors
      }
    }

    setDeleteLoading(false)
    await onPostDeleted()
  }

  const profile = post.profiles
  const username = profile?.username || 'user'
  const avatarUrl = profile?.avatar_url || '/logo.png'

  return (
    <article className="overflow-hidden rounded-[30px] border border-orange-100 bg-white shadow-[0_10px_30px_rgba(255,140,90,0.08)]">
      <div className="p-5">
        <div className="mb-4 flex items-center gap-3">
          <img
            src={avatarUrl}
            alt="user"
            className="h-11 w-11 rounded-full object-cover ring-2 ring-orange-100"
          />
          <div>
            <p className="font-semibold tracking-tight">@{username}</p>
            <p className="text-xs text-gray-400">
              {new Date(post.created_at).toLocaleString()}
            </p>
          </div>
        </div>

        {post.content && (
          <p className="mb-4 whitespace-pre-wrap text-[15px] leading-7 text-gray-700">
            {post.content}
          </p>
        )}
      </div>

      {post.image_url && (
        <div className="border-y border-orange-100 bg-[#fffaf8]">
          <img
            src={post.image_url}
            alt="Post"
            className="max-h-[680px] w-full object-contain"
          />
        </div>
      )}

      <div className="p-5">
        <div className="flex flex-wrap items-center gap-2">
          <button
            type="button"
            onClick={handleThanks}
            className={`rounded-full px-4 py-2 text-sm font-medium transition ${
              hasThanked
                ? 'bg-green-100 text-green-700'
                : 'bg-orange-50 text-gray-700 hover:-translate-y-[1px]'
            }`}
          >
            ✌️ Thanks
          </button>

          <span className="min-w-[18px] text-sm text-gray-500">{thanksCount}</span>

          <button
            type="button"
            onClick={() => setShowComments((prev) => !prev)}
            className="rounded-full bg-gray-50 px-4 py-2 text-sm font-medium text-gray-700 transition hover:-translate-y-[1px]"
          >
            Welcome
          </button>

          <button
            type="button"
            onClick={handleShare}
            className="rounded-full bg-gray-50 px-4 py-2 text-sm font-medium text-gray-700 transition hover:-translate-y-[1px]"
          >
            Happy Share
          </button>

          <Link
            href={`/post/${post.id}`}
            className="rounded-full bg-gray-50 px-4 py-2 text-sm font-medium text-gray-700 transition hover:-translate-y-[1px]"
          >
            Open
          </Link>

          <button
            type="button"
            onClick={handleDelete}
            disabled={deleteLoading}
            className="rounded-full bg-red-50 px-4 py-2 text-sm font-medium text-red-500 transition hover:-translate-y-[1px] disabled:opacity-70"
          >
            {deleteLoading ? 'Deleting...' : 'Delete'}
          </button>
        </div>

        {shareMessage && (
          <p className="mt-3 text-sm text-orange-500">{shareMessage}</p>
        )}

        {showComments && (
          <div className="mt-4 rounded-[24px] border border-orange-100 bg-[#fffaf8] p-4">
            <div className="mb-4 flex gap-2">
              <input
                value={commentText}
                onChange={(e) => setCommentText(e.target.value)}
                placeholder="Write a welcome comment..."
                className="flex-1 rounded-full border border-orange-100 bg-white px-4 py-3 text-sm outline-none"
              />
              <button
                type="button"
                onClick={handleComment}
                disabled={commentLoading}
                className="rounded-full bg-[#ff8e66] px-4 py-3 text-sm font-medium text-white disabled:opacity-70"
              >
                {commentLoading ? 'Posting...' : 'Comment'}
              </button>
            </div>

            <div className="space-y-3">
              {comments.length === 0 ? (
                <p className="text-sm text-gray-400">No comments yet.</p>
              ) : (
                comments.map((comment) => (
                  <div
                    key={comment.id}
                    className="rounded-[20px] border border-orange-100 bg-white p-3"
                  >
                    <div className="mb-2 flex items-center gap-2">
                      <img
                        src={comment.profiles?.avatar_url || '/logo.png'}
                        alt="comment user"
                        className="h-8 w-8 rounded-full object-cover"
                      />
                      <div>
                        <p className="text-sm font-semibold">
                          @{comment.profiles?.username || 'user'}
                        </p>
                        <p className="text-xs text-gray-400">
                          {new Date(comment.created_at).toLocaleString()}
                        </p>
                      </div>
                    </div>
                    <p className="text-sm leading-6 text-gray-700">{comment.content}</p>
                  </div>
                ))
              )}
            </div>
          </div>
        )}
      </div>
    </article>
  )
}