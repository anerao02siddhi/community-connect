"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import {
  Dialog,
  DialogTrigger,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import Map from "@/components/Map"; // If you have this
import { parseCoordinates } from "@/lib/utils"; // If you have this utility

export default function MyIssuesPage() {
  const [issues, setIssues] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedIssue, setSelectedIssue] = useState(null);
  const router = useRouter();

  useEffect(() => {
    const user = JSON.parse(localStorage.getItem("user"));
    if (!user) {
      router.push("/login");
      return;
    }
    fetchIssues(user.email);
  }, []);

  const fetchIssues = async (email) => {
    try {
      const res = await fetch(`/api/issues/user?email=${email}`);
      const data = await res.json();
      setIssues(data);
    } catch (error) {
      console.error("Failed to fetch issues:", error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-4">
      <h1 className="text-2xl font-bold mb-4">My Reported Issues</h1>

      {loading ? (
        <p>Loading issues...</p>
      ) : issues.length === 0 ? (
        <p className="text-gray-600">You haven’t raised any issues yet.</p>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {issues.map((issue) => (
            <div
              key={issue.id}
              className="border p-4 rounded-lg shadow bg-white flex flex-col justify-between"
            >
              <div>
                <h2 className="text-lg font-semibold mb-2">{issue.title}</h2>
                <p className="text-sm text-gray-600 mb-1">
                  Location: {issue.location}
                </p>
                <p className="text-sm text-gray-600 mb-2">
                  Upvotes: {issue.upvotes ?? 0}
                </p>
                <p className="text-sm">{issue.description.slice(0, 100)}...</p>
              </div>

              <Dialog>
                <DialogTrigger asChild>
                  <Button
                    variant="outline"
                    className="mt-4 w-full text-white bg-[#a80ba3] hover:bg-[#922a8f]"
                    onClick={() => setSelectedIssue(issue)}
                  >
                    More Details
                  </Button>
                </DialogTrigger>
                {selectedIssue && selectedIssue.id === issue.id && (
                  <DialogContent className="max-w-3xl bg-white rounded-lg shadow-md max-h-[90vh] overflow-y-auto p-4">
                    <DialogHeader>
                      <DialogTitle>{selectedIssue.title}</DialogTitle>
                    </DialogHeader>
                    <p>
                      <strong>Description:</strong> {selectedIssue.description}
                    </p>
                    <p>
                      <strong>Location:</strong> {selectedIssue.location}
                    </p>
                    <p>
                      <strong>Upvotes:</strong> {selectedIssue.upvotes ?? 0}
                    </p>

                    {Array.isArray(selectedIssue.imageUrl) &&
                      selectedIssue.imageUrl.length > 0 && (
                        <div className="grid grid-cols-2 gap-2 my-4">
                          {selectedIssue.imageUrl.map((url, idx) => (
                            <img
                              key={idx}
                              src={url}
                              alt={`image-${idx}`}
                              className="w-full h-40 object-cover rounded"
                            />
                          ))}
                        </div>
                      )}

                    {selectedIssue.location && (() => {
                      const coords = parseCoordinates(selectedIssue.location);
                      if (coords) {
                        return (
                          <>
                            <div className="h-64 mt-4 rounded overflow-hidden border">
                              <Map coordinates={coords} />
                            </div>
                            <div className="mt-4">
                              <a
                                href={`https://www.google.com/maps/dir/?api=1&destination=${coords.lat},${coords.lng}`}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="inline-block bg-[#a80ba3] hover:bg-[#922a8f] text-white px-4 py-2 rounded"
                              >
                                Direct to Location
                              </a>
                            </div>
                          </>
                        );
                      }
                      return (
                        <p className="text-sm text-gray-500">
                          Invalid location format.
                        </p>
                      );
                    })()}
                  </DialogContent>
                )}
              </Dialog>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
