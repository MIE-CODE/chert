/**
 * Files API Service
 * Handles file upload API calls
 */

import { apiClient } from "@/app/lib/api-client";

export interface UploadResponse {
  fileUrl?: string;
  url?: string;
  fileName: string;
  fileSize: number;
  fileType?: "image" | "file" | "audio";
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
  async uploadFile(file: File | FormData): Promise<UploadResponse> {
    let formData: FormData;
    
    if (file instanceof FormData) {
      formData = file;
    } else {
      formData = new FormData();
      formData.append("file", file);
    }

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

