"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import CommentsSection from "@/components/CommentsSection";
import { FaMapMarkerAlt, FaRegImages, FaThumbsUp, FaRegThumbsUp } from "react-icons/fa";
import { useKeenSlider } from "keen-slider/react";
import toast from "react-hot-toast";
import Image from "next/image";
import { issueOptions } from "@/lib/issueData";

function parseCoordinates(locationString) {
  const [lat, lng] = locationString?.split(",").map((val) => parseFloat(val.trim()));
  if (!isNaN(lat) && !isNaN(lng)) {
    return { lat, lng };
  }
  return null;
}

export default function HomePage() {
  const [issues, setIssues] = useState([]);
  const [loading, setLoading] = useState(true);
  const [expandedDescriptions, setExpandedDescriptions] = useState({});
  const [currentPage, setCurrentPage] = useState(1);
  const [user, setUser] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [typeFilter, setTypeFilter] = useState("all");
  const [sortBy, setSortBy] = useState("recent"); // default: recent
  const [sliderRef] = useKeenSlider({
    loop: true,
    slides: { perView: 1 },
  });

  const recordsPerPage = 20;
  const router = useRouter();

  useEffect(() => {
    const storedUser = localStorage.getItem("user");
    if (storedUser) {
      const parsedUser = JSON.parse(storedUser);
      setUser(parsedUser);
      fetchIssues(parsedUser.id, true); // Fetch issues by user
    } else {
      fetchIssues(); // Fetch all issues if no user is logged in
    }
  }, []);



  const fetchIssues = async (userId = null, filterByUser = false) => {
    setLoading(true);
    try {
      const url =
        filterByUser && userId
          ? `/api/issues?userId=${userId}` // Only include userId if explicitly filtering
          : `/api/issues`;

      const res = await fetch(url);
      const data = await res.json();
      console.log("Fetched issues:", data);

      if (Array.isArray(data)) {
        setIssues(data);
      } else {
        console.error("Unexpected response:", data);
        setIssues([]);
        toast.error(data.error || "Failed to load issues.");
      }
    } catch (error) {
      console.error("Failed to load issues", error);
      setIssues([]);
    }
    setLoading(false);
  };


  const handleToggleUpvote = async (postId) => {
    if (!user) return toast.error("You must be Login first.");

    const res = await fetch(`/api/issues/${postId}/upvote`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ userId: user.id }),
    });

    if (res.ok) {
      const data = await res.json();

      setIssues((prevIssues) =>
        prevIssues.map((issue) =>
          issue.id === postId
            ? {
              ...issue,
              upvotes: data.upvotes,
              hasUpvoted: data.hasUpvoted,
            }
            : issue
        )
      );

      if (data.hasUpvoted) {
        toast.success("You voted 👍");
      } else {
        toast("Vote removed 👎", { icon: "❌" });
      }
    } else {
      toast.error("Something went wrong while voting.");
    }
  };

  const filteredIssues = issues
    .filter((issue) =>
      issue.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      issue.description.toLowerCase().includes(searchTerm.toLowerCase())
    )
    .filter((issue) =>
      statusFilter === "all" || issue.status?.toLowerCase() === statusFilter.toLowerCase()
    )
    .filter((issue) =>
      typeFilter === "all" || issue.category?.toLowerCase() === typeFilter.toLowerCase()
    );

  const sortedIssues = [...filteredIssues].sort((a, b) => {
    if (sortBy === "priority") return (b.upvotes ?? 0) - (a.upvotes ?? 0);
    if (sortBy === "recent") return new Date(b.createdAt) - new Date(a.createdAt);
    return 0;
  });

  const totalPages = Math.ceil(sortedIssues.length / recordsPerPage);

  const paginatedIssues = sortedIssues.slice(
    (currentPage - 1) * recordsPerPage,
    currentPage * recordsPerPage
  );

  return (
    <div className="p-4 sm:px-8">
      <h1 className="text-2xl font-bold mb-2 text-[#a80ba3]">Community Issues</h1>

      {/* Toolbar */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 px-2 py-2 mb-4 flex-wrap">
        {/* Filters + Search */}
        <div className="flex flex-wrap items-center gap-2 flex-grow">
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="border border-[#a80ba3] rounded px-2 py-1 text-sm"
          >
            <option value="all">Status: All</option>
            <option value="Open">Open</option>
            <option value="Working">Working</option>
            <option value="Resolve">Resolved</option>
          </select>

          <select
            value={typeFilter}
            onChange={(e) => setTypeFilter(e.target.value)}
            className="border border-[#a80ba3] rounded px-2 py-1 text-sm"
          >
            <option value="all">Type: All</option>
            {Object.keys(issueOptions).map((category) => (
              <option key={category} value={category.toLowerCase()}>{category}</option>
            ))}
          </select>

          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value)}
            className="border border-[#a80ba3] rounded px-2 py-1 text-sm"
          >
            <option value="priority">Sort: Priority</option>
            <option value="recent">Sort: Latest</option>
          </select>

          <input
            type="text"
            placeholder="Search by title or description..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="bg-white border border-[#a80ba3] rounded px-3 py-1 text-sm w-full sm:w-64"
          />
        </div>

        {/* New Issue Button */}
        <Button
          onClick={() => router.push("/new-issue")}
          className="bg-[#a80ba3] hover:bg-[#922a8f] text-white w-full sm:w-auto"
        >
          + New Issue
        </Button>
      </div>


      <div className="border border-transparent rounded-lg shadow-lg max-w-6xl mx-auto">
        {/* Responsive Table */}
        <div className="w-full overflow-x-auto">
          <Table className="min-w-[650px]">
            <TableHeader>
              <TableRow className='bg-[#EDCEEC]'>
                <TableHead className="min-w-[40px] p-2 text-center">#</TableHead>
                <TableHead className="min-w-[150px] p-2 text-left">Title</TableHead>
                <TableHead className="min-w-[220px] p-2 text-center">Description</TableHead>
                <TableHead className="min-w-[220px] p-2 text-center">Address</TableHead>
                <TableHead className="min-w-[80px] p-2 text-center">Status</TableHead>
                <TableHead className="min-w-[100px] p-2 text-center">Upvotes</TableHead>
                <TableHead className="min-w-[120px] p-2 text-center">Map & Images</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {loading ? (
                <TableRow>
                  <TableCell colSpan="6" className="text-center text-gray-500 p-4">
                    Loading issues...
                  </TableCell>
                </TableRow>
              ) : paginatedIssues.length === 0 ? (
                <TableRow>
                  <TableCell colSpan="6" className="text-center text-gray-500 p-4">
                    No issues found.
                  </TableCell>
                </TableRow>
              ) : (
                paginatedIssues.map((issue, index) => (
                  <TableRow
                    key={issue.id}
                    className="odd:bg-[#f8e8f8] even:bg-[#EDCEEC] text-sm"
                  >
                    <TableCell className="text-center p-2">
                      {(currentPage - 1) * recordsPerPage + index + 1}
                    </TableCell>
                    <TableCell className="p-2">{issue.title}</TableCell>
                    <TableCell className="p-2 whitespace-pre-wrap break-words max-w-[250px]">
                      {expandedDescriptions[issue.id] ? (
                        <>
                          <span>{issue.description}</span>{" "}
                          <button
                            onClick={() =>
                              setExpandedDescriptions((prev) => ({
                                ...prev,
                                [issue.id]: false,
                              }))
                            }
                            className="text-blue-600 ml-1"
                          >
                            Less
                          </button>
                        </>
                      ) : (
                        <>
                          <span className="line-clamp-2">
                            {issue.description}
                          </span>{" "}
                          <button
                            onClick={() =>
                              setExpandedDescriptions((prev) => ({
                                ...prev,
                                [issue.id]: true,
                              }))
                            }
                            className="text-blue-600 ml-1"
                          >
                            More
                          </button>
                        </>
                      )}
                    </TableCell>
                    <TableCell className="p-2 whitespace-pre-wrap break-words">
                      {[issue.address, issue.taluka, issue.district, issue.state]
                        .filter(Boolean)
                        .join(", ")}
                    </TableCell>
                    <TableCell className="text-center p-2">{issue.status ?? 0}</TableCell>
                    <TableCell className="text-center p-2">{issue.upvotes ?? 0}</TableCell>
                    <TableCell className="flex items-center justify-center gap-3 p-2">
                      {issue.location && parseCoordinates(issue.location) && (
                        <a
                          href={`https://www.google.com/maps/dir/?api=1&destination=${parseCoordinates(issue.location).lat},${parseCoordinates(issue.location).lng}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          title="View in Google Maps"
                          className="inline-flex items-center justify-center w-8 h-8 rounded-full hover:bg-gray-200"
                        >
                          <FaMapMarkerAlt className="text-[#a80ba3] text-lg" />
                        </a>
                      )}
                      {Array.isArray(issue.imageUrl) && issue.imageUrl.length > 0 && (
                        <Dialog>
                          <DialogTrigger asChild>
                            <span
                              className="inline-flex items-center justify-center w-8 h-8 rounded-full hover:bg-gray-200 cursor-pointer"
                              title="View Images"
                            >
                              <FaRegImages className="text-[#a80ba3] text-lg" />
                            </span>
                          </DialogTrigger>
                          <DialogContent className="max-w-3xl w-[95vw] bg-[#EDCEEC] rounded-lg shadow-md max-h-[90vh] overflow-y-auto p-4 space-y-4">
                            <DialogHeader>
                              <DialogTitle className="text-xl font-semibold text-[#a80ba3]">
                                Issue - {issue.title}
                              </DialogTitle>
                            </DialogHeader>
                            <h3 className="font-semibold text-[#a80ba3]">Before Work</h3>
                            <div ref={sliderRef} className="keen-slider rounded-lg overflow-hidden">
                              {issue.imageUrl.map((url, idx) => (
                                <div
                                  key={idx}
                                  className="keen-slider__slide relative w-full h-[40vh] flex justify-center items-center"
                                >
                                  <Image
                                    src={url}
                                    alt={`image-${idx}`}
                                    fill
                                    className="object-contain rounded"
                                    unoptimized
                                  />
                                </div>
                              ))}
                            </div>
                            <h3 className="font-semibold text-[#a80ba3]">After Work</h3>
                            {Array.isArray(issue.afterImageUrl) && issue.afterImageUrl.length > 0 ? (
                              <div ref={sliderRef} className="keen-slider rounded-lg overflow-hidden">
                                {issue.afterImageUrl.map((url, idx) => (
                                  <div
                                    key={idx}
                                    className="keen-slider__slide relative w-full h-[40vh] flex justify-center items-center"
                                  >
                                    <Image
                                      src={url}
                                      alt={`after-image-${idx}`}
                                      fill
                                      className="object-contain rounded"
                                      unoptimized
                                    />
                                  </div>
                                ))}
                              </div>
                            ) : (
                              <div className="w-full h-[40vh] flex items-center justify-center bg-white border rounded text-[#a80ba3] font-semibold">
                                Working!
                              </div>
                            )}
                            <span
                              onClick={() => handleToggleUpvote(issue.id)}
                              className="cursor-pointer flex items-center gap-2 text-2xl"
                              title={issue.hasUpvoted ? "Unvote" : "Upvote"}
                            >
                              {issue.hasUpvoted ? (
                                <FaThumbsUp className="text-[#a80ba3]" />
                              ) : (
                                <FaRegThumbsUp className="text-gray-500 hover:text-[#a80ba3]" />
                              )}
                              <span className="text-base font-semibold text-[#a80ba3]">{issue.upvotes ?? 0}</span>
                            </span>
                            <div className="border-t pt-2">
                              <CommentsSection issueId={issue.id} userId={user?.id} />
                            </div>
                          </DialogContent>
                        </Dialog>
                      )}
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="flex flex-col sm:flex-row justify-between items-center p-2 bg-gray-100 gap-2">
            <button
              onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
              disabled={currentPage === 1}
              className="w-full sm:w-auto px-4 py-2 bg-blue-500 text-white rounded disabled:bg-gray-300"
            >
              Previous
            </button>
            <span className="text-gray-700 text-center">
              Page {currentPage} of {totalPages}
            </span>
            <button
              onClick={() => setCurrentPage((prev) => Math.min(prev + 1, totalPages))}
              disabled={currentPage === totalPages}
              className="w-full sm:w-auto px-4 py-2 bg-blue-500 text-white rounded disabled:bg-gray-300"
            >
              Next
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
