'use client'

import { ChangeEvent, useEffect, useRef, useState } from 'react'
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

export default function FeedPage() {
  const router = useRouter()
  const fileInputRef = useRef<HTMLInputElement | null>(null)

  const [content, setContent] = useState('')
  const [image, setImage] = useState<File | null>(null)
  const [imagePreview, setImagePreview] = useState<string | null>(null)
  const [posts, setPosts] = useState<Post[]>([])
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState('')
  const [myUsername, setMyUsername] = useState('yourname')
  const [myAvatar, setMyAvatar] = useState<string | null>(null)

  useEffect(() => {
    checkUser()
  }, [])

  useEffect(() => {
    return () => {
      if (imagePreview) URL.revokeObjectURL(imagePreview)
    }
  }, [imagePreview])

  const checkUser = async () => {
    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
      router.push('/login')
      return
    }

    await fetchMyProfile(user.id)
    await fetchPosts()
  }

  const fetchMyProfile = async (userId: string) => {
    const { data, error } = await supabase
      .from('profiles')
      .select('id, username, avatar_url')
      .eq('id', userId)
      .single()

    if (!error && data) {
      setMyUsername(data.username || 'yourname')
      setMyAvatar(data.avatar_url || null)
    }
  }

  const fetchPosts = async () => {
    setMessage('')

    const { data: postsData, error: postsError } = await supabase
      .from('posts')
      .select('*')
      .order('created_at', { ascending: false })

    if (postsError) {
      console.error('fetchPosts error:', postsError.message)
      setMessage(`Could not load posts: ${postsError.message}`)
      return
    }

    if (!postsData || postsData.length === 0) {
      setPosts([])
      return
    }

    const userIds = [...new Set(postsData.map((post) => post.user_id).filter(Boolean))]

    const { data: profilesData, error: profilesError } = await supabase
      .from('profiles')
      .select('id, username, avatar_url')
      .in('id', userIds)

    if (profilesError) {
      console.error('fetchProfiles error:', profilesError.message)
    }

    const postsWithProfiles: Post[] = postsData.map((post) => ({
      ...post,
      profiles:
        profilesData?.find((profile) => profile.id === post.user_id) || {
          username: 'user',
          avatar_url: null,
        },
    }))

    setPosts(postsWithProfiles)
  }

  const handleImageChange = (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0] || null

    if (imagePreview) URL.revokeObjectURL(imagePreview)

    setImage(file)

    if (file) {
      const previewUrl = URL.createObjectURL(file)
      setImagePreview(previewUrl)
      setMessage('')
    } else {
      setImagePreview(null)
    }
  }

  const clearSelectedImage = () => {
    if (imagePreview) URL.revokeObjectURL(imagePreview)

    setImage(null)
    setImagePreview(null)

    if (fileInputRef.current) {
      fileInputRef.current.value = ''
    }
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
    setMessage('Post created.')
    setLoading(false)
    await fetchPosts()
  }

  const handleLogout = async () => {
    await supabase.auth.signOut()
    router.push('/login')
  }

  return (
    <main className="min-h-screen bg-[#fff8f2] text-gray-900">
      <header className="sticky top-0 z-10 border-b bg-white/90 backdrop-blur">
        <div className="mx-auto flex max-w-3xl items-center justify-between px-4 py-4">
          <div className="flex items-center gap-3">
            <img
              src="/logo.png"
              alt="OnlyThankx"
              className="h-10 w-10 rounded-xl"
            />
            <div>
              <h1 className="text-lg font-bold">OnlyThankx</h1>
              <p className="text-xs text-gray-500">Share gratitude beautifully</p>
            </div>
          </div>

          <div className="flex items-center gap-3 text-sm font-medium">
            <Link href="/" className="text-gray-600">
              Home
            </Link>
            <Link href="/profile" className="text-gray-600">
              Profile
            </Link>
            <button
              onClick={handleLogout}
              className="rounded-lg bg-orange-500 px-3 py-2 text-white"
            >
              Logout
            </button>
          </div>
        </div>
      </header>

      <section className="mx-auto max-w-3xl px-4 py-6">
        <div className="mb-6 rounded-3xl border border-orange-100 bg-white p-4 shadow-sm">
          <div className="mb-3 flex items-center gap-3">
            <img
              src={myAvatar || '/logo.png'}
              alt="profile"
              className="h-12 w-12 rounded-full border border-orange-200 object-cover"
            />
            <div>
              <p className="font-semibold">@{myUsername}</p>
              <p className="text-sm text-gray-500">
                What are you thankful for today?
              </p>
            </div>
          </div>

          <textarea
            placeholder="Share a grateful moment..."
            className="min-h-[110px] w-full rounded-2xl border border-gray-200 p-4 outline-none"
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

          {image && (
            <div className="mt-4 rounded-2xl border border-orange-100 bg-orange-50/40 p-3">
              <p className="mb-3 text-sm text-gray-700">
                Selected: <span className="font-medium">{image.name}</span>
              </p>

              {imagePreview && (
                <img
                  src={imagePreview}
                  alt="Preview"
                  className="max-h-80 w-full rounded-2xl border border-orange-100 bg-white object-contain"
                />
              )}

              <button
                type="button"
                onClick={clearSelectedImage}
                className="mt-3 rounded-full border border-red-200 px-4 py-2 text-sm text-red-600"
              >
                Remove Photo
              </button>
            </div>
          )}

          {message && <p className="mt-3 text-sm text-gray-600">{message}</p>}

          <div className="mt-4 flex flex-wrap items-center justify-between gap-3">
            <div className="flex gap-3 text-sm text-gray-500">
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="rounded-full border px-4 py-2"
              >
                📷 Add Photo
              </button>

              <button className="rounded-full border px-4 py-2" type="button">
                🎥 Add Video
              </button>
            </div>

            <button
              type="button"
              onClick={handlePost}
              disabled={loading}
              className="rounded-full bg-orange-500 px-5 py-2.5 font-semibold text-white disabled:opacity-70"
            >
              {loading ? 'Posting...' : 'Post Thanks'}
            </button>
          </div>
        </div>

        <div className="space-y-5">
          {posts.length === 0 ? (
            <div className="rounded-3xl border border-orange-100 bg-white p-5 shadow-sm">
              <p className="text-gray-500">
                No posts yet. Make the first thankful post ✨
              </p>
            </div>
          ) : (
            posts.map((post) => <PostCard key={post.id} post={post} />)
          )}
        </div>
      </section>
    </main>
  )
}

