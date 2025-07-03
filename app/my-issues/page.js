"use client";

import { useEffect, useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { useUser } from "@/context/UserContext";
import { toast } from "react-hot-toast";

export default function MyIssuesPage() {
  const [issues, setIssues] = useState([]);
  const [loading, setLoading] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [searchTerm, setSearchTerm] = useState("");
  const { user } = useUser();
  const router = useRouter();
  const recordsPerPage = 10;

  // ✅ Stable fetchIssues
  const fetchIssues = useCallback(async () => {
    if (!user?.id) return;
    setLoading(true);
    try {
      const res = await fetch(`/api/issues?userId=${user.id}`);
      const data = await res.json();
      if (Array.isArray(data)) {
        setIssues(data);
        toast.success("Issues loaded successfully.");
      } else {
        toast.error(data.error || "Failed to load issues.");
        setIssues([]);
      }
    } catch (err) {
      console.error("Error loading issues:", err);
      toast.error("Error loading issues.");
      setIssues([]);
    } finally {
      setLoading(false);
    }
  }, [user]);

  // ✅ Load issues on mount or when user changes
  useEffect(() => {
    fetchIssues();
  }, [fetchIssues]);

  // ✅ Filtering and pagination
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
      <h1 className="text-2xl font-bold mb-4 text-[#a80ba3]">My Reported Issues</h1>

      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 px-4 py-2 mb-4">
        <input
          type="text"
          placeholder="Search..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="bg-white border border-[#a80ba3] rounded px-3 py-1 w-full sm:w-72 focus:outline-none focus:ring focus:border-[#a80ba3]"
        />
        <Button
          onClick={() => router.push("/new-issue")}
          className="bg-[#a80ba3] hover:bg-[#922a8f] text-white"
        >
          + New Issue
        </Button>
      </div>

      <div className="border border-transparent rounded-lg shadow-lg max-w-6xl mx-auto">
        <div className="bg-[#DC9DDA]">
          <Table className="min-w-full table-fixed">
            <TableHeader>
              <TableRow>
                <TableHead className="w-12 text-center">#</TableHead>
                <TableHead className="w-40 text-center">Title</TableHead>
                <TableHead className="w-64 text-center">Description</TableHead>
                <TableHead className="w-32 text-center">Status</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {loading ? (
                <TableRow>
                  <TableCell colSpan="4" className="text-center text-gray-500 p-4">
                    Loading issues...
                  </TableCell>
                </TableRow>
              ) : paginatedIssues.length === 0 ? (
                <TableRow>
                  <TableCell colSpan="4" className="text-center text-gray-500 p-4">
                    No issues found.
                  </TableCell>
                </TableRow>
              ) : (
                paginatedIssues.map((issue, index) => (
                  <TableRow
                    key={issue.id}
                    className="odd:bg-[#f8e8f8] even:bg-[#EDCEEC] text-sm"
                  >
                    <TableCell className="text-center">
                      {(currentPage - 1) * recordsPerPage + index + 1}
                    </TableCell>
                    <TableCell>{issue.title}</TableCell>
                    <TableCell className="whitespace-pre-wrap break-words">
                      {issue.description}
                    </TableCell>
                    <TableCell className="text-center">
                      {issue.status || "Pending"}
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>

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
