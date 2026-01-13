
import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App.tsx';
// import './lib/i18n.ts'; // Initialize i18n service before rendering - Moved to App.tsx for better lifecycle control

const rootElement = document.getElementById('root');
if (!rootElement) {
  throw new Error("Elemento raiz 'root' não encontrado no DOM. Verifique o index.html.");
}

const root = ReactDOM.createRoot(rootElement);
root.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);