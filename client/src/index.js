import React from 'react';
import ReactDOM from 'react-dom/client';

import App from './App';
import reportWebVitals from './reportWebVitals';
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

// If you want to start measuring performance in your app, pass a function
// to log results (for example: reportWebVitals(console.log))
// or send to an analytics endpoint. Learn more: https://bit.ly/CRA-vitals
reportWebVitals();
