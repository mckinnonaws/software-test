const API = '/api/v1';
let token = localStorage.getItem('token');
let user = null;
let products = [];
let cart = null;
let orders = [];

const $ = (id) => document.getElementById(id);
const $$ = (sel) => document.querySelectorAll(sel);

function setMessage(text, type = 'info') {
  const el = $('message');
  if (!text) { el.hidden = true; return; }
  el.hidden = false;
  el.className = `message ${type}`;
  el.textContent = text;
}

function headers(extra = {}) {
  const h = { ...extra };
  if (token) h.Authorization = `Bearer ${token}`;
  return h;
}

async function api(path, options = {}) {
  const res = await fetch(API + path, {
    ...options,
    headers: headers(options.headers || {}),
  });
  let data = null;
  const text = await res.text();
  if (text) {
    try { data = JSON.parse(text); } catch { data = text; }
  }
  if (!res.ok) {
    const detail = data && data.detail ? data.detail : res.statusText;
    throw new Error(detail);
  }
  return data;
}

function money(n) { return `$${Number(n).toFixed(2)}`; }

function showView(name) {
  $$('.view').forEach((el) => el.classList.toggle('hidden', el.id !== name));
}

function authState() {
  const loggedIn = !!token && !!user;
  $('authNav').hidden = loggedIn;
  $('logoutBtn').hidden = !loggedIn;
  $('adminNav').hidden = !loggedIn || !user.is_admin;
  const badge = $('userBadge');
  if (loggedIn) {
    badge.hidden = false;
    badge.textContent = user.email + (user.is_admin ? ' (admin)' : '');
  } else {
    badge.hidden = true;
  }
  if (loggedIn && $('auth').classList.contains('hidden') === false) showView('products');
}

async function loadMe() {
  if (!token) { user = null; authState(); return; }
  try {
    user = await api('/auth/me');
  } catch {
    token = null;
    localStorage.removeItem('token');
    user = null;
  }
  authState();
}

function logout() {
  token = null;
  user = null;
  localStorage.removeItem('token');
  authState();
  cart = null;
  orders = [];
  renderCart();
  renderOrders();
  showView('auth');
  setMessage('Logged out.', 'success');
}

async function loadProducts(q = '') {
  const suffix = q ? `?q=${encodeURIComponent(q)}` : '';
  try {
    products = await api('/products' + suffix);
    renderProducts();
    if (user && user.is_admin) renderAdminProducts();
  } catch (e) { setMessage(e.message, 'error'); }
}

function productCard(p, admin = false) {
  const img = p.image_url
    ? `<img src="${escapeHtml(p.image_url)}" alt="${escapeHtml(p.name)}" />`
    : `<div class="placeholder">No image</div>`;
  const actions = admin
    ? `<div class="actions">
        <button data-edit="${p.id}">Edit</button>
        <button class="danger" data-delete="${p.id}">Delete</button>
      </div>`
    : `<form class="add-form" data-add="${p.id}">
        <input type="number" name="qty" min="1" value="1" />
        <button type="submit">Add to cart</button>
      </form>`;
  return `<article class="product">
    ${img}
    <strong>${escapeHtml(p.name)}</strong>
    <span class="muted">${escapeHtml(p.description || '')}</span>
    <div class="price">${money(p.price)}</div>
    <span class="muted">Stock: ${p.stock}</span>
    ${actions}
  </article>`;
}

function renderProducts() {
  const el = $('productList');
  if (!products.length) { el.innerHTML = '<div class="empty">No products found.</div>'; return; }
  el.innerHTML = products.map((p) => productCard(p, false)).join('');
}

function renderAdminProducts() {
  const el = $('adminProductList');
  if (!products.length) { el.innerHTML = '<div class="empty">No products found.</div>'; return; }
  el.innerHTML = products.map((p) => productCard(p, true)).join('');
}

function productName(id) {
  const p = products.find((x) => x.id === id);
  return p ? p.name : `Product ${id}`;
}
function productPrice(id) {
  const p = products.find((x) => x.id === id);
  return p ? p.price : 0;
}

async function loadCart() {
  if (!token) { cart = null; renderCart(); return; }
  try {
    cart = await api('/cart');
    if (products.length === 0) await loadProducts();
    renderCart();
  } catch (e) { setMessage(e.message, 'error'); }
}

function renderCart() {
  const el = $('cartContent');
  if (!token) { el.innerHTML = '<div class="empty">Login to view your cart.</div>'; return; }
  if (!cart || !cart.items.length) { el.innerHTML = '<div class="empty">Your cart is empty.</div>'; return; }
  let total = 0;
  const html = cart.items.map((item) => {
    const price = productPrice(item.product_id);
    const line = price * item.quantity;
    total += line;
    return `<div class="cart-item">
      <div>
        <strong>${escapeHtml(productName(item.product_id))}</strong>
        <div class="muted">${money(price)} each</div>
      </div>
      <div class="cart-controls">
        <input type="number" min="1" value="${item.quantity}" data-qty="${item.id}" />
        <button data-update="${item.id}">Update</button>
        <button class="danger" data-remove="${item.id}">Remove</button>
        <strong>${money(line)}</strong>
      </div>
    </div>`;
  }).join('');
  el.innerHTML = html + `<div class="total">Total: ${money(total)}</div>`;
}

async function loadOrders() {
  if (!token) { orders = []; renderOrders(); return; }
  try {
    orders = await api('/orders');
    if (products.length === 0) await loadProducts();
    renderOrders();
  } catch (e) { setMessage(e.message, 'error'); }
}

