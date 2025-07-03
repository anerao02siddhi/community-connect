"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import CommentsSection from "@/components/CommentsSection";
import { FaMapMarkerAlt, FaThumbsUp, FaRegThumbsUp } from "react-icons/fa";
import toast from "react-hot-toast";
import { parseCoordinates } from "@/lib/utils";
import {
  Dialog,
  DialogTrigger,
  DialogContent,
  DialogTitle
} from "@/components/ui/dialog";

export default function MyIssuesPage() {
  const [issues, setIssues] = useState([]);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [user, setUser] = useState(null);
  const [expandedDescriptions, setExpandedDescriptions] = useState({});
  const [searchTerm, setSearchTerm] = useState("");
  const [commentCounts, setCommentCounts] = useState({});
  const [visibleComments, setVisibleComments] = useState({});

  const recordsPerPage = 9;
  const router = useRouter();

  useEffect(() => {
    const storedUser = localStorage.getItem("user");
    if (!storedUser) {
      toast.error("You must be logged in.");
      router.push("/login-register");
      return;
    }
    const parsedUser = JSON.parse(storedUser);
    setUser(parsedUser);
  }, [router]);

  useEffect(() => {
    if (user?.id) {
      fetchIssues();
    }
  }, [user]);

  // ✅ Put this BACK in your code
  const fetchCommentCounts = async (ids) => {
    const countsObj = {};
    await Promise.all(
      ids.map(async (id) => {
        try {
          const res = await fetch(`/api/issues/${id}/comments`);
          if (!res.ok) {
            countsObj[id] = 0;
            return;
          }
          const data = await res.json();
          countsObj[id] = Array.isArray(data) ? data.length : 0;
        } catch (err) {
          countsObj[id] = 0;
        }
      })
    );
    setCommentCounts(countsObj);
  };

  const fetchIssues = async () => {
    setLoading(true);
    try {
      const res = await fetch(`/api/issues?userId=${user.id}`);
      const data = await res.json();
      if (Array.isArray(data)) {
        setIssues(data);
        // Pre-fetch counts for all issues:
        await fetchCommentCounts(data.map((issue) => issue.id));
        toast.success("Issues loaded successfully.");
      } else {
        toast.error(data.error || "Failed to load issues.");
        setIssues([]);
      }
    } catch (error) {
      console.error("Error fetching issues:", error);
      toast.error("Error fetching issues.");
      setIssues([]);
    } finally {
      setLoading(false);
    }
  };


  const handleToggleUpvote = async (postId) => {
    if (!user) return toast.error("You must be logged in to vote.");

    const res = await fetch(`/api/issues/${postId}/upvote`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ userId: user.id }),
    });

    if (res.ok) {
      toast.success("Vote updated.");
      fetchIssues();
    } else {
      toast.error("Something went wrong while voting.");
    }
  };

  const filteredIssues = issues.filter(
    (issue) =>
      issue.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      issue.description.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const totalPages = Math.ceil(filteredIssues.length / recordsPerPage);
  const paginatedIssues = filteredIssues.slice(
    (currentPage - 1) * recordsPerPage,
    currentPage * recordsPerPage
  );

  return (
    <div className="p-4 max-w-7xl mx-auto">
      <h1 className="text-2xl font-bold mb-4 text-[#a80ba3]">My Reported Issues</h1>

      {/* Search & Create */}
      <div className="flex flex-col sm:flex-row gap-2 mb-4">
        <input
          type="text"
          placeholder="Search issues..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="border border-[#a80ba3] rounded px-3 py-2 w-full sm:w-72 focus:outline-none focus:ring focus:border-[#a80ba3]"
        />
        <Button
          onClick={() => router.push("/new-issue")}
          className="bg-[#a80ba3] hover:bg-[#922a8f] text-white"
        >
          + New Issue
        </Button>
      </div>

      {loading ? (
        <p className="text-gray-600">Loading issues...</p>
      ) : paginatedIssues.length === 0 ? (
        <p className="text-gray-600">No issues found.</p>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {paginatedIssues.map((issue) => (
            <div
              key={issue.id}
              className="bg-white border border-gray-200 rounded-md shadow-sm flex flex-col text-sm overflow-hidden"
            >
              {/* Title + Address */}
              <div className="flex items-start justify-between p-3">
                <div className="flex-1">
                  <h2 className="font-semibold text-[#a80ba3]">{issue.title}</h2>
                  <p className="text-xs text-gray-500">
                    {[issue.address, issue.taluka, issue.district, issue.state]
                      .filter(Boolean)
                      .join(", ")}
                  </p>
                </div>
                {issue.location && parseCoordinates(issue.location) && (
                  <a
                    href={`https://www.google.com/maps/dir/?api=1&destination=${parseCoordinates(issue.location).lat},${parseCoordinates(issue.location).lng}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    title="View on Map"
                    className="text-[#a80ba3] ml-2 mt-1"
                  >
                    <FaMapMarkerAlt className="text-xl" />
                  </a>
                )}
              </div>

              {/* Image */}
              {Array.isArray(issue.imageUrl) && issue.imageUrl[0] && (
                <div className="w-full">
                  <img
                    src={issue.imageUrl[0]}
                    alt={issue.title}
                    className="w-full h-38 object-cover"
                  />
                </div>
              )}

              {/* Description */}
              <div className="p-3">
                {expandedDescriptions[issue.id] ? (
                  <>
                    <p className="text-gray-800">{issue.description}</p>
                    <button
                      onClick={() =>
                        setExpandedDescriptions((prev) => ({
                          ...prev,
                          [issue.id]: false,
                        }))
                      }
                      className="text-blue-600 text-xs mt-1"
                    >
                      Show Less
                    </button>
                  </>
                ) : (
                  <>
                    <p className="text-gray-800 line-clamp-2">{issue.description}</p>
                    <button
                      onClick={() =>
                        setExpandedDescriptions((prev) => ({
                          ...prev,
                          [issue.id]: true,
                        }))
                      }
                      className="text-blue-600 text-xs mt-1"
                    >
                      Show More
                    </button>
                  </>
                )}
              </div>

              {/* Comments */}
              <div className="border-t px-3 py-2">
                <Dialog>
                  <DialogTrigger asChild>
                    <button className="text-blue-600 text-sm">
                      Comments
                      <span className="text-gray-500 ml-1">
                        ({commentCounts[issue.id] ?? 0})
                      </span>
                    </button>
                  </DialogTrigger>
                  <DialogContent className="max-w-lg bg-white">
                    <DialogTitle>Comments</DialogTitle>
                    <CommentsSection
                      issueId={issue.id}
                      userId={user?.id}
                      onCountChange={(count) =>
                        setCommentCounts((prev) => ({
                          ...prev,
                          [issue.id]: count,
                        }))
                      }
                    />
                  </DialogContent>
                </Dialog>
              </div>


              {/* Vote */}
              <div className="flex items-center gap-2 p-3 border-t">
                <button
                  onClick={() => handleToggleUpvote(issue.id)}
                  className="flex items-center gap-1"
                  title={issue.hasUpvoted ? "Unvote" : "Upvote"}
                >
                  {issue.hasUpvoted ? (
                    <FaThumbsUp className="text-[#a80ba3]" />
                  ) : (
                    <FaRegThumbsUp className="text-gray-500 hover:text-[#a80ba3]" />
                  )}
                  <span className="text-sm">{issue.upvotes ?? 0}</span>
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex justify-between items-center mt-4">
          <button
            onClick={() => setCurrentPage((p) => Math.max(p - 1, 1))}
            disabled={currentPage === 1}
            className="px-4 py-2 bg-[#a80ba3] text-white rounded disabled:bg-gray-300"
          >
            Previous
          </button>
          <span>
            Page {currentPage} of {totalPages}
          </span>
          <button
            onClick={() => setCurrentPage((p) => Math.min(p + 1, totalPages))}
            disabled={currentPage === totalPages}
            className="px-4 py-2 bg-[#a80ba3] text-white rounded disabled:bg-gray-300"
          >
            Next
          </button>
        </div>
      )}
    </div>
  );
}
