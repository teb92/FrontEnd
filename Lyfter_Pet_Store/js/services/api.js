// 🐾 Datos de prueba (Mock Data)
const MOCK_PRODUCTS = [
  {
    id: '1',
    name: 'Alimento Premium Perros 3kg',
    price: 24.99,
    available: true, // Disponible
    imageUrl: 'https://via.placeholder.com/200',
    description: 'Alimento completo...'
  },
  {
    id: '2',
    name: 'Juguete Interactivo Ratón',
    price: 12.50,
    available: false, //  Agotado / No disponible
    imageUrl: 'https://via.placeholder.com/200',
    description: 'Juguete interactivo...'
  }
];

//  Simulación de catálogo completo
export async function getProducts() {
  await new Promise(resolve => setTimeout(resolve, 500));
  return MOCK_PRODUCTS;
}

//  Simulación de búsqueda por ID
export async function getProductById(id) {
  await new Promise(resolve => setTimeout(resolve, 500));
  const product = MOCK_PRODUCTS.find(item => item.id === id);
  
  if (!product) {
    throw new Error('Producto no encontrado');
  }
  
  return product;
}