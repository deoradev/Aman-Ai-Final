import React, { memo } from 'react';

interface ProfessionalHelpCardProps {
  title: string;
  description: string;
  link?: string;
  onClick?: () => void;
  icon: React.ReactNode;
}

const ProfessionalHelpCard: React.FC<ProfessionalHelpCardProps> = ({ title, description, link, onClick, icon }) => {
  const commonClasses = "group flex items-start gap-4 p-4 bg-base-100 dark:bg-base-700/50 rounded-xl hover:bg-primary-100 dark:hover:bg-primary-900/40 hover:ring-2 hover:ring-primary-400 transition-all transform hover:scale-[1.02] text-left w-full";
  
  const content = (
      <>
        <div className="flex-shrink-0 text-primary-500 text-2xl mt-1">{icon}</div>
        <div>
          <h3 className="font-bold text-lg text-base-800 dark:text-base-100 group-hover:text-primary-600 dark:group-hover:text-primary-300 transition-colors">{title}</h3>
          <p className="text-sm text-base-600 dark:text-base-400">{description}</p>
        </div>
      </>
  );

  if (link && link !== "#") {
      return (
        <a href={link} target="_blank" rel="noopener noreferrer" className={commonClasses}>
            {content}
        </a>
      );
  }
  
  return (
    <button onClick={onClick} className={commonClasses}>
        {content}
    </button>
  );
};

export default memo(ProfessionalHelpCard);