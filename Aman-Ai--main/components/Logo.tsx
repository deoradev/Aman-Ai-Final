import React from 'react';

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
        <path d="M12 1L3 5v6c0 5.55 3.84 10.74 9 12 5.16-1.26 9-6.45 9-12V5l-9-4zm-1 6h2v3h3v2h-3v3h-2v-3H8v-2h3V7z" />
      </svg>
    </div>
  );
};

export default Logo;
