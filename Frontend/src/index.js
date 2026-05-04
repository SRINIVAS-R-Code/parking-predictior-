import React from 'react';
import ReactDOM from 'react-dom/client';
// Bootstrap first
import "bootstrap/dist/css/bootstrap.min.css";
import "bootstrap/dist/js/bootstrap.bundle.min";
import 'leaflet/dist/leaflet.css';
// Our theme LAST (overrides Bootstrap)
import './index.css';
import './css/global.css';
import App from './App';
import reportWebVitals from './reportWebVitals';
import { Provider } from 'react-redux';
import { PersistGate } from 'redux-persist/integration/react';
import { store, persistor } from './store';

// Clear saved session on every page load — user must always sign in fresh
persistor.purge();

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <React.StrictMode>
    <Provider store={store}>
      <PersistGate loading={null} persistor={persistor}>
        <App />
      </PersistGate>
    </Provider>
  </React.StrictMode>
);

reportWebVitals();
