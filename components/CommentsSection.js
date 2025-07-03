"use client";

import { useState, useEffect, useCallback } from "react";
import { Button } from "@/components/ui/button";

export default function CommentsSection({
  issueId,
  userId,
  onCountChange, // Optional prop to notify parent
}) {
  const [comments, setComments] = useState([]);
  const [text, setText] = useState("");
  const [loading, setLoading] = useState(true);

  // ✅ Wrap in useCallback
  const fetchComments = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch(`/api/issues/${issueId}/comments`);
      const data = await res.json();
      setComments(data);
      if (onCountChange) {
        onCountChange(Array.isArray(data) ? data.length : 0);
      }
    } catch (error) {
      console.error("Failed to load comments", error);
      setComments([]);
      if (onCountChange) {
        onCountChange(0);
      }
    }
    setLoading(false);
  }, [issueId, onCountChange]);

  useEffect(() => {
    fetchComments();
  }, [fetchComments]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!userId) {
      alert("Missing userId.");
      return;
    }
    await fetch(`/api/issues/${issueId}/comments`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ text, userId }),
    });

    setText("");
    fetchComments(); // Refresh after posting
  };

  return (
    <div className="mt-4">
      <h3 className="font-semibold mb-2">Comments</h3>
      <form onSubmit={handleSubmit} className="flex gap-2 mb-2">
        <input
          className="border rounded p-1 w-full text-sm"
          type="text"
          placeholder="Write a comment..."
          value={text}
          onChange={(e) => setText(e.target.value)}
          required
        />
        <Button size="sm" type="submit" className="bg-[#a80ba3] text-white">
          Post
        </Button>
      </form>
      {loading ? (
        <p className="text-sm text-gray-500">Loading comments...</p>
      ) : comments.length === 0 ? (
        <p className="text-sm text-gray-500 italic">No comments yet.</p>
      ) : (
        <ul className="space-y-1 text-sm">
          {comments.map((c) => (
            <li key={c.id} className="border p-2 rounded bg-gray-50">
              <p className="text-xs text-gray-600 font-medium mb-1">
                {c.user?.name || "Anonymous"}
              </p>
              <p>{c.text}</p>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
