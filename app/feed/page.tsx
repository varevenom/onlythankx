'use client'

import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'
import Link from 'next/link'
import { useRouter } from 'next/navigation'

type Post = {
  id: string
  user_id: string
  content: string
  image_url: string | null
  created_at: string
}

export default function FeedPage() {
  const [posts, setPosts] = useState<Post[]>([])
  const [content, setContent] = useState('')
  const [loading, setLoading] = useState(false)
  const router = useRouter()

  useEffect(() => {
    fetchPosts()
  }, [])

  const fetchPosts = async () => {
    const { data } = await supabase
      .from('posts')
      .select('*')
      .order('created_at', { ascending: false })

    if (data) setPosts(data)
  }

  const handlePost = async () => {
    if (!content.trim()) return

    setLoading(true)

    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) return

    await supabase.from('posts').insert([
      {
        user_id: user.id,
        content,
      },
    ])

    setContent('')
    setLoading(false)
    fetchPosts()

    alert('✨ Posted! Share it with someone who matters.')
  }

  return (
    <main className="min-h-screen bg-[#fff7f4] p-4">
      
      {/* HEADER */}
      <div className="max-w-2xl mx-auto mb-6 flex justify-between items-center">
        <h1 className="text-xl font-bold">OnlyThankx</h1>
        <div className="flex gap-4 text-sm">
          <Link href="/">Home</Link>
          <Link href="/profile">Profile</Link>
        </div>
      </div>

      {/* POST BOX */}
      <div className="max-w-2xl mx-auto mb-6 bg-white p-4 rounded-2xl shadow">
        <textarea
          value={content}
          onChange={(e) => setContent(e.target.value)}
          placeholder="What are you thankful for today?"
          className="w-full p-2 border rounded-xl mb-3"
        />

        <button
          onClick={handlePost}
          className="bg-orange-500 text-white px-4 py-2 rounded-full hover:scale-105 transition"
        >
          {loading ? 'Posting...' : 'Post Thanks'}
        </button>
      </div>

      {/* POSTS */}
      <div className="max-w-2xl mx-auto space-y-4">
        {posts.length === 0 ? (
          <div className="text-center text-gray-500">
            No gratitude yet 😶 <br />
            Be the first ✨
          </div>
        ) : (
          posts.map((post) => <FeedCard key={post.id} post={post} />)
        )}
      </div>
    </main>
  )
}

/* ===================== */
/* 🔥 FEED CARD */
/* ===================== */

function FeedCard({ post }: { post: Post }) {
  const [thanks, setThanks] = useState(0)
  const [hasThanked, setHasThanked] = useState(false)

  useEffect(() => {
    fetchThanks()
  }, [])

  const fetchThanks = async () => {
    const { count } = await supabase
      .from('thanks')
      .select('*', { count: 'exact', head: true })
      .eq('post_id', post.id)

    setThanks(count || 0)
  }

  const handleThanks = async () => {
    if (hasThanked) return

    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) return

    await supabase.from('thanks').insert([
      {
        user_id: user.id,
        post_id: post.id,
      },
    ])

    setHasThanked(true)
    setThanks((prev) => prev + 1)
  }

  const handleShare = async () => {
    const url = `${window.location.origin}/post/${post.id}`

    await navigator.clipboard.writeText(url)
    alert('Link copied ✨')
  }

  return (
    <article className="rounded-[30px] border border-orange-100 bg-white shadow-lg transition duration-300 hover:-translate-y-1 hover:shadow-xl animate-fadeIn overflow-hidden">
      
      {/* CONTENT */}
      <div className="p-5">
        <p className="text-gray-800 mb-3">{post.content}</p>
        <p className="text-xs text-gray-400">
          {new Date(post.created_at).toLocaleString()}
        </p>
      </div>

      {/* ACTIONS */}
      <div className="p-5 flex gap-2 flex-wrap">
        <button
          onClick={handleThanks}
          className={`px-4 py-2 rounded-full text-sm transition ${
            hasThanked
              ? 'bg-green-200 text-green-800 scale-105'
              : 'bg-orange-50 hover:scale-105'
          }`}
        >
          ✌️ Thanks
        </button>

        <span className="text-sm text-gray-500">{thanks}</span>

        <button
          onClick={handleShare}
          className="px-4 py-2 rounded-full bg-gray-100 text-sm hover:scale-105 transition"
        >
          Happy Share
        </button>

        <Link
          href={`/post/${post.id}`}
          className="px-4 py-2 rounded-full bg-gray-100 text-sm hover:scale-105 transition"
        >
          Open
        </Link>
      </div>
    </article>
  )
}