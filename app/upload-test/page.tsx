"use client";

import { useState } from "react";

export default function UploadTestPage() {
  const [file, setFile] = useState<File | null>(null);
  const [message, setMessage] = useState("");
  const [imageUrl, setImageUrl] = useState("");
  const [uploading, setUploading] = useState(false);

  const handleUpload = async () => {
    if (!file) {
      setMessage("Please select an image first.");
      return;
    }

    setUploading(true);
    setMessage("");
    setImageUrl("");

    try {
      const formData = new FormData();
      formData.append("file", file);

      const response = await fetch("/api/upload/image", {
        method: "POST",
        body: formData,
      });

      const data = await response.json();

      if (!response.ok) {
        setMessage(data.message || "Upload failed.");
        setUploading(false);
        return;
      }

      setMessage(data.message);
      setImageUrl(data.imageUrl);
    } catch (error) {
      console.error("Upload error:", error);
      setMessage("Something went wrong during upload.");
    } finally {
      setUploading(false);
    }
  };

  return (
    <main style={{ padding: "40px", maxWidth: "700px", margin: "0 auto" }}>
      <h1>Cloudinary Upload Test</h1>

      <p style={{ marginTop: "10px", marginBottom: "20px" }}>
        Select a product image and upload it to Cloudinary.
      </p>

      <input
        type="file"
        accept="image/*"
        onChange={(event) => {
          setFile(event.target.files?.[0] ?? null);
          setMessage("");
          setImageUrl("");
        }}
      />

      <button
        type="button"
        onClick={handleUpload}
        disabled={uploading || !file}
        style={{
          display: "block",
          marginTop: "20px",
          padding: "12px 20px",
          cursor: uploading || !file ? "not-allowed" : "pointer",
        }}
      >
        {uploading ? "Uploading..." : "Upload Image"}
      </button>

      {message && (
        <p style={{ marginTop: "20px" }}>
          {message}
        </p>
      )}

      {imageUrl && (
        <div style={{ marginTop: "20px" }}>
          <p>Cloudinary URL:</p>

          <a
            href={imageUrl}
            target="_blank"
            rel="noopener noreferrer"
          >
            {imageUrl}
          </a>

          <div style={{ marginTop: "20px" }}>
            <img
              src={imageUrl}
              alt="Uploaded product"
              style={{
                width: "300px",
                height: "300px",
                objectFit: "cover",
              }}
            />
          </div>
        </div>
      )}
    </main>
  );
}