import React from 'react';

export const LoadingArea: React.FC<{}> = () => {
  return (
    <div>
      <div className="absolute flex h-screen w-full items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="mx-auto mb-4 h-12 w-12 animate-spin rounded-full border-b-2 border-blue-600"></div>
          <p className="text-gray-600">Loading...</p>
        </div>
      </div>
    </div>
  );
};
