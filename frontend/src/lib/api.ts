import axios from 'axios';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';

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

export default api;
