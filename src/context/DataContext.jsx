import { createContext, useContext, useEffect, useState } from 'react'
import supabase from '../lib/supabase'
import { initialConfig } from '../utils/initialData'

const DataContext = createContext(null)

const toNumberOrNull = (value) => {
  if (value === '' || value === null || value === undefined) return null
  const num = Number(value)
  return Number.isFinite(num) ? num : null
}

const toPositiveIntOrNull = (value) => {
  const num = Number(value)
  if (!Number.isFinite(num)) return null
  const integer = Math.floor(num)
  return integer > 0 ? integer : null
}

const normalizeSalePrice = (value) => {
  const amount = toNumberOrNull(value)
  if (amount === null || amount <= 0) return null
  return amount
}

const normalizeCategoryName = (value) => (value ?? '').toString().trim()
const categoryKey = (name) => normalizeCategoryName(name).toLowerCase()
const sortByCategoryName = (a, b) => a.name.localeCompare(b.name, 'es', { sensitivity: 'base' })

const toProduct = (row) => ({
  id: row.id,
  name: row.name,
  description: row.description,
  category: row.category,
  sortOrder: toPositiveIntOrNull(row.sort_order),
  variants: row.variants ?? [],
  bolsitasXUd: row.bolsitas_x_ud ?? [],
  price: toNumberOrNull(row.price),
  salePrice: normalizeSalePrice(row.sale_price),
  priceNote: row.price_note ?? '',
  minQuantity: row.min_quantity ?? 1,
  active: row.active ?? true,
  emoji: row.emoji ?? '',
})

const fromProduct = (product) => ({
  id: product.id,
  name: product.name,
  description: product.description,
  category: product.category,
  sort_order: toPositiveIntOrNull(product.sortOrder),
  variants: product.variants ?? [],
  bolsitas_x_ud: product.bolsitasXUd ?? [],
  price: toNumberOrNull(product.price),
  sale_price: normalizeSalePrice(product.salePrice),
  price_note: product.priceNote ?? '',
  min_quantity: product.minQuantity ?? 1,
  active: product.active ?? true,
  emoji: product.emoji ?? '',
})

const stripOptionalProductFields = (payload) => {
  const { price, sale_price, sort_order, ...rest } = payload
  return rest
}

function stripMissingProductFields(payload, errorMessage = '') {
  const message = String(errorMessage || '').toLowerCase()

  if (!message) return stripOptionalProductFields(payload)

  const missingPrice = message.includes('price') && !message.includes('sale_price')
  const missingSalePrice = message.includes('sale_price')
  const missingSortOrder = message.includes('sort_order')

  if (missingPrice && missingSalePrice && missingSortOrder) {
    const { price, sale_price, sort_order, ...rest } = payload
    return rest
  }

  if (missingPrice && missingSalePrice) {
    const { price, sale_price, ...rest } = payload
    return rest
  }

  if (missingSalePrice) {
    const { sale_price, ...rest } = payload
    return rest
  }

  if (missingPrice) {
    const { price, ...rest } = payload
    return rest
  }

  if (missingSortOrder) {
    const { sort_order, ...rest } = payload
    return rest
  }

  return stripOptionalProductFields(payload)
}

const toIngredient = (row) => ({
  id: row.id,
  name: row.name,
  inStock: row.in_stock ?? true,
  sortOrder: toPositiveIntOrNull(row.sort_order),
})

const fromIngredient = (ingredient) => ({
  id: ingredient.id,
  name: ingredient.name,
  in_stock: ingredient.inStock ?? true,
  sort_order: toPositiveIntOrNull(ingredient.sortOrder),
})

function stripMissingIngredientFields(payload, errorMessage = '') {
  const message = String(errorMessage || '').toLowerCase()
  if (!message.includes('sort_order')) return payload
  const { sort_order, ...rest } = payload
  return rest
}

const toOrder = (row) => ({
  id: row.id,
  customerName: row.customer_name ?? row.client_name ?? '',
  phone: row.phone,
  address: row.address,
  orderItems: row.order_items ?? [],
  deliveryDate: row.delivery_date ?? {},
  tags: row.tags ?? [],
  status: row.status,
  notes: row.notes,
  date: row.date,
})

