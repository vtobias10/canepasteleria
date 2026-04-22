const defaultMessageTexts = {
  greeting: 'Hola! Quiero hacer un pedido.',
  productLabel: 'Producto',
  optionsLabel: 'Opciones',
  quantityLabel: 'Cantidad',
  closing: 'Me confirmas disponibilidad y precio final? Gracias!',
}

function normalizeMessageTexts(messageTexts) {
  return {
    ...defaultMessageTexts,
    ...(messageTexts || {}),
  }
}

function parsePackSize(selectedVariants) {
  const keys = ['Bolsitas x ud', 'Bolsitas por unidad']
  const rawValue = keys.map(key => selectedVariants?.[key]).find(Boolean)
  if (!rawValue) return null

  const parsed = parseInt(String(rawValue).replace(/\D/g, ''), 10)
  return Number.isFinite(parsed) && parsed > 0 ? parsed : null
}

function formatQuantity(quantity, selectedVariants) {
  const qty = Number(quantity) || 0
  if (!qty) return ''

  const packSize = parsePackSize(selectedVariants)
  if (!packSize) {
    return `${qty} ${qty === 1 ? 'unidad' : 'unidades'}`
  }

  const totalUnits = qty * packSize
  const packWord = qty === 1 ? 'pack' : 'packs'
  return `${qty} ${packWord} x${packSize} (${totalUnits} unidades)`
}

function formatOptions(selectedVariants) {
  const entries = Object.entries(selectedVariants || {}).filter(([, value]) => value !== '' && value !== null && value !== undefined)
  if (entries.length === 0) return []
  return entries.map(([key, value]) => `- ${key}: ${value}`)
}

const defaultCartMessageTexts = {
  greeting: 'Hola! Quiero hacer el siguiente pedido:',
  productLabel: 'Producto',
  optionsLabel: 'Opciones',
  closing: 'Me confirmas disponibilidad y precio final? Gracias!',
}

export function buildCartWhatsAppUrl(cartItems, whatsappNumber, cartMessageTexts) {
  const texts = { ...defaultCartMessageTexts, ...(cartMessageTexts || {}) }

  const itemBlocks = cartItems.map(item => {
    const lines = [`*${texts.productLabel}:* ${item.productName}  ×${item.quantity}`]
    const opts = Object.entries(item.variantSelections || {})
      .filter(([, v]) => v)
      .map(([k, v]) => `- ${k}: ${v}`)
    if (item.bolsitasXUd) opts.push(`- Bolsitas x ud: ${item.bolsitasXUd}`)
    if (opts.length > 0) {
      lines.push(`*${texts.optionsLabel}:*`, ...opts)
    }
    return lines.join('\n')
  })

  const message = [texts.greeting, '', itemBlocks.join('\n\n'), '', texts.closing].join('\n')
  return `https://wa.me/${whatsappNumber}?text=${encodeURIComponent(message)}`
}

export function buildWhatsAppUrl(product, selectedVariants, quantity, whatsappNumber, messageTexts) {
  const texts = normalizeMessageTexts(messageTexts)
  const optionLines = formatOptions(selectedVariants)
  const formattedQuantity = formatQuantity(quantity, selectedVariants)

  const lines = [
    texts.greeting,
    '',
    `*${texts.productLabel}:* ${product.name}`,
    ...(optionLines.length > 0 ? [`*${texts.optionsLabel}:*`, ...optionLines] : []),
    formattedQuantity ? `*${texts.quantityLabel}:* ${formattedQuantity}` : null,
    '',
    texts.closing,
  ].filter(Boolean)

  const encoded = encodeURIComponent(lines.join('\n'))
  return `https://wa.me/${whatsappNumber}?text=${encoded}`
}
