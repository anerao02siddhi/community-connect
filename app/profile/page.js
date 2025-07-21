"use client";

import { useEffect, useState, useRef } from "react";
import { useRouter } from "next/navigation";
import toast from "react-hot-toast";
import { useUser } from "@/context/UserContext";

export default function ProfilePage() {
    const router = useRouter();
    const { setUser: setGlobalUser } = useUser(); // 👈 add this line
    const [user, setUser] = useState(null);
    const [previewImage, setPreviewImage] = useState(null);
    const [uploading, setUploading] = useState(false);
    const fileInputRef = useRef();

    useEffect(() => {
        const storedUser = localStorage.getItem("user");
        if (!storedUser) {
            toast.error("You must be logged in.");
            router.push("/login-register");
            return;
        }
        const parsedUser = JSON.parse(storedUser);
        setUser(parsedUser);
    }, [router]);

    const handleImageChange = async (e) => {
        const file = e.target.files[0];
        if (!file) return;

        setPreviewImage(URL.createObjectURL(file));
        setUploading(true);

        try {
            // Upload image to Cloudinary (you can replace with your own API)
            const formData = new FormData();
            formData.append("file", file);
            formData.append("upload_preset", process.env.NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET);

            const res = await fetch(`https://api.cloudinary.com/v1_1/${process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME}/image/upload`, {
                method: "POST",
                body: formData,
            });

            const data = await res.json();
            if (!data.secure_url) throw new Error("Upload failed");

            // Call backend to update user profileImage in DB (optional)
            await fetch("/api/profile", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ userId: user.id, profileImage: data.secure_url }),
            });

            // Update localStorage and state
            const updatedUser = { ...user, profileImage: data.secure_url };
            setUser(updatedUser);
            setGlobalUser(updatedUser);       // ✅ this updates the Navbar
            localStorage.setItem("user", JSON.stringify(updatedUser));
            toast.success("Profile picture updated!");
        } catch (error) {
            console.error("Image upload error:", error);
            toast.error("Failed to upload image");
        } finally {
            setUploading(false);
        }
    };

    if (!user)
        return <div className="text-center p-4 text-red-600">User not found.</div>;

    return (
        <div className="max-w-xl mx-auto mt-10 bg-white p-6 rounded shadow text-center">
            <h1 className="text-2xl font-bold text-[#a80ba3] mb-6">My Profile</h1>

            {/* Profile Picture */}
            <div className="flex flex-col items-center justify-center space-y-4 mb-6">
                <img
                    src={previewImage || user.profileImage || "/images/avatar.jpeg"}
                    alt="Profile"
                    className="h-32 w-32 rounded-full object-cover border shadow-md"
                />

                <input
                    type="file"
                    accept="image/*"
                    className="hidden"
                    ref={fileInputRef}
                    onChange={handleImageChange}
                />

                <button
                    className="px-4 py-1 bg-[#a80ba3] text-white rounded hover:bg-[#c77bc6] text-sm"
                    onClick={() => fileInputRef.current.click()}
                    disabled={uploading}
                >
                    {uploading ? "Uploading..." : "Change Profile Picture"}
                </button>
            </div>

            {/* Profile Info */}
            <div className="text-left space-y-4">
                <div>
                    <strong>Name:</strong> {user.name}
                </div>
                <div>
                    <strong>Email:</strong> {user.email}
                </div>
                <div>
                    <strong>Phone:</strong> {user.phone || "N/A"}
                </div>
                <div>
                    <strong>Role:</strong> {user.role}
                </div>
                <div>
                    <strong>Status:</strong> {user.isSuspended ? "Suspended" : "Active"}
                </div>
                {user.role === "official" && (
                    <div>
                        <strong>Approval:</strong>{" "}
                        {user.isApproved ? "Approved" : "Not Approved"}
                    </div>
                )}
                <div>
                    <strong>Joined:</strong>{" "}
                    {new Date(user.createdAt).toLocaleDateString()}
                </div>
            </div>
        </div>
    );
}
