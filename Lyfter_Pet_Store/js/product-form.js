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
    name: valueOf('name'),
    description: valueOf('description'),
    price: parseFloat(valueOf('price')),
    category: valueOf('category'),
    image: valueOf('image'),
    stock: parseInt(valueOf('stock'), 10)
  };
}

export function fillProductForm(form, product) {
  const setValue = (id, value) => {
    form.querySelector(`#${id}`).value = value ?? '';
  };

  setValue('name', product.name);
  setValue('description', product.description);
  setValue('price', product.price);
  setValue('category', product.category);
  setValue('image', product.image);
  setValue('stock', product.stock);
}

export function fillCategoryOptions(datalist, products) {
  if (!datalist) return;

  const categories = [...new Set(products.map((product) => product.category).filter(Boolean))].sort();
  datalist.replaceChildren(
    ...categories.map((category) => {
      const option = document.createElement('option');
      option.value = category;
      return option;
    })
  );
}
