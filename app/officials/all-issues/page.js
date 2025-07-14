"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import {
    DropdownMenu,
    DropdownMenuTrigger,
    DropdownMenuContent,
    DropdownMenuItem,
} from "@/components/ui/dropdown-menu";
import { MoreVertical } from "lucide-react";
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";
import CommentsSection from "@/components/CommentsSection";
import {
    FaMapMarkerAlt,
    FaRegImages,
    FaThumbsUp,
    FaRegThumbsUp,
} from "react-icons/fa";
import { useKeenSlider } from "keen-slider/react";
import toast from "react-hot-toast";
import Image from "next/image";
import { issueOptions } from "@/lib/issueData";
import CameraCaptureWithLocation from "@/components/CameraCaptureWithLocation";

function parseCoordinates(locationString) {
    const [lat, lng] = locationString?.split(",").map((val) => parseFloat(val.trim())) || [];
    if (!isNaN(lat) && !isNaN(lng)) return { lat, lng };
    return null;
}

export default function AllIssues() {
    const [useCamera, setUseCamera] = useState(false);
    const [isUploading, setIsUploading] = useState(false);
    const [issues, setIssues] = useState([]);
    const [showCameraForIssue, setShowCameraForIssue] = useState(null);
    const [overview, setOverview] = useState({});
    const [issuesLoading, setIssuesLoading] = useState(true);
    const [overviewLoading, setOverviewLoading] = useState(true);
    const [expandedDescriptions, setExpandedDescriptions] = useState({});
    const [currentPage, setCurrentPage] = useState(1);
    const [user, setUser] = useState(null);
    const [searchTerm, setSearchTerm] = useState("");
    const [sliderRef] = useKeenSlider({ loop: true, slides: { perView: 1 } });

    const [statusFilter, setStatusFilter] = useState("all");
    const [typeFilter, setTypeFilter] = useState("all");
    const [sortBy, setSortBy] = useState("recent"); // default: recent

    const router = useRouter();
    const recordsPerPage = 20;

    const fetchIssues = async (userId = null) => {
        setIssuesLoading(true);
        try {
            const url = userId ? `/api/issues?userId=${userId}` : "/api/issues";
            const res = await fetch(url);
            const data = await res.json();

            if (Array.isArray(data)) {
                setIssues(data); // update state
                return data;     // return updated data
            } else {
                console.error("Unexpected response:", data);
                toast.error(data?.error || "Failed to load issues.");
            }
        } catch (error) {
            console.error("Fetch error:", error);
            toast.error("Network error or backend crashed");
        } finally {
            setIssuesLoading(false);
        }
    };


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
    const handleCaptureAfterImage = async ({ imageDataUrl, issueId }) => {
        const issueToUpdate = issueId || showCameraForIssue;
        if (!issueToUpdate) return;

        setIsUploading(true); // Start loading

        try {
            // Upload to Cloudinary
            const uploadRes = await fetch("/api/upload", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ image: imageDataUrl }),
            });

            if (!uploadRes.ok) throw new Error("Upload failed");
            const { url } = await uploadRes.json();

            // Save to database
            const updateRes = await fetch(`/api/issues/${issueToUpdate}/after-image`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    afterImageUrl: url,
                    status: "Resolve",
                }),
            });

            if (!updateRes.ok) throw new Error("Save failed");

            // Update UI
            setIssues(prevIssues =>
                prevIssues.map(issue =>
                    issue.id === issueToUpdate
                        ? { ...issue, afterImageUrl: url, status: "Resolved" }
                        : issue
                )
            );
            toast.success("Image uploaded and issue resolved!");
        } catch (err) {
            console.error("Error:", err);
            toast.error(err.message || "Something went wrong");
        } finally {
            setIsUploading(false);
            setUseCamera(false);
            setShowCameraForIssue(null);
        }
    };

    const handleImageUpload = async (e, issueId) => {
        const file = e.target.files[0];
        if (!file) return;

        try {
            const reader = new FileReader();
            reader.readAsDataURL(file);

            reader.onload = async () => {
                const imageDataUrl = reader.result;
                await handleCaptureAfterImage({ imageDataUrl, issueId });
            };
        } catch (err) {
            console.error("Upload error:", err);
            toast.error("Failed to upload image");
        }
    };

    const fetchOverview = async () => {
        try {
            const res = await fetch("/api/admin/overview");
            if (!res.ok) throw new Error("Failed to fetch overview");
            const json = await res.json();
            setOverview(json);
            console.log(overview);
        } catch (err) {
            console.error("Failed to load overview", err);
        } finally {
            setOverviewLoading(false);
        }
    };

    useEffect(() => {
        fetchOverview();
    }, []);

    const handleToggleUpvote = async (postId) => {
        if (!user) return alert("You must be logged in.");

        const res = await fetch(`/api/issues/${postId}/upvote`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ userId: user.id }),
        });

        if (res.ok) {
            const data = await res.json();
            setIssues((prev) =>
                prev.map((issue) =>
                    issue.id === postId
                        ? { ...issue, upvotes: data.upvotes, hasUpvoted: data.hasUpvoted }
                        : issue
                )
            );
            toast(data.hasUpvoted ? "You voted 👍" : "Vote removed 👎", {
                icon: data.hasUpvoted ? undefined : "❌",
            });
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
    const updateStatus = async (id, status) => {
        const res = await fetch(`/api/issues/${id}/status`, {
            method: "PUT",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ status }),
        });
        if (res.ok) {
            toast.success(`Status updated to ${status}`);
            fetchIssues();
            fetchOverview();

        } else {
            toast.error("Failed to update status");
        }
    };


    const totalPages = Math.ceil(sortedIssues.length / recordsPerPage);
    const paginatedIssues = sortedIssues.slice(
        (currentPage - 1) * recordsPerPage,
        currentPage * recordsPerPage
    );

    return (
        <div className="p-4 sm:px-8">
            <h1 className="text-2xl font-bold mb-4 text-[#a80ba3]">Community Issues ({overview.issuesCount || 0})</h1>

            {/* Quick Stats */}
            <div className="grid grid-cols-3 gap-2 mb-4">
                {overviewLoading ? (
                    <div className="col-span-3 text-center text-gray-500">Loading stats...</div>
                ) : (
                    <>
                        <div className="flex flex-col items-center bg-[#EDCEEC] p-3 rounded-lg shadow text-center">
                            <span className="text-xs text-gray-700">Assigned</span>
                            <span className="text-lg font-semibold text-[#a80ba3]">
                                {overview.statusCounts?.Open || 0}
                            </span>
                        </div>
                        <div className="flex flex-col items-center bg-[#EDCEEC] p-3 rounded-lg shadow text-center">
                            <span className="text-xs text-gray-700">In Progress</span>
                            <span className="text-lg font-semibold text-[#a80ba3]">
                                {overview.statusCounts?.Working || 0}
                            </span>
                        </div>
                        <div className="flex flex-col items-center bg-[#EDCEEC] p-3 rounded-lg shadow text-center">
                            <span className="text-xs text-gray-700">Resolved</span>
                            <span className="text-lg font-semibold text-[#a80ba3]">
                                {overview.statusCounts?.Resolved || 0}
                            </span>
                        </div>
                    </>
                )}
            </div>

            {/* Filters */}
            <div className="flex flex-wrap items-center gap-2 mb-4">
                <select
                    value={statusFilter}
                    onChange={(e) => setStatusFilter(e.target.value)}
                    className="w-[48%] sm:w-auto border border-[#a80ba3] rounded px-2 py-1 text-sm"
                >
                    <option value="all">Status: All</option>
                    <option value="Open">Open</option>
                    <option value="Working">Working</option>
                    <option value="Resolve">Resolved</option>
                </select>

                <select
                    value={typeFilter}
                    onChange={(e) => setTypeFilter(e.target.value)}
                    className="w-[48%] sm:w-auto border border-[#a80ba3] rounded px-2 py-1 text-sm"
                >
                    <option value="all">Type: All</option>
                    {Object.keys(issueOptions).map((category) => (
                        <option key={category} value={category.toLowerCase()}>{category}</option>
                    ))}
                </select>

                <select
                    value={sortBy}
                    onChange={(e) => setSortBy(e.target.value)}
                    className="w-full sm:w-auto border border-[#a80ba3] rounded px-2 py-1 text-sm"
                >
                    <option value="priority">Sort: Priority</option>
                    <option value="recent">Sort: Latest</option>
                </select>
            </div>


            {/* Search and New Issue */}
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 mb-4">
                <input
                    type="text"
                    placeholder="Search..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="bg-white border border-[#a80ba3] rounded px-3 py-2 w-full sm:w-72"
                />
            </div>
            {/* Table */}
            <div className="border border-transparent rounded-lg shadow-lg max-w-6xl mx-auto">
                <div className="w-full overflow-x-auto">
                    <Table className="min-w-[650px]">
                        <TableHeader className='bg-[#EDCEEC]'>
                            <TableRow>
                                <TableHead className="text-center">#</TableHead>
                                <TableHead>Title</TableHead>
                                <TableHead>Description</TableHead>
                                <TableHead>Address</TableHead>
                                <TableHead>Status</TableHead>
                                <TableHead>Upvotes</TableHead>
                                <TableHead>Map & Images</TableHead>
                                <TableHead className="min-w-[120px] p-2 text-center">Actions</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {issuesLoading ? (
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
                                    <TableRow key={issue.id} className="odd:bg-[#f8e8f8] even:bg-[#EDCEEC] hover:bg-[#e3d4e3] transition-colors">
                                        <TableCell className="text-center">{(currentPage - 1) * recordsPerPage + index + 1}</TableCell>
                                        <TableCell>{issue.title}</TableCell>
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
                                                    <span className="line-clamp-2">{issue.description}</span>{" "}
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
                                        <TableCell>{[issue.address, issue.taluka, issue.district, issue.state].filter(Boolean).join(", ")}</TableCell>
                                        <TableCell>{issue.status ?? "N/A"}</TableCell>
                                        <TableCell>{issue.upvotes ?? 0}</TableCell>
                                        <TableCell className="flex gap-2">
                                            {issue.location && parseCoordinates(issue.location) && (
                                                <a
                                                    href={`https://www.google.com/maps/dir/?api=1&destination=${parseCoordinates(issue.location).lat},${parseCoordinates(issue.location).lng}`}
                                                    target="_blank"
                                                    rel="noopener noreferrer"
                                                    title="View in Google Maps"
                                                    className="inline-flex items-center justify-center w-8 h-8"
                                                >
                                                    <FaMapMarkerAlt className="text-[#a80ba3] text-lg" />
                                                </a>
                                            )}
                                            {Array.isArray(issue.imageUrl) && issue.imageUrl.length > 0 && (
                                                <Dialog>
                                                    <DialogTrigger asChild>
                                                        <span className="cursor-pointer w-8 h-8 flex justify-center items-center">
                                                            <FaRegImages className="text-[#a80ba3] text-lg" />
                                                        </span>
                                                    </DialogTrigger>
                                                    <DialogContent className="max-w-3xl w-[95vw] bg-[#EDCEEC] rounded-lg max-h-[90vh] overflow-y-auto p-4 space-y-4">
                                                        <DialogHeader>
                                                            <DialogTitle className="text-xl font-semibold text-[#a80ba3]">
                                                                Issue - {issue.title}
                                                            </DialogTitle>
                                                        </DialogHeader>

                                                        {/* Before Images */}
                                                        <h3 className="font-semibold text-[#a80ba3]">Before</h3>
                                                        <div ref={sliderRef} className="keen-slider rounded-lg overflow-hidden">
                                                            {issue.imageUrl.map((url, idx) => (
                                                                <div
                                                                    key={idx}
                                                                    className="keen-slider__slide relative w-full h-[40vh] flex justify-center items-center"
                                                                >
                                                                    <Image src={url} alt={`before-image-${idx}`} fill className="object-contain rounded" unoptimized />
                                                                </div>
                                                            ))}
                                                        </div>

                                                        {/* After Image */}
                                                        <div>
                                                            <h3 className="font-semibold text-[#a80ba3] mt-4">After</h3>

                                                            {issue.afterImageUrl && Array.isArray(issue.afterImageUrl) && issue.afterImageUrl.length > 0 ? (
                                                                issue.afterImageUrl.map((url, idx) => (
                                                                    <div key={idx} className="w-full h-[40vh] relative mt-2">
                                                                        <Image
                                                                            src={url}
                                                                            alt={`after-image-${idx}`}
                                                                            fill
                                                                            className="object-contain rounded"
                                                                            unoptimized
                                                                        />
                                                                    </div>
                                                                ))
                                                            ) : (
                                                                <>
                                                                    {user && (
                                                                        <div className="flex flex-col sm:flex-row gap-2">
                                                                            <Button
                                                                                onClick={() => setUseCamera(true)}
                                                                                className="bg-[#a80ba3] text-white"
                                                                            >
                                                                                Capture Photo
                                                                            </Button>
                                                                            <p className="font-semibold text-center my-2">OR</p>
                                                                            <Button
                                                                                onClick={() => document.getElementById(`upload-${issue.id}`).click()}
                                                                                variant="outline"
                                                                                className="border-[#a80ba3] text-[#a80ba3]"
                                                                            >
                                                                                Upload Image
                                                                            </Button>
                                                                            <input
                                                                                id={`upload-${issue.id}`}
                                                                                type="file"
                                                                                accept="image/*"
                                                                                className="hidden"
                                                                                onChange={(e) => handleImageUpload(e, issue.id)}
                                                                            />
                                                                        </div>
                                                                    )}
                                                                </>
                                                            )}

                                                            {useCamera && (
                                                                <div className="max-w-xs mx-auto">
                                                                    <CameraCaptureWithLocation
                                                                        onCapture={({ imageDataUrl }) => {
                                                                            handleCaptureAfterImage({
                                                                                imageDataUrl,
                                                                                issueId: issue.id,
                                                                            });
                                                                            setUseCamera(false);
                                                                        }}
                                                                        onCancel={() => !isUploading && setUseCamera(false)}
                                                                        disabled={isUploading}
                                                                    />
                                                                </div>
                                                            )}

                                                            {isUploading && (
                                                                <div className="fixed inset-0 z-50 flex items-center justify-center">
                                                                    <div className="bg-white border border-gray-300 shadow-md rounded-lg px-4 py-3 flex items-center gap-3">
                                                                        <span className="animate-spin text-[#a80ba3]">⏳</span>
                                                                        <span className="text-sm font-medium text-gray-800">Processing your image...</span>
                                                                    </div>
                                                                </div>
                                                            )}
                                                        </div>


                                                        {/* Upvote */}
                                                        <span
                                                            onClick={() => handleToggleUpvote(issue.id)}
                                                            className="cursor-pointer flex items-center gap-2 text-2xl"
                                                        >
                                                            {issue.hasUpvoted ? (
                                                                <FaThumbsUp className="text-[#a80ba3]" />
                                                            ) : (
                                                                <FaRegThumbsUp className="text-gray-500 hover:text-[#a80ba3]" />
                                                            )}
                                                            <span className="text-base font-semibold text-[#a80ba3]">
                                                                {issue.upvotes ?? 0}
                                                            </span>
                                                        </span>

                                                        {/* Comments */}
                                                        <div className="border-t pt-2">
                                                            <CommentsSection issueId={issue.id} userId={user?.id} />
                                                        </div>
                                                    </DialogContent>

                                                </Dialog>
                                            )}
                                        </TableCell>
                                        <TableCell className="text-center p-2">
                                            <DropdownMenu>
                                                <DropdownMenuTrigger asChild>
                                                    <button
                                                        className="inline-flex items-center justify-center w-8 h-8 rounded-full hover:bg-gray-200"
                                                        title="Actions"
                                                    >
                                                        <MoreVertical className="text-[#a80ba3]" />
                                                    </button>
                                                </DropdownMenuTrigger>
                                                <DropdownMenuContent align="end" className="w-40 bg-white">
                                                    {["Open", "Working", "Resolve"].map((status) => (
                                                        <DropdownMenuItem
                                                            key={status}
                                                            onClick={() => updateStatus(issue.id, status)}
                                                        >
                                                            Mark {status}
                                                        </DropdownMenuItem>
                                                    ))}
                                                </DropdownMenuContent>
                                            </DropdownMenu>
                                        </TableCell>
                                    </TableRow>
                                ))
                            )}
                        </TableBody>
                    </Table>
                </div>

                {/* Pagination */}
                {totalPages > 1 && (
                    <div className="flex justify-between items-center p-2 bg-gray-100 mt-4">
                        <button
                            onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                            disabled={currentPage === 1}
                            className="px-4 py-2 bg-blue-500 text-white rounded disabled:bg-gray-300"
                        >
                            Previous
                        </button>
                        <span className="text-gray-700">
                            Page {currentPage} of {totalPages}
                        </span>
                        <button
                            onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                            disabled={currentPage === totalPages}
                            className="px-4 py-2 bg-blue-500 text-white rounded disabled:bg-gray-300"
                        >
                            Next
                        </button>
                    </div>
                )}
            </div>
            {/* Pagination */}
            {totalPages > 1 && (
                <div className="flex justify-between items-center p-2 bg-gray-100 mt-4">
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
    );
}
