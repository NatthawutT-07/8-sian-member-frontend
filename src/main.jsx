import React from 'react';
import { createRoot } from 'react-dom/client';
import App from './app/App.jsx';
import './styles/global.css';
import './styles/compact.css';
import './styles/mobile.css';

createRoot(document.getElementById('root')).render(<App />);
