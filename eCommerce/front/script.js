// script.js
const BASE_URL = 'http://localhost:3000'; // Adjust if needed

document.getElementById('btnGetProducts').addEventListener('click', async () => {
  try {
    const response = await fetch(`${BASE_URL}/products`);
    const products = await response.json();
    displayProducts(products);
  } catch (error) {
    console.error('Error:', error);
  }
});

function displayProducts(products) {
  const container = document.getElementById('productsContainer');
  container.innerHTML = '';
  products.forEach(product => {
    container.innerHTML += `
      <div style="border:1px solid #ccc; margin:5px; padding:5px;">
        <h3>${product.name} - $${product.price}</h3>
        <p>${product.description}</p>
        <p><strong>Category:</strong> ${product.category} | <strong>In Stock:</strong> ${product.inStock}</p>
      </div>
    `;
  });
}
