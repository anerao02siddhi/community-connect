"use client";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

export default function AdminDashboard() {
  const router = useRouter();
  const [authorized, setAuthorized] = useState(false);
  const [issues, setIssues] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const storedUser = localStorage.getItem("user");
    console.log(storedUser);

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
    await fetch(`/api/issues/${id}/status`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status }),
    });
    fetchIssues(); // Refresh after update
  };

  if (!authorized) return null;

  return (
    <div className="p-4">
      <h1 className="text-2xl font-bold mb-4">Admin Dashboard</h1>

      {loading ? (
        <p>Loading issues...</p>
      ) : (
        <div className="space-y-4">
          {issues.map((issue) => (
            <div key={issue.id} className="border p-4 rounded shadow bg-white">
              <h2 className="text-lg font-semibold">{issue.title}</h2>
              <p className="text-sm text-gray-600 mb-1">{issue.location}</p>
              <p className="mb-1">{issue.description}</p>
              <p className="text-xs text-gray-500 mb-2">
                Status: <strong>{issue.status}</strong>
              </p>

              <div className="flex gap-2">
                <button
                  onClick={() => updateStatus(issue.id, "open")}
                  className="px-2 py-1 bg-gray-500 text-white rounded"
                >
                  Open
                </button>
                <button
                  onClick={() => updateStatus(issue.id, "in-progress")}
                  className="px-2 py-1 bg-yellow-500 text-white rounded"
                >
                  In Progress
                </button>
                <button
                  onClick={() => updateStatus(issue.id, "resolved")}
                  className="px-2 py-1 bg-green-600 text-white rounded"
                >
                  Resolved
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
