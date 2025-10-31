import React, { memo } from 'react';

const Logo: React.FC<{ size?: 'normal' | 'large' }> = ({ size = 'normal' }) => {
  const sizeClass = size === 'large' ? 'h-24 w-auto' : 'h-8 w-auto';
  return (
    <div className="flex items-center">
      <svg
        xmlns="http://www.w3.org/2000/svg"
        viewBox="0 0 24 24"
        fill="currentColor"
        className={`${sizeClass} text-primary-500 dark:text-primary-400`}
        aria-label="Aman Digital Care Logo"
      >
        <path d="M12 1L3 5v6c0 5.55 3.84 10.74 9 12 5.16-1.26 9-6.45 9-12V5l-9-4z M12 7 L 8 11 L 10 16 L 12 14 L 14 16 L 16 11 Z" />
      </svg>
    </div>
  );
};

export default memo(Logo);