const fromOrder = (order) => ({
  id: order.id,
  client_name: order.customerName ?? order.clientName ?? '',
  phone: order.phone,
  address: order.address,
  order_items: order.orderItems ?? [],
  delivery_date: order.deliveryDate ?? {},
  tags: order.tags ?? [],
  status: order.status,
  notes: order.notes,
  date: order.date,
})

const toConfig = (row) => ({
  whatsappNumber: row.whatsapp_number,
  businessName: row.business_name,
  tagline: row.tagline,
  description: row.description,
  instagramHandle: row.instagram_handle,
  instagramUrl: row.instagram_url,
  facebookUrl: row.facebook_url,
  sinTagline: row.sin_tagline,
  socialLinks: row.social_links ?? [],
  logoUrl: row.logo_url ?? '/logo.jpeg',
  footerNote: row.footer_note ?? 'Hecho con amor',
  orderMessageTexts: row.order_message_texts ?? initialConfig.orderMessageTexts,
})

const fromConfig = (config) => ({
  id: 1,
  whatsapp_number: config.whatsappNumber,
  business_name: config.businessName,
  tagline: config.tagline,
  description: config.description,
  instagram_handle: config.instagramHandle,
  instagram_url: config.instagramUrl,
  facebook_url: config.facebookUrl,
  sin_tagline: config.sinTagline,
  social_links: config.socialLinks ?? [],
  logo_url: config.logoUrl ?? '/logo.jpeg',
  footer_note: config.footerNote ?? 'Hecho con amor',
  order_message_texts: config.orderMessageTexts ?? initialConfig.orderMessageTexts,
})

const stripOptionalConfigFields = (payload) => {
  const { order_message_texts, ...rest } = payload
  return rest
}

function stripMissingConfigFields(payload, errorMessage = '') {
  const message = String(errorMessage || '').toLowerCase()
  if (message.includes('order_message_texts')) {
    const { order_message_texts, ...rest } = payload
    return rest
  }
  return stripOptionalConfigFields(payload)
}

const toCategory = (row) => ({
  id: row.id,
  name: normalizeCategoryName(row.name),
})

function mergeCategoryLists(...lists) {
  const byName = new Map()

  lists.flat().forEach((item) => {
    const category = typeof item === 'string' ? { name: item } : item
    const name = normalizeCategoryName(category?.name)
    if (!name) return
    const key = categoryKey(name)
    if (!byName.has(key)) {
      byName.set(key, { id: category?.id || crypto.randomUUID(), name })
    }
  })

  return Array.from(byName.values()).sort(sortByCategoryName)
}

function deriveCategoriesFromProducts(productsList) {
  return mergeCategoryLists(
    (productsList || []).map(product => ({ name: normalizeCategoryName(product.category) })),
  )
}

function normalizeSortOrder(list) {
  return list.map((item, index) => ({
    ...item,
    sortOrder: index + 1,
  }))
}

function moveByDirection(list, id, direction) {
  const currentIndex = list.findIndex(item => item.id === id)
  if (currentIndex === -1) return null

  const targetIndex = direction === 'up' ? currentIndex - 1 : currentIndex + 1
  if (targetIndex < 0 || targetIndex >= list.length) return null

  const next = [...list]
  const [moved] = next.splice(currentIndex, 1)
  next.splice(targetIndex, 0, moved)
  return normalizeSortOrder(next)
}

function reorderByIds(list, orderedIds) {
  const byId = new Map(list.map(item => [item.id, item]))
  const next = []

  orderedIds.forEach((id) => {
    const item = byId.get(id)
    if (item) {
      next.push(item)
      byId.delete(id)
    }
  })

  byId.forEach((item) => next.push(item))
  return normalizeSortOrder(next)
}

async function persistSortOrder(table, list) {
  const updates = await Promise.all(
    list.map(item => (
      supabase.from(table).update({ sort_order: item.sortOrder }).eq('id', item.id)
    )),
  )

  updates.forEach(({ error }) => {
    if (error) console.error(`persistSortOrder(${table}):`, error)
  })
}

