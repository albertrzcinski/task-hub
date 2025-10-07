import React from 'react';
import { createRoot } from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import { HelmetProvider } from 'react-helmet-async';
import App from './App';
import { ThemeProviderLocal } from './context/ThemeContext';
import { SessionProvider } from './context/SessionContext';
// Start MSW in development only
if (typeof window !== 'undefined' && import.meta.env.DEV) {
  import('./mocks/browser').then(({ worker }) => {
    worker.start({ onUnhandledRequest: 'bypass' });
  });
}
import './styles/index.scss';

const container = document.getElementById('root');
if (!container) throw new Error('Root element not found');
const root = createRoot(container);

root.render(
  <React.StrictMode>
    <HelmetProvider>
      <BrowserRouter>
        <ThemeProviderLocal>
          <SessionProvider>
            <App />
          </SessionProvider>
        </ThemeProviderLocal>
      </BrowserRouter>
    </HelmetProvider>
  </React.StrictMode>,
);
