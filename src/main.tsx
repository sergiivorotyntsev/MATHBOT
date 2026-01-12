import React from 'react';
import ReactDOM from 'react-dom/client';
import MathBotArena from './MathBotArena';
import { I18nProvider } from './i18n/context';
import './index.css';

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <I18nProvider>
      <MathBotArena />
    </I18nProvider>
  </React.StrictMode>
);
