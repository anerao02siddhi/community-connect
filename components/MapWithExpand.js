"use client";

import { useState } from "react";
import dynamic from "next/dynamic";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { Maximize2, X } from "lucide-react";

// Dynamically import the Map with no SSR
const Map = dynamic(() => import("@/components/Map"), { ssr: false });

export default function MapWithExpand({ coordinates }) {
  const [expanded, setExpanded] = useState(false);

  if (!coordinates) {
    return <p className="text-sm text-gray-500">Invalid location format.</p>;
  }

  return (
    <>
      {/* Embedded map */}
      <div className="h-64 mt-4 rounded overflow-hidden border relative">
        <Map coordinates={coordinates} />
        <button
          onClick={() => setExpanded(true)}
          className="absolute top-2 right-2 z-20 bg-[#a80ba3] text-white p-2 rounded hover:bg-[#922a8f]"
          title="Expand Map"
        >
          <Maximize2 className="w-4 h-4" />
        </button>
      </div>

      {/* Fullscreen modal */}
      <Dialog open={expanded} onOpenChange={setExpanded}>
        <DialogContent className="max-w-6xl w-[95vw] h-[85vh] p-0 overflow-hidden">
          <div className="relative w-full h-full">
            <Map coordinates={coordinates} />
            <button
              onClick={() => setExpanded(false)}
              className="absolute top-3 right-3 bg-[#a80ba3] text-white p-2 rounded hover:bg-[#922a8f]"
              title="Close"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}
