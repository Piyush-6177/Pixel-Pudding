import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import App from './App.jsx';
import { ThemeProvider } from './context/ThemeContext.jsx';
import { SoundProvider } from './context/SoundContext.jsx';
import { FavouritesProvider } from './context/FavouritesContext.jsx';
import './styles/tokens.css';
import './styles/global.css';

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <BrowserRouter>
      <ThemeProvider>
        <SoundProvider>
          <FavouritesProvider>
            <App />
          </FavouritesProvider>
        </SoundProvider>
      </ThemeProvider>
    </BrowserRouter>
  </React.StrictMode>,
);
