"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import {
    Select,
    SelectTrigger,
    SelectValue,
    SelectContent,
    SelectItem,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import { Badge } from "@/components/ui/badge";
import {
    Table,
    TableHeader,
    TableBody,
    TableRow,
    TableHead,
    TableCell,
} from "@/components/ui/table";
import { Download } from "lucide-react";
import toast from "react-hot-toast";
import * as XLSX from "xlsx";

export default function ManageUsersPage() {
    const [selectedType, setSelectedType] = useState("users");
    const [users, setUsers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState("");
    const [statusFilter, setStatusFilter] = useState("all");
    const [selectedUsers, setSelectedUsers] = useState([]);
    const [currentPage, setCurrentPage] = useState(1);

    const usersPerPage = 5;

    useEffect(() => {
        fetchUsers();
    }, [selectedType]);

    const fetchUsers = async () => {
        setLoading(true);
        try {
            const endpoint =
                selectedType === "users"
                    ? "/api/admin/users?role=user"
                    : "/api/admin/users?role=official";

            const res = await fetch(endpoint);
            const data = await res.json();
            setUsers(data);
        } catch (error) {
            toast.error("Failed to fetch users");
        } finally {
            setLoading(false);
        }
    };

    const filteredUsers = users.filter((user) => {
        const matchSearch =
            user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
            user.email.toLowerCase().includes(searchTerm.toLowerCase());

        const matchStatus =
            statusFilter === "all" ||
            (statusFilter === "pending" && user.isApproved === false) ||
            (statusFilter === "suspended" && user.isSuspended) ||
            (statusFilter === "active" && user.isApproved !== false && !user.isSuspended);

        return matchSearch && matchStatus;
    });

    const indexOfLastUser = currentPage * usersPerPage;
    const indexOfFirstUser = indexOfLastUser - usersPerPage;
    const currentUsers = filteredUsers.slice(indexOfFirstUser, indexOfLastUser);
    const totalPages = Math.ceil(filteredUsers.length / usersPerPage);

    const toggleSelect = (userId) => {
        setSelectedUsers((prev) =>
            prev.includes(userId)
                ? prev.filter((id) => id !== userId)
                : [...prev, userId]
        );
    };

    const handleApiCall = async (endpoint, body, successMessage) => {
        const toastId = toast.loading("Working...");
        try {
            const res = await fetch(endpoint, {
                method: "PATCH",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(body),
            });
            toast.dismiss(toastId);
            if (res.ok) {
                toast.success(successMessage);
                fetchUsers();
            } else {
                toast.error("Action failed");
            }
        } catch (err) {
            toast.dismiss(toastId);
            toast.error("Something went wrong");
        }
    };

    const toggleSuspend = (userId, isSuspended, username) => {
        const endpoint = isSuspended
            ? "/api/admin/users/unsuspend"
            : "/api/admin/users/suspend";
        const msg = isSuspended
            ? `The ${username} account is Unsuspended`
            : `The ${username} account is Suspended`;
        handleApiCall(endpoint, { userId }, msg);
    };

    const handleApprove = (userId) => {
        handleApiCall("/api/admin/users/approve", { userId }, "Approved");
    };

    const handleReject = (userId) => {
        handleApiCall("/api/admin/users/reject", { userId }, "Rejected");
    };

    const bulkAction = async (action) => {
        for (const id of selectedUsers) {
            if (action === "approve") await handleApprove(id);
            if (action === "reject") await handleReject(id);
            if (action === "suspend") await toggleSuspend(id, false, "");
            if (action === "unsuspend") await toggleSuspend(id, true, "");
        }
        setSelectedUsers([]);
    };

    const exportCSV = () => {
        const ws = XLSX.utils.json_to_sheet(filteredUsers);
        const wb = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(wb, ws, "Users");
        XLSX.writeFile(wb, `${selectedType}-export.xlsx`);
    };

    return (
        <div className="max-w-6xl mx-auto p-4">
            {/* Filters */}
            <div className="flex flex-wrap justify-between items-center mb-4 gap-4">
                <h1 className="text-2xl font-bold text-[#a80ba3] capitalize">
                    Manage {selectedType}
                </h1>

                <div className="flex flex-wrap gap-2 items-center">
                    <Input
                        placeholder="Search name or email"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="w-[200px]"
                    />
                    <Select value={selectedType} onValueChange={setSelectedType}>
                        <SelectTrigger className="w-[120px]">
                            <SelectValue placeholder="Select Type" />
                        </SelectTrigger>
                        <SelectContent className='bg-white'>
                            <SelectItem value="users">Users</SelectItem>
                            <SelectItem value="officials">Officials</SelectItem>
                        </SelectContent>
                    </Select>
                    <Select value={statusFilter} onValueChange={setStatusFilter}>
                        <SelectTrigger className="w-[120px]">
                            <SelectValue placeholder="Status" />
                        </SelectTrigger>
                        <SelectContent className='bg-white'>
                            <SelectItem value="all">All</SelectItem>
                            <SelectItem value="pending">Pending</SelectItem>
                            <SelectItem value="active">Active</SelectItem>
                            <SelectItem value="suspended">Suspended</SelectItem>
                        </SelectContent>
                    </Select>

                    <Button onClick={exportCSV} className="bg-[#a80ba3] text-white">
                        <Download className="w-4 h-4 mr-2" /> Export
                    </Button>
                </div>
            </div>

            {/* Stats + Bulk Actions */}
            <div className="mb-4 flex flex-wrap gap-3 text-sm">
                <Badge>Total: {users.length}</Badge>
                <Badge variant="outline">
                    Official Requests:{" "}
                    {
                        users.filter(
                            (u) => u.role === "official" && u.isApproved === false
                        ).length
                    }
                </Badge>

                <Badge variant="destructive">
                    Suspended: {users.filter((u) => u.isSuspended).length}
                </Badge>

                {selectedUsers.length > 1 && (
                    <div className="ml-auto flex flex-wrap gap-2">
                        {selectedType === "officials" && (
                            <>
                                <Button
                                    size="sm"
                                    onClick={() => bulkAction("approve")}
                                    className="bg-green-600 text-white"
                                >
                                    Bulk Approve
                                </Button>
                                <Button
                                    size="sm"
                                    onClick={() => bulkAction("reject")}
                                    className="bg-yellow-500 text-white"
                                >
                                    Bulk Reject
                                </Button>
                            </>
                        )}
                        <Button
                            size="sm"
                            onClick={() => bulkAction("suspend")}
                            className="bg-red-600 text-white"
                        >
                            Bulk Suspend
                        </Button>
                        <Button
                            size="sm"
                            onClick={() => bulkAction("unsuspend")}
                            className="bg-blue-600 text-white"
                        >
                            Bulk Unsuspend
                        </Button>
                    </div>
                )}
            </div>

            <div className="overflow-x-auto">
                <Table>
                    <TableHeader className="bg-[#EDCEEC]">
                        <TableRow className="bg-[#EDCEEC] text-sm">
                            <TableHead>#</TableHead>
                            <TableHead>Select</TableHead>
                            <TableHead>Name</TableHead>
                            <TableHead>Email</TableHead>
                            <TableHead>Contact</TableHead>
                            <TableHead>Status</TableHead>
                            <TableHead>Action</TableHead>
                        </TableRow>
                    </TableHeader>

                    <TableBody>
                        {loading ? (
                            <TableRow className="odd:bg-[#f8e8f8] even:bg-[#EDCEEC] hover:bg-[#e3d4e3] transition-colors">
                                <TableCell colSpan={7} className="text-center py-10">
                                    Loading...
                                </TableCell>
                            </TableRow>
                        ) : currentUsers.length === 0 ? (
                            <TableRow className="odd:bg-[#f8e8f8] even:bg-[#EDCEEC] hover:bg-[#e3d4e3] transition-colors">
                                <TableCell colSpan={7} className="text-center py-10">
                                    No records found.
                                </TableCell>
                            </TableRow>
                        ) : (
                            currentUsers.map((user, idx) => (
                                <TableRow key={user.id} className="odd:bg-[#f8e8f8] even:bg-[#EDCEEC] hover:bg-[#e3d4e3] transition-colors">
                                    <TableCell>{indexOfFirstUser + idx + 1}</TableCell>
                                    <TableCell>
                                        <Checkbox
                                            checked={selectedUsers.includes(user.id)}
                                            onCheckedChange={() => toggleSelect(user.id)}
                                        />
                                    </TableCell>
                                    <TableCell>{user.name}</TableCell>
                                    <TableCell>{user.email}</TableCell>
                                    <TableCell>{user.phone}</TableCell>
                                    <TableCell>
                                        {selectedType === "officials" ? (
                                            user.isApproved === false ? (
                                                <Badge className="bg-red-500 text-white">Rejected</Badge>
                                            ) : user.isSuspended ? (
                                                <Badge className="bg-red-500 text-white">Inactive</Badge>
                                            ) : (
                                                <Badge className="bg-green-600 text-white">Active</Badge>
                                            )
                                        ) : user.isSuspended ? (
                                            <Badge className="bg-red-500 text-white">Inactive</Badge>
                                        ) : (
                                            <Badge className="bg-green-600 text-white">Active</Badge>
                                        )}
                                    </TableCell>
                                    <TableCell className="space-x-2">
                                        {selectedType === "officials" && user.isApproved === false ? (
                                            <>
                                                <Button
                                                    size="sm"
                                                    onClick={() => handleApprove(user.id)}
                                                    className="bg-green-600 text-white"
                                                >
                                                    Approve
                                                </Button>
                                                <Button
                                                    size="sm"
                                                    onClick={() => handleReject(user.id)}
                                                    className="bg-red-600 text-white"
                                                >
                                                    Reject
                                                </Button>
                                            </>
                                        ) : (
                                            <Button
                                                size="sm"
                                                className="bg-[#a80ba3] text-white"
                                                onClick={() => toggleSuspend(user.id, user.isSuspended, user.name)}
                                            >
                                                {user.isSuspended ? "Unsuspend" : "Suspend"}
                                            </Button>
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
                <div className="flex justify-between items-center mt-4">
                    <p className="text-sm">
                        Page {currentPage} of {totalPages}
                    </p>
                    <div className="space-x-2">
                        <Button
                            size="sm"
                            variant="outline"
                            onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                            disabled={currentPage === 1}
                        >
                            Prev
                        </Button>
                        <Button
                            size="sm"
                            variant="outline"
                            onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                            disabled={currentPage === totalPages}
                        >
                            Next
                        </Button>
                    </div>
                </div>
            )}
        </div>
    );
}
