import { createRoot } from 'react-dom/client'
import './index.css'
import { BrowserRouter, Route, Routes } from 'react-router-dom'
import Home from './pages/homepage'
import Dashboard from './pages/Dashboard'
import ProtectedRoute from './components/ProtectedRoute'
createRoot(document.getElementById('root')!).render(
  <BrowserRouter>
  <Routes>
  <Route path="/" element={<Home />} />
  <Route 
    path="/dashboard" 
    element={
      <ProtectedRoute>
        <Dashboard />
      </ProtectedRoute>
    } 
  />
</Routes>
</BrowserRouter>
)
