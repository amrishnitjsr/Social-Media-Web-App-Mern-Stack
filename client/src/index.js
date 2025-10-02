import React from 'react';
import ReactDOM from 'react-dom/client';

import App from './App';
import { Provider } from 'react-redux';
import store from './store/ReduxStore.js';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import GoogleAuthProvider from './Components/Auth/GoogleAuthProvider';
import MantineWrapper from './Components/MantineWrapper';

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <React.StrictMode>
    <MantineWrapper>
      <GoogleAuthProvider>
        <Provider store={store}>

          <BrowserRouter>
            <Routes>
              <Route path='*' element= {<App />} />
            </Routes>
          </BrowserRouter>

        </Provider>
      </GoogleAuthProvider>
    </MantineWrapper>
  </React.StrictMode>
);
