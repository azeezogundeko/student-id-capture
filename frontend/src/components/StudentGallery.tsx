'use client';

import { Student } from '@/lib/api';
import Image from 'next/image';

interface StudentGalleryProps {
  students: Student[];
  className: string;
}

export default function StudentGallery({ students, className }: StudentGalleryProps) {
  if (students.length === 0) {
    return (
      <div className="card text-center py-12">
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
            d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"
          />
        </svg>
        <h3 className="text-lg font-semibold text-gray-900 mb-2">No Students Yet</h3>
        <p className="text-gray-600">Start capturing student photos for this class.</p>
      </div>
    );
  }

  return (
    <div className="card">
      <h2 className="text-2xl font-bold text-gray-900 mb-6">
        Students in {className}
        <span className="ml-3 text-lg font-normal text-gray-500">({students.length})</span>
      </h2>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {students.map((student) => (
          <div key={student.key} className="border border-gray-200 rounded-lg overflow-hidden hover:shadow-lg transition-shadow">
            <div className="relative h-64 bg-gray-100">
              <img
                src={student.url}
                alt={student.studentName}
                className="w-full h-full object-cover"
              />
            </div>
            <div className="p-4">
              <h3 className="font-semibold text-gray-900 text-lg mb-1">{student.studentName}</h3>
              <p className="text-sm text-gray-500">
                Added: {new Date(student.lastModified).toLocaleDateString()}
              </p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
