export function buildWhatsAppUrl(product, selectedVariants, quantity, whatsappNumber) {
  const variantText = Object.entries(selectedVariants)
    .map(([key, val]) => `${key}: ${val}`)
    .join(', ')

  const lines = [
    `¡Hola! Me gustaría hacer un pedido 🎀`,
    ``,
    `*Producto:* ${product.name}`,
    variantText ? `*Opciones:* ${variantText}` : null,
    quantity ? `*Cantidad:* ${quantity}` : null,
    ``,
    `¿Me podés dar más información? ¡Gracias!`,
  ]
    .filter((l) => l !== null)
    .join('\n')

  const encoded = encodeURIComponent(lines)
  return `https://wa.me/${whatsappNumber}?text=${encoded}`
}
