import { supabase } from '@/lib/supabase'
import Link from 'next/link'

type Profile = {
  username: string
  avatar_url?: string | null
}

type Post = {
  id: string
  content: string
  image_url: string | null
  created_at: string
  profiles: Profile | Profile[] | null
}

type Comment = {
  id: string
  content: string
  created_at: string
  profiles: Profile | Profile[] | null
}

export default async function SinglePostPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params

  const { data: post } = await supabase
    .from('posts')
    .select(
      `
      id,
      content,
      image_url,
      created_at,
      profiles (
        username,
        avatar_url
      )
    `
    )
    .eq('id', id)
    .single()

  const { data: comments } = await supabase
    .from('comments')
    .select(
      `
      id,
      content,
      created_at,
      profiles (
        username,
        avatar_url
      )
    `
    )
    .eq('post_id', id)
    .order('created_at', { ascending: true })

  if (!post) {
    return (
      <main className="min-h-screen bg-[#fff8f2] p-8">
        <div className="mx-auto max-w-2xl rounded-3xl bg-white p-8 shadow-sm">
          <p className="text-lg font-semibold">Post not found.</p>
          <Link href="/feed" className="mt-4 inline-block text-orange-500">
            Back to feed
          </Link>
        </div>
      </main>
    )
  }

  const profile = Array.isArray(post.profiles) ? post.profiles[0] : post.profiles

  return (
    <main className="min-h-screen bg-[#fff8f2] p-4">
      <div className="mx-auto max-w-2xl">
        <Link href="/feed" className="mb-4 inline-block text-orange-500">
          ← Back to feed
        </Link>

        <article className="rounded-3xl border border-orange-100 bg-white p-5 shadow-sm">
          <div className="mb-4 flex items-center gap-3">
            <img
              src={profile?.avatar_url || '/logo.png'}
              alt="user"
              className="h-12 w-12 rounded-full border border-orange-200 object-cover"
            />
            <div>
              <p className="font-semibold">@{profile?.username || 'user'}</p>
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
              className="mb-6 w-full max-h-[600px] rounded-2xl border border-orange-100 bg-white object-contain"
            />
          )}

          <div className="rounded-2xl border border-orange-100 bg-orange-50/30 p-4">
            <h2 className="mb-4 text-lg font-semibold">Welcome section</h2>

            <div className="space-y-3">
              {!comments || comments.length === 0 ? (
                <p className="text-sm text-gray-500">No comments yet.</p>
              ) : (
                comments.map((comment: Comment) => {
                  const commentProfile = Array.isArray(comment.profiles)
                    ? comment.profiles[0]
                    : comment.profiles

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
        </article>
      </div>
    </main>
  )
}