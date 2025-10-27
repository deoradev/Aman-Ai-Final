import React from 'react';

interface SimpleMarkdownRendererProps {
    content: string;
}

const SimpleMarkdownRenderer: React.FC<SimpleMarkdownRendererProps> = ({ content }) => {
    const lines = content.split('\n').filter(line => line.trim() !== '');

    const renderLine = (line: string, index: number) => {
        // Bolded Heading (entire line is bold)
        if (line.startsWith('**') && line.endsWith('**')) {
            return <h3 key={index} className="text-lg font-bold text-primary-500 dark:text-primary-400 my-2">{line.substring(2, line.length - 2)}</h3>;
        }

        // Unordered list item
        if (line.trim().startsWith('* ') || line.trim().startsWith('- ')) {
            return <li key={index} className="ml-5 list-disc">{line.trim().substring(2)}</li>;
        }

        // Numbered list item
        const numberedMatch = line.trim().match(/^(\d+)\.\s(.+)/);
        if (numberedMatch) {
            return <li key={index} className="ml-5" value={parseInt(numberedMatch[1], 10)}>{numberedMatch[2]}</li>;
        }

        // Default paragraph
        return <p key={index} className="my-1">{line}</p>;
    };
    
    const elements: React.ReactNode[] = [];
    let currentList: { type: 'ul' | 'ol'; items: React.ReactNode[] } | null = null;
    
    lines.forEach((line, index) => {
        const isUnordered = line.trim().startsWith('* ') || line.trim().startsWith('- ');
        const isOrdered = !!line.trim().match(/^(\d+)\.\s(.+)/);
        
        if (isUnordered) {
            if (currentList?.type !== 'ul') {
                if (currentList) elements.push(<ul key={`list-${index-1}`} className="space-y-1">{currentList.items}</ul>);
                currentList = { type: 'ul', items: [] };
            }
            currentList.items.push(renderLine(line, index));
        } else if (isOrdered) {
            if (currentList?.type !== 'ol') {
                 if (currentList) elements.push(<ol key={`list-${index-1}`} className="space-y-1">{currentList.items}</ol>);
                currentList = { type: 'ol', items: [] };
            }
            currentList.items.push(renderLine(line, index));
        } else {
            if (currentList) {
                if(currentList.type === 'ul') elements.push(<ul key={`list-${index-1}`} className="space-y-1 my-2">{currentList.items}</ul>);
                if(currentList.type === 'ol') elements.push(<ol key={`list-${index-1}`} className="space-y-1 my-2 list-decimal">{currentList.items}</ol>);
                currentList = null;
            }
            elements.push(renderLine(line, index));
        }
    });

    if (currentList) {
        if(currentList.type === 'ul') elements.push(<ul key={`list-end`} className="space-y-1 my-2">{currentList.items}</ul>);
        if(currentList.type === 'ol') elements.push(<ol key={`list-end`} className="space-y-1 my-2 list-decimal">{currentList.items}</ol>);
    }


    return <div className="prose prose-sm md:prose-base max-w-none text-base-800 dark:text-base-200">{elements}</div>;
};

export default SimpleMarkdownRenderer;