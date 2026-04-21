export const initialProducts = [
  {
    id: '1',
    name: 'Alfajores Artesanales',
    description: 'Deliciosos alfajores rellenos de dulce de leche, bañados en chocolate o azúcar impalpable.',
    category: 'Alfajores',
    variants: [
      { name: 'Tamaño', options: ['Chico', 'Mediano', 'Grande'] },
      { name: 'Cobertura', options: ['Chocolate', 'Azúcar'] },
    ],
    bolsitasXUd: ['1', '6', '12'],
    priceNote: '',
    minQuantity: 1,
    active: true,
    emoji: '🍫',
  },
  {
    id: '2',
    name: 'Torta de Cumpleaños',
    description: 'Torta personalizada para tu celebración especial, disponible en distintos sabores y decoraciones.',
    category: 'Tortas',
    variants: [
      { name: 'Tamaño', options: ['6 porciones', '10 porciones', '15 porciones'] },
      { name: 'Sabor', options: ['Vainilla', 'Chocolate', 'Lemon pie'] },
    ],
    bolsitasXUd: [],
    priceNote: '',
    minQuantity: 1,
    active: true,
    emoji: '🎂',
  },
  {
    id: '3',
    name: 'Cupcakes',
    description: 'Esponjosos cupcakes con frosting de colores, perfectos para cualquier ocasión.',
    category: 'Cupcakes',
    variants: [
      { name: 'Sabor', options: ['Vainilla', 'Chocolate', 'Red Velvet'] },
    ],
    bolsitasXUd: ['1', '6', '12'],
    priceNote: '',
    minQuantity: 1,
    active: true,
    emoji: '🧁',
  },
  {
    id: '4',
    name: 'Brownies',
    description: 'Brownies húmedos y chocolatosos. Disponibles en plancha completa o en porciones de 5 cm aprox.',
    category: 'Brownies',
    variants: [
      { name: 'Presentación', options: ['Plancha completa', 'Porción 5cm aprox'] },
    ],
    bolsitasXUd: [],
    priceNote: 'Porciones: x4 $2.600 · Mínimo de compra 4 u.',
    minQuantity: 4,
    active: true,
    emoji: '🍫',
  },
]

export const initialIngredients = [
  { id: '1', name: 'Harina 000', inStock: true },
  { id: '2', name: 'Azúcar', inStock: true },
  { id: '3', name: 'Manteca', inStock: true },
  { id: '4', name: 'Huevos', inStock: true },
  { id: '5', name: 'Dulce de leche', inStock: false },
  { id: '6', name: 'Chocolate cobertura', inStock: true },
  { id: '7', name: 'Esencia de vainilla', inStock: true },
  { id: '8', name: 'Cacao en polvo', inStock: false },
  { id: '9', name: 'Crema de leche', inStock: true },
  { id: '10', name: 'Queso crema', inStock: true },
]

export const initialOrders = []

export const initialConfig = {
  whatsappNumber: '5491100000000',
  businessName: 'Cane Pastelería',
  tagline: 'Dulces hechos con amor',
  description: 'Somos un emprendimiento familiar de repostería artesanal. Cada producto está hecho con ingredientes seleccionados y mucho amor. ¡Pedí el tuyo!',
  instagramHandle: '@canepasteleria',
  instagramUrl: 'https://instagram.com/canepasteleria',
  facebookUrl: '',
  sinTagline: 'Repostería Sin TACC',
}
