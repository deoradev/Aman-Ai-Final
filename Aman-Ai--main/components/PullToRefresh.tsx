import React, { useState, useEffect, useRef, ReactNode, useCallback } from 'react';

const PULL_THRESHOLD = 80; // Pixels to pull before refresh triggers
const PULL_MAX = 110; // Max pixels the indicator can be pulled down

const PullToRefresh: React.FC<{ children: ReactNode; onRefresh: () => void }> = ({ children, onRefresh }) => {
  const [pullStart, setPullStart] = useState<number | null>(null);
  const [pullDistance, setPullDistance] = useState(0);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  const handleTouchStart = useCallback((e: TouchEvent) => {
    if (window.scrollY === 0) {
      setPullStart(e.touches[0].clientY);
    } else {
      setPullStart(null);
    }
  }, []);

  const handleTouchMove = useCallback((e: TouchEvent) => {
    if (pullStart === null || isRefreshing) return;

    const currentY = e.touches[0].clientY;
    const distance = currentY - pullStart;

    if (distance > 0) {
      // Prevent browser's native pull-to-refresh. This is crucial on mobile.
      // We check for `e.cancelable` as some events (like passive ones) can't be prevented.
      if (e.cancelable) {
        e.preventDefault();
      }
      
      // Apply some resistance to the pull for a more natural feel
      const dampenedDistance = Math.min(PULL_MAX, distance / (1 + distance / 200));
      setPullDistance(dampenedDistance);
    }
  }, [pullStart, isRefreshing]);

  const handleTouchEnd = useCallback(() => {
    if (isRefreshing || pullDistance === 0) return;

    if (pullDistance > PULL_THRESHOLD) {
      setIsRefreshing(true);
      setPullDistance(PULL_THRESHOLD); // Keep the indicator visible while refreshing
      // Wait for the animation to show before executing the refresh action
      setTimeout(() => {
          onRefresh();
      }, 500);
    } else {
      // Not pulled enough, animate back to hidden
      setPullDistance(0);
    }
    setPullStart(null);
  }, [pullDistance, isRefreshing, onRefresh]);

  useEffect(() => {
    window.addEventListener('touchstart', handleTouchStart);
    // Setting passive to false is necessary to allow preventDefault in touchmove
    window.addEventListener('touchmove', handleTouchMove, { passive: false });
    window.addEventListener('touchend', handleTouchEnd);
    window.addEventListener('touchcancel', handleTouchEnd); // Also handle cancellation

    return () => {
      window.removeEventListener('touchstart', handleTouchStart);
      window.removeEventListener('touchmove', handleTouchMove);
      window.removeEventListener('touchend', handleTouchEnd);
      window.removeEventListener('touchcancel', handleTouchEnd);
    };
  }, [handleTouchStart, handleTouchMove, handleTouchEnd]);

  const rotation = Math.min(pullDistance / PULL_THRESHOLD * 180, 180);

  return (
    <div ref={containerRef} className="relative">
      <div
        className="absolute top-0 left-0 right-0 flex justify-center items-center text-primary-500 dark:text-primary-400"
        style={{
          transform: `translateY(${pullDistance - 50}px)`,
          height: '50px',
          opacity: isRefreshing ? 1 : Math.min(pullDistance / PULL_THRESHOLD, 1),
          transition: isRefreshing || pullStart !== null ? 'none' : 'transform 0.3s ease, opacity 0.3s ease'
        }}
        aria-hidden="true"
      >
        {isRefreshing ? (
          <svg className="animate-spin h-6 w-6" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
          </svg>
        ) : (
          <svg
            className="h-6 w-6"
            style={{ transform: `rotate(${rotation}deg)`, transition: 'transform 0.1s ease' }}
            xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 14l-7 7m0 0l-7-7m7 7V3" />
          </svg>
        )}
      </div>
      <div 
        style={{ 
          transform: `translateY(${isRefreshing ? PULL_THRESHOLD : pullDistance}px)`,
          transition: isRefreshing || pullStart !== null ? 'none' : 'transform 0.3s ease'
        }}
      >
        {children}
      </div>
    </div>
  );
};

export default PullToRefresh;
