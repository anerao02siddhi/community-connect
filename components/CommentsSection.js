import { useState, useEffect, useCallback } from "react";
import { Button } from "@/components/ui/button";
import toast from "react-hot-toast";

export default function CommentsSection({ issueId, userId }) {
  const [comments, setComments] = useState([]);
  const [text, setText] = useState("");
  const [parentId, setParentId] = useState(null);
  const [activeReplyBox, setActiveReplyBox] = useState(null);
  const [mention, setMention] = useState("");
  const [loading, setLoading] = useState(true);

  const fetchComments = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch(`/api/issues/${issueId}/comments`);
      const data = await res.json();
      setComments(data);
    } catch (err) {
      console.error(err);
      toast.error("Error loading comments");
    }
    setLoading(false);
  }, [issueId]);

  useEffect(() => {
    fetchComments();
  }, [fetchComments]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!userId) return toast.error("You must be logged in");

    try {
      const replyText = parentId ? `@${mention} ${text}` : text;

      const res = await fetch(`/api/issues/${issueId}/comments`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text: replyText, userId, parentId }),
      });

      if (!res.ok) throw new Error("Failed to post comment");

      toast.success("Comment posted");
      setText("");
      setParentId(null);
      setActiveReplyBox(null);
      setMention("");
      fetchComments();
    } catch (err) {
      console.error(err);
      toast.error("Failed to post comment");
    }
  };

  const renderReplyInput = (commentId, mentionName) => {
    return (
      <form onSubmit={handleSubmit} className="flex flex-col gap-1 mt-2">
        {mentionName && (
          <span className="text-blue-500 font-medium text-sm">
            @{mentionName}
          </span>
        )}
        <div className="flex items-center gap-2">
          <input
            type="text"
            className="border p-1 rounded text-sm w-full"
            placeholder="Write a reply..."
            value={text}
            onChange={(e) => setText(e.target.value)}
            autoFocus
          />
          <Button type="submit" size="sm" className="bg-[#a80ba3] text-white">
            Reply
          </Button>
        </div>
      </form>
    );
  };

  const renderReplies = (replies, level = 1) => {
    return replies.map((reply) => (
      <div key={reply.id} className={`ml-${level * 4} mt-1`}>
        <div className="border p-2 rounded bg-gray-50 text-sm">
          <p className="text-xs text-[#a80ba3] font-medium">
            {reply.user?.name || "Anonymous"}
          </p>
          <p>
            {(() => {
              const words = reply.text.trim().split(/\s+/);
              const bluePart = words.slice(0, 3).join(" ");
              const restPart = words.slice(3).join(" ");

              return (
                <>
                  <span className="text-blue-500 font-medium">{bluePart}</span>{" "}
                  {restPart}
                </>
              );
            })()}



          </p>

          <button
            className="text-xs text-blue-500 mt-1"
            onClick={() => {
              setParentId(reply.id);
              setActiveReplyBox(reply.id);
              setMention(reply.user?.name || "Anonymous");
              setText("");
            }}
          >
            Reply
          </button>

          {activeReplyBox === reply.id &&
            renderReplyInput(reply.id, mention)}

          {reply.replies?.length > 0 &&
            renderReplies(reply.replies, level + 1)}
        </div>
      </div>
    ));
  };

  const nestComments = (all) => {
    const map = {};
    const roots = [];

    all.forEach((c) => {
      map[c.id] = { ...c, replies: [] };
    });

    all.forEach((c) => {
      if (c.parentId) {
        map[c.parentId]?.replies.push(map[c.id]);
      } else {
        roots.push(map[c.id]);
      }
    });

    return roots;
  };

  return (
    <div className="mt-4">
      <h3 className="font-semibold mb-2">Comments</h3>

      <form onSubmit={handleSubmit} className="flex gap-2 mb-4">
        <input
          className="border rounded p-1 w-full text-sm"
          type="text"
          placeholder="Write a comment..."
          value={text}
          onChange={(e) => setText(e.target.value)}
          required
        />
        <Button type="submit" size="sm" className="bg-[#a80ba3] text-white">
          {parentId ? "Reply" : "Post"}
        </Button>
      </form>

      {loading ? (
        <p className="text-sm text-gray-500">Loading...</p>
      ) : comments.length === 0 ? (
        <p className="text-sm italic text-gray-400">No comments yet.</p>
      ) : (
        <div className="space-y-2 text-sm">
          {nestComments(comments).map((c) => (
            <div key={c.id} className="border p-2 rounded bg-gray-50">
              <p className="text-xs font-medium text-[#a80ba3]">
                {c.user?.name || "Anonymous"}
              </p>
              <p>
                {c.text.split(/(@[\w\s.]+)(?=\s|$)/g).map((part, index) =>
                  part.startsWith("@") ? (
                    <span key={index} className="text-blue-500 font-medium">
                      {part}
                    </span>
                  ) : (
                    <span key={index}>{part}</span>
                  )
                )}
              </p>
              <button
                className="text-xs text-blue-500 mt-1"
                onClick={() => {
                  setParentId(c.id);
                  setActiveReplyBox(c.id);
                  setMention(c.user?.name || "Anonymous");
                  setText("");
                }}
              >
                Reply
              </button>

              {activeReplyBox === c.id &&
                renderReplyInput(c.id, mention)}

              {renderReplies(c.replies)}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
