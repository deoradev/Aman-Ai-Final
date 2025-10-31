import React from 'react';

interface TranscriptionBubbleProps {
    isUser: boolean;
    author: string;
    text: string;
    icon?: React.ReactNode;
}

const TranscriptionBubble: React.FC<TranscriptionBubbleProps> = ({ isUser, author, text, icon }) => {
    return (
        <div className={`flex items-start gap-3 ${isUser ? 'justify-end' : 'justify-start'} animate-fade-in`}>
            {!isUser && icon && (
                <div className="flex-shrink-0 w-8 h-8 rounded-full bg-primary-100 dark:bg-primary-900/50 flex items-center justify-center mt-1">
                    {icon}
                </div>
            )}
            <div className="flex flex-col items-start">
                 <span className={`text-xs px-2 mb-1 ${isUser ? 'self-end text-base-500 dark:text-base-400' : 'text-primary-600 dark:text-primary-400 font-semibold'}`}>
                    {author}
                </span>
                <div className={`px-4 py-2 rounded-2xl max-w-full shadow-sm ${isUser ? 'bg-base-800 dark:bg-base-600 text-white rounded-br-none' : 'bg-white dark:bg-base-700 text-base-800 dark:text-base-200 rounded-bl-none'}`}>
                    <p className="text-sm" style={{ whiteSpace: 'pre-wrap' }}>{text}</p>
                </div>
            </div>
             {isUser && icon && (
                <div className="flex-shrink-0 w-8 h-8 rounded-full bg-base-300 dark:bg-base-600 flex items-center justify-center mt-1">
                   {icon}
                </div>
            )}
        </div>
    );
};

export default TranscriptionBubble;
