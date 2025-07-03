"use client";

import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { State, City } from "country-state-city";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";

let watchId; // Declare watchId at module scope

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

  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  const router = useRouter();

  useEffect(() => {
    const storedUser = localStorage.getItem("user");
    if (!storedUser) router.push("/login");
    else setUser(JSON.parse(storedUser));

    const states = State.getStatesOfCountry("IN");
    setAllStates(states);
  }, []);

  const handleStateChange = (stateCode) => {
    setSelectedState(stateCode);
    setSelectedDistrict("");
    setTaluka("");
    const districts = City.getCitiesOfState("IN", stateCode);
    setAllDistricts(districts);
  };

  const startCamera = async () => {
    if (!navigator.mediaDevices?.getUserMedia) {
      alert("Camera is not supported.");
      return;
    }
    setUseCamera(true);
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: true });
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
      }
    } catch (err) {
      console.error("Camera error:", err);
      alert("Unable to access camera.");
      setUseCamera(false);
    }
  };

  // ✅ Start camera and live location together
  const startCameraAndLocation = async () => {
    // Start watching position
    watchId = navigator.geolocation.watchPosition(
      (pos) => {
        console.log("Live coords:", pos.coords);
        setCoordinates({ lat: pos.coords.latitude, lng: pos.coords.longitude });
        setLocation(`${pos.coords.latitude.toFixed(6)}, ${pos.coords.longitude.toFixed(6)}`);
      },
      (err) => {
        console.error("Location error:", err);
        alert("Could not get location.");
      },
      { enableHighAccuracy: true, maximumAge: 0, timeout: 20000 }
    );

    // Start camera
    await startCamera();
  };

  const handleCapture = () => {
    const video = videoRef.current;
    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d");
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    ctx.drawImage(video, 0, 0);
    const imageDataUrl = canvas.toDataURL("image/png");
    setImage(imageDataUrl);
    setImagePreview(imageDataUrl);

    const stream = video.srcObject;
    if (stream) {
      stream.getTracks().forEach((track) => track.stop());
      video.srcObject = null;
    }
    setUseCamera(false);

    // Stop watching location
    if (watchId) {
      navigator.geolocation.clearWatch(watchId);
      watchId = null;
    }
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
    if (!user) return alert("You must be logged in.");
    if (!selectedState || !selectedDistrict || !taluka || !address || !pincode) {
      return alert("Please fill in all required fields.");
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

      let locString = location;
      if (coordinates) {
        locString = `${coordinates.lat.toFixed(6)}, ${coordinates.lng.toFixed(6)}`;
      }

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
        }),
      });

      const data = await res.json();
      if (!res.ok) return alert(data.error || "Submission failed.");
      alert("Issue submitted successfully!");
      router.push("/my-issues");
    } catch (err) {
      console.error(err);
      alert("Something went wrong.");
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
        {/* Form fields */}
        <div className="space-y-2">
          <Label>Issue Title</Label>
          <Input
            placeholder="Title"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            required
          />
        </div>

        <div className="space-y-2">
          <Label>Issue Description</Label>
          <Textarea
            placeholder="Describe the issue..."
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            required
          />
        </div>

        <div className="space-y-2">
          <Label>Address</Label>
          <Input
            placeholder="Address"
            value={address}
            onChange={(e) => setAddress(e.target.value)}
            required
          />
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
          <div className="space-y-2">
            <Label>Taluka</Label>
            <Input
              placeholder="Taluka"
              value={taluka}
              onChange={(e) => setTaluka(e.target.value)}
              required
            />
          </div>

          <div className="space-y-2">
            <Label>Pincode</Label>
            <Input
              placeholder="Pincode"
              value={pincode}
              onChange={(e) => setPincode(e.target.value)}
              required
            />
          </div>
        </div>

        {!imagePreview && (
          <div className="flex flex-col sm:flex-row gap-2">
            <Button
              type="button"
              onClick={startCameraAndLocation}
              className="flex-1 bg-[#a80ba3] hover:bg-[#922a8f] text-white"
            >
              Capture Photo
            </Button>
            <p className="font-semibold">OR</p>
            <Input
              type="file"
              accept="image/*"
              onChange={handleImageChange}
              className="flex-1"
            />
          </div>
        )}

        <Input
          placeholder="Location (Auto-filled)"
          value={location}
          readOnly
          className="bg-gray-100 cursor-not-allowed"
        />

        {useCamera && (
          <div>
            <video ref={videoRef} autoPlay className="w-full rounded" />
            <canvas ref={canvasRef} className="hidden" />
            <div className="flex gap-2 mt-2">
              <Button
                type="button"
                onClick={handleCapture}
                className="flex-1 bg-green-600 text-white"
              >
                Click Photo
              </Button>
              <Button
                type="button"
                onClick={() => {
                  const stream = videoRef.current?.srcObject;
                  if (stream) {
                    stream.getTracks().forEach((track) => track.stop());
                  }
                  setUseCamera(false);
                  if (watchId) {
                    navigator.geolocation.clearWatch(watchId);
                    watchId = null;
                  }
                }}
                className="flex-1 bg-red-600 text-white"
              >
                Cancel
              </Button>
            </div>
          </div>
        )}

        {imagePreview && (
          <div className="relative mt-2 w-40 h-40">
            <img
              src={imagePreview}
              alt="Preview"
              className="w-40 h-40 object-cover rounded border"
            />
            <Button
              type="button"
              onClick={removeImage}
              className="absolute top-1 right-1 bg-red-600 text-white px-2 py-1 rounded-full text-xs"
            >
              ✕
            </Button>
          </div>
        )}

        <Button
          type="submit"
          disabled={uploading}
          className="w-full bg-[#a80ba3] hover:bg-[#922a8f] text-white"
        >
          {uploading ? "Uploading..." : "Submit Issue"}
        </Button>
      </form>
    </div>
  );
}
