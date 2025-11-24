import axios from 'axios';

// Use production API endpoint by default
const API_URL = process.env.NEXT_PUBLIC_API_URL || 'https://api.studentscapture.boboyii.app';

const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

export interface Class {
  className: string;
  prefix: string;
}

export interface Student {
  studentName: string;
  key: string;
  size: number;
  lastModified: string;
  url: string;
}

export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
}

export interface AdminClass extends Class {
  studentCount: number;
  students: Student[];
  lastUpdated: string | null;
}

export interface AdminStats {
  totalClasses: number;
  totalStudents: number;
  totalSize: number;
  totalSizeMB: string;
  recentUploads: Array<Student & { className: string }>;
}

// Class APIs
export async function fetchClasses(): Promise<Class[]> {
  try {
    const response = await api.get('/api/classes');
    return response.data.classes || [];
  } catch (error: any) {
    console.error('Fetch classes error:', error);
    throw new Error(error.response?.data?.error || 'Failed to fetch classes');
  }
}

export async function createClass(className: string): Promise<any> {
  try {
    const response = await api.post('/api/classes', { className });
    return response.data;
  } catch (error: any) {
    console.error('Create class error:', error);
    throw new Error(error.response?.data?.error || 'Failed to create class');
  }
}

// Student APIs
export async function fetchStudents(className: string): Promise<Student[]> {
  try {
    const response = await api.get(`/api/students/${encodeURIComponent(className)}`);
    return response.data.students || [];
  } catch (error: any) {
    console.error('Fetch students error:', error);
    throw new Error(error.response?.data?.error || 'Failed to fetch students');
  }
}

// Upload APIs
export async function uploadPhoto(
  className: string,
  studentName: string,
  photoFile: File
): Promise<any> {
  try {
    const formData = new FormData();
    formData.append('className', className);
    formData.append('studentName', studentName);
    formData.append('photo', photoFile);

    const response = await api.post('/api/upload', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });

    return response.data;
  } catch (error: any) {
    console.error('Upload photo error:', error);
    throw new Error(error.response?.data?.error || 'Failed to upload photo');
  }
}

export async function getPresignedUrl(
  className: string,
  studentName: string
): Promise<string> {
  try {
    const response = await api.post('/api/upload/presigned', {
      className,
      studentName,
    });
    return response.data.data.uploadUrl;
  } catch (error: any) {
    console.error('Get presigned URL error:', error);
    throw new Error(error.response?.data?.error || 'Failed to get upload URL');
  }
}

export async function uploadToPresignedUrl(url: string, file: File): Promise<void> {
  try {
    await axios.put(url, file, {
      headers: {
        'Content-Type': 'image/jpeg',
      },
    });
  } catch (error: any) {
    console.error('Upload to presigned URL error:', error);
    throw new Error('Failed to upload file to S3');
  }
}

// Admin APIs
export async function adminLogin(password: string): Promise<string> {
  try {
    const response = await api.post('/api/admin/login', { password });
    return response.data.data.token;
  } catch (error: any) {
    console.error('Admin login error:', error);
    throw new Error(error.response?.data?.error || 'Login failed');
  }
}

export async function fetchAdminClasses(token: string): Promise<AdminClass[]> {
  try {
    const response = await api.get('/api/admin/classes', {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
    return response.data.classes || [];
  } catch (error: any) {
    console.error('Fetch admin classes error:', error);
    throw new Error(error.response?.data?.error || 'Failed to fetch classes');
  }
}

export async function fetchAdminStats(token: string): Promise<AdminStats> {
  try {
    const response = await api.get('/api/admin/stats', {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
    return response.data.stats;
  } catch (error: any) {
    console.error('Fetch admin stats error:', error);
    throw new Error(error.response?.data?.error || 'Failed to fetch stats');
  }
}

export function getDownloadImageUrl(
  token: string,
  className: string,
  studentName: string
): string {
  return `${API_URL}/api/admin/download/image/${encodeURIComponent(className)}/${encodeURIComponent(studentName)}?token=${token}`;
}

export function getDownloadClassUrl(token: string, className: string): string {
  return `${API_URL}/api/admin/download/class/${encodeURIComponent(className)}?token=${token}`;
}

export async function downloadImage(
  token: string,
  className: string,
  studentName: string
): Promise<void> {
  try {
    const response = await axios.get(
      `/api/admin/download/image/${encodeURIComponent(className)}/${encodeURIComponent(studentName)}`,
      {
        baseURL: API_URL,
        headers: {
          Authorization: `Bearer ${token}`,
        },
        responseType: 'blob',
      }
    );

    // Create download link
    const url = window.URL.createObjectURL(new Blob([response.data]));
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `${studentName}.jpeg`);
    document.body.appendChild(link);
    link.click();
    link.remove();
    window.URL.revokeObjectURL(url);
  } catch (error: any) {
    console.error('Download image error:', error);
    throw new Error('Failed to download image');
  }
}

export async function downloadClass(token: string, className: string): Promise<void> {
  try {
    const response = await axios.get(
      `/api/admin/download/class/${encodeURIComponent(className)}`,
      {
        baseURL: API_URL,
        headers: {
          Authorization: `Bearer ${token}`,
        },
        responseType: 'blob',
      }
    );

    // Create download link
    const url = window.URL.createObjectURL(new Blob([response.data]));
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `${className.replace(/\s+/g, '_')}.zip`);
    document.body.appendChild(link);
    link.click();
    link.remove();
    window.URL.revokeObjectURL(url);
  } catch (error: any) {
    console.error('Download class error:', error);
    throw new Error('Failed to download class');
  }
}

export default api;
