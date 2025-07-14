"use client";
import { useEffect, useState } from "react";
import { PieChart, Pie, Cell, Tooltip, Legend, ResponsiveContainer } from "recharts";
import dynamic from "next/dynamic";
import { Loader2, X } from "lucide-react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"

const MapComponent = dynamic(() => import("@/components/MapComponent"), { ssr: false });

export default function AdminDashboard() {
  const [overview, setOverview] = useState(null);
  const [overviewLoading, setOverviewLoading] = useState(true);

  const [issues, setIssues] = useState([]);
  const [issuesLoading, setIssuesLoading] = useState(true);

  const [isUserModalOpen, setIsUserModalOpen] = useState(false);
  const [users, setUsers] = useState([]);
  const [filteredUsers, setFilteredUsers] = useState([]);
  const [usersLoading, setUsersLoading] = useState(false);

  const [selectedRole, setSelectedRole] = useState("all");
  const [currentPage, setCurrentPage] = useState(1);
  const usersPerPage = 10;

  const COLORS = ["#a80ba3", "#36A2EB", "#4BC0C0"];

  useEffect(() => {
    const fetchOverview = async () => {
      try {
        const res = await fetch("/api/admin/overview");
        const data = await res.json();
        setOverview(data);
      } catch (err) {
        console.error("Failed to load overview:", err);
      } finally {
        setOverviewLoading(false);
      }
    };

    fetchOverview();
  }, []);

  useEffect(() => {
    const fetchIssues = async () => {
      try {
        const res = await fetch("/api/issues");
        const json = await res.json();
        if (Array.isArray(json)) setIssues(json);
        else console.error("Invalid issues response", json);
      } catch (err) {
        console.error("Failed to load issues", err);
      } finally {
        setIssuesLoading(false);
      }
    };
    fetchIssues();
  }, []);

  const openUserModal = async () => {
    setIsUserModalOpen(true);
    setUsersLoading(true);
    try {
      const res = await fetch(`/api/admin/users?role=${selectedRole}`);
      const json = await res.json();
      setUsers(json);
      setFilteredUsers(json);
    } catch (err) {
      console.error("Failed to load users", err);
    } finally {
      setUsersLoading(false);
    }
  };

  useEffect(() => {
    if (selectedRole === "all") {
      setFilteredUsers(users);
    } else {
      setFilteredUsers(users.filter((user) => user.role === selectedRole));
    }
    setCurrentPage(1);
  }, [selectedRole, users]);

  const totalPages = Math.ceil(filteredUsers.length / usersPerPage);
  const paginatedUsers = filteredUsers.slice((currentPage - 1) * usersPerPage, currentPage * usersPerPage);

  return (
    <div className="p-4 max-w-7xl mx-auto">
      <h1 className="text-3xl font-bold mb-6 text-[#a80ba3]">Admin Dashboard</h1>

      {overviewLoading ? (
        <div className="flex items-center gap-2 mb-6 text-gray-600">
          <Loader2 className="animate-spin" /> Loading overview...
        </div>
      ) : overview ? (
        <div className="grid grid-cols-2 gap-4 mb-8">
          <button
            onClick={openUserModal}
            className="rounded-lg bg-[#a80ba3] text-white p-4 flex flex-col items-center justify-center hover:opacity-90 transition"
          >
            <h2 className="text-sm font-medium">Total Users</h2>
            <p className="text-2xl font-bold">{overview.usersCount}</p>
          </button>
          
          <div className="rounded-lg bg-[#a80ba3] text-white p-4 flex flex-col items-center justify-center">
            <h2 className="text-sm font-medium">Total Issues</h2>
            <p className="text-2xl font-bold">{overview.issuesCount}</p>
          </div>
        </div>
      ) : (
        <p className="text-red-500 mb-6">Failed to load overview.</p>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <div className="rounded-lg border border-gray-200 bg-white p-4 shadow-sm">
          <h2 className="text-lg font-semibold text-gray-700 mb-4">Issues by Status</h2>
          {overviewLoading ? (
            <div className="flex items-center gap-2 text-gray-600">
              <Loader2 className="animate-spin" /> Loading chart...
            </div>
          ) : overview ? (
            Object.values(overview.statusCounts).reduce((a, b) => a + b, 0) > 0 ? (
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie
                    data={[
                      { name: "Open", value: overview.statusCounts.Open },
                      { name: "In Progress", value: overview.statusCounts.Working },
                      { name: "Resolved", value: overview.statusCounts.Resolved },
                    ]}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    outerRadius={100}
                    fill="#8884d8"
                    dataKey="value"
                    label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                  >
                    {["Open", "In Progress", "Resolved"].map((_, i) => (
                      <Cell key={i} fill={COLORS[i % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip />
                  <Legend />
                </PieChart>
              </ResponsiveContainer>
            ) : (
              <p className="text-gray-500">No data to display.</p>
            )
          ) : (
            <p className="text-gray-500">No data to display.</p>
          )}
        </div>

        <div className="rounded-lg border border-gray-200 bg-white p-4 shadow-sm">
          <h2 className="text-lg font-semibold text-gray-700 mb-4">Issue Locations</h2>
          {issuesLoading ? (
            <div className="flex items-center gap-2 text-gray-600">
              <Loader2 className="animate-spin" /> Loading map...
            </div>
          ) : issues?.length > 0 ? (
            <MapComponent issues={issues} />
          ) : (
            <p className="text-gray-500">No issues with location data.</p>
          )}
        </div>
      </div>

      {isUserModalOpen && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center">
          <div className="bg-white rounded-lg max-w-3xl w-full p-4">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-semibold">All Users</h3>
              <button
                onClick={() => setIsUserModalOpen(false)}
                className="text-gray-500 hover:text-gray-700"
              >
                <X size={20} />
              </button>
            </div>
            <div className="flex justify-between items-center mb-3">
              <label htmlFor="roleFilter" className="text-sm font-medium">Filter by Role:</label>
              <select
                id="roleFilter"
                className="border px-2 py-1 rounded"
                value={selectedRole}
                onChange={(e) => setSelectedRole(e.target.value)}
              >
                <option value="all">All</option>
                <option value="user">User</option>
                <option value="official">Officials</option>

              </select>
            </div>
            {usersLoading ? (
              <div className="flex items-center gap-2 text-gray-600">
                <Loader2 className="animate-spin" /> Loading users...
              </div>
            ) : (
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow className="bg-[#EDCEEC] text-sm">
                      <TableHead>Sr No</TableHead>
                      <TableHead>Name</TableHead>
                      <TableHead>Email</TableHead>
                      <TableHead>Contact No</TableHead>
                      <TableHead>Created</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {paginatedUsers.map((user, index) => (
                      <TableRow
                        key={user.id}
                        className="odd:bg-[#f8e8f8] even:bg-[#EDCEEC] hover:bg-[#e3d4e3] transition-colors"
                      >
                        <TableCell>{(currentPage - 1) * usersPerPage + index + 1}</TableCell>
                        <TableCell>{user.name}</TableCell>
                        <TableCell>{user.email}</TableCell>
                        <TableCell>{user.phone}</TableCell>
                        <TableCell>{new Date(user.createdAt).toLocaleDateString()}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>

                {totalPages > 1 && (
                  <div className="flex justify-between items-center mt-4">
                    <button
                      onClick={() => setCurrentPage((p) => Math.max(p - 1, 1))}
                      disabled={currentPage === 1}
                      className="px-4 py-1 bg-[#a80ba3] text-white rounded disabled:bg-gray-300"
                    >
                      Previous
                    </button>
                    <span className="text-sm text-gray-700">
                      Page {currentPage} of {totalPages}
                    </span>
                    <button
                      onClick={() => setCurrentPage((p) => Math.min(p + 1, totalPages))}
                      disabled={currentPage === totalPages}
                      className="px-4 py-1 bg-[#a80ba3] text-white rounded disabled:bg-gray-300"
                    >
                      Next
                    </button>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
