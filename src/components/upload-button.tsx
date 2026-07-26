"use client";

import { UploadButton } from "@/utils/uploadthing";
import { useRouter } from "next/navigation";

interface UploadButtonProps {
  type: "image" | "model" | "document";
  onUploadComplete?: (urls: string[]) => void;
  className?: string;
}

export function UploadButtonClient({ 
  type, 
  onUploadComplete,
  className = "" 
}: UploadButtonProps) {
  const router = useRouter();

  const getEndpoint = () => {
    switch (type) {
      case "image":
        return "imageUploader";
      case "model":
        return "modelUploader";
      case "document":
        return "documentUploader";
    }
  };

  return (
    <UploadButton
      endpoint={getEndpoint()}
      onClientUploadComplete={(res) => {
        if (res) {
          const urls = res.map((r) => r.url);
          onUploadComplete?.(urls);
          router.refresh();
        }
      }}
      onUploadError={(error: Error) => {
        console.error("Upload error:", error);
        alert(`Upload failed: ${error.message}`);
      }}
      className={className}
    />
  );
}
