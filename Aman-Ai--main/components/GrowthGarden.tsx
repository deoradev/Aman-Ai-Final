import React from 'react';
import { useLocalization } from '../hooks/useLocalization';

interface GrowthGardenProps {
  day: number;
  journalStreak: number;
  completedChallenges: number;
}

const MAX_STEM_HEIGHT = 80;
const MAX_LEAVES = 20;

const GrowthGarden: React.FC<GrowthGardenProps> = ({ day, journalStreak, completedChallenges }) => {
  const { t } = useLocalization();
  const stemHeight = Math.max(10, (day / 90) * MAX_STEM_HEIGHT);
  const numLeaves = Math.min(Math.floor(completedChallenges / 2), MAX_LEAVES);
  const numFlowers = Math.min(Math.floor(journalStreak / 7), 5);

  const leaves = Array.from({ length: numLeaves }).map((_, i) => {
    const y = 85 - (i / numLeaves) * stemHeight * 0.9;
    const x = i % 2 === 0 ? 45 : 55;
    const scale = i % 2 === 0 ? '-1, 1' : '1, 1';
    const rotation = i % 2 === 0 ? -20 : 20;
    return (
      <path
        key={i}
        d="M50 85 C 40 70, 40 60, 50 50"
        fill="#22c55e"
        stroke="#16a34a"
        strokeWidth="0.5"
        transform={`translate(${x - 50}, ${y - 85}) scale(${scale}) rotate(${rotation}, 50, 85)`}
        style={{ transformOrigin: '50% 85%', transition: 'all 0.5s ease-out', transitionDelay: `${i * 50}ms` }}
      />
    );
  });

  const flowers = Array.from({ length: numFlowers }).map((_, i) => {
    const angle = (i / numFlowers) * 360 + (day * 2);
    const radius = 10;
    const cx = 50 + radius * Math.cos(angle * Math.PI / 180);
    const cy = 10 + radius * Math.sin(angle * Math.PI / 180);

    return (
        <g key={i} transform={`translate(${cx - 50}, ${cy - 10})`} style={{ transformOrigin: '50% 10%', transition: 'all 0.5s ease-out' }}>
            <circle cx="50" cy="10" r="4" fill="#fde047" />
            <circle cx="50" cy="10" r="2" fill="#f59e0b" />
        </g>
    )
  });

  return (
    <div className="flex items-center justify-center h-48 w-full" aria-label={`Growth Garden. Program day ${day}, ${completedChallenges} challenges completed, ${journalStreak} day journal streak.`}>
      <svg viewBox="0 0 100 100" className="w-full h-full">
        {/* Pot */}
        <g>
          <title>{t('dashboard.garden.pot_tooltip')}</title>
          <path d="M30 90 L 25 100 H 75 L 70 90 Z" fill="#a16207" />
          <path d="M25 88 H 75 V 92 H 25 Z" fill="#ca8a04" />
        </g>

        {/* Stem */}
        <g>
          <title>{t('dashboard.garden.stem_tooltip', { day: day })}</title>
          <line
            x1="50"
            y1="90"
            x2="50"
            y2={90 - stemHeight}
            stroke="#16a34a"
            strokeWidth="3"
            strokeLinecap="round"
            style={{ transition: 'y2 0.5s ease-out' }}
          />
        </g>
        
        {/* Leaves */}
        <g>
          <title>{t('dashboard.garden.leaves_tooltip', { count: completedChallenges })}</title>
          {leaves}
        </g>

        {/* Flowers */}
        <g transform={`translate(0, ${88 - stemHeight})`}>
          <title>{t('dashboard.garden.flowers_tooltip', { count: journalStreak })}</title>
          {flowers}
        </g>
      </svg>
    </div>
  );
};

export default GrowthGarden;