'use client';

import { useRef, useState, useCallback } from 'react';
import Webcam from 'react-webcam';

interface CameraCaptureProps {
  onCapture: (imageBlob: Blob) => void;
  onCancel: () => void;
}

const videoConstraints = {
  width: 1280,
  height: 720,
  facingMode: 'user',
};

export default function CameraCapture({ onCapture, onCancel }: CameraCaptureProps) {
  const webcamRef = useRef<Webcam>(null);
  const [capturedImage, setCapturedImage] = useState<string | null>(null);
  const [cameraError, setCameraError] = useState<string | null>(null);

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
      <div className="mb-6">
        {!capturedImage ? (
          <div className="relative">
            <Webcam
              audio={false}
              ref={webcamRef}
              screenshotFormat="image/jpeg"
              videoConstraints={videoConstraints}
              onUserMediaError={handleUserMediaError}
              className="w-full rounded-lg"
            />
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
