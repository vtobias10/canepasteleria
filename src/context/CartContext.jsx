import { createContext, useContext, useState } from 'react'

const CartContext = createContext(null)

export function CartProvider({ children }) {
  const [cartItems, setCartItems] = useState([])

  function addToCart({ productId, productName, emoji, imageUrl, price, salePrice, quantity, variantSelections, bolsitasXUd }) {
    const id = `${productId}__${JSON.stringify(variantSelections || {})}__${bolsitasXUd || ''}`
    setCartItems(prev => {
      const existing = prev.find(item => item.id === id)
      if (existing) {
        return prev.map(item => item.id === id ? { ...item, quantity: item.quantity + quantity } : item)
      }
      return [...prev, { id, productId, productName, emoji, imageUrl, price, salePrice, quantity, variantSelections: variantSelections || {}, bolsitasXUd: bolsitasXUd || '' }]
    })
  }

  function removeFromCart(id) {
    setCartItems(prev => prev.filter(item => item.id !== id))
  }

  function updateQuantity(id, quantity) {
    if (quantity < 1) { removeFromCart(id); return }
    setCartItems(prev => prev.map(item => item.id === id ? { ...item, quantity } : item))
  }

  function clearCart() {
    setCartItems([])
  }

  const cartCount = cartItems.reduce((sum, item) => sum + item.quantity, 0)

  return (
    <CartContext.Provider value={{ cartItems, addToCart, removeFromCart, updateQuantity, clearCart, cartCount }}>
      {children}
    </CartContext.Provider>
  )
}

export function useCart() {
  return useContext(CartContext)
}
