"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";

type Post = {
  id: string;
  content: string;
  image_url: string;
  created_at: string;
};

export default function FeedPage() {
  const [posts, setPosts] = useState<Post[]>([]);
  const [content, setContent] = useState("");
  const [image, setImage] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchPosts();
  }, []);

  const fetchPosts = async () => {
    const { data } = await supabase
      .from("posts")
      .select("*")
      .order("created_at", { ascending: false });

    setPosts(data || []);
  };

  const handlePost = async () => {
    if (!content && !image) return;

    setLoading(true);

    let image_url = "";

    if (image) {
      const fileName = `${Date.now()}-${image.name}`;

      await supabase.storage.from("posts").upload(fileName, image);

      image_url = supabase.storage
        .from("posts")
        .getPublicUrl(fileName).data.publicUrl;
    }

    await supabase.from("posts").insert([
      {
        content,
        image_url,
      },
    ]);

    setContent("");
    setImage(null);
    setLoading(false);

    fetchPosts();
  };

  return (
    <div className="min-h-screen bg-[#f5f5f5] flex justify-center">
      <div className="w-full max-w-md px-4 py-6">

        {/* HEADER */}
        <h1 className="text-2xl font-bold mb-6 text-center">
          OnlyThankx ✌️
        </h1>

        {/* CREATE POST */}
        <div className="bg-white rounded-2xl shadow p-4 mb-6">
          <textarea
            className="w-full border rounded-xl p-3 mb-3 outline-none resize-none"
            rows={3}
            placeholder="Share something you're grateful for..."
            value={content}
            onChange={(e) => setContent(e.target.value)}
          />

          <div className="flex items-center justify-between gap-2">
            <input
              type="file"
              onChange={(e) => setImage(e.target.files?.[0] || null)}
              className="text-sm"
            />

            <button
              onClick={handlePost}
              disabled={loading}
              className="bg-orange-500 hover:bg-orange-600 text-white px-4 py-2 rounded-xl text-sm"
            >
              {loading ? "Posting..." : "Post Thanks"}
            </button>
          </div>
        </div>

        {/* FEED */}
        {posts.map((post) => (
          <div
            key={post.id}
            className="bg-white rounded-2xl shadow mb-5 overflow-hidden"
          >
            {post.image_url && (
              <img
                src={post.image_url}
                alt="post"
                className="w-full h-64 object-cover"
              />
            )}

            <div className="p-4">
              <p className="text-gray-800 mb-4">{post.content}</p>

              <div className="flex justify-between text-sm text-gray-500">
                <button className="hover:text-black">🙏 Thanks</button>
                <button className="hover:text-black">💬 Welcome</button>
                <button className="hover:text-black">📤 Happy Share</button>
              </div>
            </div>
          </div>
        ))}

        {/* EMPTY STATE */}
        {posts.length === 0 && (
          <p className="text-center text-gray-400 mt-10">
            No posts yet. Be the first ✨
          </p>
        )}
      </div>
    </div>
  );
}