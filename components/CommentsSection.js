"use client";

import { useState, useEffect, useCallback } from "react";
import { Button } from "@/components/ui/button";
import toast from "react-hot-toast";

export default function CommentsSection({
  issueId,
  userId,
  onCountChange, // Optional prop to notify parent
}) {
  const [comments, setComments] = useState([]);
  const [text, setText] = useState("");
  const [loading, setLoading] = useState(true);

  const fetchComments = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch(`/api/issues/${issueId}/comments`);
      if (!res.ok) throw new Error("Failed to fetch comments");
      const data = await res.json();
      setComments(data);
      if (onCountChange) {
        onCountChange(issueId, Array.isArray(data) ? data.length : 0);
      }
    } catch (error) {
      console.error("Failed to load comments", error);
      toast.error("Error loading comments");
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
      toast.error("User not logged in.");
      return;
    }

    try {
      const res = await fetch(`/api/issues/${issueId}/comments`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text, userId }),
      });

      if (!res.ok) throw new Error("Failed to post comment");

      toast.success("Comment posted successfully!");
      setText("");
      fetchComments();
    } catch (err) {
      console.error("Error posting comment:", err);
      toast.error("Failed to post comment");
    }
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
