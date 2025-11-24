'use client';

import { useState, useEffect } from 'react';
import ClassSelector from '@/components/ClassSelector';
import CameraCapture from '@/components/CameraCapture';
import StudentGallery from '@/components/StudentGallery';
import {
  fetchClasses,
  createClass,
  fetchStudents,
  uploadPhoto,
  Class,
  Student,
} from '@/lib/api';

type Step = 'select-class' | 'capture-photo' | 'enter-name' | 'view-gallery';

export default function Home() {
  const [step, setStep] = useState<Step>('select-class');
  const [classes, setClasses] = useState<Class[]>([]);
  const [selectedClass, setSelectedClass] = useState<string>('');
  const [students, setStudents] = useState<Student[]>([]);
  const [capturedPhoto, setCapturedPhoto] = useState<Blob | null>(null);
  const [studentName, setStudentName] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isCreatingClass, setIsCreatingClass] = useState(false);
  const [error, setError] = useState('');

  // Load classes on mount
  useEffect(() => {
    loadClasses();
  }, []);

  const loadClasses = async () => {
    try {
      setIsLoading(true);
      const data = await fetchClasses();
      setClasses(data);
    } catch (err: any) {
      console.error('Failed to load classes:', err);
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  const handleCreateClass = async (className: string) => {
    try {
      setIsCreatingClass(true);
      setError('');
      await createClass(className);
      await loadClasses();
    } catch (err: any) {
      throw err;
    } finally {
      setIsCreatingClass(false);
    }
  };

  const handleSelectClass = async (className: string) => {
    try {
      setSelectedClass(className);
      setIsLoading(true);
      setError('');
      const data = await fetchStudents(className);
      setStudents(data);
      setStep('view-gallery');
    } catch (err: any) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  const handleStartCapture = () => {
    setCapturedPhoto(null);
    setStudentName('');
    setError('');
    setStep('capture-photo');
  };

  const handlePhotoCapture = (imageBlob: Blob) => {
    setCapturedPhoto(imageBlob);
    setStep('enter-name');
  };

  const handleCancelCapture = () => {
    setCapturedPhoto(null);
    setStep('view-gallery');
  };

  const handleSaveStudent = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!studentName.trim()) {
      setError('Please enter student name');
      return;
    }

    if (!capturedPhoto) {
      setError('No photo captured');
      return;
    }

    try {
      setIsLoading(true);
      setError('');

      // Convert Blob to File
      const file = new File([capturedPhoto], `${studentName}.jpeg`, { type: 'image/jpeg' });

      await uploadPhoto(selectedClass, studentName.trim(), file);

      // Refresh student list
      const data = await fetchStudents(selectedClass);
      setStudents(data);

      // Reset and go back to gallery
      setCapturedPhoto(null);
      setStudentName('');
      setStep('view-gallery');
    } catch (err: any) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  const handleBackToClasses = () => {
    setSelectedClass('');
    setStudents([]);
    setCapturedPhoto(null);
    setStudentName('');
    setError('');
    setStep('select-class');
  };

  return (
    <div className="min-h-screen py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto">
        {/* Error Display */}
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

        {/* Step 1: Select or Create Class */}
        {step === 'select-class' && (
          <ClassSelector
            classes={classes}
            onSelectClass={handleSelectClass}
            onCreateClass={handleCreateClass}
            isCreating={isCreatingClass}
          />
        )}

        {/* Step 2: Capture Photo */}
        {step === 'capture-photo' && (
          <div>
            <div className="mb-6">
              <button onClick={handleCancelCapture} className="text-primary-600 hover:text-primary-700 font-medium">
                ← Back to Gallery
              </button>
            </div>
            <CameraCapture onCapture={handlePhotoCapture} onCancel={handleCancelCapture} />
          </div>
        )}

        {/* Step 3: Enter Student Name */}
        {step === 'enter-name' && capturedPhoto && (
          <div className="card">
            <h2 className="text-2xl font-bold text-gray-900 mb-6">Enter Student Details</h2>

            {/* Photo Preview */}
            <div className="mb-6">
              <img
                src={URL.createObjectURL(capturedPhoto)}
                alt="Captured student"
                className="w-full max-w-md mx-auto rounded-lg"
              />
            </div>

            {/* Student Name Form */}
            <form onSubmit={handleSaveStudent}>
              <div className="mb-6">
                <label htmlFor="studentName" className="block text-sm font-medium text-gray-700 mb-2">
                  Student Name
                </label>
                <input
                  type="text"
                  id="studentName"
                  value={studentName}
                  onChange={(e) => setStudentName(e.target.value)}
                  placeholder="Enter student's full name"
                  className="input-field"
                  disabled={isLoading}
                  autoFocus
                />
              </div>

              <div className="flex space-x-3">
                <button
                  type="submit"
                  disabled={isLoading || !studentName.trim()}
                  className="flex-1 btn-primary"
                >
                  {isLoading ? (
                    <>
                      <svg
                        className="animate-spin -ml-1 mr-3 h-5 w-5 text-white inline"
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
                      Saving...
                    </>
                  ) : (
                    <>
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
                          d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12"
                        />
                      </svg>
                      Save to S3
                    </>
                  )}
                </button>
                <button
                  type="button"
                  onClick={() => setStep('capture-photo')}
                  disabled={isLoading}
                  className="flex-1 btn-secondary"
                >
                  Retake Photo
                </button>
              </div>
            </form>
          </div>
        )}

        {/* Step 4: View Gallery */}
        {step === 'view-gallery' && (
          <div>
            {/* Header */}
            <div className="mb-6 flex items-center justify-between">
              <button
                onClick={handleBackToClasses}
                className="text-primary-600 hover:text-primary-700 font-medium"
              >
                ← Back to Classes
              </button>
              <button onClick={handleStartCapture} className="btn-primary">
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
                    d="M12 4v16m8-8H4"
                  />
                </svg>
                Add Student
              </button>
            </div>

            {/* Loading State */}
            {isLoading ? (
              <div className="card text-center py-12">
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
                <p className="text-gray-600">Loading students...</p>
              </div>
            ) : (
              <StudentGallery students={students} className={selectedClass} />
            )}
          </div>
        )}
      </div>
    </div>
  );
}
