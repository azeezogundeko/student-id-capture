'use client';

import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import {
  fetchAdminClasses,
  fetchAdminStats,
  downloadImage,
  downloadClass,
  downloadAllClasses,
  AdminClass,
  AdminStats,
} from '@/lib/api';

export default function AdminDashboard() {
  const [token, setToken] = useState<string | null>(null);
  const [classes, setClasses] = useState<AdminClass[]>([]);
  const [stats, setStats] = useState<AdminStats | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const [selectedClass, setSelectedClass] = useState<string | null>(null);
  const [downloadingClass, setDownloadingClass] = useState<string | null>(null);
  const [downloadingImage, setDownloadingImage] = useState<string | null>(null);
  const [downloadingAll, setDownloadingAll] = useState(false);
  const [autoRefresh, setAutoRefresh] = useState(false); // Default to off to save S3 transactions
  const router = useRouter();

  // Check authentication
  useEffect(() => {
    const adminToken = localStorage.getItem('adminToken');
    if (!adminToken) {
      router.push('/admin');
      return;
    }
    setToken(adminToken);
  }, [router]);

  // Load data
  const loadData = useCallback(async () => {
    if (!token) return;

    try {
      setError('');
      const [classesData, statsData] = await Promise.all([
        fetchAdminClasses(token),
        fetchAdminStats(token),
      ]);
      setClasses(classesData);
      setStats(statsData);
    } catch (err: any) {
      setError(err.message || 'Failed to load data');
      if (err.message.includes('token') || err.message.includes('Authentication')) {
        localStorage.removeItem('adminToken');
        router.push('/admin');
      }
    } finally {
      setIsLoading(false);
    }
  }, [token, router]);

  // Initial load
  useEffect(() => {
    if (token) {
      loadData();
    }
  }, [token, loadData]);

  // Auto-refresh every 60 seconds (if enabled)
  useEffect(() => {
    if (!autoRefresh || !token) return;

    const interval = setInterval(() => {
      loadData();
    }, 60000); // 60 seconds (1 minute)

    return () => clearInterval(interval);
  }, [autoRefresh, token, loadData]);

  // Handle logout
  const handleLogout = () => {
    localStorage.removeItem('adminToken');
    router.push('/admin');
  };

  // Handle download class
  const handleDownloadClass = async (className: string) => {
    if (!token) return;

    try {
      setDownloadingClass(className);
      await downloadClass(token, className);
    } catch (err: any) {
      alert(err.message || 'Failed to download class');
    } finally {
      setDownloadingClass(null);
    }
  };

  // Handle download image
  const handleDownloadImage = async (className: string, studentName: string) => {
    if (!token) return;

    try {
      setDownloadingImage(`${className}-${studentName}`);
      await downloadImage(token, className, studentName);
    } catch (err: any) {
      alert(err.message || 'Failed to download image');
    } finally {
      setDownloadingImage(null);
    }
  };

  // Handle download all classes
  const handleDownloadAllClasses = async () => {
    if (!token) return;

    try {
      setDownloadingAll(true);
      await downloadAllClasses(token);
    } catch (err: any) {
      alert(err.message || 'Failed to download all classes');
    } finally {
      setDownloadingAll(false);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <svg
            className="animate-spin h-12 w-12 text-primary-600 mx-auto mb-4"
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
          >
            <circle
              className="opacity-25"
              cx="12"
              cy="12"
              r="10"
              stroke="currentColor"
              strokeWidth="4"
            ></circle>
            <path
              className="opacity-75"
              fill="currentColor"
              d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
            ></path>
          </svg>
          <p className="text-gray-600">Loading dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Admin Dashboard</h1>
              <p className="text-sm text-gray-600 mt-1">Student Photo Capture System</p>
            </div>
            <div className="flex items-center space-x-4">
              {/* Auto-refresh toggle */}
              <label className="flex items-center cursor-pointer">
                <div className="relative">
                  <input
                    type="checkbox"
                    className="sr-only"
                    checked={autoRefresh}
                    onChange={(e) => setAutoRefresh(e.target.checked)}
                  />
                  <div className={`w-10 h-6 rounded-full transition ${autoRefresh ? 'bg-primary-600' : 'bg-gray-300'}`}></div>
                  <div
                    className={`absolute left-1 top-1 bg-white w-4 h-4 rounded-full transition transform ${
                      autoRefresh ? 'translate-x-4' : ''
                    }`}
                  ></div>
                </div>
                <span className="ml-3 text-sm text-gray-700">Auto-refresh (60s)</span>
              </label>

              {/* Refresh button */}
              <button
                onClick={loadData}
                className="px-4 py-2 bg-gray-200 text-gray-800 rounded-lg hover:bg-gray-300 transition-colors"
              >
                <svg
                  className="w-5 h-5 inline mr-2"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
                  />
                </svg>
                Refresh
              </button>

              {/* Download All Classes button */}
              <button
                onClick={handleDownloadAllClasses}
                disabled={downloadingAll}
                className="px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                <svg
                  className="w-5 h-5 inline mr-2"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4"
                  />
                </svg>
                {downloadingAll ? 'Downloading...' : 'Download All'}
              </button>

              {/* Logout button */}
              <button onClick={handleLogout} className="btn-danger">
                Logout
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {error && (
          <div className="mb-6 bg-red-50 border border-red-200 rounded-lg p-4">
            <div className="flex">
              <svg
                className="h-5 w-5 text-red-400 mr-2"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              </svg>
              <p className="text-sm text-red-800">{error}</p>
            </div>
          </div>
        )}

        {/* Stats Cards */}
        {stats && (
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
            <div className="bg-white rounded-xl shadow-md p-6">
              <div className="flex items-center">
                <div className="p-3 bg-primary-100 rounded-lg">
                  <svg
                    className="w-8 h-8 text-primary-600"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"
                    />
                  </svg>
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Total Classes</p>
                  <p className="text-2xl font-bold text-gray-900">{stats.totalClasses}</p>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-xl shadow-md p-6">
              <div className="flex items-center">
                <div className="p-3 bg-green-100 rounded-lg">
                  <svg
                    className="w-8 h-8 text-green-600"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"
                    />
                  </svg>
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Total Students</p>
                  <p className="text-2xl font-bold text-gray-900">{stats.totalStudents}</p>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-xl shadow-md p-6">
              <div className="flex items-center">
                <div className="p-3 bg-blue-100 rounded-lg">
                  <svg
                    className="w-8 h-8 text-blue-600"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
                    />
                  </svg>
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Total Photos</p>
                  <p className="text-2xl font-bold text-gray-900">{stats.totalStudents}</p>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-xl shadow-md p-6">
              <div className="flex items-center">
                <div className="p-3 bg-purple-100 rounded-lg">
                  <svg
                    className="w-8 h-8 text-purple-600"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M5 8h14M5 8a2 2 0 110-4h14a2 2 0 110 4M5 8v10a2 2 0 002 2h10a2 2 0 002-2V8m-9 4h4"
                    />
                  </svg>
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Storage Used</p>
                  <p className="text-2xl font-bold text-gray-900">{stats.totalSizeMB} MB</p>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Classes List */}
        <div className="space-y-6">
          {classes.length === 0 ? (
            <div className="bg-white rounded-xl shadow-md p-12 text-center">
              <svg
                className="mx-auto h-16 w-16 text-gray-400 mb-4"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"
                />
              </svg>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">No Classes Yet</h3>
              <p className="text-gray-600">Classes will appear here once students are uploaded.</p>
            </div>
          ) : (
            classes.map((classItem) => (
              <div key={classItem.className} className="bg-white rounded-xl shadow-md overflow-hidden">
                {/* Class Header */}
                <div
                  className="p-6 bg-gradient-to-r from-primary-600 to-primary-700 text-white cursor-pointer hover:from-primary-700 hover:to-primary-800 transition"
                  onClick={() =>
                    setSelectedClass(selectedClass === classItem.className ? null : classItem.className)
                  }
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center flex-1">
                      <svg
                        className="w-8 h-8 mr-4"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"
                        />
                      </svg>
                      <div>
                        <h2 className="text-2xl font-bold">{classItem.className}</h2>
                        <p className="text-primary-100 mt-1">
                          {classItem.studentCount} {classItem.studentCount === 1 ? 'student' : 'students'}
                          {classItem.lastUpdated && (
                            <span className="ml-4">
                              Last updated: {new Date(classItem.lastUpdated).toLocaleString()}
                            </span>
                          )}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center space-x-3">
                      {/* Download Class Button */}
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleDownloadClass(classItem.className);
                        }}
                        disabled={downloadingClass === classItem.className || classItem.studentCount === 0}
                        className="px-4 py-2 bg-white text-primary-600 rounded-lg font-medium hover:bg-primary-50 transition-colors disabled:bg-gray-300 disabled:text-gray-500 disabled:cursor-not-allowed"
                      >
                        {downloadingClass === classItem.className ? (
                          <span className="flex items-center">
                            <svg
                              className="animate-spin h-5 w-5 mr-2"
                              xmlns="http://www.w3.org/2000/svg"
                              fill="none"
                              viewBox="0 0 24 24"
                            >
                              <circle
                                className="opacity-25"
                                cx="12"
                                cy="12"
                                r="10"
                                stroke="currentColor"
                                strokeWidth="4"
                              ></circle>
                              <path
                                className="opacity-75"
                                fill="currentColor"
                                d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                              ></path>
                            </svg>
                            Downloading...
                          </span>
                        ) : (
                          <span className="flex items-center">
                            <svg
                              className="w-5 h-5 mr-2"
                              fill="none"
                              viewBox="0 0 24 24"
                              stroke="currentColor"
                            >
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4"
                              />
                            </svg>
                            Download All (ZIP)
                          </span>
                        )}
                      </button>

                      {/* Expand/Collapse Icon */}
                      <svg
                        className={`w-6 h-6 transition-transform ${
                          selectedClass === classItem.className ? 'transform rotate-180' : ''
                        }`}
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M19 9l-7 7-7-7"
                        />
                      </svg>
                    </div>
                  </div>
                </div>

                {/* Students Grid */}
                {selectedClass === classItem.className && (
                  <div className="p-6 bg-gray-50">
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                      {classItem.students.map((student) => (
                        <div
                          key={student.key}
                          className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-xl transition-shadow"
                        >
                          {/* Student Image */}
                          <div className="relative h-64 bg-gray-200">
                            <img
                              src={student.url}
                              alt={student.studentName}
                              className="w-full h-full object-cover"
                              loading="lazy"
                            />
                          </div>

                          {/* Student Info */}
                          <div className="p-4">
                            <h3 className="font-semibold text-gray-900 text-lg mb-1 truncate">
                              {student.studentName}
                            </h3>
                            <p className="text-sm text-gray-500 mb-3">
                              {new Date(student.lastModified).toLocaleDateString()}
                            </p>

                            {/* Download Button */}
                            <button
                              onClick={() => handleDownloadImage(classItem.className, student.studentName)}
                              disabled={downloadingImage === `${classItem.className}-${student.studentName}`}
                              className="w-full px-3 py-2 bg-primary-600 text-white rounded-lg font-medium hover:bg-primary-700 transition-colors disabled:bg-gray-400"
                            >
                              {downloadingImage === `${classItem.className}-${student.studentName}` ? (
                                <span className="flex items-center justify-center">
                                  <svg
                                    className="animate-spin h-4 w-4 mr-2"
                                    xmlns="http://www.w3.org/2000/svg"
                                    fill="none"
                                    viewBox="0 0 24 24"
                                  >
                                    <circle
                                      className="opacity-25"
                                      cx="12"
                                      cy="12"
                                      r="10"
                                      stroke="currentColor"
                                      strokeWidth="4"
                                    ></circle>
                                    <path
                                      className="opacity-75"
                                      fill="currentColor"
                                      d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                                    ></path>
                                  </svg>
                                  Downloading...
                                </span>
                              ) : (
                                <span className="flex items-center justify-center">
                                  <svg
                                    className="w-4 h-4 mr-2"
                                    fill="none"
                                    viewBox="0 0 24 24"
                                    stroke="currentColor"
                                  >
                                    <path
                                      strokeLinecap="round"
                                      strokeLinejoin="round"
                                      strokeWidth={2}
                                      d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4"
                                    />
                                  </svg>
                                  Download
                                </span>
                              )}
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            ))
          )}
        </div>
      </main>
    </div>
  );
}
