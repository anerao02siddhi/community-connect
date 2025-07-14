"use client";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";
import { FaMapMarkerAlt, FaRegImages } from "react-icons/fa";
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog";
import Image from "next/image";
import { useKeenSlider } from "keen-slider/react";
import toast from "react-hot-toast";
import {
    DropdownMenu,
    DropdownMenuTrigger,
    DropdownMenuContent,
    DropdownMenuItem,
} from "@/components/ui/dropdown-menu";
import { MoreVertical } from "lucide-react";
import {
    Select,
    SelectTrigger,
    SelectValue,
    SelectContent,
    SelectItem,
} from "@/components/ui/select";

function parseCoordinates(locationString) {
    const [lat, lng] = locationString?.split(",").map((v) => parseFloat(v.trim()));
    return !isNaN(lat) && !isNaN(lng) ? { lat, lng } : null;
}

export default function AllIssues() {
    const router = useRouter();
    const [authorized, setAuthorized] = useState(false);
    const [issues, setIssues] = useState([]);
    const [loading, setLoading] = useState(true);
    const [currentPage, setCurrentPage] = useState(1);
    const [searchTerm, setSearchTerm] = useState("");
    const [statusFilterIssue, setStatusFilterIssue] = useState("all");
    const [expandedDescriptions, setExpandedDescriptions] = useState({});
    const [sliderRef] = useKeenSlider({ loop: true, slides: { perView: 1 } });

    const recordsPerPage = 20;

    useEffect(() => {
        const storedUser = localStorage.getItem("user");
        if (!storedUser) {
            router.push("/login-register");
            return;
        }
        const user = JSON.parse(storedUser);
        if (user.role !== "admin") {
            alert("You are not authorized to access the Admin Dashboard.");
            router.push("/");
            return;
        }
        setAuthorized(true);
        fetchIssues();
    }, [router]);

    const fetchIssues = async () => {
        setLoading(true);
        const res = await fetch("/api/issues");
        const data = await res.json();
        setIssues(data);
        setLoading(false);
    };

    const updateStatus = async (id, status) => {
        const res = await fetch(`/api/issues/${id}/status`, {
            method: "PUT",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ status }),
        });
        if (res.ok) {
            toast.success(`Status updated to ${status}`);
            fetchIssues();
        } else {
            toast.error("Failed to update status");
        }
    };

    if (!authorized) return null;

    const filteredIssues = issues.filter((issue) => {
        const textMatch =
            issue.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
            issue.description.toLowerCase().includes(searchTerm.toLowerCase());

        const statusMatch =
            statusFilterIssue === "all" || issue.status === statusFilterIssue;

        return textMatch && statusMatch;
    });

    const totalPages = Math.ceil(filteredIssues.length / recordsPerPage);

    const paginatedIssues = filteredIssues.slice(
        (currentPage - 1) * recordsPerPage,
        currentPage * recordsPerPage
    );

    return (
        <div className="p-4 sm:px-8">
            <h1 className="text-2xl font-bold mb-2 text-[#a80ba3]">All Issues</h1>

            {/* Search & Filter */}
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 px-2 py-2 mb-2">
                <input
                    type="text"
                    placeholder="Search by title or description..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="bg-white border border-[#a80ba3] rounded px-3 py-2 w-full sm:w-72 focus:outline-none focus:ring focus:border-[#a80ba3]"
                />

                <Select value={statusFilterIssue} onValueChange={setStatusFilterIssue}>
                    <SelectTrigger className="w-[150px] border border-[#a80ba3]">
                        <SelectValue placeholder="Status" />
                    </SelectTrigger>
                    <SelectContent className="bg-white">
                        <SelectItem value="all">All</SelectItem>
                        <SelectItem value="Open">Open</SelectItem>
                        <SelectItem value="Working">Working</SelectItem>
                        <SelectItem value="Resolve">Resolved</SelectItem>
                    </SelectContent>
                </Select>
            </div>

            {/* Table */}
            <div className="border border-transparent rounded-lg shadow-lg max-w-6xl mx-auto">
                <div className="w-full overflow-x-auto">
                    <Table className="min-w-[900px]">
                        <TableHeader>
                            <TableRow className="bg-[#EDCEEC]">
                                <TableHead className="min-w-[40px] p-2 text-center">#</TableHead>
                                <TableHead className="min-w-[150px] p-2 text-left">Title</TableHead>
                                <TableHead className="min-w-[200px] p-2 text-left">Description</TableHead>
                                <TableHead className="min-w-[180px] p-2 text-left">Address</TableHead>
                                <TableHead className="min-w-[80px] p-2 text-center">Votes</TableHead>
                                <TableHead className="min-w-[100px] p-2 text-center">Status</TableHead>
                                <TableHead className="min-w-[120px] p-2 text-center">Map & Images</TableHead>
                                <TableHead className="min-w-[120px] p-2 text-center">Actions</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {loading ? (
                                <TableRow>
                                    <TableCell colSpan={8} className="text-center text-gray-500 p-4">
                                        Loading issues...
                                    </TableCell>
                                </TableRow>
                            ) : paginatedIssues.length === 0 ? (
                                <TableRow>
                                    <TableCell colSpan={8} className="text-center text-gray-500 p-4">
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
                                        <TableCell className="p-2 whitespace-pre-wrap break-words">
                                            {[issue.address, issue.taluka, issue.district, issue.state]
                                                .filter(Boolean)
                                                .join(", ")}
                                        </TableCell>
                                        <TableCell className="text-center font-medium p-2">
                                            {issue.upvotes ?? 0}
                                        </TableCell>
                                        <TableCell className="text-center p-2">
                                            <span className="font-medium">{issue.status}</span>
                                        </TableCell>
                                        <TableCell className="p-2">
                                            <div className="flex items-center justify-center gap-3">
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
                                                {issue.imageUrl?.length > 0 && (
                                                    <Dialog>
                                                        <DialogTrigger asChild>
                                                            <button
                                                                className="inline-flex items-center justify-center w-8 h-8 rounded-full hover:bg-gray-200"
                                                                title="View Images"
                                                            >
                                                                <FaRegImages className="text-[#a80ba3] text-lg" />
                                                            </button>
                                                        </DialogTrigger>
                                                        <DialogContent className="max-w-3xl w-[95vw] bg-[#EDCEEC] rounded-lg shadow-md max-h-[90vh] overflow-y-auto p-4 space-y-4">
                                                            <DialogHeader>
                                                                <DialogTitle className="text-xl font-semibold text-[#a80ba3]">
                                                                    {issue.title}
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

                                                        </DialogContent>
                                                    </Dialog>
                                                )}
                                            </div>
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
                    <div className="flex flex-col sm:flex-row justify-between items-center p-2 bg-gray-100 gap-2">
                        <button
                            onClick={() => setCurrentPage((p) => Math.max(p - 1, 1))}
                            disabled={currentPage === 1}
                            className="w-full sm:w-auto px-4 py-2 bg-blue-500 text-white rounded disabled:bg-gray-300"
                        >
                            Previous
                        </button>
                        <span className="text-gray-700 text-center">
                            Page {currentPage} of {totalPages}
                        </span>
                        <button
                            onClick={() => setCurrentPage((p) => Math.min(p + 1, totalPages))}
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
