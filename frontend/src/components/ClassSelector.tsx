'use client';

import { useState } from 'react';
import { Class } from '@/lib/api';

interface ClassSelectorProps {
  classes: Class[];
  onSelectClass: (className: string) => void;
  onCreateClass: (className: string) => Promise<void>;
  isCreating: boolean;
}

export default function ClassSelector({
  classes,
  onSelectClass,
  onCreateClass,
  isCreating,
}: ClassSelectorProps) {
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [newClassName, setNewClassName] = useState('');
  const [error, setError] = useState('');

  const handleCreateClass = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!newClassName.trim()) {
      setError('Please enter a class name');
      return;
    }

    try {
      await onCreateClass(newClassName.trim());
      setNewClassName('');
      setShowCreateForm(false);
    } catch (err: any) {
      setError(err.message || 'Failed to create class');
    }
  };

  return (
    <div className="card">
      <h1 className="text-3xl font-bold text-gray-900 mb-2">Student Photo Capture</h1>
      <p className="text-gray-600 mb-8">Select a class or create a new one to get started</p>

      {!showCreateForm ? (
        <>
          {classes.length > 0 ? (
            <div className="space-y-3 mb-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">Select a Class:</h2>
              {classes.map((classItem) => (
                <button
                  key={classItem.className}
                  onClick={() => onSelectClass(classItem.className)}
                  className="w-full p-4 bg-white border-2 border-gray-200 rounded-lg hover:border-primary-500 hover:bg-primary-50 transition-all text-left"
                >
                  <div className="flex items-center justify-between">
                    <span className="font-medium text-gray-900">{classItem.className}</span>
                    <svg
                      className="w-5 h-5 text-gray-400"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M9 5l7 7-7 7"
                      />
                    </svg>
                  </div>
                </button>
              ))}
            </div>
          ) : (
            <div className="text-center py-8 mb-6">
              <svg
                className="mx-auto h-12 w-12 text-gray-400 mb-3"
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
              <p className="text-gray-600">No classes yet. Create your first class to begin.</p>
            </div>
          )}

          <button
            onClick={() => setShowCreateForm(true)}
            className="w-full btn-primary"
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
                d="M12 4v16m8-8H4"
              />
            </svg>
            Create New Class
          </button>
        </>
      ) : (
        <form onSubmit={handleCreateClass}>
          <div className="mb-4">
            <label htmlFor="className" className="block text-sm font-medium text-gray-700 mb-2">
              Class Name
            </label>
            <input
              type="text"
              id="className"
              value={newClassName}
              onChange={(e) => setNewClassName(e.target.value)}
              placeholder="e.g., JSS1 Jasper, SS2 Emerald"
              className="input-field"
              disabled={isCreating}
              autoFocus
            />
            {error && <p className="mt-2 text-sm text-red-600">{error}</p>}
          </div>
          <div className="flex space-x-3">
            <button
              type="submit"
              disabled={isCreating}
              className="flex-1 btn-primary"
            >
              {isCreating ? 'Creating...' : 'Create Class'}
            </button>
            <button
              type="button"
              onClick={() => {
                setShowCreateForm(false);
                setNewClassName('');
                setError('');
              }}
              disabled={isCreating}
              className="flex-1 btn-secondary"
            >
              Cancel
            </button>
          </div>
        </form>
      )}
    </div>
  );
}