function PostCard({ post }: { post: Post }) {
  const [thanksCount, setThanksCount] = useState(0)
  const [hasThanked, setHasThanked] = useState(false)
  const [comments, setComments] = useState<Comment[]>([])
  const [showComments, setShowComments] = useState(false)
  const [commentText, setCommentText] = useState('')
  const [commentLoading, setCommentLoading] = useState(false)
  const [shareMessage, setShareMessage] = useState('')

  useEffect(() => {
    fetchThanks()
    fetchComments()
  }, [])

  const profile = post.profiles
  const username = profile?.username || 'user'
  const avatarUrl = profile?.avatar_url || '/logo.png'

  const postUrl =
    typeof window !== 'undefined'
      ? `${window.location.origin}/post/${post.id}`
      : ''

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

    if (data) setHasThanked(true)
  }

  const fetchComments = async () => {
    const { data: commentsData, error } = await supabase
      .from('comments')
      .select('*')
      .eq('post_id', post.id)
      .order('created_at', { ascending: true })

    if (error || !commentsData) {
      return
    }

    if (commentsData.length === 0) {
      setComments([])
      return
    }

    const commentUserIds = [
      ...new Set(commentsData.map((comment) => comment.user_id).filter(Boolean)),
    ]

    const { data: profilesData } = await supabase
      .from('profiles')
      .select('id, username, avatar_url')
      .in('id', commentUserIds)

    const commentsWithProfiles: Comment[] = commentsData.map((comment) => ({
      ...comment,
      profiles:
        profilesData?.find((profile) => profile.id === comment.user_id) || {
          username: 'user',
          avatar_url: null,
        },
    }))

    setComments(commentsWithProfiles)
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
      setThanksCount((prev) => prev + 1)
      setHasThanked(true)
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
      await fetchComments()
      setShowComments(true)
    }

    setCommentLoading(false)
  }

  const handleShare = async () => {
    try {
      if (navigator.share) {
        await navigator.share({
          title: 'OnlyThankx Post',
          text: 'Check out this grateful post on OnlyThankx',
          url: postUrl,
        })
        setShareMessage('Shared successfully')
      } else {
        await navigator.clipboard.writeText(postUrl)
        setShareMessage('Link copied')
      }
    } catch {
      try {
        await navigator.clipboard.writeText(postUrl)
        setShareMessage('Link copied')
      } catch {
        setShareMessage('Could not share')
      }
    }

    setTimeout(() => setShareMessage(''), 2000)
  }

  return (
    <article className="rounded-3xl border border-orange-100 bg-white p-5 shadow-sm">
      <div className="mb-4 flex items-center gap-3">
        <img
          src={avatarUrl}
          alt="user"
          className="h-12 w-12 rounded-full border border-orange-200 object-cover"
        />
        <div>
          <p className="font-semibold">@{username}</p>
          <p className="text-sm text-gray-500">
            {new Date(post.created_at).toLocaleString()}
          </p>
        </div>
      </div>

      {post.content && (
        <p className="mb-4 text-[15px] leading-7 text-gray-700">{post.content}</p>
      )}

      {post.image_url && (
        <img
          src={post.image_url}
          alt="Post image"
          className="mb-4 w-full max-h-[500px] rounded-2xl border border-orange-100 bg-white object-contain"
        />
      )}

      <div className="flex flex-wrap items-center gap-3 border-t pt-4 text-sm font-medium text-gray-600">
        <button
          type="button"
          onClick={handleThanks}
          className={`rounded-full px-4 py-2 ${
            hasThanked ? 'bg-green-100 text-green-700' : 'bg-orange-50'
          }`}
        >
          ✌️ Thanks
        </button>

        <span>{thanksCount}</span>

        <button
          className="rounded-full bg-gray-50 px-4 py-2"
          type="button"
          onClick={() => setShowComments((prev) => !prev)}
        >
          Welcome {comments.length > 0 ? comments.length : ''}
        </button>

        <button
          className="rounded-full bg-gray-50 px-4 py-2"
          type="button"
          onClick={handleShare}
        >
          Happy Share
        </button>

        <Link
          href={`/post/${post.id}`}
          className="rounded-full bg-gray-50 px-4 py-2"
        >
          Open
        </Link>
      </div>

      {shareMessage && (
        <p className="mt-3 text-sm text-orange-500">{shareMessage}</p>
      )}

      {showComments && (
        <div className="mt-4 rounded-2xl border border-orange-100 bg-orange-50/30 p-4">
          <div className="mb-4 flex gap-2">
            <input
              value={commentText}
              onChange={(e) => setCommentText(e.target.value)}
              placeholder="Write a welcome comment..."
              className="flex-1 rounded-xl border px-3 py-2 outline-none"
            />
            <button
              type="button"
              onClick={handleComment}
              disabled={commentLoading}
              className="rounded-xl bg-orange-500 px-4 py-2 text-white disabled:opacity-70"
            >
              {commentLoading ? 'Posting...' : 'Comment'}
            </button>
          </div>

          <div className="space-y-3">
            {comments.length === 0 ? (
              <p className="text-sm text-gray-500">No comments yet.</p>
            ) : (
              comments.map((comment) => {
                const commentProfile = comment.profiles

                return (
                  <div
                    key={comment.id}
                    className="rounded-2xl border border-orange-100 bg-white p-3"
                  >
                    <div className="mb-2 flex items-center gap-2">
                      <img
                        src={commentProfile?.avatar_url || '/logo.png'}
                        alt="comment user"
                        className="h-8 w-8 rounded-full object-cover"
                      />
                      <div>
                        <p className="text-sm font-semibold">
                          @{commentProfile?.username || 'user'}
                        </p>
                        <p className="text-xs text-gray-500">
                          {new Date(comment.created_at).toLocaleString()}
                        </p>
                      </div>
                    </div>

                    <p className="text-sm text-gray-700">{comment.content}</p>
                  </div>
                )
              })
            )}
          </div>
        </div>
      )}
    </article>
  )
}