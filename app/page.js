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
  const [sliderRef, instanceRef] = useKeenSlider({
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
      fetchIssues(parsedUser.id);
    } else {
      fetchIssues(null);
    }
  }, []);


  const fetchIssues = async (userId) => {
    setLoading(true);
    try {
      const url = userId ? `/api/issues?userId=${userId}` : "/api/issues";
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
    if (!user) return alert("You must be logged in.");

    const res = await fetch(`/api/issues/${postId}/upvote`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ userId: user.id }),
    });

    if (res.ok) {
      const data = await res.json();

      // Update issues array with the new upvote state
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
    <div className="p-4 sm:px-8">
      <h1 className="text-2xl font-bold mb-2 text-[#a80ba3]">Community Issues</h1>

      {/* Toolbar */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 px-4 py-2 mb-2 ml-15">
        <input
          type="text"
          placeholder="Search..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="bg-white border border-[#a80ba3] rounded px-3 py-1 w-full sm:w-72 focus:outline-none focus:ring focus:border-[#a80ba3]"
        />
        <Button
          onClick={() => router.push("/new-issue")}
          className="bg-[#a80ba3] hover:bg-[#922a8f] text-white mr-15"
        >
          + New Issue
        </Button>
      </div>

      <div className="border border-transparent rounded-lg shadow-lg max-w-6xl mx-auto">
        {/* Table */}
        <div className="bg-[#DC9DDA]">
          <Table className="min-w-full table-fixed">
            <TableHeader>
              <TableRow>
                <TableHead className="w-12 p-3 text-center">#</TableHead>
                <TableHead className="w-40 p-3 text-center">Title</TableHead>
                <TableHead className="w-64 p-3 text-center">Description</TableHead>
                <TableHead className="w-64 p-3 text-center">Address</TableHead>
                <TableHead className="w-24 p-3 text-center">Upvotes</TableHead>
                <TableHead className="w-28 p-3 text-center">Map & Images</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {loading ? (
                <TableRow>
                  <TableCell colSpan="7" className="text-center text-gray-500 p-4">
                    Loading issues...
                  </TableCell>
                </TableRow>
              ) : paginatedIssues.length === 0 ? (
                <TableRow>
                  <TableCell colSpan="7" className="text-center text-gray-500 p-4">
                    No issues found.
                  </TableCell>
                </TableRow>
              ) : (
                paginatedIssues.map((issue, index) => (
                  <TableRow
                    key={issue.id}
                    className="odd:bg-[#f8e8f8] even:bg-[#EDCEEC] text-sm"
                  >
                    <TableCell className="text-center p-3">
                      {(currentPage - 1) * recordsPerPage + index + 1}
                    </TableCell>
                    <TableCell className="p-3 truncate">{issue.title}</TableCell>
                    <TableCell className="p-3 whitespace-pre-wrap break-words max-w-[250px]">
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
                          <span className="truncate-2-lines">
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


                    <TableCell className="p-3 whitespace-pre-wrap break-words">
                      {[issue.address, issue.taluka, issue.district, issue.state]
                        .filter(Boolean)
                        .join(", ")}
                    </TableCell>
                    <TableCell className="text-center p-3">{issue.upvotes ?? 0}</TableCell>

                    {/* Map & Images */}
                    <TableCell className="flex items-center justify-center gap-3 p-3">
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
                          <DialogContent className="max-w-3xl w-[95vw] bg-[#EDCEEC] rounded-lg shadow-md max-h-[90vh] overflow-y-auto p-4 space-y-4 scrollbar scrollbar-thin scrollbar-thumb-[#a80ba3] scrollbar-track-[#a80ba3]">
                            <DialogHeader>
                              <DialogTitle className="text-xl font-semibold text-[#a80ba3]">
                                Issue - {issue.title}
                              </DialogTitle>
                            </DialogHeader>

                            {/* Image Slider */}
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
                                  />
                                </div>
                              ))}

                            </div>

                            {/* Upvote Section */}
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



                            {/* Comments */}
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
          <div className="flex justify-between items-center p-4 bg-gray-100 rounded-b-lg">
            <button
              onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
              disabled={currentPage === 1}
              className="px-4 py-2 bg-blue-500 text-white rounded disabled:bg-gray-300"
            >
              Previous
            </button>
            <span className="text-gray-700">
              Page {currentPage} of {totalPages}
            </span>
            <button
              onClick={() => setCurrentPage((prev) => Math.min(prev + 1, totalPages))}
              disabled={currentPage === totalPages}
              className="px-4 py-2 bg-blue-500 text-white rounded disabled:bg-gray-300"
            >
              Next
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
