import { createContext, useContext, useState, useEffect } from 'react'
import supabase from '../lib/supabase'
import { initialProducts, initialIngredients, initialConfig } from '../utils/initialData'

const DataContext = createContext(null)

// ─── Mappers DB (snake_case) ↔ JS (camelCase) ────────────────────────────────

const toProduct = r => ({
  id: r.id,
  name: r.name,
  description: r.description,
  category: r.category,
  variants: r.variants ?? [],
  bolsitasXUd: r.bolsitas_x_ud ?? [],
  priceNote: r.price_note ?? '',
  minQuantity: r.min_quantity ?? 1,
  active: r.active ?? true,
  emoji: r.emoji ?? '',
})

const fromProduct = p => ({
  id: p.id,
  name: p.name,
  description: p.description,
  category: p.category,
  variants: p.variants ?? [],
  bolsitas_x_ud: p.bolsitasXUd ?? [],
  price_note: p.priceNote ?? '',
  min_quantity: p.minQuantity ?? 1,
  active: p.active ?? true,
  emoji: p.emoji ?? '',
})

const toIngredient = r => ({ id: r.id, name: r.name, inStock: r.in_stock ?? true })
const fromIngredient = i => ({ id: i.id, name: i.name, in_stock: i.inStock ?? true })

const toOrder = r => ({
  id: r.id,
  clientName: r.client_name,
  phone: r.phone,
  address: r.address,
  orderItems: r.order_items ?? [],
  deliveryDate: r.delivery_date ?? {},
  tags: r.tags ?? [],
  status: r.status,
  notes: r.notes,
  date: r.date,
})

const fromOrder = o => ({
  id: o.id,
  client_name: o.clientName,
  phone: o.phone,
  address: o.address,
  order_items: o.orderItems ?? [],
  delivery_date: o.deliveryDate ?? {},
  tags: o.tags ?? [],
  status: o.status,
  notes: o.notes,
  date: o.date,
})

const toConfig = r => ({
  whatsappNumber: r.whatsapp_number,
  businessName: r.business_name,
  tagline: r.tagline,
  description: r.description,
  instagramHandle: r.instagram_handle,
  instagramUrl: r.instagram_url,
  facebookUrl: r.facebook_url,
  sinTagline: r.sin_tagline,
})

const fromConfig = c => ({
  id: 1,
  whatsapp_number: c.whatsappNumber,
  business_name: c.businessName,
  tagline: c.tagline,
  description: c.description,
  instagram_handle: c.instagramHandle,
  instagram_url: c.instagramUrl,
  facebook_url: c.facebookUrl,
  sin_tagline: c.sinTagline,
})

// ─── Provider ─────────────────────────────────────────────────────────────────

