import './styles/index.css';

import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { ToastContainer } from 'react-toastify';

import App from '@/App';

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
    <ToastContainer position="top-right" autoClose={3000} />
  </StrictMode>
);
