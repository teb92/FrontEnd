// 🛠️ Función para renderizar los productos en la tabla
function renderProducts() {
  const tableBody = document.getElementById('products-table-body');
  const productos = JSON.parse(localStorage.getItem('productos')) || [];

  // Limpiamos el contenido actual
  tableBody.innerHTML = '';

  // Dibujamos cada fila de producto 
  for (const producto of productos) {
    tableBody.innerHTML += `
      <tr>
        <td>${producto.id.slice(0, 8)}...</td>
        <td>${producto.nombre}</td>
        <td>$${producto.precio.toFixed(2)}</td>
        <td>${producto.categoria}</td>
        <td>${producto.stock}</td>
        <td>
          <button class="btn-edit" data-id="${producto.id}">Editar</button>
          <button class="btn-delete" data-id="${producto.id}">Eliminar</button>
        </td>
      </tr>
    `;
  }
}

//  Escuchar el envío del formulario para agregar productos
const productForm = document.getElementById('product-form');

productForm.addEventListener('submit', (event) => {
  event.preventDefault();

  // 1. Crear el nuevo objeto
  const newProduct = {
    id: crypto.randomUUID(), // Estándar único UUID 🆔
    nombre: document.getElementById('name').value,
    descripcion: document.getElementById('description').value,
    precio: parseFloat(document.getElementById('price').value),
    categoria: document.getElementById('category').value,
    imagen: document.getElementById('image').value,
    stock: parseInt(document.getElementById('stock').value)
  };

  // 2. Guardar en localStorage 
  const productos = JSON.parse(localStorage.getItem('productos')) || [];
  productos.push(newProduct);
  localStorage.setItem('productos', JSON.stringify(productos));

  // 3. Reiniciar formulario y actualizar vista
  productForm.reset();
  renderProducts();
});

//  Escuchar clics en los botones de la tabla (Eliminar)
const tableBody = document.getElementById('products-table-body');

tableBody.addEventListener('click', (event) => {
  if (event.target.classList.contains('btn-delete')) {
    const idToDelete = event.target.getAttribute('data-id');
    
    let productos = JSON.parse(localStorage.getItem('productos')) || [];
    productos = productos.filter(producto => producto.id !== idToDelete);
    
    localStorage.setItem('productos', JSON.stringify(productos));
    renderProducts();
  }
});

// Cargar la tabla al iniciar la página
document.addEventListener('DOMContentLoaded', renderProducts);