export function DataProvider({ children }) {
  const [products, setProducts] = useState([])
  const [ingredients, setIngredients] = useState([])
  const [orders, setOrders] = useState([])
  const [config, setConfigState] = useState(initialConfig)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    async function load() {
      try {
        const [
          { data: prods, error: prodsErr },
          { data: ings, error: ingsErr },
          { data: ords },
          { data: cfg },
        ] = await Promise.all([
          supabase.from('products').select('*'),
          supabase.from('ingredients').select('*'),
          supabase.from('orders').select('*').order('date', { ascending: false }),
          supabase.from('config').select('*').eq('id', 1).maybeSingle(),
        ])

        if (prodsErr) throw prodsErr
        if (ingsErr) throw ingsErr

        if (prods.length === 0) {
          await supabase.from('products').upsert(initialProducts.map(fromProduct), { onConflict: 'id', ignoreDuplicates: true })
          setProducts(initialProducts)
        } else {
          setProducts(prods.map(toProduct))
        }

        if (ings.length === 0) {
          await supabase.from('ingredients').upsert(initialIngredients.map(fromIngredient), { onConflict: 'id', ignoreDuplicates: true })
          setIngredients(initialIngredients)
        } else {
          setIngredients(ings.map(toIngredient))
        }

        setOrders(ords ? ords.map(toOrder) : [])

        if (!cfg) {
          await supabase.from('config').upsert(fromConfig(initialConfig), { onConflict: 'id', ignoreDuplicates: true })
          setConfigState(initialConfig)
        } else {
          setConfigState(toConfig(cfg))
        }
      } catch (err) {
        console.error('Supabase load error:', err)
        setError(err.message ?? 'Error al conectar con la base de datos.')
      } finally {
        setLoading(false)
      }
    }
    load()
  }, [])

  // ─── Products ───────────────────────────────────────────────────────────────

  async function addProduct(product) {
    const newProd = { ...product, id: crypto.randomUUID() }
    setProducts(prev => [...prev, newProd])
    const { error } = await supabase.from('products').insert(fromProduct(newProd))
    if (error) console.error('addProduct:', error)
  }

  async function updateProduct(id, data) {
    setProducts(prev => prev.map(p => p.id === id ? { ...p, ...data } : p))
    const updated = products.find(p => p.id === id)
    if (updated) {
      const { error } = await supabase.from('products').update(fromProduct({ ...updated, ...data })).eq('id', id)
      if (error) console.error('updateProduct:', error)
    }
  }

  async function deleteProduct(id) {
    setProducts(prev => prev.filter(p => p.id !== id))
    const { error } = await supabase.from('products').delete().eq('id', id)
    if (error) console.error('deleteProduct:', error)
  }

  // ─── Ingredients ────────────────────────────────────────────────────────────

  async function addIngredient(ingredient) {
    const newIng = { ...ingredient, id: crypto.randomUUID() }
    setIngredients(prev => [...prev, newIng])
    const { error } = await supabase.from('ingredients').insert(fromIngredient(newIng))
    if (error) console.error('addIngredient:', error)
  }

  async function updateIngredient(id, data) {
    setIngredients(prev => prev.map(i => i.id === id ? { ...i, ...data } : i))
    const updated = ingredients.find(i => i.id === id)
    if (updated) {
      const { error } = await supabase.from('ingredients').update(fromIngredient({ ...updated, ...data })).eq('id', id)
      if (error) console.error('updateIngredient:', error)
    }
  }

  async function deleteIngredient(id) {
    setIngredients(prev => prev.filter(i => i.id !== id))
    const { error } = await supabase.from('ingredients').delete().eq('id', id)
    if (error) console.error('deleteIngredient:', error)
  }

  async function toggleIngredientStock(id) {
    const ing = ingredients.find(i => i.id === id)
    if (!ing) return
    const newStock = !ing.inStock
    setIngredients(prev => prev.map(i => i.id === id ? { ...i, inStock: newStock } : i))
    const { error } = await supabase.from('ingredients').update({ in_stock: newStock }).eq('id', id)
    if (error) console.error('toggleIngredientStock:', error)
  }

  // ─── Orders ─────────────────────────────────────────────────────────────────

  async function addOrder(order) {
    const newOrder = { ...order, id: crypto.randomUUID(), date: new Date().toISOString() }
    setOrders(prev => [newOrder, ...prev])
    const { error } = await supabase.from('orders').insert(fromOrder(newOrder))
    if (error) console.error('addOrder:', error)
  }

  async function updateOrder(id, data) {
    setOrders(prev => prev.map(o => o.id === id ? { ...o, ...data } : o))
    const updated = orders.find(o => o.id === id)
    if (updated) {
      const { error } = await supabase.from('orders').update(fromOrder({ ...updated, ...data })).eq('id', id)
      if (error) console.error('updateOrder:', error)
    }
  }

  async function deleteOrder(id) {
    setOrders(prev => prev.filter(o => o.id !== id))
    const { error } = await supabase.from('orders').delete().eq('id', id)
    if (error) console.error('deleteOrder:', error)
  }

  // ─── Config ─────────────────────────────────────────────────────────────────

  async function setConfig(newConfig) {
    setConfigState(newConfig)
    const { error } = await supabase.from('config').upsert(fromConfig(newConfig))
    if (error) console.error('setConfig:', error)
  }

  // ─── Loading / Error screens ─────────────────────────────────────────────────

  if (loading) {
    return (
      <div style={{
        height: '100vh', display: 'flex', flexDirection: 'column',
        alignItems: 'center', justifyContent: 'center', gap: '16px',
        color: 'var(--lilac-deep)', fontFamily: 'Cormorant Garamond, serif',
        fontSize: '1.2rem', fontStyle: 'italic',
      }}>
        <div style={{ fontSize: '2rem' }}>✿</div>
        Cargando…
      </div>
    )
  }

  if (error) {
    return (
      <div style={{
        height: '100vh', display: 'flex', flexDirection: 'column',
        alignItems: 'center', justifyContent: 'center', gap: '12px',
        color: '#c0392b', fontFamily: 'sans-serif', textAlign: 'center', padding: '24px',
      }}>
        <div style={{ fontSize: '2rem' }}>⚠️</div>
        <strong>Error de conexión</strong>
        <p style={{ fontSize: '0.9rem', color: '#666' }}>{error}</p>
        <p style={{ fontSize: '0.8rem', color: '#999' }}>
          Verificá que las variables VITE_SUPABASE_URL y VITE_SUPABASE_ANON_KEY en el archivo .env sean correctas.
        </p>
      </div>
    )
  }

  return (
    <DataContext.Provider value={{
      products, addProduct, updateProduct, deleteProduct,
      ingredients, addIngredient, updateIngredient, deleteIngredient, toggleIngredientStock,
      orders, addOrder, updateOrder, deleteOrder,
      config, setConfig,
    }}>
      {children}
    </DataContext.Provider>
  )
}

export function useData() {
  return useContext(DataContext)
}
