import React, { ReactNode } from 'react';

const PageWrapper: React.FC<{ children: ReactNode }> = ({ children }) => {
    return (
        <div className="page-fade-in">
            {children}
            <style>{`
                @keyframes fadeIn {
                    from { opacity: 0; transform: translateY(10px); }
                    to { opacity: 1; transform: translateY(0); }
                }
                .page-fade-in {
                    animation: fadeIn 0.5s ease-out forwards;
                }
            `}</style>
        </div>
    );
};

export default PageWrapper;
