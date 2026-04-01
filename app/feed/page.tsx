"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";

export default function FeedPage() {
  const [posts, setPosts] = useState<any[]>([]);
  const [content, setContent] = useState("");
  const [image, setImage] = useState<File | null>(null);

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
    let image_url = "";

    if (image) {
      const fileName = `${Date.now()}-${image.name}`;

      const { data: uploadData } = await supabase.storage
        .from("posts")
        .upload(fileName, image);

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
    fetchPosts();
  };

  return (
    <div className="min-h-screen bg-[#f8f8f8] flex justify-center">
      <div className="w-full max-w-md px-4 py-6">

        {/* Create Post */}
        <div className="bg-white rounded-2xl shadow p-4 mb-6">
          <textarea
            className="w-full border rounded-xl p-3 mb-3 outline-none"
            placeholder="Share something you're grateful for..."
            value={content}
            onChange={(e) => setContent(e.target.value)}
          />

          <div className="flex items-center justify-between">
            <input
              type="file"
              onChange={(e) => setImage(e.target.files?.[0] || null)}
            />

            <button
              onClick={handlePost}
              className="bg-orange-500 text-white px-4 py-2 rounded-xl"
            >
              Post Thanks
            </button>
          </div>
        </div>

        {/* Feed */}
        {posts.map((post) => (
          <div
            key={post.id}
            className="bg-white rounded-2xl shadow mb-5 overflow-hidden"
          >
            {post.image_url && (
              <img
                src={post.image_url}
                className="w-full h-64 object-cover"
              />
            )}

            <div className="p-4">
              <p className="text-gray-800 mb-3">{post.content}</p>

              <div className="flex justify-between text-sm text-gray-500">
                <button>🙏 Thanks</button>
                <button>💬 Welcome</button>
                <button>📤 Happy Share</button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}