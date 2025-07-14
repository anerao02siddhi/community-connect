"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { State, City } from "country-state-city";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import Image from "next/image";
import toast from "react-hot-toast";
import { issueOptions } from "@/lib/issueData";
import CameraCaptureWithLocation from "@/components/CameraCaptureWithLocation";

export default function NewIssuePage() {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [location, setLocation] = useState("");
  const [coordinates, setCoordinates] = useState(null);
  const [address, setAddress] = useState("");
  const [image, setImage] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [user, setUser] = useState(null);
  const [useCamera, setUseCamera] = useState(false);
  const [allStates, setAllStates] = useState([]);
  const [allDistricts, setAllDistricts] = useState([]);
  const [selectedState, setSelectedState] = useState("");
  const [selectedDistrict, setSelectedDistrict] = useState("");
  const [taluka, setTaluka] = useState("");
  const [pincode, setPincode] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("");
  const [selectedIssue, setSelectedIssue] = useState("");

  const router = useRouter();

  useEffect(() => {
    const storedUser = localStorage.getItem("user");
    if (!storedUser) router.push("/login-register");
    else setUser(JSON.parse(storedUser));
    setAllStates(State.getStatesOfCountry("IN"));
  }, [router]);

  const handleStateChange = (stateCode) => {
    setSelectedState(stateCode);
    setSelectedDistrict("");
    setTaluka("");
    setAllDistricts(City.getCitiesOfState("IN", stateCode));
  };

  const handleImageChange = (e) => {
    const file = e.target.files?.[0];
    if (file) {
      setImage(file);
      setImagePreview(URL.createObjectURL(file));
    }
  };

  const handleImageUpload = async (file) => {
    const formData = new FormData();
    formData.append("file", file);
    formData.append("upload_preset", process.env.NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET);

    const res = await fetch(
      `https://api.cloudinary.com/v1_1/${process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME}/image/upload`,
      { method: "POST", body: formData }
    );
    if (!res.ok) throw new Error("Cloudinary upload failed");
    const data = await res.json();
    return data.secure_url;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!user) return toast.error("You must be logged in.");
    if (!selectedState || !selectedDistrict || !taluka || !address || !pincode) {
      return toast.error("Please fill all required fields.");
    }

    setUploading(true);
    try {
      let imageUrl = "";
      if (image) {
        if (typeof image === "string") {
          const blob = await (await fetch(image)).blob();
          imageUrl = await handleImageUpload(blob);
        } else {
          imageUrl = await handleImageUpload(image);
        }
      }

      const locString = coordinates
        ? `${coordinates.lat.toFixed(6)}, ${coordinates.lng.toFixed(6)}`
        : location;

      const res = await fetch("/api/issues", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title,
          description,
          location: locString,
          state: selectedState,
          district: selectedDistrict,
          taluka,
          address,
          pincode,
          email: user.email,
          imageUrl,
          category: selectedCategory,
          issueType: selectedIssue,
        }),
      });

      const data = await res.json();
      if (!res.ok) return toast.error(data.error || "Submission failed.");
      toast.success("Issue submitted successfully!");
      router.push("/my-issues");
    } catch (err) {
      console.error(err);
      toast.error("Something went wrong.");
    } finally {
      setUploading(false);
    }
  };

  const removeImage = () => {
    setImage(null);
    setImagePreview(null);
  };

  return (
    <div className="max-w-md bg-[#fef2fd] mx-auto p-4 mt-6 rounded shadow space-y-4 overflow-hidden">
      <h2 className="text-2xl font-bold">Report New Issue</h2>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="space-y-2">
          <Label>Issue Title</Label>
          <Input value={title} onChange={(e) => setTitle(e.target.value)} required />
        </div>

        <div className="space-y-2">
          <Label>Description</Label>
          <Textarea value={description} onChange={(e) => setDescription(e.target.value)} required />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label>Category</Label>
            <select
              className="w-full border p-2 rounded"
              value={selectedCategory}
              onChange={(e) => {
                setSelectedCategory(e.target.value);
                setSelectedIssue("");
              }}
              required
            >
              <option value="">Select Category</option>
              {Object.keys(issueOptions).map((category) => (
                <option key={category} value={category}>
                  {category}
                </option>
              ))}
            </select>
          </div>

          {selectedCategory && (
            <div className="space-y-2">
              <Label>Issue Type</Label>
              <select
                className="w-full border p-2 rounded"
                value={selectedIssue}
                onChange={(e) => setSelectedIssue(e.target.value)}
                required
              >
                <option value="">Select Issue</option>
                {issueOptions[selectedCategory].map((issue) => (
                  <option key={issue} value={issue}>
                    {issue}
                  </option>
                ))}
              </select>
            </div>
          )}
        </div>

        <div className="space-y-2">
          <Label>Address</Label>
          <Input value={address} onChange={(e) => setAddress(e.target.value)} required />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label>State</Label>
            <select
              className="w-full border p-2 rounded"
              value={selectedState}
              onChange={(e) => handleStateChange(e.target.value)}
              required
            >
              <option value="">Select State</option>
              {allStates.map((state) => (
                <option key={state.isoCode} value={state.isoCode}>
                  {state.name}
                </option>
              ))}
            </select>
          </div>

          <div className="space-y-2">
            <Label>District</Label>
            <select
              className="w-full border p-2 rounded"
              value={selectedDistrict}
              onChange={(e) => setSelectedDistrict(e.target.value)}
              required
              disabled={!selectedState}
            >
              <option value="">Select District</option>
              {allDistricts.map((city) => (
                <option key={city.name} value={city.name}>
                  {city.name}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Input placeholder="Taluka" value={taluka} onChange={(e) => setTaluka(e.target.value)} required />
          <Input placeholder="Pincode" value={pincode} onChange={(e) => setPincode(e.target.value)} required />
        </div>

        {!imagePreview && !useCamera && (
          <div className="flex flex-col sm:flex-row gap-2">
            <Button onClick={() => setUseCamera(true)} className="flex-1 bg-[#a80ba3] text-white">Capture Photo</Button>
            <p className="font-semibold">OR</p>
            <Input type="file" accept="image/*" onChange={handleImageChange} className="flex-1" />
          </div>
        )}

        <Input value={location} readOnly className="bg-gray-100 cursor-not-allowed" placeholder="Location (Auto)" />

        {useCamera && (
          <CameraCaptureWithLocation
            onCapture={({ imageDataUrl, coordinates, location }) => {
              setImage(imageDataUrl);
              setImagePreview(imageDataUrl);
              setCoordinates(coordinates);
              setLocation(location);
              setUseCamera(false);
            }}
            onCancel={() => setUseCamera(false)}
          />
        )}

        {imagePreview && (
          <div className="relative mt-2 w-40 h-40">
            <Image src={imagePreview} alt="Preview" width={160} height={160} className="object-cover rounded border" unoptimized />
            <Button onClick={removeImage} className="absolute top-1 right-1 bg-red-600 text-white px-2 py-1 text-xs rounded-full">✕</Button>
          </div>
        )}

        <Button type="submit" disabled={uploading} className="w-full bg-[#a80ba3] text-white">
          {uploading ? "Uploading..." : "Submit Issue"}
        </Button>
      </form>
    </div>
  );
}
