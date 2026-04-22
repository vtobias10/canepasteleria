import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { DataProvider } from './context/DataContext'
import { CartProvider } from './context/CartContext'
import HomePage from './pages/HomePage'
import ShopPage from './pages/ShopPage'
import AdminPage from './pages/AdminPage'
import Sparkles from './components/public/Sparkles'

export default function App() {
  return (
    <DataProvider>
      <CartProvider>
        <BrowserRouter>
          <Sparkles />
          <Routes>
            <Route path="/" element={<HomePage />} />
            <Route path="/carta" element={<ShopPage />} />
            <Route path="/canepasteleria-admin/*" element={<AdminPage />} />
            <Route path="*" element={<Navigate to="/" />} />
          </Routes>
        </BrowserRouter>
      </CartProvider>
    </DataProvider>
  )
}