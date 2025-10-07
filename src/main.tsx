import React, { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import { HelmetProvider } from 'react-helmet-async';
import App from './App';
import { ThemeProviderLocal } from './context/ThemeContext';
import { SessionProvider } from './context/SessionContext';
import './styles/index.scss';

// Start MSW in development only
async function startMSW() {
  if (typeof window !== 'undefined' && import.meta.env.DEV) {
    const { worker } = await import('./mocks/browser');
    await worker.start({ onUnhandledRequest: 'bypass' });
  }
}

startMSW().then(() => {
  createRoot(document.getElementById('root')!).render(
    <StrictMode>
      <HelmetProvider>
        <BrowserRouter>
          <ThemeProviderLocal>
            <SessionProvider>
              <App />
            </SessionProvider>
          </ThemeProviderLocal>
        </BrowserRouter>
      </HelmetProvider>
    </StrictMode>,
  );
});