export function DataProvider({ children }) {
  const [products, setProducts] = useState([])
  const [categories, setCategories] = useState([])
  const [ingredients, setIngredients] = useState([])
  const [orders, setOrders] = useState([])
  const [config, setConfigState] = useState(initialConfig)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    async function load() {
      try {
        const [
          { data: productsRows, error: productsErr },
          { data: ingredientsRows, error: ingredientsErr },
          { data: ordersRows },
          { data: configRow },
          { data: categoriesRows, error: categoriesErr },
        ] = await Promise.all([
          supabase.from('products').select('*'),
          supabase.from('ingredients').select('*'),
          supabase.from('orders').select('*').order('date', { ascending: false }),
          supabase.from('config').select('*').eq('id', 1).maybeSingle(),
          supabase.from('categories').select('*'),
        ])

        if (productsErr) throw productsErr
        if (ingredientsErr) throw ingredientsErr

        const mappedProducts = normalizeSortOrder(
          (productsRows || [])
            .map(toProduct)
            .sort((a, b) => (a.sortOrder ?? Number.MAX_SAFE_INTEGER) - (b.sortOrder ?? Number.MAX_SAFE_INTEGER)),
        )
        const mappedIngredients = normalizeSortOrder(
          (ingredientsRows || [])
            .map(toIngredient)
            .sort((a, b) => (a.sortOrder ?? Number.MAX_SAFE_INTEGER) - (b.sortOrder ?? Number.MAX_SAFE_INTEGER)),
        )
        const persistedCategories = categoriesErr ? [] : (categoriesRows || []).map(toCategory)
        const derivedCategories = deriveCategoriesFromProducts(mappedProducts)

        setProducts(mappedProducts)
        setCategories(mergeCategoryLists(persistedCategories, derivedCategories))
        setIngredients(mappedIngredients)
        setOrders((ordersRows || []).map(toOrder))
        setConfigState(configRow ? toConfig(configRow) : initialConfig)

        if (categoriesErr) {
          console.warn('categories load fallback:', categoriesErr.message)
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

  async function addProduct(product) {
    const maxOrder = products.reduce((max, item) => Math.max(max, item.sortOrder || 0), 0)
    const newProduct = { ...product, id: crypto.randomUUID(), sortOrder: maxOrder + 1 }
    setProducts(prev => [...prev, newProduct])

    const payload = fromProduct(newProduct)
    let { error: insertError } = await supabase.from('products').insert(payload)

    if (insertError) {
      const fallbackPayload = stripMissingProductFields(payload, insertError.message)
      const fallback = await supabase.from('products').insert(fallbackPayload)
      insertError = fallback.error
    }

    if (insertError) console.error('addProduct:', insertError)
  }

  async function updateProduct(id, data) {
    setProducts(prev => prev.map(product => (product.id === id ? { ...product, ...data } : product)))
    const existing = products.find(product => product.id === id)
    if (!existing) return

    const payload = fromProduct({ ...existing, ...data })
    let { error: updateError } = await supabase.from('products').update(payload).eq('id', id)

    if (updateError) {
      const fallbackPayload = stripMissingProductFields(payload, updateError.message)
      const fallback = await supabase.from('products').update(fallbackPayload).eq('id', id)
      updateError = fallback.error
    }

    if (updateError) console.error('updateProduct:', updateError)
  }

  async function deleteProduct(id) {
    let reordered = []
    setProducts(prev => {
      reordered = normalizeSortOrder(prev.filter(product => product.id !== id))
      return reordered
    })
    const { error: deleteError } = await supabase.from('products').delete().eq('id', id)
    if (deleteError) console.error('deleteProduct:', deleteError)
    if (reordered.length > 0) {
      await persistSortOrder('products', reordered)
    }
  }

  async function moveProduct(id, direction) {
    let reordered = null
    setProducts(prev => {
      reordered = moveByDirection(prev, id, direction)
      return reordered || prev
    })
    if (!reordered) return
    await persistSortOrder('products', reordered)
  }

  async function reorderProducts(orderedIds) {
    let reordered = null
    setProducts(prev => {
      reordered = reorderByIds(prev, orderedIds)
      return reordered
    })
    if (!reordered) return
    await persistSortOrder('products', reordered)
  }

  async function addCategory(category) {
    const name = normalizeCategoryName(category?.name)
    if (!name) return

    const newCategory = { id: crypto.randomUUID(), name }
    setCategories(prev => mergeCategoryLists(prev, [newCategory]))

    const { error: insertError } = await supabase.from('categories').insert({
      id: newCategory.id,
      name: newCategory.name,
    })

    if (insertError) console.error('addCategory:', insertError)
  }

  async function updateCategory(id, data) {
    const existingCategory = categories.find(category => category.id === id)
    if (!existingCategory) return

    const nextName = normalizeCategoryName(data?.name)
    if (!nextName) return

    setCategories(prev => mergeCategoryLists(
      prev.map(category => (category.id === id ? { ...category, name: nextName } : category)),
    ))

    const previousKey = categoryKey(existingCategory.name)
    const nextKey = categoryKey(nextName)
    const nameChanged = previousKey !== nextKey
    const impactedProducts = nameChanged
      ? products.filter(product => categoryKey(product.category) === previousKey)
      : []

    if (impactedProducts.length > 0) {
      setProducts(prev => prev.map(product => (
        categoryKey(product.category) === previousKey
          ? { ...product, category: nextName }
          : product
      )))
    }

    const { error: updateError } = await supabase.from('categories').update({ name: nextName }).eq('id', id)
    if (updateError) console.error('updateCategory:', updateError)

    if (impactedProducts.length > 0) {
      const categoryUpdates = await Promise.all(
        impactedProducts.map(product => (
          supabase.from('products').update({ category: nextName }).eq('id', product.id)
        )),
      )

      categoryUpdates.forEach(({ error: categoryError }) => {
        if (categoryError) console.error('updateCategory->productSync:', categoryError)
      })
    }
  }

  async function deleteCategory(id) {
    const categoryToDelete = categories.find(category => category.id === id)
    if (!categoryToDelete) return

    const targetKey = categoryKey(categoryToDelete.name)
    const impactedProducts = products.filter(product => categoryKey(product.category) === targetKey)

    setCategories(prev => prev.filter(category => category.id !== id))

    if (impactedProducts.length > 0) {
      setProducts(prev => prev.map(product => (
        categoryKey(product.category) === targetKey
          ? { ...product, category: '' }
          : product
      )))
    }

    const { error: deleteError } = await supabase.from('categories').delete().eq('id', id)
    if (deleteError) console.error('deleteCategory:', deleteError)

    if (impactedProducts.length > 0) {
      const productUpdates = await Promise.all(
        impactedProducts.map(product => (
          supabase.from('products').update({ category: '' }).eq('id', product.id)
        )),
      )

      productUpdates.forEach(({ error: productError }) => {
        if (productError) console.error('deleteCategory->productSync:', productError)
      })
    }
  }

  async function addIngredient(ingredient) {
    const maxOrder = ingredients.reduce((max, item) => Math.max(max, item.sortOrder || 0), 0)
    const newIngredient = { ...ingredient, id: crypto.randomUUID(), sortOrder: maxOrder + 1 }
    setIngredients(prev => [...prev, newIngredient])
    const payload = fromIngredient(newIngredient)
    let { error: addError } = await supabase.from('ingredients').insert(payload)
    if (addError) {
      const fallback = await supabase.from('ingredients').insert(stripMissingIngredientFields(payload, addError.message))
      addError = fallback.error
    }
    if (addError) console.error('addIngredient:', addError)
  }

  async function updateIngredient(id, data) {
    setIngredients(prev => prev.map(ingredient => (ingredient.id === id ? { ...ingredient, ...data } : ingredient)))
    const existing = ingredients.find(ingredient => ingredient.id === id)
    if (!existing) return
    const payload = fromIngredient({ ...existing, ...data })
    let { error: updateError } = await supabase
      .from('ingredients')
      .update(payload)
      .eq('id', id)
    if (updateError) {
      const fallback = await supabase
        .from('ingredients')
        .update(stripMissingIngredientFields(payload, updateError.message))
        .eq('id', id)
      updateError = fallback.error
    }
    if (updateError) console.error('updateIngredient:', updateError)
  }

  async function deleteIngredient(id) {
    let reordered = []
    setIngredients(prev => {
      reordered = normalizeSortOrder(prev.filter(ingredient => ingredient.id !== id))
      return reordered
    })
    const { error: deleteError } = await supabase.from('ingredients').delete().eq('id', id)
    if (deleteError) console.error('deleteIngredient:', deleteError)
    if (reordered.length > 0) {
      await persistSortOrder('ingredients', reordered)
    }
  }

  async function moveIngredient(id, direction) {
    let reordered = null
    setIngredients(prev => {
      reordered = moveByDirection(prev, id, direction)
      return reordered || prev
    })
    if (!reordered) return
    await persistSortOrder('ingredients', reordered)
  }

  async function reorderIngredients(orderedIds) {
    let reordered = null
    setIngredients(prev => {
      reordered = reorderByIds(prev, orderedIds)
      return reordered
    })
    if (!reordered) return
    await persistSortOrder('ingredients', reordered)
  }

  async function toggleIngredientStock(id) {
    const ingredient = ingredients.find(item => item.id === id)
    if (!ingredient) return
    const nextStock = !ingredient.inStock
    setIngredients(prev => prev.map(item => (item.id === id ? { ...item, inStock: nextStock } : item)))
    const { error: toggleError } = await supabase.from('ingredients').update({ in_stock: nextStock }).eq('id', id)
    if (toggleError) console.error('toggleIngredientStock:', toggleError)
  }

  async function addOrder(order) {
    const newOrder = { ...order, id: crypto.randomUUID(), date: new Date().toISOString() }
    setOrders(prev => [newOrder, ...prev])
    const { error: addError } = await supabase.from('orders').insert(fromOrder(newOrder))
    if (addError) console.error('addOrder:', addError)
  }

  async function updateOrder(id, data) {
    setOrders(prev => prev.map(order => (order.id === id ? { ...order, ...data } : order)))
    const existing = orders.find(order => order.id === id)
    if (!existing) return
    const { error: updateError } = await supabase
      .from('orders')
      .update(fromOrder({ ...existing, ...data }))
      .eq('id', id)
    if (updateError) console.error('updateOrder:', updateError)
  }

  async function deleteOrder(id) {
    setOrders(prev => prev.filter(order => order.id !== id))
    const { error: deleteError } = await supabase.from('orders').delete().eq('id', id)
    if (deleteError) console.error('deleteOrder:', deleteError)
  }

  async function setConfig(newConfig) {
    setConfigState(newConfig)
    const payload = fromConfig(newConfig)
    let { error: saveError } = await supabase.from('config').upsert(payload)

    if (saveError) {
      const fallbackPayload = stripMissingConfigFields(payload, saveError.message)
      const fallback = await supabase.from('config').upsert(fallbackPayload)
      saveError = fallback.error
    }

    if (saveError) console.error('setConfig:', saveError)
  }

  if (loading) {
    return (
      <div
        style={{
          height: '100vh',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          gap: '16px',
          color: 'var(--lilac-deep)',
          fontFamily: 'Cormorant Garamond, serif',
          fontSize: '1.2rem',
          fontStyle: 'italic',
        }}
      >
        <div style={{ fontSize: '2rem' }}>✿</div>
        Cargando...
      </div>
    )
  }

  if (error) {
    return (
      <div
        style={{
          height: '100vh',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          gap: '12px',
          color: '#c0392b',
          fontFamily: 'sans-serif',
          textAlign: 'center',
          padding: '24px',
        }}
      >
        <div style={{ fontSize: '2rem' }}>⚠️</div>
        <strong>Error de conexion</strong>
        <p style={{ fontSize: '0.9rem', color: '#666' }}>{error}</p>
        <p style={{ fontSize: '0.8rem', color: '#999' }}>
          Verifica que VITE_SUPABASE_URL y VITE_SUPABASE_ANON_KEY en .env sean correctas.
        </p>
      </div>
    )
  }

  return (
    <DataContext.Provider
      value={{
        products,
        addProduct,
        updateProduct,
        deleteProduct,
        moveProduct,
        reorderProducts,
        categories,
        addCategory,
        updateCategory,
        deleteCategory,
        ingredients,
        addIngredient,
        updateIngredient,
        deleteIngredient,
        toggleIngredientStock,
        moveIngredient,
        reorderIngredients,
        orders,
        addOrder,
        updateOrder,
        deleteOrder,
        config,
        setConfig,
      }}
    >
      {children}
    </DataContext.Provider>
  )
}

export function useData() {
  return useContext(DataContext)
}
