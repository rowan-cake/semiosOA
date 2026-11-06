import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.tsx'
import FieldDetail from './FieldDetail.tsx'

const fieldRoute = window.location.pathname.match(/^\/fields\/([^/]+)\/?$/)

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    {fieldRoute ? <FieldDetail fieldId={fieldRoute[1]} /> : <App />}
  </StrictMode>,
)
