"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";

export default function ReportIssuePage() {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [location, setLocation] = useState("");
  const [file, setFile] = useState(null);
  const [coordinates, setCoordinates] = useState(null);
  const router = useRouter();

  const handleGetLocation = () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setCoordinates({
            lat: position.coords.latitude,
            lng: position.coords.longitude,
          });
          alert("Location detected!");
        },
        () => {
          alert("Failed to get location.");
        }
      );
    } else {
      alert("Geolocation is not supported by your browser.");
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    let imageUrl = "";

    if (file) {
      const formData = new FormData();
      formData.append("file", file);

      const res = await fetch("/api/upload", {
        method: "POST",
        body: formData,
      });

      const data = await res.json();
      imageUrl = data.url;
    }

    await fetch("/api/issues", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        title,
        description,
        location,
        imageUrl,
        coordinates, // 👈 Include coordinates here
      }),
    });

    alert("Issue reported successfully!");
    router.push("/");
  };

  return (
    <div className="max-w-lg mx-auto p-4 mt-10 bg-white rounded shadow">
      <h2 className="text-2xl font-bold mb-4">Report an Issue</h2>
      <form onSubmit={handleSubmit} className="space-y-4">
        <input
          className="w-full border p-2 rounded"
          type="text"
          placeholder="Issue Title"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          required
        />
        <textarea
          className="w-full border p-2 rounded"
          placeholder="Describe the issue..."
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          required
        />
        <input
          className="w-full border p-2 rounded"
          type="text"
          placeholder="Location (Street Name or Description)"
          value={location}
          onChange={(e) => setLocation(e.target.value)}
        />
        <button
          type="button"
          className="w-full bg-yellow-500 text-white py-2 rounded"
          onClick={handleGetLocation}
        >
          Auto Detect Location
        </button>
        <input
          className="w-full border p-2 rounded"
          type="file"
          accept="image/*"
          onChange={(e) => setFile(e.target.files[0])}
        />
        <button className="w-full bg-blue-600 text-white py-2 rounded">
          Submit Issue
        </button>
      </form>
    </div>
  );
}
