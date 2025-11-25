'use client';

import { useRef, useState, useCallback } from 'react';
import Webcam from 'react-webcam';

interface CameraCaptureProps {
  onCapture: (imageBlob: Blob) => void;
  onCancel: () => void;
}

export default function CameraCapture({ onCapture, onCancel }: CameraCaptureProps) {
  const webcamRef = useRef<Webcam>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [capturedImage, setCapturedImage] = useState<string | null>(null);
  const [cameraError, setCameraError] = useState<string | null>(null);
  const [facingMode, setFacingMode] = useState<'user' | 'environment'>('user');
  const [uploadMode, setUploadMode] = useState<'camera' | 'upload'>('camera');

  const videoConstraints = {
    width: 1280,
    height: 720,
    facingMode: facingMode,
  };

  const toggleCamera = () => {
    setFacingMode((prev) => (prev === 'user' ? 'environment' : 'user'));
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate file type
    if (!file.type.startsWith('image/')) {
      setCameraError('Please select an image file');
      return;
    }

    // Validate file size (5MB max)
    if (file.size > 5 * 1024 * 1024) {
      setCameraError('Image size must be less than 5MB');
      return;
    }

    // Convert to base64 for preview
    const reader = new FileReader();
    reader.onload = (event) => {
      setCapturedImage(event.target?.result as string);
    };
    reader.readAsDataURL(file);
  };

  const handleUploadClick = () => {
    fileInputRef.current?.click();
  };

  const capture = useCallback(() => {
    const imageSrc = webcamRef.current?.getScreenshot();
    if (imageSrc) {
      setCapturedImage(imageSrc);
    }
  }, [webcamRef]);

  const retake = () => {
    setCapturedImage(null);
  };

  const confirmCapture = () => {
    if (capturedImage) {
      // Convert base64 to Blob
      fetch(capturedImage)
        .then((res) => res.blob())
        .then((blob) => {
          onCapture(blob);
        })
        .catch((error) => {
          console.error('Error converting image:', error);
          setCameraError('Failed to process image');
        });
    }
  };

  const handleUserMediaError = (error: string | DOMException) => {
    console.error('Camera error:', error);
    setCameraError('Unable to access camera. Please check permissions.');
  };

  if (cameraError) {
    return (
      <div className="card text-center">
        <div className="mb-4">
          <svg
            className="mx-auto h-12 w-12 text-red-500"
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
        </div>
        <h3 className="text-lg font-semibold text-gray-900 mb-2">Camera Access Error</h3>
        <p className="text-gray-600 mb-6">{cameraError}</p>
        <button onClick={onCancel} className="btn-secondary">
          Go Back
        </button>
      </div>
    );
  }

  return (
    <div className="card">
      {/* Mode selector tabs */}
      <div className="flex mb-4 bg-gray-100 rounded-lg p-1">
        <button
          onClick={() => setUploadMode('camera')}
          className={`flex-1 py-2 px-4 rounded-md transition-all ${
            uploadMode === 'camera'
              ? 'bg-white text-primary-600 shadow-sm font-medium'
              : 'text-gray-600 hover:text-gray-900'
          }`}
        >
          📷 Take Photo
        </button>
        <button
          onClick={() => setUploadMode('upload')}
          className={`flex-1 py-2 px-4 rounded-md transition-all ${
            uploadMode === 'upload'
              ? 'bg-white text-primary-600 shadow-sm font-medium'
              : 'text-gray-600 hover:text-gray-900'
          }`}
        >
          📤 Upload Photo
        </button>
      </div>

      <div className="mb-6">
        {!capturedImage ? (
          <>
            {uploadMode === 'camera' ? (
              <div className="relative">
                <Webcam
                  audio={false}
                  ref={webcamRef}
                  screenshotFormat="image/jpeg"
                  videoConstraints={videoConstraints}
                  onUserMediaError={handleUserMediaError}
                  className="w-full rounded-lg"
                  key={facingMode}
                />
                {/* Camera switch button - top right */}
                <button
                  onClick={toggleCamera}
                  className="absolute top-4 right-4 bg-white/90 hover:bg-white text-gray-800 p-3 rounded-full shadow-lg transition-all"
                  title={facingMode === 'user' ? 'Switch to Back Camera' : 'Switch to Front Camera'}
                >
                  <svg
                    className="w-6 h-6"
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
                </button>
                {/* Camera mode indicator */}
                <div className="absolute top-4 left-4 bg-black/60 text-white px-3 py-1 rounded-full text-sm">
                  {facingMode === 'user' ? '🤳 Front Camera' : '📷 Back Camera'}
                </div>
                <div className="absolute bottom-4 left-0 right-0 flex justify-center space-x-4">
                  <button onClick={capture} className="btn-primary">
                    <svg
                      className="w-6 h-6 inline mr-2"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z"
                      />
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M15 13a3 3 0 11-6 0 3 3 0 016 0z"
                      />
                    </svg>
                    Take Photo
                  </button>
                  <button onClick={onCancel} className="btn-secondary">
                    Cancel
                  </button>
                </div>
              </div>
            ) : (
              <div className="text-center py-12">
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  onChange={handleFileSelect}
                  className="hidden"
                />
                <div className="mb-6">
                  <svg
                    className="mx-auto h-24 w-24 text-gray-400"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={1.5}
                      d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
                    />
                  </svg>
                </div>
                <h3 className="text-lg font-medium text-gray-900 mb-2">Upload a Photo</h3>
                <p className="text-sm text-gray-600 mb-6">
                  Choose a photo from your gallery
                </p>
                <div className="flex justify-center space-x-4">
                  <button onClick={handleUploadClick} className="btn-primary">
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
                        d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12"
                      />
                    </svg>
                    Choose from Gallery
                  </button>
                  <button onClick={onCancel} className="btn-secondary">
                    Cancel
                  </button>
                </div>
              </div>
            )}
          </>
        ) : (
          <div>
            <img src={capturedImage} alt="Captured" className="w-full rounded-lg mb-4" />
            <div className="flex justify-center space-x-4">
              <button onClick={retake} className="btn-secondary">
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
                Retake Photo
              </button>
              <button onClick={confirmCapture} className="btn-primary">
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
                    d="M5 13l4 4L19 7"
                  />
                </svg>
                Use This Photo
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
