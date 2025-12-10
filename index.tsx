import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './Aman-Ai--main/App';

// Global error handling for issues outside of React's scope
window.addEventListener('error', (event) => {
  console.error('Global error:', {
    message: event.message,
    filename: event.filename,
    lineno: event.lineno,
    colno: event.colno,
    error: event.error
  });
});

window.addEventListener('unhandledrejection', (event) => {
  console.error('Unhandled promise rejection:', {
    reason: event.reason
  });
});

// --- Service Worker Registration ---
if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    // Use a relative path. In standard deployments, this resolves correctly.
    // In preview environments, cross-origin restrictions often block SWs.
    const swUrl = './service-worker.js';
    
    navigator.serviceWorker.register(swUrl)
      .then(registration => {
        console.log('ServiceWorker registration successful with scope: ', registration.scope);
      })
      .catch(error => {
        // Handle common environment-specific errors gracefully.
        // "Script origin" errors occur when the SW file is served from a different origin 
        // or when running in a null-origin iframe (common in online code editors).
        if (error.message.includes('Script origin') || error.message.includes('MIME type')) {
            console.info('ServiceWorker functionality disabled: Environment restriction (Script origin/MIME type). This is normal in preview mode.');
        } else {
             console.warn('ServiceWorker registration failed:', error);
        }
      });
  });
}
// ---------------------------------


const rootElement = document.getElementById('root');
if (!rootElement) {
  throw new Error("Could not find root element to mount to");
}

const root = ReactDOM.createRoot(rootElement);
root.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);