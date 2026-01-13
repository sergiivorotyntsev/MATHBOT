import React from 'react';
import ReactDOM from 'react-dom/client';
import MathBotArena from './MathBotArena';
import { I18nProvider } from './i18n/context';
import { ErrorBoundary } from './components/ErrorBoundary';
import './index.css';

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <ErrorBoundary>
      <I18nProvider>
        <MathBotArena />
      </I18nProvider>
    </ErrorBoundary>
  </React.StrictMode>
);
