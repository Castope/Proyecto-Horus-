import { lazy, Suspense } from 'react'
import PageBoundary from './components/PageBoundary'
import { BrowserRouter, Routes, Route } from 'react-router-dom'
import { Toaster } from 'sonner'
import MainLayout from './layouts/MainLayout'
import Home            from './pages/Home'
import QuienesSomos    from './pages/QuienesSomos'
import Galeria         from './pages/Galeria'
import Market          from './pages/Market'
import Contactos       from './pages/Contactos'

import CableadoEstructurado  from './pages/tecnologias/CableadoEstructurado'
import CamarasSeguridad      from './pages/tecnologias/CamarasSeguridad'
import SoporteMantenimiento  from './pages/tecnologias/SoporteMantenimiento'

import Asesoramiento   from './pages/educacion/Asesoramiento'
import Capacitaciones  from './pages/educacion/Capacitaciones'
import Cursos          from './pages/educacion/Cursos'

import PoliticasCookies    from './pages/politicas/PoliticasCookies'
import PoliticasDevolucion from './pages/politicas/PoliticasDevolucion'
import PoliticasPrivacidad from './pages/politicas/PoliticasPrivacidad'
import PreguntasFrecuentes from './pages/politicas/PreguntasFrecuentes'
import LibroReclamaciones  from './pages/politicas/LibroReclamaciones'

import { AdminAuthProvider } from './panel/context/AdminAuthContext'
import AdminRoute from './panel/components/AdminRoute'
import AdminLogin from './panel/pages/AdminLogin'
import AdminRegister from './panel/pages/AdminRegister'
const AdminDashboard = lazy(() => import('./panel/pages/AdminDashboard'))
const AdminMessages = lazy(() => import('./panel/pages/AdminMessages'))

import NewsletterUnsubscribe from './pages/NewsletterUnsubscribe'
const AdminRecovery = lazy(() => import('./panel/pages/AdminRecovery'))
import CatalogoDetail from './pages/CatalogoDetail'
import Servicios from './pages/Servicios'
import NotFound from './pages/NotFound'

export default function App() {
  return (
    <AdminAuthProvider>
      <BrowserRouter>
        <Toaster richColors position="top-right" closeButton expand />
        <PageBoundary><Suspense fallback={<p role="status" style={{ padding: '2rem' }}>Cargando página…</p>}>
        <Routes>
          <Route element={<MainLayout />}>
            <Route path="/educacion/cursos/:id" element={<CatalogoDetail kind="cursos" />} />
            <Route path="/tecnologias/servicios/:id" element={<CatalogoDetail kind="servicios" />} />
            <Route path="/tecnologias/servicios" element={<Servicios />} />
            <Route path="/"                        element={<Home />} />
            <Route path="/quienes-somos"           element={<QuienesSomos />} />
            <Route path="/galeria"                 element={<Galeria />} />
            <Route path="/newsletter/baja" element={<NewsletterUnsubscribe />} />
            <Route path="/market"                  element={<Market />} />
            <Route path="/contactos"               element={<Contactos />} />

            <Route path="/tecnologias/cableado-estructurado"  element={<CableadoEstructurado />} />
            <Route path="/tecnologias/camaras-seguridad"      element={<CamarasSeguridad />} />
            <Route path="/tecnologias/soporte-mantenimiento"  element={<SoporteMantenimiento />} />

            <Route path="/educacion/asesoramiento"  element={<Asesoramiento />} />
            <Route path="/educacion/capacitaciones" element={<Capacitaciones />} />
            <Route path="/educacion/cursos"         element={<Cursos />} />

            <Route path="/politicas/cookies"           element={<PoliticasCookies />} />
            <Route path="/politicas/devolucion"        element={<PoliticasDevolucion />} />
            <Route path="/politicas/privacidad"        element={<PoliticasPrivacidad />} />
            <Route path="/preguntas-frecuentes"        element={<PreguntasFrecuentes />} />
            <Route path="/libro-reclamaciones"         element={<LibroReclamaciones />} />
          </Route>

          <Route path="/admin/forgot-password" element={<AdminRecovery />} />
          <Route path="/admin/reset-password" element={<AdminRecovery reset />} />
          <Route path="/admin/login" element={<AdminLogin />} />
          <Route path="/admin/register" element={<AdminRegister />} />

          <Route element={<AdminRoute />}>
            <Route path="/admin/dashboard" element={<AdminDashboard />} />
            <Route path="/admin/messages" element={<AdminMessages />} />
          </Route>

          <Route path="*" element={<NotFound />} />
        </Routes>
        </Suspense></PageBoundary>
      </BrowserRouter>
    </AdminAuthProvider>
  )
}
