import {
  validateProductName,
  validateProductDescription,
  validateProductPrice,
  validateProductCategory,
  validateImageUrl,
  validateProductStock
} from './validators.js';

export function validateProductForm(form) {
  const valueOf = (id) => form.querySelector(`#${id}`).value;

  return {
    name: validateProductName(valueOf('name')),
    description: validateProductDescription(valueOf('description')),
    price: validateProductPrice(valueOf('price')),
    category: validateProductCategory(valueOf('category')),
    image: validateImageUrl(valueOf('image')),
    stock: validateProductStock(valueOf('stock'))
  };
}

export function readProductForm(form) {
  const valueOf = (id) => form.querySelector(`#${id}`).value.trim();

  return {
    nombre: valueOf('name'),
    descripcion: valueOf('description'),
    precio: parseFloat(valueOf('price')),
    categoria: valueOf('category'),
    imagen: valueOf('image'),
    stock: parseInt(valueOf('stock'), 10)
  };
}

export function fillProductForm(form, product) {
  const setValue = (id, value) => {
    form.querySelector(`#${id}`).value = value ?? '';
  };

  setValue('name', product.nombre);
  setValue('description', product.descripcion);
  setValue('price', product.precio);
  setValue('category', product.categoria);
  setValue('image', product.imagen);
  setValue('stock', product.stock);
}

export function fillCategoryOptions(datalist, products) {
  if (!datalist) return;

  const categories = [...new Set(products.map((product) => product.categoria).filter(Boolean))].sort();
  datalist.replaceChildren(
    ...categories.map((category) => {
      const option = document.createElement('option');
      option.value = category;
      return option;
    })
  );
}