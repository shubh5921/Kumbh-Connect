import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import {RouterProvider} from 'react-router-dom'
import { router } from './router.jsx'
import { Provider } from 'react-redux'
import store from './app/store.js'
import './index.css'
import 'leaflet/dist/leaflet.css';
import { NuqsAdapter } from 'nuqs/adapters/react-router'


createRoot(document.getElementById('root')).render(
  <StrictMode>
    <NuqsAdapter>
      <Provider store={store}>
          <RouterProvider router={router} />
      </Provider>
    </NuqsAdapter>
  </StrictMode>
)
