import React from 'react';

const Loading = ({ fullscreen = false, message = '로딩 중...', size = 'medium' }) => {
  const spinnerSizes = {
    small: 'w-6 h-6',
    medium: 'w-12 h-12',
    large: 'w-20 h-20'
  };

  const spinnerSize = spinnerSizes[size] || spinnerSizes.medium;

  if (fullscreen) {
    return (
      <div className="fixed inset-0 flex flex-col items-center justify-center bg-white bg-opacity-80 dark:bg-dark-700 dark:bg-opacity-80 z-50">
        <div className={`${spinnerSize} animate-spin rounded-full border-4 border-gray-200 dark:border-gray-700 border-t-primary-600 dark:border-t-primary-400`}></div>
        {message && (
          <p className="mt-4 text-gray-700 dark:text-gray-300 font-medium">{message}</p>
        )}
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center justify-center p-6">
      <div className={`${spinnerSize} animate-spin rounded-full border-4 border-gray-200 dark:border-gray-700 border-t-primary-600 dark:border-t-primary-400`}></div>
      {message && (
        <p className="mt-4 text-gray-700 dark:text-gray-300">{message}</p>
      )}
    </div>
  );
};

export default Loading;