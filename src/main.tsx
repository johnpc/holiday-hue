import React from 'react';
import { createRoot } from 'react-dom/client';
import './lib/amplify';
import App from './App';
import { applyAppearance, readAppearance } from './features/settings/appearance';

// Apply the stored Light/Dark/System choice before first paint.
applyAppearance(readAppearance());

const container = document.getElementById('root');
const root = createRoot(container!);
root.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
);
