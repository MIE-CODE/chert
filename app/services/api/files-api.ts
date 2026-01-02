/**
 * Files API Service
 * Handles file upload API calls
 */

import { apiClient } from "@/app/lib/api-client";

export interface UploadResponse {
  fileUrl: string;
  fileName: string;
  fileSize: number;
  fileType: "image" | "file";
  mimeType: string;
}

export interface ApiResponse<T> {
  success: boolean;
  message?: string;
  data: T;
}

class FilesAPI {
  private basePath = "/api/files";

  /**
   * Upload a file or image
   */
  async uploadFile(file: File): Promise<UploadResponse> {
    const formData = new FormData();
    formData.append("file", file);

    const response = await apiClient.axiosInstance.post<
      ApiResponse<UploadResponse>
    >(`${this.basePath}/upload`, formData, {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    });

    if (response.data.success && response.data.data) {
      return response.data.data;
    }

    throw new Error(response.data.message || "File upload failed");
  }
}

export const filesAPI = new FilesAPI();