function renderOrders() {
  const el = $('orderList');
  if (!token) { el.innerHTML = '<div class="empty">Login to view orders.</div>'; return; }
  if (!orders.length) { el.innerHTML = '<div class="empty">No orders yet.</div>'; return; }
  el.innerHTML = orders.map((o) => {
    const items = o.items.map((i) =>
      `<div class="order-item"><span>${escapeHtml(productName(i.product_id))} x ${i.quantity}</span><span>${money(i.unit_price * i.quantity)}</span></div>`
    ).join('');
    return `<article class="order">
      <strong>Order #${o.id}</strong>
      <span class="muted">Status: ${escapeHtml(o.status)}</span>
      ${items}
      <div class="total">Total: ${money(o.total)}</div>
    </article>`;
  }).join('');
}

function escapeHtml(s) {
  return String(s).replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
}

function resetProductForm() {
  const f = $('productForm');
  f.reset();
  f.id.value = '';
  $('productSubmit').textContent = 'Create Product';
}

function fillProductForm(p) {
  const f = $('productForm');
  f.id.value = p.id;
  f.name.value = p.name;
  f.description.value = p.description || '';
  f.price.value = p.price;
  f.stock.value = p.stock;
  f.image_url.value = p.image_url || '';
  $('productSubmit').textContent = 'Update Product';
  showView('admin');
}

// Event handlers
document.addEventListener('click', async (e) => {
  const t = e.target;
  if (t.dataset && t.dataset.view) { showView(t.dataset.view); return; }
  if (t.id === 'logoutBtn') { logout(); return; }
  if (t.dataset && t.dataset.edit) {
    const p = products.find((x) => x.id === Number(t.dataset.edit));
    if (p) fillProductForm(p);
    return;
  }
  if (t.dataset && t.dataset.delete) {
    if (!confirm('Delete product?')) return;
    try {
      await api(`/products/${t.dataset.delete}`, { method: 'DELETE' });
      setMessage('Product deleted.', 'success');
      await loadProducts();
    } catch (err) { setMessage(err.message, 'error'); }
    return;
  }
  if (t.dataset && t.dataset.update) {
    const id = Number(t.dataset.update);
    const input = document.querySelector(`[data-qty="${id}"]`);
    const qty = Number(input.value);
    try {
      cart = await api(`/cart/items/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ quantity: qty }),
      });
      renderCart();
      setMessage('Cart updated.', 'success');
    } catch (err) { setMessage(err.message, 'error'); }
    return;
  }
  if (t.dataset && t.dataset.remove) {
    const id = Number(t.dataset.remove);
    try {
      cart = await api(`/cart/items/${id}`, { method: 'DELETE' });
      renderCart();
      setMessage('Item removed.', 'success');
    } catch (err) { setMessage(err.message, 'error'); }
    return;
  }
});

document.addEventListener('submit', async (e) => {
  const form = e.target;
  e.preventDefault();
  if (form.id === 'loginForm') {
    const fd = new FormData(form);
    try {
      const body = new URLSearchParams();
      body.set('username', fd.get('email'));
      body.set('password', fd.get('password'));
      const res = await fetch(API + '/auth/login', {
        method: 'POST',
        headers: headers({ 'Content-Type': 'application/x-www-form-urlencoded' }),
        body,
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.detail || res.statusText);
      token = data.access_token;
      localStorage.setItem('token', token);
      await loadMe();
      await loadProducts();
      await loadCart();
      await loadOrders();
      showView('products');
      setMessage('Logged in.', 'success');
    } catch (err) { setMessage(err.message, 'error'); }
    return;
  }
  if (form.id === 'registerForm') {
    const fd = new FormData(form);
    try {
      await api('/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: fd.get('email'), password: fd.get('password') }),
      });
      setMessage('Registered. Please login.', 'success');
      form.reset();
    } catch (err) { setMessage(err.message, 'error'); }
    return;
  }
  if (form.id === 'searchForm') {
    const fd = new FormData(form);
    await loadProducts(fd.get('q') || '');
    return;
  }
  if (form.classList.contains('add-form')) {
    if (!token) { setMessage('Login to add items.', 'error'); return; }
    const id = Number(form.dataset.add);
    const qty = Number(new FormData(form).get('qty') || 1);
    try {
      cart = await api('/cart/items', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ product_id: id, quantity: qty }),
      });
      renderCart();
      showView('cart');
      setMessage('Added to cart.', 'success');
    } catch (err) { setMessage(err.message, 'error'); }
    return;
  }
  if (form.id === 'productForm') {
    const fd = new FormData(form);
    const payload = {
      name: fd.get('name'),
      description: fd.get('description') || '',
      price: Number(fd.get('price')),
      stock: Number(fd.get('stock')),
      image_url: fd.get('image_url') || '',
    };
    const id = fd.get('id');
    try {
      if (id) {
        await api(`/products/${id}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload),
        });
        setMessage('Product updated.', 'success');
      } else {
        await api('/products', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload),
        });
        setMessage('Product created.', 'success');
      }
      resetProductForm();
      await loadProducts();
    } catch (err) { setMessage(err.message, 'error'); }
    return;
  }
});

$('clearSearch').addEventListener('click', () => {
  $('searchForm').reset();
  loadProducts();
});

$('productReset').addEventListener('click', resetProductForm);

$('checkoutBtn').addEventListener('click', async () => {
  if (!token) { setMessage('Login to checkout.', 'error'); return; }
  try {
    const order = await api('/orders', { method: 'POST' });
    setMessage(`Order #${order.id} placed.`, 'success');
    await loadCart();
    await loadOrders();
    showView('orders');
  } catch (err) { setMessage(err.message, 'error'); }
});

// Init
(async function init() {
  await loadMe();
  await loadProducts();
  if (token) { await loadCart(); await loadOrders(); }
  showView(user ? 'products' : 'auth');
})();
