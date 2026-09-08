import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import './styles/global.css'
import './styles/loader.css'
import './styles/home.css'
import './styles/quienes-somos.css'
import './styles/galeria.css'
import './styles/market.css'
import './styles/contactos.css'
import './styles/educacion.css'
import './styles/cableado.css'
import './styles/camaras.css'
import './styles/soporte.css'
import './styles/libro-reclamaciones.css'
import './styles/policies.css'
import './styles/responsive-fixes.css'
import './styles/visual-upgrades.css'
import './panel/styles/admin-auth.css'
import './panel/styles/admin-dashboard.css'
import App from './App'

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
