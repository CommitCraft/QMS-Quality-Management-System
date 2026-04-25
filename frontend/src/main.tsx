import React from 'react';
import ReactDOM from 'react-dom/client';
import { Toaster } from 'react-hot-toast';
import { BrowserRouter } from 'react-router-dom';
import App from './App';
import './index.css';
import { AuthProvider } from './context/AuthContext';
import { CompanyProfileProvider } from './context/CompanyProfileContext';

ReactDOM.createRoot(document.getElementById('root') as HTMLElement).render(
  <React.StrictMode>
    <BrowserRouter>
      <CompanyProfileProvider>
        <AuthProvider>
          <App />
          <Toaster position="top-right" toastOptions={{ style: { background: '#1e2731', color: '#f4f7fa' } }} />
        </AuthProvider>
      </CompanyProfileProvider>
    </BrowserRouter>
  </React.StrictMode>,
);
