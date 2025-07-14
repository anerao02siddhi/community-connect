// File: components/CameraCaptureWithLocation.js
"use client";

import { useEffect, useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import toast from "react-hot-toast";

let watchId;

export default function CameraCaptureWithLocation({ onCapture, onCancel }) {
  const [location, setLocation] = useState("");
  const [coordinates, setCoordinates] = useState(null);

  const videoRef = useRef(null);
  const canvasRef = useRef(null);

  useEffect(() => {
    const startCamera = async () => {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({
          video: { facingMode: { exact: "environment" } },
        });
        videoRef.current.srcObject = stream;
      } catch (err) {
        try {
          const stream = await navigator.mediaDevices.getUserMedia({
            video: { facingMode: "user" },
          });
          videoRef.current.srcObject = stream;
        } catch (err2) {
          toast.error("Unable to access camera");
          onCancel?.();
        }
      }
    };

    const watchPosition = () => {
      watchId = navigator.geolocation.watchPosition(
        (pos) => {
          const coords = `${pos.coords.latitude.toFixed(6)}, ${pos.coords.longitude.toFixed(6)}`;
          setLocation(coords);
          setCoordinates({ lat: pos.coords.latitude, lng: pos.coords.longitude });
        },
        (err) => {
          toast.error("Failed to get location");
        },
        { enableHighAccuracy: true, maximumAge: 0, timeout: 20000 }
      );
    };

    startCamera();
    watchPosition();

    return () => stopCamera();
  }, []);

  const stopCamera = () => {
    const stream = videoRef.current?.srcObject;
    if (stream) stream.getTracks().forEach((t) => t.stop());
    if (watchId) navigator.geolocation.clearWatch(watchId);
    watchId = null;
  };

  const handleCapture = () => {
    const canvas = canvasRef.current;
    const video = videoRef.current;
    const ctx = canvas.getContext("2d");
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    ctx.drawImage(video, 0, 0);
    const imageDataUrl = canvas.toDataURL("image/png");

    stopCamera();
    onCapture?.({ imageDataUrl, location, coordinates });
  };

  return (
    <div className="w-full">
      <video ref={videoRef} autoPlay className="w-full rounded" />
      <canvas ref={canvasRef} className="hidden" />

      <p className="text-sm mt-2">Location: {location || "Detecting..."}</p>

      <div className="flex gap-2 mt-2">
        <Button onClick={handleCapture} className="flex-1 bg-green-600 text-white">
          Click Photo
        </Button>
        <Button
          onClick={() => {
            stopCamera();
            onCancel?.();
          }}
          className="flex-1 bg-red-600 text-white"
        >
          Cancel
        </Button>
      </div>
    </div>
  );
}
