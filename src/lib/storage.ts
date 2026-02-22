import axios from "axios";
import { api, unwrap } from "./api";

interface PresignedUploadUrl {
  uploadUrl: string;   // S3 pre-signed PUT URL
  publicUrl: string;   // CDN/S3 public URL after upload
  key: string;         // S3 object key
}

type UploadPurpose = "resource-video" | "resource-pdf" | "thumbnail" | "cms-image";

export const storageApi = {
  /** Get a pre-signed S3 upload URL from the backend */
  getUploadUrl: async (
    fileName: string,
    contentType: string,
    purpose: UploadPurpose
  ): Promise<PresignedUploadUrl> => {
    const res = await api.post("/storage/presigned-upload", {
      fileName,
      contentType,
      purpose,
    });
    return unwrap(res);
  },

  /**
   * Upload a file directly to S3 using the pre-signed URL.
   * Reports progress via onProgress callback (0–100).
   */
  uploadToS3: async (
    uploadUrl: string,
    file: File,
    onProgress?: (pct: number) => void
  ): Promise<void> => {
    await axios.put(uploadUrl, file, {
      headers: { "Content-Type": file.type },
      onUploadProgress: (event) => {
        if (event.total && onProgress) {
          onProgress(Math.round((event.loaded * 100) / event.total));
        }
      },
    });
  },

  /**
   * Full upload pipeline: get pre-signed URL → upload → return public URL.
   */
  upload: async (
    file: File,
    purpose: UploadPurpose,
    onProgress?: (pct: number) => void
  ): Promise<string> => {
    const { uploadUrl, publicUrl } = await storageApi.getUploadUrl(
      file.name,
      file.type,
      purpose
    );
    await storageApi.uploadToS3(uploadUrl, file, onProgress);
    return publicUrl;
  },
};
